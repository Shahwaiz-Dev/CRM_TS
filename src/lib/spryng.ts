
interface SpryngSmsResponse {
    success: boolean;
    message?: string;
    error?: string;
}

interface SendSmsParams {
    recipients: string[];
    body: string;
    originator?: string;
    reference?: string;
    route?: string;
}

const SPRYNG_API_URL = 'https://rest.spryngsms.com/v1/messages';

export async function sendSms({ recipients, body, originator = 'CRM', reference, route = 'business' }: SendSmsParams): Promise<SpryngSmsResponse> {
    const apiKey = import.meta.env.VITE_SPRYNG_API_KEY;

    if (!apiKey) {
        console.error('Spryng API Key is missing. Please set VITE_SPRYNG_API_KEY in your .env file.');
        return {
            success: false,
            error: 'API Configuration Error: Missing API Key'
        };
    }

    if (!body || body.trim() === '') {
        return {
            success: false,
            error: 'Message body cannot be empty'
        };
    }

    // Spryng API expects recipients as an array of phone numbers
    // and body as the message content
    // Reference: https://docs.spryngsms.com/

    const payload = {
        recipients,
        body,
        originator,
        reference,
        route,
        encoding: 'auto'
    };

    console.log('Spryng SMS Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(SPRYNG_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.statusText}`);
        }

        return {
            success: true,
            message: 'SMS sent successfully'
        };

    } catch (error) {
        console.error('Failed to send SMS via Spryng:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
