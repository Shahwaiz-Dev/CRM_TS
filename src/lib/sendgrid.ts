
interface SendGridResponse {
    success: boolean;
    message?: string;
    error?: string;
}

interface SendEmailParams {
    to: string[];
    subject: string;
    text: string;
    html?: string;
    from?: string;
}

const SENDGRID_API_URL = '/api/email/send';

export async function sendEmail({ to, subject, text, html, from }: SendEmailParams): Promise<SendGridResponse> {

    if (!to || to.length === 0) {
        return {
            success: false,
            error: 'No recipients specified'
        };
    }

    const payload = {
        to,
        subject,
        text,
        html,
    };

    try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(SENDGRID_API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        let data: any = {};

        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('Failed to parse JSON response:', text);
                    throw new Error('Invalid JSON response from server');
                }
            }
        } else {
            // Non-JSON response
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Server returned non-JSON response: ${response.statusText}`);
        }

        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.statusText}`);
        }

        return {
            success: true,
            message: 'Email sent successfully'
        };

    } catch (error) {
        console.error('Failed to send email via API:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
