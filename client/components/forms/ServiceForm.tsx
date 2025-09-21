'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'
import Part from '@/lib/models/Part'

import { Combobox } from '@/components/ui/Combobox'

interface ServiceFormData {
  name: string
  description: string
  category: string
  laborRate: number
  laborHours: number
  partsRequired: { partId: string; quantity: number; cost: number }[]
  isActive: boolean
  isTemplate: boolean
}

export default function ServiceForm({ serviceId, fromTemplate }: { serviceId?: string, fromTemplate?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<Array<InstanceType<typeof Part>>>([])
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    laborRate: 0,
    laborHours: 0,
    partsRequired: [],
    isActive: true,
    isTemplate: false
  })

  const [templates, setTemplates] = useState<ServiceFormData[]>([]);

  const isEditing = !!serviceId

  useEffect(() => {
    fetchParts()
    fetchCategories()
    if (isEditing) {
      fetchService()
    } else if (fromTemplate) {
      fetchTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, isEditing, fromTemplate])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/categories');
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/services?isTemplate=true');
      if (response.ok) {
        setTemplates(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch service templates:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => (t as any)._id === templateId);
    if (template) {
      setFormData({
        ...template,
        isTemplate: false, // Don't save the new service as a template by default
      });
    }
  };


  const fetchParts = async () => {
    try {
      const response = await fetch('/api/parts')
      if (response.ok) {
        setParts(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    }
  }

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`)
      if (response.ok) {
        const service = await response.json()
        setFormData(service)
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/services/${serviceId}` : '/api/services'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/services')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save service')
      }
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePartChange = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.partsRequired]
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    handleInputChange('partsRequired', updatedParts)
  }

  const addPart = () => {
    handleInputChange('partsRequired', [...formData.partsRequired, { partId: '', quantity: 1, cost: 0 }])
  }

  const removePart = (index: number) => {
    const updatedParts = formData.partsRequired.filter((_, i) => i !== index)
    handleInputChange('partsRequired', updatedParts)
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Service' : 'New Service'}</h1>
                    <p className="mt-1 text-sm text-gray-500">{isEditing ? 'Update service details.' : 'Create a new service.'}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {fromTemplate && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create from Template</h3>
                <select onChange={e => handleTemplateChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Select a Template</option>
                  {templates.map(t => <option key={(t as any)._id} value={(t as any)._id}>{t.name}</option>)}
                </select>
              </div>
            )}
            {/* Form fields for service details */}
            <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Name" required value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <Combobox 
                  options={categories.map(c => ({ label: c, value: c }))}
                  value={formData.category}
                  onChange={value => handleInputChange('category', value)}
                  placeholder="Select a category"
                  searchPlaceholder="Search or add category..."
                  emptyPlaceholder="No categories found."
                />
                <input type="number" placeholder="Labor Rate" required value={formData.laborRate} onChange={e => handleInputChange('laborRate', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="number" placeholder="Labor Hours" required value={formData.laborHours} onChange={e => handleInputChange('laborHours', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <textarea placeholder="Description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} className="md:col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <div className="flex items-center">
                  <input id="isTemplate" type="checkbox" checked={formData.isTemplate} onChange={e => handleInputChange('isTemplate', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                  <label htmlFor="isTemplate" className="ml-3 min-w-0 flex-1 text-gray-500">Save as template</label>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parts Required</h3>
                {formData.partsRequired.map((part, index) => (
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
                    {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Save Service')}
                </button>
            </div>
        </form>
    </div>
  )
}
