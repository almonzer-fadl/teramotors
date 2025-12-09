import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import TenantConfig from '@/lib/models/TenantConfig';
import { INSPECTION_CONFIG } from '@/lib/config/inspection';

// GET - Fetch inspection settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    await connectToDatabase();

    let tenantConfig = await TenantConfig.findOne({ tenantId }).lean();

    // If no config exists, return defaults from INSPECTION_CONFIG
    if (!tenantConfig || !tenantConfig.inspectionSettings) {
      return NextResponse.json({
        success: true,
        config: {
          defaultFee: INSPECTION_CONFIG.DEFAULT_FEE,
          invoiceDueDays: INSPECTION_CONFIG.INVOICE_DUE_DAYS,
          estimateValidityDays: INSPECTION_CONFIG.ESTIMATE_VALIDITY_DAYS,
          autoCloseInspectionJobCard: INSPECTION_CONFIG.AUTO_CLOSE_INSPECTION_JOB_CARD,
          autoGenerateEstimate: INSPECTION_CONFIG.AUTO_GENERATE_ESTIMATE,
          autoGenerateInvoice: INSPECTION_CONFIG.AUTO_GENERATE_INVOICE,
          whatsappNotifications: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      config: tenantConfig.inspectionSettings
    });

  } catch (error) {
    console.error('Error fetching inspection settings:', error);
    return NextResponse.json({
      error: 'Failed to fetch inspection settings'
    }, { status: 500 });
  }
}

// POST - Save inspection settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await request.json();

    const {
      defaultFee,
      invoiceDueDays,
      estimateValidityDays,
      autoCloseInspectionJobCard,
      autoGenerateEstimate,
      autoGenerateInvoice,
      whatsappNotifications
    } = body;

    await connectToDatabase();

    // Find or create tenant config
    let tenantConfig = await TenantConfig.findOne({ tenantId });

    if (!tenantConfig) {
      tenantConfig = new TenantConfig({
        tenantId,
        inspectionSettings: {}
      });
    }

    // Update inspection settings
    tenantConfig.inspectionSettings = {
      defaultFee: defaultFee || INSPECTION_CONFIG.DEFAULT_FEE,
      invoiceDueDays: invoiceDueDays || INSPECTION_CONFIG.INVOICE_DUE_DAYS,
      estimateValidityDays: estimateValidityDays || INSPECTION_CONFIG.ESTIMATE_VALIDITY_DAYS,
      autoCloseInspectionJobCard: autoCloseInspectionJobCard !== undefined ? autoCloseInspectionJobCard : INSPECTION_CONFIG.AUTO_CLOSE_INSPECTION_JOB_CARD,
      autoGenerateEstimate: autoGenerateEstimate !== undefined ? autoGenerateEstimate : INSPECTION_CONFIG.AUTO_GENERATE_ESTIMATE,
      autoGenerateInvoice: autoGenerateInvoice !== undefined ? autoGenerateInvoice : INSPECTION_CONFIG.AUTO_GENERATE_INVOICE,
      whatsappNotifications: whatsappNotifications !== undefined ? whatsappNotifications : true,
    };

    await tenantConfig.save();

    return NextResponse.json({
      success: true,
      message: 'Inspection settings saved successfully',
      config: tenantConfig.inspectionSettings
    });

  } catch (error) {
    console.error('Error saving inspection settings:', error);
    return NextResponse.json({
      error: 'Failed to save inspection settings'
    }, { status: 500 });
  }
}
