'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Car, Calendar, CheckCircle, XCircle, AlertCircle, Camera, Plus, Trash2 } from 'lucide-react'
import FileUpload from '@/components/dashboard/FileUpload';
interface PartMinimal { _id: string; name: string; }

interface JobCard {
  _id: string
  appointmentId: { _id: string; appointmentDate: string; startTime: string; endTime: string }
  customerId: { _id: string; firstName: string; lastName: string }
  vehicleId: { _id: string; make: string; model: string; year: number; licensePlate: string }
  mechanicId: { _id: string; fullName: string }
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedStartTime: string
  estimatedEndTime: string
  actualStartTime?: string
  actualEndTime?: string
  laborHours: number
  notes?: string
  photos: string[]
  partsUsed: { partId: string; quantity: number; cost: number }[]
}

export default function JobCardDetailsPage() {
  const params = useParams()
  const { id } = params
  const [jobCard, setJobCard] = useState<JobCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [parts, setParts] = useState<PartMinimal[]>([])

  useEffect(() => {
    if (id) {
      fetchJobCard()
      fetchParts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchJobCard = async () => {
    try {
      const response = await fetch(`/api/job-cards/${id}`)
      if (response.ok) {
        setJobCard(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch job card:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/parts');
      if (response.ok) {
        setParts(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    }
  };

  const handleTimeTracking = async (action: 'start' | 'end') => {
    try {
      const response = await fetch(`/api/job-cards/${id}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        const updatedJobCard = await response.json();
        setJobCard(updatedJobCard.jobCard);
      }
    } catch (error) {
      console.error(`Failed to ${action} job:
`, error);
    }
  };

  const handlePhotoUpload = async (url: string) => {
    if (jobCard) {
      const updatedPhotos = [...jobCard.photos, url];
      try {
        const response = await fetch(`/api/job-cards/${id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: updatedPhotos }),
        });
        if (response.ok) {
          setJobCard({ ...jobCard, photos: updatedPhotos });
        }
      } catch (error) {
        console.error('Failed to upload photo:', error);
      }
    }
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    if (jobCard) {
      const updatedParts = [...jobCard.partsUsed];
      updatedParts[index] = { ...updatedParts[index], [field]: value };
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const addPart = () => {
    if (jobCard) {
      const updatedParts = [...jobCard.partsUsed, { partId: '', quantity: 1, cost: 0 }];
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const removePart = (index: number) => {
    if (jobCard) {
      const updatedParts = jobCard.partsUsed.filter((_, i) => i !== index);
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const saveParts = async () => {
    if (jobCard) {
      try {
        const response = await fetch(`/api/job-cards/${id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partsUsed: jobCard.partsUsed }),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to save parts');
        }
      } catch (error) {
        console.error('Failed to save parts:', error);
      }
    }
  };

  const saveNotes = async () => {
    if (jobCard) {
      try {
        const response = await fetch(`/api/job-cards/${id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: jobCard.notes }),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to save notes');
        }
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  if (!jobCard) {
    return <div>Job Card not found</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/job-cards" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Job Cards
      </Link>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Job Card Details</h1>
          <div className="flex space-x-2">
            {!jobCard.actualStartTime && (
              <button onClick={() => handleTimeTracking('start')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Start Job
              </button>
            )}
            {jobCard.actualStartTime && !jobCard.actualEndTime && (
              <button onClick={() => handleTimeTracking('end')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                End Job
              </button>
            )}
          </div>
        </div>
        {/* Display job card details here */}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Parts Used</h2>
        {jobCard.partsUsed.map((part, index) => (
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
        <div className="flex justify-end mt-4">
          <button onClick={saveParts} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Save Parts
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
        <textarea
          value={jobCard.notes || ''}
          onChange={(e) => setJobCard({ ...jobCard, notes: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={4}
        />
        <div className="flex justify-end mt-4">
          <button onClick={saveNotes} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Save Notes
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Photos</h2>
        <FileUpload onUpload={handlePhotoUpload} />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {jobCard.photos.map((photo, index) => (
            <div key={index} className="relative">
              <img src={photo} alt={`Progress photo ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
