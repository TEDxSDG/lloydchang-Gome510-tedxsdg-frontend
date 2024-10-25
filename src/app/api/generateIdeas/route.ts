// File: src/app/api/generateIdeas/route.ts
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_API_KEY environment variable not set!");
    return NextResponse.json({ error: "Server error: Missing API key" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const data = await req.json();

    if (!data || typeof data !== 'object' || !data.transcript || !data.sdg) {
      return NextResponse.json({ error: "Invalid input data. 'transcript' and 'sdg' are required." }, { status: 400 });
    }

    if (typeof data.transcript !== 'string' || !data.transcript.trim()) {
      return NextResponse.json({ error: "Invalid transcript. Must be a non-empty string." }, { status: 400 });
    }

    let sdgNumber: number;
    if (typeof data.sdg === 'string') {
      sdgNumber = parseInt(data.sdg.replace('sdg', ''), 10);
    } else if (typeof data.sdg === 'number') {
      sdgNumber = data.sdg;
    } else {
      return NextResponse.json({ error: "Invalid sdg. Must be a number or string." }, { status: 400 });
    }

    if (isNaN(sdgNumber) || sdgNumber < 1 || sdgNumber > 17) {
      return NextResponse.json({ error: "Invalid 'sdg' value. Must be a number between 1 and 17." }, { status: 400 });
    }

    const systemPrompt = `
Generate a summary, a nonprofit idea, and a title, all related to the provided transcript and SDG, in valid JSON.  Return ONLY JSON. Do not include markdown backticks.

Transcript:
${data.transcript}

SDG: ${sdgNumber}

Valid JSON Response Format:
{
  "summary": "string",
  "idea": "string",
  "ideaTitle": "string"
}
    `;

    let completion;
    try {
      completion = await model.generateContent([systemPrompt]);
    } catch (geminiCallError) {
      console.error("Gemini API call failed:", geminiCallError);
      return NextResponse.json({ error: "Error communicating with the AI model." }, { status: 500 });
    }

    if (!completion || !completion.response || !completion.response.text) {
      console.error("Invalid response from Gemini:", completion);
      return NextResponse.json({ error: "Invalid response from AI model." }, { status: 500 });
    }

    const content = completion.response.text();

    try {
      const jsonResponse = JSON.parse(content);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, content);
      return NextResponse.json({ error: "Error processing AI response. Invalid JSON returned.", content: content }, { status: 500 });
    }


  } catch (outerError: unknown) {  // Use unknown and narrow down
    if (outerError instanceof Error) {
      console.error("Unexpected error in generateIdeas route:", outerError.message);
      return NextResponse.json({ error: "An unexpected error occurred.", details: outerError.message }, { status: 500 });
    } else {
      console.error("Unexpected non-error in generateIdeas route:", outerError);
      return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
  }
}
