import { connectToDatabase } from '@/lib/db'
import JobCard from '@/lib/models/JobCard'
import Appointment from '@/lib/models/Appointment'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Service from '@/lib/models/Service'
import { getServerSession } from "@/lib/auth-server";
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const jobCards = await JobCard.find({})
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name laborHours laborRate')
      .sort({ createdAt: -1 })

    return Response.json(jobCards)
  } catch (error) {
    console.error('Error fetching job cards:', error)
    // Return empty array when database is unavailable
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    if (body.appointmentId) {
      const appointment = await Appointment.findById(body.appointmentId)
      if (!appointment) {
        return Response.json({ error: 'Appointment not found' }, { status: 400 })
      }
    }

    // Validate that customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Validate that vehicle exists
    const vehicle = await Vehicle.findById(body.vehicleId)
    if (!vehicle) {
      return Response.json({ error: 'Vehicle not found' }, { status: 400 })
    }

    // Validate that services exist
    if (body.services && body.services.length > 0) {
      for (const serviceItem of body.services) {
        const service = await Service.findById(serviceItem.serviceId)
        if (!service) {
          return Response.json({ error: `Service ${serviceItem.serviceId} not found` }, { status: 400 })
        }
      }
    }

    // Filter out parts with empty or invalid partId
    const validPartsUsed = (body.partsUsed || []).filter((part: any) => {
      return part.partId && part.partId.trim() !== '';
    });

    const jobCardData: any = {
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      services: body.services || [],
      partsUsed: validPartsUsed,
      notes: body.notes,
      discount: body.discount || 0
    };

    if (body.appointmentId) {
      jobCardData.appointmentId = body.appointmentId;
    }

    if (body.estimatedStartTime) {
      jobCardData.estimatedStartTime = new Date(body.estimatedStartTime);
    }

    if (body.estimatedEndTime) {
      jobCardData.estimatedEndTime = new Date(body.estimatedEndTime);
    }

    if (body.inspectionId) {
      jobCardData.inspectionId = body.inspectionId;
    }

    const jobCard = new JobCard(jobCardData)

    await jobCard.save()

    if (body.appointmentId) {
      await Appointment.findByIdAndUpdate(body.appointmentId, {
        status: 'in-progress'
      })
    }

    // Send job started WhatsApp message
    try {
      const whatsappListeners = WhatsAppEventListeners.getInstance();
      await whatsappListeners.onJobCardOpened(body.customerId);
    } catch (whatsappError) {
      console.error('Error sending job started WhatsApp message:', whatsappError);
      // Don't fail the job card creation if WhatsApp fails
    }

    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate('appointmentId', 'appointmentDate startTime endTime')
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name laborHours laborRate')

    return Response.json({ 
      success: true, 
      jobCard: populatedJobCard
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job card:', error)
    return Response.json({ error: 'Failed to create job card' }, { status: 500 })
  }
}
