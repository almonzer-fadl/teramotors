'use client'
import { useState } from 'react'
import { useSession } from '@/lib/hooks/useSession'

export default function ProfilePage() {
  const { user } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: (user as any)?.name || '',
    email: user?.email || '',
    phone: '',
    role: (user as any)?.role || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add API call to update profile
    console.log('Updating profile:', formData)
    setIsEditing(false)
  }

  return (
    <div>
      <h1>My Profile</h1>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="Full Name"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Email"
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Phone"
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {formData.fullName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phone || 'Not set'}</p>
          <p><strong>Role:</strong> {formData.role}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  )
}
