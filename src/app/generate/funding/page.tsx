"use client";

import React, { useState, useEffect } from "react";
import { fetchLLMResults } from "@/lib/utils";
import request from "./request.json";
import { marked } from "marked";

export default function FundingPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedResults = localStorage.getItem("llmResults");
      console.log('cache', cachedResults)

      if (cachedResults && cachedResults !== "undefined") {
        // If we have cached results, use them
        setResults(JSON.parse(cachedResults));
        setLoading(false);
      } else {
        // If no cached results, make the API call
        try {
          const response = await fetch(
            "https://ted-murex.vercel.app/grantInfo",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(request),
              // mode: "no-cors",
              
            }
          );
          const data = await response.json();
          console.log(data)
          // Store the new results in local storage
          localStorage.setItem("llmResults", JSON.stringify(data));
          setResults(data);
        } catch (error) {
          console.error("Error fetching LLM results:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      const response = await fetch('https://ted-murex.vercel.app/getGrantProposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'grant_proposal.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(results) }}></div>
      <button
        onClick={handleGeneratePDF}
        disabled={generatingPDF}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {generatingPDF ? 'Generating PDF...' : 'Generate Grant Proposal'}
      </button>
    </div>
  );
}
