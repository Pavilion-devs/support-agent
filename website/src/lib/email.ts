// For client-side email sending, we'll create API calls to a serverless function
// Since we can't use Resend directly from the client (security reasons)

export interface EmailData {
  to: string
  subject: string
  html: string
}

// This would typically call your backend/serverless function
export const sendEmail = async (data: EmailData) => {
  try {
    // For now, we'll simulate the email sending
    // In production, this would call your API endpoint that uses Resend
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
export const createWaitlistWelcomeEmail = (firstName: string, company: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Twisky!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Twisky</h1>
      <p style="color: #888888; margin: 10px 0 0;">AI-Powered Customer Support</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Welcome to the waitlist, ${firstName}! 🚀</h2>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 20px;">
        Thank you for your interest in Twisky! We're excited to have ${company} on our waitlist.
      </p>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
        You're now part of an exclusive group that will get:
      </p>
      
      <ul style="color: #cccccc; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">⚡ Priority access when we launch</li>
        <li style="margin-bottom: 8px;">🎯 Exclusive early-bird pricing</li>
        <li style="margin-bottom: 8px;">💬 Direct feedback line to shape the product</li>
        <li style="margin-bottom: 8px;">📚 Early access to our knowledge base</li>
      </ul>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
        We'll keep you updated on our progress and notify you as soon as Twisky is ready for ${company}.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://usetwisky.com" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Visit Our Website
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #666666; font-size: 14px;">
      <p>Questions? Just reply to this email - we'd love to hear from you!</p>
      <p style="margin-top: 20px;">
        Twisky • AI-Powered Customer Support<br>
        <a href="mailto:hello@usetwisky.com" style="color: #888888;">hello@usetwisky.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export const createDemoConfirmationEmail = (firstName: string, company: string, preferredTime: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Demo Scheduled - Twisky</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Twisky</h1>
      <p style="color: #888888; margin: 10px 0 0;">AI-Powered Customer Support</p>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Demo scheduled! 📅</h2>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 20px;">
        Hi ${firstName},
      </p>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 20px;">
        Thank you for booking a demo of Twisky for ${company}! We're excited to show you how our AI-powered customer support can transform your operations.
      </p>
      
      <div style="background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 15px;">What's Next?</h3>
        <ul style="color: #cccccc; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">📧 Calendar invite sent to your email</li>
          <li style="margin-bottom: 8px;">🎯 Demo customized for your use case</li>
          <li style="margin-bottom: 8px;">📋 Follow-up resources after the call</li>
          <li style="margin-bottom: 8px;">⏰ Preferred time: ${preferredTime}</li>
        </ul>
      </div>
      
      <p style="color: #cccccc; line-height: 1.6; margin-bottom: 30px;">
        Our team will reach out within 24 hours to confirm your preferred time slot and send you the meeting details.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://usetwisky.com" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Learn More About Twisky
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #666666; font-size: 14px;">
      <p>Need to reschedule? Just reply to this email!</p>
      <p style="margin-top: 20px;">
        Twisky • AI-Powered Customer Support<br>
        <a href="mailto:hello@usetwisky.com" style="color: #888888;">hello@usetwisky.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export const createAdminNotificationEmail = (type: 'waitlist' | 'demo', data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New ${type === 'waitlist' ? 'Waitlist' : 'Demo'} Submission</title>
</head>
<body style="font-family: monospace; background-color: #f5f5f5; color: #333; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="color: #2563eb; margin-bottom: 20px;">🎉 New ${type === 'waitlist' ? 'Waitlist' : 'Demo'} Submission</h2>
    
    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
      <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Team Size:</strong> ${data.team_size}</p>
      ${type === 'demo' ? `
      <p><strong>Job Title:</strong> ${data.job_title}</p>
      <p><strong>Current Solution:</strong> ${data.current_solution}</p>
      <p><strong>Preferred Time:</strong> ${data.preferred_time}</p>
      <div style="margin-top: 15px;">
        <strong>Challenges:</strong>
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; margin-top: 5px;">
          ${data.challenges}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div style="color: #6b7280; font-size: 14px;">
      <p>Submitted: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
 
 