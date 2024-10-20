"use client";

import React, { useState, useEffect } from "react";
import request from "./request.json";
import { marked } from "marked";
import jsPDF from 'jspdf';

export default function FundingPage() {
  const [investors, setInvestors] = useState<string>("");
  const [grants, setGrants] = useState<string>("");
  const [grantProposal, setGrantProposal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [investorsCollapsed, setInvestorsCollapsed] = useState(true);
  const [grantsCollapsed, setGrantsCollapsed] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedGrants = localStorage.getItem("grantResults");
      const cachedInvestors = localStorage.getItem("investorResults");
      const cachedGrantProposal = localStorage.getItem("grantProposalResults");

      if (cachedGrants && cachedInvestors && cachedGrantProposal) {
        setGrants(JSON.parse(cachedGrants));
        setInvestors(JSON.parse(cachedInvestors));
        setGrantProposal(JSON.parse(cachedGrantProposal));
        setLoading(false);
      } else {
        // If no cached results, make the API call
        try {
          // Fetch grants
          const grantResponse = await fetch(
            "https://ted-murex.vercel.app/grantInfo",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(request),
            }
          );
          const grantData = await grantResponse.json();
          localStorage.setItem("grantResults", JSON.stringify(grantData));
          setGrants(grantData);

          // fetch grant proposal
          const grantProposalResponse = await fetch(
            "https://ted-murex.vercel.app/getGrantProposal",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(request),
            }
          );
          const grantProposalData = await grantProposalResponse.json();
          localStorage.setItem("grantProposalResults", JSON.stringify(grantProposalData));
          setGrantProposal(grantProposalData);

          // Fetch investors
          const investorResponse = await fetch(
            "https://ted-murex.vercel.app/investors",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(request),
            }
          );
          const investorData = await investorResponse.json();
          localStorage.setItem("investorResults", JSON.stringify(investorData));
          setInvestors(investorData);
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

  const toggleSection = (section: 'investors' | 'grants') => {
    if (section === 'investors') {
      setInvestorsCollapsed(!investorsCollapsed);
    } else {
      setGrantsCollapsed(!grantsCollapsed);
    }
  };

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
