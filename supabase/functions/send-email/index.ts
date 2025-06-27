// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

console.info('send-email function started');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, html, text }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject) {
      throw new Error("Missing required fields: to, subject");
    }

    // If no HTML provided but text is provided, convert text to HTML
    const emailHtml = html || (text ? text.replace(/\n/g, '<br>') : '');
    const emailText = text || (html ? html.replace(/<[^>]*>/g, '') : '');

    if (!emailHtml && !emailText) {
      throw new Error("Either html or text content is required");
    }

    // Get email service configuration from environment with better error handling
    const emailService = Deno.env.get("EMAIL_SERVICE")?.toLowerCase().trim() || "resend";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    
    console.log(`Email service configured as: ${emailService}`);
    console.log(`From email address: ${fromEmail}`);
    console.log(`Available environment variables: EMAIL_SERVICE=${Deno.env.get("EMAIL_SERVICE")}, RESEND_API_KEY=${resendApiKey ? 'set' : 'not set'}, SENDGRID_API_KEY=${sendGridApiKey ? 'set' : 'not set'}`);
    
    let response;
    
    if (emailService === "resend") {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY environment variable is required for Resend service");
      }
      response = await sendWithResend(to, subject, emailHtml, emailText, resendApiKey, fromEmail);
    } else if (emailService === "sendgrid") {
      if (!sendGridApiKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required for SendGrid service");
      }
      response = await sendWithSendGrid(to, subject, emailHtml, emailText, sendGridApiKey, fromEmail);
    } else {
      // Provide more detailed error information
      throw new Error(`Unsupported email service: "${emailService}". Supported services are: "resend" or "sendgrid". Please check your EMAIL_SERVICE environment variable.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        messageId: response.messageId || response.id,
        recipient: to,
        details: {
          service: emailService,
          from: fromEmail
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function sendWithResend(
  to: string, 
  subject: string, 
  html: string, 
  text?: string, 
  apiKey?: string,
  fromEmail?: string
) {
  const resendApiKey = apiKey || Deno.env.get("RESEND_API_KEY");
  const from = fromEmail || Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
  
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }

  console.log(`Sending email via Resend to ${to} from ${from}`);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Resend API error (${response.status}):`, errorData);
    throw new Error(`Resend API error (${response.status}): ${errorData}`);
  }

  const result = await response.json();
  console.log("Resend email sent successfully:", result);
  return result;
}

async function sendWithSendGrid(
  to: string, 
  subject: string, 
  html: string, 
  text?: string,
  apiKey?: string,
  fromEmail?: string
) {
  const sendGridApiKey = apiKey || Deno.env.get("SENDGRID_API_KEY");
  const from = fromEmail || Deno.env.get("FROM_EMAIL") || "noreply@resteasy.com";
  
  if (!sendGridApiKey) {
    throw new Error("SENDGRID_API_KEY environment variable is required");
  }

  console.log(`Sending email via SendGrid to ${to} from ${from}`);

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${sendGridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: from, name: "Ever Ease" },
      content: [
        {
          type: "text/html",
          value: html,
        },
        {
          type: "text/plain",
          value: text || html.replace(/<[^>]*>/g, ''),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`SendGrid API error (${response.status}):`, errorData);
    throw new Error(`SendGrid API error (${response.status}): ${errorData}`);
  }

  const result = { messageId: response.headers.get("x-message-id") };
  console.log("SendGrid email sent successfully:", result);
  return result;
}