'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface AppointmentMinimal { _id: string }
interface CustomerMinimal { _id: string; firstName: string; lastName: string }
interface VehicleMinimal { _id: string; make: string; model: string; year: number }
interface UserMinimal { _id: string; name?: string; fullName?: string }
interface PartMinimal { _id: string; name: string; compatibleVehicles?: string[] }

interface JobCardFormData {
  appointmentId: string
  customerId: string
  vehicleId: string
  mechanicId: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedStartTime: string
  estimatedEndTime: string
  laborHours: number
  partsUsed: { partId: string; quantity: number; cost: number }[]
  notes: string
}

export default function JobCardForm({ jobCardId, appointmentId }: { jobCardId?: string, appointmentId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentMinimal[]>([])
  const [customers, setCustomers] = useState<CustomerMinimal[]>([])
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([])
  const [mechanics, setMechanics] = useState<UserMinimal[]>([])
  const [parts, setParts] = useState<PartMinimal[]>([])
  const [showCompatibleParts, setShowCompatibleParts] = useState(false)
  const [formData, setFormData] = useState<JobCardFormData>({
    appointmentId: '',
    customerId: '',
    vehicleId: '',
    mechanicId: '',
    status: 'pending',
    priority: 'medium',
    estimatedStartTime: '',
    estimatedEndTime: '',
    laborHours: 0,
    partsUsed: [],
    notes: ''
  })

  const isEditing = !!jobCardId

  const fetchJobCard = async () => {
    try {
      const response = await fetch(`/api/job-cards/${jobCardId}`)
      if (response.ok) {
        const jobCard = await response.json()
        setFormData({
            ...jobCard,
            estimatedStartTime: jobCard.estimatedStartTime ? new Date(jobCard.estimatedStartTime).toISOString().slice(0, 16) : '',
            estimatedEndTime: jobCard.estimatedEndTime ? new Date(jobCard.estimatedEndTime).toISOString().slice(0, 16) : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch job card:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
    if (isEditing) {
      fetchJobCard()
    } else if (appointmentId) {
      fetchAppointmentDetails(appointmentId);
    }
  }, [jobCardId, isEditing, appointmentId])

  const fetchInitialData = async () => {
    try {
      const [appointmentsRes, customersRes, vehiclesRes, mechanicsRes, partsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/customers'),
        fetch('/api/vehicles'),
        fetch('/api/users?role=mechanic'),
        fetch('/api/parts')
      ]);
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json())
      if (mechanicsRes.ok) setMechanics(await mechanicsRes.json())
      if (partsRes.ok) setParts(await partsRes.json())
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchAppointmentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (response.ok) {
        const appointment = await response.json();
        setFormData(prev => ({
          ...prev,
          appointmentId: appointment._id,
          customerId: appointment.customerId._id,
          vehicleId: appointment.vehicleId._id,
          mechanicId: appointment.mechanicId._id,
          // You might want to map services from the appointment to partsUsed or a new services field
        }));
      }
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
    }
  };

  // duplicate removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/job-cards/${jobCardId}` : '/api/job-cards'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/job-cards')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save job card')
      }
    } catch (error) {
      console.error('Failed to save job card:', error)
      alert('Failed to save job card')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePartChange = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.partsUsed]
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    handleInputChange('partsUsed', updatedParts)
  }

  const addPart = () => {
    handleInputChange('partsUsed', [...formData.partsUsed, { partId: '', quantity: 1, cost: 0 }])
  }

  const removePart = (index: number) => {
    const updatedParts = formData.partsUsed.filter((_, i) => i !== index)
    handleInputChange('partsUsed', updatedParts)
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Job Card' : 'New Job Card'}</h1>
                    <p className="mt-1 text-sm text-gray-500">{isEditing ? 'Update job card details.' : 'Create a new job card.'}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields for job card details */}

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parts Used</h3>
                {formData.partsUsed.map((part, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center mb-4">
                        <select value={part.partId} onChange={(e) => handlePartChange(index, 'partId', e.target.value)} className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Select Part</option>
                            {parts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <input type="number" placeholder="Qty" value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <input type="number" placeholder="Cost" value={part.cost} onChange={(e) => handlePartChange(index, 'cost', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <button type="button" onClick={() => removePart(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={addPart} className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Part
                </button>
            </div>

            <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => router.back()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><X className="mr-2 h-4 w-4" />Cancel</button>
                <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : (isEditing ? 'Update Job Card' : 'Save Job Card')}
                </button>
            </div>
        </form>
    </div>
  )
}
