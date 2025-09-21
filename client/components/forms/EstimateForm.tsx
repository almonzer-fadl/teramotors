'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface CustomerMinimal { _id: string; firstName: string; lastName: string }
interface VehicleMinimal { _id: string; make: string; model: string; year: number; customerId?: string }
interface ServiceMinimal { 
  _id: string; 
  name: string; 
  laborHours?: number; 
  laborRate?: number; 
  partsRequired?: { partId: string; quantity: number }[]; 
}
interface PartMinimal { _id: string; sellingPrice: number; }
interface UserMinimal { _id: string; name?: string; fullName?: string }
interface JobCardMinimal { _id: string }

interface EstimateFormData {
  jobCardId: string
  customerId: string
  vehicleId: string
  mechanicId: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string
  services: { serviceId: string; quantity: number; laborCost: number; partsCost: number; totalCost: number }[]
  subtotal: number
  tax: number
  total: number
  validUntil: string
}

export default function EstimateForm({ estimateId }: { estimateId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<CustomerMinimal[]>([])
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([])
  const [services, setServices] = useState<ServiceMinimal[]>([])
  const [mechanics, setMechanics] = useState<UserMinimal[]>([])
  const [jobCards, setJobCards] = useState<JobCardMinimal[]>([])
  const [parts, setParts] = useState<PartMinimal[]>([])
  const [formData, setFormData] = useState<EstimateFormData>({
    jobCardId: '',
    customerId: '',
    vehicleId: '',
    mechanicId: '',
    status: 'pending',
    notes: '',
    services: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    validUntil: ''
  })

  const isEditing = !!estimateId

  useEffect(() => {
    fetchInitialData()
    if (isEditing) {
      fetchEstimate()
    }
  }, [estimateId])

  useEffect(() => {
    calculateTotals()
  }, [formData.services])

  const fetchInitialData = async () => {
    try {
      const [customersRes, vehiclesRes, servicesRes, mechanicsRes, jobCardsRes, partsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
        fetch('/api/services'),
        fetch('/api/users?role=mechanic'),
        fetch('/api/job-cards'),
        fetch('/api/parts')
      ]);
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (mechanicsRes.ok) setMechanics(await mechanicsRes.json())
      if (jobCardsRes.ok) setJobCards(await jobCardsRes.json())
      if (partsRes.ok) setParts(await partsRes.json())
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${estimateId}`)
      if (response.ok) {
        const estimate = await response.json()
        setFormData({
          ...estimate,
          validUntil: estimate.validUntil ? new Date(estimate.validUntil).toISOString().split('T')[0] : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch estimate:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/estimates/${estimateId}` : '/api/estimates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/estimates')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save estimate')
      }
    } catch (error) {
      console.error('Failed to save estimate:', error)
      alert('Failed to save estimate')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = async (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === 'serviceId') {
      const selectedService = services.find(s => s._id === value);
      if (selectedService) {
        const laborCost = (selectedService.laborHours || 0) * (selectedService.laborRate || 0);
        updatedServices[index].laborCost = laborCost;

        const partsCost = (selectedService.partsRequired || []).reduce((acc, requiredPart) => {
          const partDetails = parts.find(p => p._id === requiredPart.partId);
          return acc + (partDetails ? partDetails.sellingPrice * requiredPart.quantity : 0);
        }, 0);
        updatedServices[index].partsCost = partsCost;

        updatedServices[index].totalCost = (laborCost + partsCost) * updatedServices[index].quantity;
      }
    } else if (field === 'quantity') {
      const selectedService = services.find(s => s._id === updatedServices[index].serviceId);
      if (selectedService) {
        const laborCost = (selectedService.laborHours || 0) * (selectedService.laborRate || 0);
        const partsCost = (selectedService.partsRequired || []).reduce((acc, requiredPart) => {
          const partDetails = parts.find(p => p._id === requiredPart.partId);
          return acc + (partDetails ? partDetails.sellingPrice * requiredPart.quantity : 0);
        }, 0);
        updatedServices[index].totalCost = (laborCost + partsCost) * value;
      }
    }

    handleInputChange('services', updatedServices)
  }

  const addService = () => {
    handleInputChange('services', [...formData.services, { serviceId: '', quantity: 1, laborCost: 0, partsCost: 0, totalCost: 0 }])
  }

  const removeService = (index: number) => {
    const updatedServices = formData.services.filter((_, i) => i !== index)
    handleInputChange('services', updatedServices)
  }

  const calculateTotals = () => {
    const subtotal = formData.services.reduce((acc, service) => acc + service.totalCost, 0)
    const tax = subtotal * 0.1 // Example tax rate
    const total = subtotal + tax
    setFormData(prev => ({ ...prev, subtotal, tax, total }))
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Estimate' : 'New Estimate'}</h1>
                    <p className="mt-1 text-sm text-gray-500">{isEditing ? 'Update estimate details.' : 'Create a new service estimate.'}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fields for customer, vehicle, etc. */}
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
                {formData.services.map((service, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 items-center mb-4">
                        <select value={service.serviceId} onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)} className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Select Service</option>
                            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <input type="number" placeholder="Qty" value={service.quantity} onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <input type="number" placeholder="Labor" value={service.laborCost.toFixed(2)} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                        <input type="number" placeholder="Parts" value={service.partsCost.toFixed(2)} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                        <input type="number" placeholder="Total" value={service.totalCost.toFixed(2)} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                        <button type="button" onClick={() => removeService(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={addService} className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mt-6">
                <div className="grid grid-cols-3 gap-4">
                    <div><span className="font-medium">Subtotal:</span> ${formData.subtotal.toFixed(2)}</div>
                    <div><span className="font-medium">Tax:</span> ${formData.tax.toFixed(2)}</div>
                    <div><span className="font-medium text-lg">Total:</span> ${formData.total.toFixed(2)}</div>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => router.back()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><X className="mr-2 h-4 w-4" />Cancel</button>
                <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : (isEditing ? 'Update Estimate' : 'Save Estimate')}
                </button>
            </div>
        </form>
    </div>
  )
}
