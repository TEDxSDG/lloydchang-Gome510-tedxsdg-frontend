import axios from 'axios';
import { NextResponse, NextRequest } from "next/server";

interface Talk {
    title: string; // Title of the TED Talk
    url: string; // URL of the TED Talk
    sdg_tags: string[]; // Tags related to Sustainable Development Goals (SDGs)
    presenterDisplayName: string; // Name of the presenter
    transcript: string; // Full transcript of the talk
}

interface ResultDocument {
    presenterDisplayName?: string | null;
    slug: string;
    sdg_tags?: string[] | null;
    transcript?: string | null;
}

interface Result {
    document: ResultDocument;
}

export async function POST(req: NextRequest) {

    const query = await req.json();
    const response = await axios.get(`https://tedxsdg-search-backend.vercel.app/api/search?query=${encodeURIComponent(query.text)}`);

    if (response.status !== 200) throw new Error(response.statusText);

    const data: Talk[] = response.data.results.map((result: Result) => ({
        presenterDisplayName: result.document.presenterDisplayName || '',
        title: result.document.slug.replace(/_/g, ' ') || '',
        url: `https://www.ted.com/talks/${result.document.slug}`,
        sdg_tags: result.document.sdg_tags || [],
        transcript: result.document.transcript || '',
    }));

    return NextResponse.json(data);
}
