import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const data = await req.text()
    // console.log('data', data)
    // data should be {idea:'', sdg:''}
    const systemPrompt = `Given an idea for a nonprofit that covers the given sustainable development goal, please return the following JSON: 
    {
    "idea": {

   "name": string that is name of the nonprofit,

    "mission": string that is the mission statement,
    "goals": string[] that is a list of goals for the nonprofit,
    "targetMarket": {
      "entity": string - example "Individuals and communities",
      "ageRange": string - example "15-65",
      "income": string - example"Low to middle income",
      "occupation": string - example "Unemployed, underemployed, or in traditional non-sustainable industries",
      "geography": string - example "Rural and peri-urban areas in developing countries",
      "marginalizedIdentity": string - example "Indigenous populations, women, youth"
    },
    "primaryProduct": string - example "Integrated environmental education and sustainable livelihood training programs",
    "sdgs": string[] that is list of given SDGs
  }
}`

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: data
            }
        ],
        response_format: { "type": "json_object" }
    });
    // console.log('completion', completion.choices[0].message.content)
    const content = completion.choices[0].message.content;

    if (typeof content !== 'string') {
        return NextResponse.json({ error: 'Invalid response from OpenAI' }, { status: 500 });
    }

    let summaries;
    try {
        summaries = JSON.parse(content);
    } catch (error) {
        console.error('JSON parsing error:', error);  // Log the error for server-side debugging

        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';

        return NextResponse.json(
            { error: 'Failed to parse JSON response', details: errorMessage },
            { status: 500 }
        );
    }

    return NextResponse.json(summaries);
}