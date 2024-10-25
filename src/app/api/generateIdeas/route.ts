// File: src/app/api/generateIdeas/route.ts
import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
if (!openRouterApiKey) {
    console.error("OPENROUTER_API_KEY environment variable not set!");
    // In production, you should throw an error or return a default response here.
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openRouterApiKey,
    defaultHeaders: { // Required for OpenRouter; adjust if necessary for your setup
      "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Replace with your site URL
      "X-Title": process.env.YOUR_SITE_NAME || "",       // Replace with your site name
    }
});



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
        `; // Strict prompt with JSON example

        console.log("Prompt sent to Gemma:", systemPrompt);

        try {
            console.log("About to call Gemma API via OpenRouter...");
            const completion = await openai.chat.completions.create({ // Gemma via OpenRouter
                model: "google/gemma-2-9b-it:free",  // Or the correct Gemma model string
                messages: [{ role: "system", content: systemPrompt }]
            });
            console.log("Gemma API call successful.");

            console.log("Raw OpenRouter response:", completion); // Log the entire response object


             if (!completion || !completion.choices || !completion.choices.length || !completion.choices[0].message || !completion.choices[0].message.content) {
                console.error("Invalid response from Gemma via OpenRouter:", completion);
                return NextResponse.json({ error: "Invalid response from Gemma" }, { status: 500 });
            }


            let content = completion.choices[0].message.content;
            console.log("Extracted content from Gemma:", content);


            try {
                const jsonResponse = JSON.parse(content); // Attempt direct parse
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
                        const regex = /{.*}/s; // Regex to extract JSON
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


        } catch (openRouterError) {
           console.error("OpenRouter Error:", openRouterError);
           return NextResponse.json({ error: "An error occurred while contacting OpenRouter" }, { status: 500 });
        }


    } catch (outerError) {
       console.error("General Error:", outerError);
       return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
