import axios from 'axios';
import { NextResponse } from "next/server";
// import OpenAI from "openai";


interface Talk {
    title: string; // Title of the TED Talk
    url: string; // URL of the TED Talk
    sdg_tags: string[]; // Tags related to Sustainable Development Goals (SDGs)
    presenterDisplayName: string; // Name of the presenter
    transcript: string; // Full transcript of the talk
}

export async function POST(req) {

    // const openai = new OpenAI(process.env.OPENAI_API_KEY);
    const query = await req.text()
    const response = await axios.get(`https://tedxsdg-search-backend.vercel.app/api/search?query=${encodeURIComponent(query)}`);

    if (response.status !== 200) throw new Error(response.statusText);

    console.log('res', response)

    const data: Talk[] = response.data.results.map((result: any) => ({
        presenterDisplayName: result.document.presenterDisplayName || '',
        title: result.document.slug.replace(/_/g, ' ') || '',
        url: `https://www.ted.com/talks/${result.document.slug}`,
        sdg_tags: result.document.sdg_tags || [],
        transcript: result.document.transcript || '',
    }));

    // const completion = await openai.chat.completions.create({
    //     model: "gpt-4o-mini",
    //     messages: [
    //         {
    //             role: "system",
    //             content: systemPrompt
    //         },
    //         {
    //             role: "user",
    //             content: data
    //         }
    //     ],
    //     response_format: { "type": "json_object" }
    // });
    // const flashcards = JSON.parse(completion.choices[0].message.content).flashcards;

    return NextResponse.json(data);
}


// const handleGetTedTalks = async () => {
//     try {
//       const res = await fetch('/api/getTedTalks', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ text })
//       });
  
//       if (!res.ok) {
//         throw new Error('Failed to generate flashcards. Please try again.');
//       }
  
//       const data = await res.json();
//     } catch (error) {
//       console.error('Error generating ted talks:', error.message);
//       // alert('An error occurred while generating flashcards. Please try again.');
//     }
//   }