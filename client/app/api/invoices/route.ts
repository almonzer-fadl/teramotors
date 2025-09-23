import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import Estimate from '@/lib/models/Estimate';
import JobCard from '@/lib/models/JobCard';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { invoiceService } from '@/lib/services/InvoiceService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const invoices = await Invoice.find({})
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model licensePlate')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const { estimateId, jobCardId, dueDate, notes, paymentMethod } = body;

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
    }

    const invoice = new Invoice({
      jobCardId: jobCardId || undefined,
      customerId,
      vehicleId,
      mechanicId,
      status: 'pending',
      notes,
      totalAmount,
      paidAmount: 0,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      paymentMethod,
      paymentStatus: 'pending',
      zatca: zatcaData,
    });
    await invoice.save();

    // Optionally update the estimate status to 'converted' or similar
    if (estimateId) {
      await Estimate.findByIdAndUpdate(estimateId, { status: 'converted' });
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