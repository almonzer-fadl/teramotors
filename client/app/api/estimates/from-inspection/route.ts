import { connectToDatabase } from '@/lib/db'
import Estimate from '@/lib/models/Estimate'
import VehicleInspection from '@/lib/models/VehicleInspection'
import JobCard from '@/lib/models/JobCard'
import Service from '@/lib/models/Service'
import Part from '@/lib/models/Part'
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    const { inspectionId, selectedItems } = body
    
    // Get the inspection
    const inspection = await VehicleInspection.findById(inspectionId)
      .populate({
        path: 'jobCardId',
        populate: [
          { path: 'customerId', select: 'firstName lastName' },
          { path: 'vehicleId', select: 'make model year licensePlate' }
        ]
      })
      .populate('mechanicId', 'userId')

    if (!inspection) {
      return Response.json({ error: 'Inspection not found' }, { status: 404 })
    }

    const jobCard = inspection.jobCardId as any
    if (!jobCard) {
      return Response.json({ error: 'Job card not found for inspection' }, { status: 404 })
    }

    // Get available services and parts
    const services = await Service.find({ isActive: true })
    const parts = await Part.find({ isActive: true })

    // Convert inspection items to estimate services and parts
    const estimateServices = []
    const estimateParts = []
    let subtotal = 0

    for (const item of selectedItems) {
      if (item.condition === 'fair' || item.condition === 'poor' || item.condition === 'critical') {
        // Use inspection item data directly - don't try to match existing services
        // This ensures the estimate shows exactly what was found in the inspection
        const laborHours = 2 // Default labor hours for repair
        const laborRate = 50 // Default labor rate
        const laborCost = laborHours * laborRate
        const partsCost = item.estimatedCost || 0
        const totalCost = laborCost + partsCost

        // Use uniqueCode if available, otherwise use itemId
        const itemName = item.uniqueCode || item.itemId

        estimateServices.push({
          serviceId: null, // No service ID - this is inspection-based
          quantity: 1,
          laborHours,
          laborRate,
          laborCost,
          partsCost,
          totalCost,
          name: itemName,
          description: `${item.notes || 'Requires attention'} - Condition: ${item.condition}`
        })

        subtotal += totalCost

        // Add parts if estimated cost is provided
        if (item.estimatedCost > 0) {
          const itemName = item.uniqueCode || item.itemId
          estimateParts.push({
            partId: null, // No part ID - this is inspection-based
            quantity: 1,
            unitCost: item.estimatedCost,
            totalCost: item.estimatedCost,
            name: `${itemName} - Parts`,
            description: `Parts required for ${itemName} repair`
          })
        }
      }
    }

    console.log(`[Estimate from Inspection] Created ${estimateServices.length} services and ${estimateParts.length} parts from ${selectedItems.length} inspection items`);

    // Calculate tax and total (tax only on parts)
    const partsTotal = estimateParts.reduce((sum, part) => sum + part.totalCost, 0)
    const tax = partsTotal * 0.15 // 15% tax ONLY on parts
    const total = subtotal + tax

    // Set valid until date (30 days from now)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    // Create the estimate
    const estimate = new Estimate({
      inspectionId: inspection._id,
      customerId: jobCard.customerId._id,
      vehicleId: jobCard.vehicleId._id,
      mechanicId: inspection.mechanicId._id,
      services: estimateServices,
      parts: estimateParts,
      subtotal,
      tax,
      total,
      validUntil,
      notes: `Generated from inspection on ${inspection.inspectionDate.toLocaleDateString()}`
    })

    await estimate.save()

    // Populate the estimate for response
    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('inspectionId', 'inspectionDate overallCondition')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'userId')
      .populate('services.serviceId', 'name description')
      .populate('parts.partId', 'name partNumber')

    return Response.json({ 
      success: true, 
      estimate: populatedEstimate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating estimate from inspection:', error)
    return Response.json({ error: 'Failed to create estimate from inspection' }, { status: 500 })
  }
}
