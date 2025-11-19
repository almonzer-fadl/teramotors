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
      if (item.condition === 'poor' || item.condition === 'critical') {
        // Find matching service
        const matchingService = services.find(s => 
          s.name.toLowerCase().includes(item.itemId.toLowerCase()) ||
          s.description.toLowerCase().includes(item.itemId.toLowerCase())
        )
        
        if (matchingService) {
          const laborCost = matchingService.laborHours * matchingService.laborRate
          const partsCost = item.estimatedCost || 0
          const totalCost = laborCost + partsCost
          
          estimateServices.push({
            serviceId: matchingService._id,
            quantity: 1,
            laborCost,
            partsCost,
            totalCost
          })
          
          subtotal += totalCost
        } else {
          // Create a generic service entry
          const laborCost = 2 * 50 // 2 hours at $50/hour
          const partsCost = item.estimatedCost || 0
          const totalCost = laborCost + partsCost
          
          estimateServices.push({
            serviceId: null, // Will be handled differently
            quantity: 1,
            laborCost,
            partsCost,
            totalCost,
            itemName: item.itemId,
            itemDescription: `Repair ${item.itemId} - ${item.notes || 'No description'}`
          })
          
          subtotal += totalCost
        }

        // Add parts if estimated cost is provided
        if (item.estimatedCost > 0) {
          const matchingPart = parts.find(p => 
            p.name.toLowerCase().includes(item.itemId.toLowerCase())
          )
          
          if (matchingPart) {
            estimateParts.push({
              partId: matchingPart._id,
              quantity: 1,
              unitCost: item.estimatedCost,
              totalCost: item.estimatedCost
            })
          } else {
            estimateParts.push({
              partId: null,
              quantity: 1,
              unitCost: item.estimatedCost,
              totalCost: item.estimatedCost,
              partName: `${item.itemId} parts`,
              partDescription: `Parts for ${item.itemId} repair`
            })
          }
        }
      }
    }

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
