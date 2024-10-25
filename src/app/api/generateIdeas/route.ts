// File: src/app/api/generateIdeas/route.ts
import { NextResponse, NextRequest } from "next/server";
import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.error("GROQ_API_KEY environment variable not set!");
    // In production, you should throw an error or return a default response here.
}

const groq = new Groq({ apiKey: groqApiKey });

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.debug(`Incoming data (generateIdeas):`, data);

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
Generate a summary, a nonprofit idea, and a title, all related to the provided transcript and SDG, in valid JSON.  Return ONLY JSON. Do NOT include markdown backticks.

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

        try {
            console.debug("About to call Groq API...");
            const completion = await groq.chat.completions.create({
                model: "gemma2-9b-it", // Or the correct Gemma model string
                messages: [{ role: "system", content: systemPrompt }]
            });
            console.debug("Groq API call successful.");

            if (!completion || !completion.choices || !completion.choices.length || !completion.choices[0].message || !completion.choices[0].message.content) {
                console.error("Invalid response from Groq:", completion);
                return NextResponse.json({ error: "Invalid response from Groq" }, { status: 500 });
            }

            let content = completion.choices[0].message.content;

            try {
                const jsonResponse = JSON.parse(content);
                console.debug("Returning JSON response:", jsonResponse);
                return NextResponse.json(jsonResponse);
            } catch (parseError) {
                console.error("Initial JSON parsing failed:", parseError);
                console.error("Response that failed initial parsing:", content);

                // Remove backticks and retry parsing
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();

                try {
                    const cleanedJsonResponse = JSON.parse(content);
                    console.warn("Removed backticks and parsed successfully. Full response:", content);
                    return NextResponse.json(cleanedJsonResponse);
                } catch (cleanedParseError) {
                    console.error("Parsing failed even after removing backticks:", cleanedParseError);

                    try { // Regex fallback (optional, but recommended for robustness)
                        const regex = /{.*}/s;
                        const match = content.match(regex);

                        if (match) {
                            const extractedJson = JSON.parse(match[0]);
                            console.warn("Used regex fallback.  Full response:", content);
                            return NextResponse.json(extractedJson);
                        } else {
                           return NextResponse.json({error: "Failed to extract JSON after backtick removal and regex", geminiResponse: content, dataReceived: data }, { status: 500});
                        }

                     } catch (regexError) {
                       console.error("Regex extraction and parsing failed:", regexError);
                       return NextResponse.json({ error: "JSON parsing and extraction failed", geminiResponse: content, dataReceived: data }, { status: 500 });

                     }
                }
            }

        } catch (groqError) {
           console.error("Groq Error:", groqError);
           return NextResponse.json({ error: "An error occurred while contacting Groq" }, { status: 500 });
        }

    } catch (outerError) {
       console.error("General Error:", outerError);
       return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
