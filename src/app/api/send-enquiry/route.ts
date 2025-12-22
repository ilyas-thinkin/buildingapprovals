import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, countryCode, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !service) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter - configured with Hostinger SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // use TLS
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER || 'info@buildingapprovals.ae',
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER || 'info@buildingapprovals.ae',
      to: process.env.ENQUIRY_TO || 'info@buildingapprovals.ae',
      subject: `New Enquiry from ${name} - ${service}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(45deg, #006efe, #4da3f5); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #006efe; }
              .value { margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">New Enquiry - Building Approvals Dubai</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${countryCode} ${phone}</div>
                </div>
                <div class="field">
                  <div class="label">Service Requested:</div>
                  <div class="value">${service}</div>
                </div>
                ${message ? `
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message}</div>
                </div>
                ` : ''}
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">
                  This enquiry was submitted from buildingapprovals.ae contact form on ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Enquiry - Building Approvals Dubai

Name: ${name}
Email: ${email}
Phone: ${countryCode} ${phone}
Service Requested: ${service}
${message ? `Message: ${message}` : ''}

Submitted on: ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}
      `,
    };

    // Send email
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
