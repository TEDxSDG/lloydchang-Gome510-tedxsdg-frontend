// File: src/app/generate/funding/page.tsx
"use client";

import React, { useState, useEffect } from "react";
// import request from "./request.json"; // No longer needed, using idea JSON
import { marked } from "marked";
import jsPDF from "jspdf";

export default function FundingPage() {
  const [investors, setInvestors] = useState<string>("");
  const [grants, setGrants] = useState<string>("");
  const [grantProposal, setGrantProposal] = useState<string>("");
  // const [pitchText, setPitchText] = useState<string>('');
  // const [pitchAudio, setPitchAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [investorsCollapsed, setInvestorsCollapsed] = useState(true);
  const [grantsCollapsed, setGrantsCollapsed] = useState(true);
  // const [pitchCollapsed, setPitchCollapsed] = useState(true);
  // const [generatingAudio, setGeneratingAudio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedGrants = localStorage.getItem("grantResults");
      const cachedInvestors = localStorage.getItem("investorResults");
      const cachedGrantProposal = localStorage.getItem("grantProposalResults");
      // const cachedPitchText = localStorage.getItem("pitchTextResults");

      if (cachedGrants && cachedInvestors && cachedGrantProposal) {
        setGrants(JSON.parse(cachedGrants));
        setInvestors(JSON.parse(cachedInvestors));
        setGrantProposal(JSON.parse(cachedGrantProposal));
        // setPitchText(JSON.parse(cachedPitchText))
        setLoading(false);
      } else {
        // If no cached results, make the API call
        try {
          // Fetch grants
          const selectedIdea = JSON.parse(localStorage.getItem("selectedIdea") || "{}");
          const ideaJSONRequest = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idea: selectedIdea.idea,
              ideaTitle: selectedIdea.ideaTitle,
              sdg: selectedIdea.sdg,
            }),
          };
          const grantResponse = await fetch(
            "https://ted-murex.vercel.app/grantInfo",
            {
              ...ideaJSONRequest,
            }
          );
          const grantData = await grantResponse.json();
          localStorage.setItem("grantResults", JSON.stringify(grantData));
          setGrants(grantData);

          // Fetch grant proposal
          const grantProposalResponse = await fetch(
            "https://ted-murex.vercel.app/getGrantProposal",
            {
              ...ideaJSONRequest,
            }
          );
          const grantProposalData = await grantProposalResponse.json();
          localStorage.setItem("grantProposalResults", JSON.stringify(grantProposalData));
          setGrantProposal(grantProposalData);

          // Fetch investors
          const investorResponse = await fetch(
            "https://ted-murex.vercel.app/investors",
            {
              ...ideaJSONRequest,
            }
          );
          const investorData = await investorResponse.json();
          localStorage.setItem("investorResults", JSON.stringify(investorData));
          setInvestors(investorData);

          // Fetch pitch
          // const pitchTextResponse = await fetch(
          //   "https://ted-murex.vercel.app/generatePitchText",
          //   {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify(request),
          //   }
          // );
          // const pitchTextData = await pitchTextResponse.json();
          // console.log('pitchTextData', pitchTextData)
          // localStorage.setItem("pitchTextResults", JSON.stringify(pitchTextData.pitch_text));
          // setPitchText(pitchTextData.pitch_text);


        } catch (error) {
          console.error("Error fetching results:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  const handleGeneratePDF = () => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      
      // Convert markdown to HTML
      const htmlContent = marked.parse(grantProposal);
      
      // Remove HTML tags to get plain text
      const plainText = (htmlContent as string).replace(/<[^>]+>/g, '');
      
      // Split the content into lines
      const lines = doc.splitTextToSize(plainText, 180);
      
      let y = 10;
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 7;
      });

      doc.save('grant_proposal.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const toggleSection = (section: 'investors' | 'grants' | 'pitch') => {
    if (section === 'investors') {
      setInvestorsCollapsed(!investorsCollapsed);
    } else if (section === 'grants') {
      setGrantsCollapsed(!grantsCollapsed);
    }
    // else {
    //   setPitchCollapsed(!pitchCollapsed)
    // }
  };

  // const handleGenerateAudio = async () => {
  //   setGeneratingAudio(true);
  //   try {

  //     const pitchResponse = await fetch(
  //       "https://ted-murex.vercel.app/generatePitchAudio",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(pitchText),
  //       }
  //     );

  //     if (!pitchResponse.ok) {
  //       throw new Error('Failed to generate pitch audio');
  //     }

  //     const audioBlob = await pitchResponse.blob();
  //     const audioUrl = URL.createObjectURL(audioBlob);

  //     // Create a temporary anchor element to trigger the download
  //     const a = document.createElement('a');
  //     a.href = audioUrl;
  //     a.download = 'pitch_audio.mp3'; // You can change the file name and extension as needed
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);

  //     // Optionally, you can also update the pitchAudio state and localStorage
  //     setPitchAudio(audioUrl);
  //     localStorage.setItem("pitchAudioUrl", audioUrl);

  //   } catch (error) {
  //     console.error("Error generating audio:", error);
  //     alert('Failed to generate audio. Please try again.');
  //   } finally {
  //     setGeneratingAudio(false);
  //   }
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('investors')}
          className="text-3xl font-bold w-full text-left flex justify-between items-center bg-gray-200 p-4 rounded-t"
        >
          <span>Investors</span>
          <span>{investorsCollapsed ? '▼' : '▲'}</span>
        </button>
        {!investorsCollapsed && (
          <div className="bg-gray-100 shadow-md rounded-b px-8 pt-6 pb-8">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(investors) }}></div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <button 
          onClick={() => toggleSection('grants')}
          className="text-3xl font-bold w-full text-left flex justify-between items-center bg-gray-200 p-4 rounded-t"
        >
          <span>Grants</span>
          <span>{grantsCollapsed ? '▼' : '▲'}</span>
        </button>
        {!grantsCollapsed && (
          <div className="bg-gray-100 shadow-md rounded-b px-8 pt-6 pb-8">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(grants) }}></div>
          </div>
        )}
      </div>

      {/* <div className="mb-6">
        <button 
          onClick={() => toggleSection('pitch')}
          className="text-3xl font-bold w-full text-left flex justify-between items-center bg-gray-200 p-4 rounded-t"
        >
          <span>Pitch</span>
          <span>{pitchCollapsed ? '▼' : '▲'}</span>
        </button>
        {!pitchCollapsed && (
          <div className="bg-gray-100 shadow-md rounded-b px-8 pt-6 pb-8">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(pitchText) }}></div>
          </div>
        )}
      </div> */}

      {/* {pitchAudio && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Pitch Audio</h2>
          <audio controls src={pitchAudio}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )} */}

      <div className="flex space-x-4">
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {generatingPDF ? 'Generating PDF...' : 'Generate Grant Proposal PDF'}
        </button>

        {/* <button
          onClick={handleGenerateAudio}
          disabled={generatingAudio}
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {generatingAudio ? 'Generating Audio...' : 'Generate & Download Pitch Audio'}
        </button> */}
      </div>
    </div>
  );
}
