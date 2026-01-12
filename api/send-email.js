
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { to, subject, text, html } = req.body;

    if (!process.env.VITE_SENDGRID_API_KEY) {
        return res.status(500).json({ error: 'Missing API Key configuration' });
    }

    sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY);

    const sender = process.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@example.com';

    const msg = {
        to, // SendGrid supports array of strings
        from: sender,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
    };

    try {
        await sgMail.send(msg);
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('SendGrid Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email'
        });
    }
}
