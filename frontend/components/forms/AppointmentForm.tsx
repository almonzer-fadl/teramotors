'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'

interface CustomerMinimal { _id: string; firstName: string; lastName: string }
interface VehicleMinimal { _id: string; make: string; model: string; year: number; customerId: string | { _id: string } }
interface ServiceMinimal { _id: string | { toString: () => string }; name: string; laborHours: number }
interface UserMinimal { _id: string; name?: string; fullName?: string }

interface AppointmentFormData {
  customerId: string
  vehicleId: string
  serviceId: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes: string
  estimatedCost: number
  mechanicId: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export default function AppointmentForm({ appointmentId }: { appointmentId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<CustomerMinimal[]>([])
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([])
  const [services, setServices] = useState<ServiceMinimal[]>([])
  const [mechanics, setMechanics] = useState<UserMinimal[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [formData, setFormData] = useState<AppointmentFormData>({
    customerId: '',
    vehicleId: '',
    serviceId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    notes: '',
    estimatedCost: 0,
    mechanicId: '',
    priority: 'medium'
  })

  const isEditing = !!appointmentId

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (response.ok) {
        const appointment = await response.json()
        setFormData({
          customerId: appointment.customerId || '',
          vehicleId: appointment.vehicleId || '',
          serviceId: appointment.serviceId || '',
          appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
          startTime: appointment.startTime || '',
          endTime: appointment.endTime || '',
          status: appointment.status || 'scheduled',
          notes: appointment.notes || '',
          estimatedCost: appointment.estimatedCost || 0,
          mechanicId: appointment.mechanicId || '',
          priority: appointment.priority || 'medium'
        })
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
    if (isEditing) {
      fetchAppointment()
    }
  }, [appointmentId, isEditing])

  useEffect(() => {
    if (formData.appointmentDate && formData.serviceId) {
      fetchAvailableSlots()
    }
  }, [formData.appointmentDate, formData.serviceId])

  const fetchInitialData = async () => {
    try {
      const [customersRes, vehiclesRes, servicesRes, mechanicsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
        fetch('/api/services'),
        fetch('/api/users?role=mechanic') // Assuming you have a way to filter users by role
      ]);
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (mechanicsRes.ok) setMechanics(await mechanicsRes.json())
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchAvailableSlots = async () => {
    const selectedService = services.find(s => s._id.toString() === formData.serviceId)
    if (!selectedService) return

    const duration = selectedService.laborHours * 60 // convert hours to minutes
    try {
      const response = await fetch(`/api/appointments/available-slots?date=${formData.appointmentDate}&duration=${duration}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/appointments/${appointmentId}` : '/api/appointments'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/appointments')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save appointment')
      }
    } catch (error) {
      console.error('Failed to save appointment:', error)
      alert('Failed to save appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      if (field === 'startTime') {
        const selectedService = services.find(s => s._id.toString() === newFormData.serviceId)
        if (selectedService) {
          const startTime = value as string;
          const duration = selectedService.laborHours * 60;
          const [hours, minutes] = startTime.split(':').map(Number);
          const startDate = new Date();
          startDate.setHours(hours, minutes, 0, 0);
          const endDate = new Date(startDate.getTime() + duration * 60000);
          newFormData.endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        }
      }
      return newFormData;
    });
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Appointment' : 'New Appointment'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Update appointment details.' : 'Schedule a new appointment.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <select required value={formData.customerId} onChange={(e) => handleInputChange('customerId', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                    <select required value={formData.vehicleId} onChange={(e) => handleInputChange('vehicleId', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Vehicle</option>
                        {vehicles.filter(v => (typeof v.customerId === 'string' ? v.customerId : v.customerId?._id) === formData.customerId).map(v => <option key={v._id} value={v._id}>{v.make} {v.model} ({v.year})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <select required value={formData.serviceId} onChange={(e) => handleInputChange('serviceId', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Service</option>
                        {services.map(s => <option key={s._id.toString()} value={s._id.toString()}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mechanic</label>
                    <select required value={formData.mechanicId} onChange={(e) => handleInputChange('mechanicId', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Assign Mechanic</option>
                        {mechanics.map(m => <option key={m._id} value={m._id}>{m.fullName || m.name || 'Unnamed'}</option>)} 
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                    <input type="date" required value={formData.appointmentDate} onChange={(e) => handleInputChange('appointmentDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <select required value={formData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Select Time</option>
                            {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input type="time" required value={formData.endTime} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select value={formData.priority} onChange={(e) => handleInputChange('priority', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Estimated Cost ($)</label>
                    <input type="number" required value={formData.estimatedCost} onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>
            </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : (isEditing ? 'Update Appointment' : 'Save Appointment')}
          </button>
        </div>
      </form>
    </div>
  )
}
