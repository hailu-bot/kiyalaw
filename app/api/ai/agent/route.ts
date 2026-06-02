import { streamText, generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { AGENT_SYSTEM_PROMPT } from '@/lib/ai/agent-prompt';
import { allTools } from '@/lib/ai/agent-tools';

export async function POST(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query: string | undefined;
    let autoSuggest: boolean | undefined;
    try {
      const body = await req.json();
      query = body.query;
      autoSuggest = body.autoSuggest;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!autoSuggest && (!query || typeof query !== 'string' || !query.trim())) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY ?? '',
    });

    if (autoSuggest) {
      const result = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: AGENT_SYSTEM_PROMPT,
        prompt: 'Analyze the current firm data and suggest 2-4 specific actionable items. Be concise.',
        tools: allTools,
      });

      return Response.json({
        suggestion: result.text,
        toolResults: result.toolResults || [],
      });
    }

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: AGENT_SYSTEM_PROMPT,
      prompt: query as string,
      tools: allTools,
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
    console.error('AI agent error:', error);
    return NextResponse.json({ error: 'AI agent request failed' }, { status: 500 });
  }
}