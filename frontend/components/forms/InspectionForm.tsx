'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface VehicleMinimal { _id: string; make: string; model: string; year: number }
interface CustomerMinimal { _id: string; firstName: string; lastName: string }
interface UserMinimal { _id: string; name?: string; fullName?: string }
interface TemplateMinimal { _id: string; name: string }

interface InspectionFormData {
  vehicleId: string
  customerId: string
  mechanicId: string
  templateId: string
  inspectionDate: string
  mileage: number
  overallCondition: string
  items: { itemId: string; condition: 'good' | 'fair' | 'poor' | 'critical'; notes: string; priority: 'critical' | 'safety' | 'recommended' | 'optional' }[]
  status: 'in-progress' | 'completed' | 'cancelled'
}

export default function InspectionForm({ inspectionId }: { inspectionId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([])
  const [customers, setCustomers] = useState<CustomerMinimal[]>([])
  const [mechanics, setMechanics] = useState<UserMinimal[]>([])
  const [templates, setTemplates] = useState<TemplateMinimal[]>([])
  const [formData, setFormData] = useState<InspectionFormData>({
    vehicleId: '',
    customerId: '',
    mechanicId: '',
    templateId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    mileage: 0,
    overallCondition: '',
    items: [],
    status: 'in-progress'
  })

  const isEditing = !!inspectionId

  useEffect(() => {
    fetchInitialData()
    if (isEditing) {
      fetchInspection()
    }
  }, [inspectionId])

  const fetchInitialData = async () => {
    try {
      const [vehiclesRes, customersRes, mechanicsRes, templatesRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/customers'),
        fetch('/api/users?role=mechanic'),
        fetch('/api/inspection-templates')
      ]);
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (mechanicsRes.ok) setMechanics(await mechanicsRes.json())
      if (templatesRes.ok) setTemplates(await templatesRes.json())
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${inspectionId}`)
      if (response.ok) {
        const inspection = await response.json()
        setFormData({
            ...inspection,
            inspectionDate: inspection.inspectionDate ? new Date(inspection.inspectionDate).toISOString().split('T')[0] : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch inspection:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/inspections/${inspectionId}` : '/api/inspections'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/inspections')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save inspection')
      }
    } catch (error) {
      console.error('Failed to save inspection:', error)
      alert('Failed to save inspection')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange('items', updatedItems)
  }

  const addItem = () => {
    handleInputChange('items', [...formData.items, { itemId: '', condition: 'good', notes: '', priority: 'optional' }])
  }

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    handleInputChange('items', updatedItems)
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Inspection' : 'New Inspection'}</h1>
                    <p className="mt-1 text-sm text-gray-500">{isEditing ? 'Update inspection details.' : 'Create a new vehicle inspection.'}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields for inspection details */}

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inspection Items</h3>
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center mb-4">
                        <input type="text" placeholder="Item ID" value={item.itemId} onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <select value={item.condition} onChange={(e) => handleItemChange(index, 'condition', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="critical">Critical</option>
                        </select>
                        <input type="text" placeholder="Notes" value={item.notes} onChange={(e) => handleItemChange(index, 'notes', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </button>
            </div>

            <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => router.back()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><X className="mr-2 h-4 w-4" />Cancel</button>
                <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : (isEditing ? 'Update Inspection' : 'Save Inspection')}
                </button>
            </div>
        </form>
    </div>
  )
}
