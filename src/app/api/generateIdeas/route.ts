import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const data = await req.json()
    console.log('data', data)
    const systemPrompt = `summarize this video transcript (${data.transcript}) and include how it connects to sustainable development goal number ${data.sdg} and then given a nonprofit proposal idea related to the ted talk and give a title for the idea. Respond in this json format: {summary: string, idea: string, ideaTitle: string}`

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: systemPrompt
            }
        ],
        response_format: { "type": "json_object" }
    });
    console.log('completion', completion.choices[0].message.content)
    const summaries = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(summaries);
}