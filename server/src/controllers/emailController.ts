import type { Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

export const sendEmail = async (req: Request, res: Response) => {
    const { to, subject, text, html } = req.body;

    const apiKey = process.env.SENDGRID_API_KEY || process.env.VITE_SENDGRID_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Missing SendGrid API Key configuration' });
    }

    sgMail.setApiKey(apiKey);

    const sender = process.env.SENDGRID_FROM_EMAIL || process.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@example.com';

    const msg = {
        to, // SendGrid supports array of strings
        from: sender,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Email sent successfully to:', to);
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('❌ SendGrid Error:', error.message);
        if (error.response) {
            console.error('📋 Response Status:', error.response.statusCode);
            console.error('📋 Response Body:', JSON.stringify(error.response.body, null, 2));
        }

        // Provide helpful error messages
        let errorMessage = 'Failed to send email';
        if (error.response?.statusCode === 403) {
            errorMessage = 'SendGrid Forbidden: Please verify your sender email address in SendGrid dashboard';
        } else if (error.response?.statusCode === 401) {
            errorMessage = 'SendGrid Unauthorized: Invalid API key';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
