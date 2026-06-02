import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function POST(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let prompt: string;
    let documentContext: string | undefined;
    let selection: string | undefined;
    try {
      const body = await req.json();
      prompt = body.prompt;
      documentContext = body.documentContext;
      selection = body.selection;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY ?? '',
    });

    const systemPrompt = `You are an expert legal drafting assistant for a law firm.
Your role is to draft clear, precise legal language that follows standard legal conventions.
Respond only with the requested legal text — no explanations, no markdown formatting, no prefixes like "Here is" or "Certainly."
If the user highlights a specific section, address only that section.
Maintain a formal, authoritative legal tone throughout.`;

    const plainContext = documentContext ? documentContext.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    const userPrompt = [
      selection ? `The following text is selected for revision:\n${selection}\n\n` : '',
      plainContext ? `Document context (first 6000 chars):\n${plainContext.slice(0, 6000)}\n\n` : '',
      `Instruction: ${prompt}`,
    ].join('');

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      prompt: userPrompt || prompt,
    });

    const textStream = result.textStream;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI draft error:', error);
    return NextResponse.json({ error: 'AI draft generation failed' }, { status: 500 });
  }
}