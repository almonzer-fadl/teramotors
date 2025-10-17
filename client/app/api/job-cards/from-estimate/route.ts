import { connectToDatabase } from '@/lib/db'
import JobCard from '@/lib/models/JobCard'
import Estimate from '@/lib/models/Estimate'
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    const { estimateId } = body
    
    // Get the estimate
    const estimate = await Estimate.findById(estimateId)
      .populate('inspectionId', 'inspectionDate overallCondition')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'userId')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('parts.partId', 'name partNumber cost')
    
    if (!estimate) {
      return Response.json({ error: 'Estimate not found' }, { status: 404 })
    }

    // Convert estimate services to job card services
    const jobCardServices = estimate.services.map((service: any) => {
      // Get the populated service data
      const serviceData = service.serviceId as any;
      const laborHours = serviceData?.laborHours || 0;
      const laborRate = serviceData?.laborRate || 0;
      
      return {
        serviceId: service.serviceId._id || service.serviceId,
        quantity: service.quantity,
        laborHours: laborHours,
        laborRate: laborRate
      }
    })

    // Convert estimate parts to job card parts
    const jobCardParts = estimate.parts.map((part: any) => {
      // Get the populated part data
      const partData = part.partId as any;
      const cost = partData?.cost || part.unitCost || 0;
      
      return {
        partId: part.partId._id || part.partId,
        quantity: part.quantity,
        cost: cost
      }
    })

    // Create the job card
    const jobCard = new JobCard({
      inspectionId: estimate.inspectionId?._id,
      customerId: estimate.customerId._id,
      vehicleId: estimate.vehicleId._id,
      mechanicId: estimate.mechanicId._id,
      status: 'pending',
      priority: 'medium',
      services: jobCardServices,
      partsUsed: jobCardParts,
      notes: `Created from estimate - ${estimate.notes || 'No notes'}`,
      discount: 0 // Default discount when creating from estimate
    })

    await jobCard.save()

    // Update estimate status to approved
    await Estimate.findByIdAndUpdate(estimateId, { 
      status: 'approved',
      jobCardId: jobCard._id 
    })

    // Populate the job card for response
    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate('inspectionId', 'inspectionDate overallCondition totalEstimatedCost items')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'userId')
      .populate('services.serviceId', 'name description laborHours laborRate')
      .populate('partsUsed.partId', 'name partNumber cost')

    return Response.json({ 
      success: true, 
      jobCard: populatedJobCard
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job card from estimate:', error)
    return Response.json({ error: 'Failed to create job card from estimate' }, { status: 500 })
  }
}