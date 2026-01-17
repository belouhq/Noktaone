import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, subject, message, email, userId, username } = body;

    // Générer un ID de ticket unique
    const ticketId = `NOKTA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Formater l'email
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
    .ticket-id { background: #3B82F6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; }
    .field { margin-bottom: 20px; }
    .label { font-weight: 600; color: #374151; margin-bottom: 5px; }
    .value { background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .message-box { white-space: pre-wrap; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0 0 10px 0;">🎫 Nouveau Ticket Support</h1>
      <span class="ticket-id">${ticketId}</span>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">📧 Email de l'utilisateur</div>
        <div class="value">${email}</div>
      </div>
      
      <div class="field">
        <div class="label">👤 Utilisateur</div>
        <div class="value">@${username || 'Anonyme'} (ID: ${userId || 'N/A'})</div>
      </div>
      
      <div class="field">
        <div class="label">📁 Catégorie</div>
        <div class="value">${category}</div>
      </div>
      
      <div class="field">
        <div class="label">📋 Sujet</div>
        <div class="value">${subject}</div>
      </div>
      
      <div class="field">
        <div class="label">💬 Message</div>
        <div class="value message-box">${message}</div>
      </div>
      
      <div class="field">
        <div class="label">📅 Date</div>
        <div class="value">${new Date().toLocaleString('fr-FR', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}</div>
      </div>
    </div>
    <div class="footer">
      NOKTA ONE Support System
    </div>
  </div>
</body>
</html>
`;

    // Envoyer l'email via Resend (ou autre service)
    // Option 1: Utiliser Resend (recommandé)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOKTA Support <noreply@noktaone.com>',
          to: ['support@noktaone.com'],
          reply_to: email,
          subject: `[${ticketId}] ${category} - ${subject}`,
          html: emailContent,
        }),
      });

      if (!resendResponse.ok) {
        throw new Error('Failed to send email');
      }
    } else {
      // Fallback: Log pour le développement
      console.log('📧 EMAIL TICKET (DEV MODE)');
      console.log('To: support@noktaone.com');
      console.log('From:', email);
      console.log('Subject:', `[${ticketId}] ${category} - ${subject}`);
      console.log('Message:', message);
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Ticket created successfully'
    });

  } catch (error) {
    console.error('Support ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
