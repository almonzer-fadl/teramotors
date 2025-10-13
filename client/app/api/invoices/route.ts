import { connectToDatabase } from '@/lib/db';
import { Invoice, Estimate, JobCard, Customer, Vehicle, Service, Part } from '@/lib/models';
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server';
import { invoiceService } from '@/lib/services/InvoiceService';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalCount = await Invoice.countDocuments({});

    const invoices = await Invoice.find({})
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return new Response(JSON.stringify({
      invoices,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const { estimateId, jobCardId, dueDate, notes, paymentMethod } = body;
    const { customerId: manualCustomerId, vehicleId: manualVehicleId, services: manualServices, partsUsed: manualParts } = body;

    let totalAmount = 0;
    let customerId;
    let vehicleId;
    let mechanicId;
    let zatcaData = null;

    if (jobCardId) {
      const jobCard = await JobCard.findById(jobCardId)
        .populate('customerId')
        .populate('vehicleId')
        .populate('services.serviceId')
        .populate('partsUsed.partId');
      if (!jobCard) {
        return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
      }
      
      // Generate ZATCA-compliant invoice
      const zatcaResult = await invoiceService.createInvoiceFromJobCard({
        jobCardId: jobCard._id.toString(),
        customerId: jobCard.customerId,
        vehicleId: jobCard.vehicleId,
        services: jobCard.services || [],
        partsUsed: jobCard.partsUsed || [],
        notes,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        paymentMethod,
      });

      if (zatcaResult.success && zatcaResult.invoice) {
        totalAmount = zatcaResult.invoice.totals.totalAmount;
        customerId = jobCard.customerId;
        vehicleId = jobCard.vehicleId;
        
        // Store ZATCA data
        zatcaData = {
          qrCode: zatcaResult.qrCode,
          qrCodeImage: zatcaResult.invoice?.zatca?.qrCodeImage,
          invoiceNumber: zatcaResult.invoice.invoiceData.invoiceNumber,
          invoiceDate: zatcaResult.invoice.invoiceData.invoiceDate,
          vatAmount: zatcaResult.invoice.totals.totalVAT,
          subtotal: zatcaResult.invoice.totals.subtotal,
          compliance: zatcaResult.invoice.zatca.compliance,
        };
      } else {
        // Fallback calculation if ZATCA fails
        const servicesTotal = (jobCard.services || []).reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
        const partsTotal = (jobCard.partsUsed || []).reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
        totalAmount = servicesTotal + partsTotal;
        customerId = jobCard.customerId;
        vehicleId = jobCard.vehicleId;
      }
    } else {
      // Manual creation path
      if (!manualCustomerId || !manualVehicleId) {
        return new Response(JSON.stringify({ error: 'customerId and vehicleId are required for manual invoices' }), { status: 400 });
      }

      // Attempt ZATCA generation from manual lines
      try {
        const customerDoc: any = await (await import('@/lib/models/Customer')).default.findById(manualCustomerId).lean();
        const items: any[] = [];
        if (Array.isArray(manualServices)) {
          manualServices.forEach((s: any, idx: number) => {
            items.push({
              id: `service-${idx}`,
              name: s.name || 'Service',
              description: `Labor hours: ${Number(s.laborHours || 0)}`,
              quantity: Number(s.quantity || 0) || 1,
              unitPrice: Number(s.laborRate || 0),
              vatRate: undefined,
            });
          });
        }
        if (Array.isArray(manualParts)) {
          manualParts.forEach((p: any, idx: number) => {
            items.push({
              id: `part-${idx}`,
              name: p.name || 'Part',
              description: 'Auto part',
              quantity: Number(p.quantity || 0) || 1,
              unitPrice: Number(p.cost || 0),
              vatRate: undefined,
            });
          });
        }

        const zatcaResult = await invoiceService.createInvoice({
          items,
          customer: customerDoc ? { name: `${customerDoc.firstName} ${customerDoc.lastName}`, email: customerDoc.email, phone: customerDoc.phone } : undefined,
          paymentMethod,
          notes,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        if (zatcaResult.success && zatcaResult.invoice) {
          totalAmount = zatcaResult.invoice.totals.totalAmount;
          zatcaData = {
            qrCode: zatcaResult.qrCode,
            qrCodeImage: zatcaResult.invoice?.zatca?.qrCodeImage,
            invoiceNumber: zatcaResult.invoice.invoiceData.invoiceNumber,
            invoiceDate: zatcaResult.invoice.invoiceData.invoiceDate,
            vatAmount: zatcaResult.invoice.totals.totalVAT,
            subtotal: zatcaResult.invoice.totals.subtotal,
            compliance: zatcaResult.invoice.zatca.compliance,
          };
        } else {
          // Fallback totals if ZATCA failed
          const servicesTotal = Array.isArray(manualServices) ? manualServices.reduce((sum: number, s: any) => {
            const qty = Number(s.quantity || 0);
            const hours = Number(s.laborHours || 0);
            const rate = Number(s.laborRate || 0);
            return sum + (qty * hours * rate);
          }, 0) : 0;
          const partsTotal = Array.isArray(manualParts) ? manualParts.reduce((sum: number, p: any) => {
            const qty = Number(p.quantity || 0);
            const cost = Number(p.cost || 0);
            return sum + (qty * cost);
          }, 0) : 0;
          totalAmount = servicesTotal + partsTotal;
        }
      } catch (e) {
        // If anything fails in ZATCA path, fallback to totals only
        const servicesTotal = Array.isArray(manualServices) ? manualServices.reduce((sum: number, s: any) => {
          const qty = Number(s.quantity || 0);
          const hours = Number(s.laborHours || 0);
          const rate = Number(s.laborRate || 0);
          return sum + (qty * hours * rate);
        }, 0) : 0;
        const partsTotal = Array.isArray(manualParts) ? manualParts.reduce((sum: number, p: any) => {
          const qty = Number(p.quantity || 0);
          const cost = Number(p.cost || 0);
          return sum + (qty * cost);
        }, 0) : 0;
        totalAmount = servicesTotal + partsTotal;
      }

      customerId = manualCustomerId;
      vehicleId = manualVehicleId;
    }

    const invoiceDoc: any = {
      customerId,
      vehicleId,
      mechanicId,
      status: 'pending',
      notes,
      totalAmount,
      paidAmount: 0,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      paymentMethod,
      zatca: zatcaData,
    };
    if (jobCardId) {
      invoiceDoc.jobCardId = jobCardId;
    }
    const invoice = new Invoice(invoiceDoc);
    await invoice.save();

    // Optionally update the estimate status to 'converted' or similar
    if (estimateId) {
      await Estimate.findByIdAndUpdate(estimateId, { status: 'converted' });
    }

    // Send invoice ready WhatsApp message
    try {
      const whatsappListeners = WhatsAppEventListeners.getInstance();
      await whatsappListeners.onInvoiceCreated(customerId.toString());
    } catch (whatsappError) {
      console.error('Error sending invoice ready WhatsApp message:', whatsappError);
      // Don't fail the invoice creation if WhatsApp fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invoice,
      zatca: zatcaData ? {
        qrCode: zatcaData.qrCode,
        invoiceNumber: zatcaData.invoiceNumber,
        isCompliant: zatcaData.compliance.isCompliant,
      } : null
    }), { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to create invoice' }), { status: 500 });
  }
}