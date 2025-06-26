import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, systemPrompt } = await req.json()
    
    const OPENAI_API_KEY = "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";
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Convert messages to OpenAI format
    const openaiMessages = [];
    
    // Add system message if provided
    if (systemPrompt) {
      openaiMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add conversation messages
    messages.forEach(msg => {
      openaiMessages.push({
        role: msg.role,
        content: msg.content
      });
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ text: responseText || '' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in openai-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})