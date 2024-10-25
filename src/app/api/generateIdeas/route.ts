// File: src/app/api/generateIdeas/route.ts
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY environment variable not set!");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("Incoming data (generateIdeas):", data);
        console.log("Data types:", typeof data, typeof data.transcript, typeof data.sdg);

        if (!data || typeof data !== 'object' || !data.transcript || !data.sdg) {
            return NextResponse.json({ error: "Invalid input data. 'transcript' and 'sdg' are required." }, { status: 400 });
        }

        let sdgNumber;
        if (typeof data.sdg === 'string') {
            sdgNumber = parseInt(data.sdg.replace('sdg', ''), 10);
        } else if (typeof data.sdg === 'number') {
            sdgNumber = data.sdg;
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
        `; // Strict prompt with JSON example

        console.log("Prompt sent to Gemini:", systemPrompt);

        let completion;
        try {
            console.log("About to call Gemini API...");
            completion = await model.generateContent([systemPrompt]);
            console.log("Gemini API call successful.");
        } catch (geminiCallError) {  // Handle Gemini errors
            console.error("Gemini API call failed:", geminiCallError);
            if (geminiCallError instanceof Error) {
                return NextResponse.json({ error: "Gemini API Call Error", details: geminiCallError.message, prompt: systemPrompt, dataReceived: data}, {status: 500 });
            } else {
                 return NextResponse.json({ error: "Gemini API call failed - unknown error", prompt: systemPrompt, dataReceived: data}, {status: 500});
            }
        }

        if (!completion || !completion.response || !completion.response.text) {
          console.error("Invalid response from Gemini:", completion);
          return NextResponse.json({ error: "Invalid response from Gemini API"}, {status: 500});

        }

        let content = completion.response.text();
        console.log("Raw Gemini response (generateIdeas):", content);

        try {
            const jsonResponse = JSON.parse(content);
            return NextResponse.json(jsonResponse);

        } catch (parseError) {
            console.error("JSON parsing error (generateIdeas):", parseError);
            console.error("Content that failed to parse (generateIdeas):", content);

        }
    } catch (outerError) { // Handle other errors
        console.error("Unexpected error in generateIdeas route:", outerError);
        if (outerError instanceof Error) {
             return NextResponse.json({ error: "An unexpected error occurred", details: outerError.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
        }
    }
}
