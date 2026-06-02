import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function POST(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY ?? '' });

    const systemPrompt = `You are an expert legal writing assistant. Your job is to help lawyers write, refine, and edit text.

Rules:
- Respond ONLY with the modified text — no explanations, no markdown formatting, no prefixes.
- If given existing text, modify it according to the instruction.
- If no existing text, generate new text based on the instruction.
- Maintain professional legal tone.
- Fix grammar, spelling, and clarity issues automatically.
- Keep the same language as the original text unless asked to change it.`;

    const userPrompt = text?.trim()
      ? `Existing text:\n${text}\n\nInstruction: ${prompt}`
      : `Instruction: ${prompt}\n\nWrite professional text for a law firm context.`;

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      prompt: userPrompt,
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
    console.error('AI assist error:', error);
    return NextResponse.json({ error: 'AI assist failed' }, { status: 500 });
  }
}
