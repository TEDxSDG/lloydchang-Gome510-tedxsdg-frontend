"use client";

import React, { useState, useEffect } from "react";
import { fetchLLMResults } from "@/lib/utils";
import request from "./request.json";
import { marked } from "marked";
import jsPDF from 'jspdf';

export default function FundingPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedResults = localStorage.getItem("llmResults");

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
  }, []);

  const handleGeneratePDF = () => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      
      // Convert markdown to HTML
      const htmlContent = marked.parse(results);
      
      // Remove HTML tags to get plain text
      const plainText = htmlContent.replace(/<[^>]+>/g, '');
      
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Grant Proposal Information</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div dangerouslySetInnerHTML={{ __html: marked.parse(results) }}></div>
      </div>
      <button
        onClick={handleGeneratePDF}
        disabled={generatingPDF}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {generatingPDF ? 'Generating PDF...' : 'Generate Grant Proposal PDF'}
      </button>
    </div>
  );
}
