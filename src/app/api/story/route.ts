import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const defaultPrompt = `Write a magical short story that captures the reader's imagination. 
The story should be engaging, well-structured, and suitable for all ages. 
Include vivid descriptions and a satisfying narrative arc.`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a master storyteller who writes engaging, magical stories. Your stories are:
          - Well-structured with clear narrative flow
          - Rich in vivid, sensory details
          - Engaging and imaginative
          - Between 1000-5000 words
          If continuing a story, maintain consistency with the existing narrative and add meaningful progression.`
        },
        {
          role: "user",
          content: prompt || defaultPrompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const story = completion.choices[0]?.message?.content || "Once upon a time...";
    
    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
