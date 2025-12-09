import Tenant from '@/lib/models/Tenant';
import WhatsAppMessage from '@/lib/models/WhatsAppMessage';

async function sendMessage(tenantId: string, customerId: string, to: string, body: string): Promise<{ success: boolean; message?: string; error?: any }> {
    
    const tenant = await Tenant.findById(tenantId).select('integrations.whatsapp').lean();
    
    const instanceId = tenant?.integrations?.whatsapp?.instanceId;
    const token = tenant?.integrations?.whatsapp?.token;

    if (!instanceId || !token) {
        const errorMsg = 'WhatsApp integration not configured for this tenant.';
        console.error(errorMsg);
        await new WhatsAppMessage({
            tenantId,
            customerId,
            phoneNumber: to,
            body,
            status: 'failed',
            errorMessage: errorMsg,
        }).save();
        return { success: false, message: 'WhatsApp not configured.' };
    }
    
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
    
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('to', to);
    params.append('body', body);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await response.json();

        if (data.sent === 'true' || response.ok) {
            console.log('WhatsApp message sent successfully:', data);
            await new WhatsAppMessage({
                tenantId,
                customerId,
                phoneNumber: to,
                body,
                status: 'sent',
            }).save();
            return { success: true, message: data.message, ...data };
        } else {
            console.error('Failed to send WhatsApp message:', data.error);
             await new WhatsAppMessage({
                tenantId,
                customerId,
                phoneNumber: to,
                body,
                status: 'failed',
                errorMessage: data.error?.message || 'Unknown error from provider',
            }).save();
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        await new WhatsAppMessage({
            tenantId,
            customerId,
            phoneNumber: to,
            body,
            status: 'failed',
            errorMessage: (error as Error).message,
        }).save();
        return { success: false, error };
    }
}

export const WhatsAppService = {
    sendMessage,
};