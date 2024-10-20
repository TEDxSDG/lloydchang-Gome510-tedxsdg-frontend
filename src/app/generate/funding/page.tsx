"use client";

import React, { useState, useEffect } from "react";

export default function LLMResultsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          const newResults = await fetchLLMResults();
          // Store the new results in local storage
          localStorage.setItem("llmResults", JSON.stringify(newResults));
          setResults(newResults);
        } catch (error) {
          console.error("Error fetching LLM results:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on component mount

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {results &&
        Object.entries(results).map(([key, value]) => (
          <div className="mb-4" key={key}>
            <h2 className="text-lg font-bold">{key}</h2>
            <p>{value}</p>
          </div>
        ))}
    </div>
  );
}

async function fetchLLMResults() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate AI-generated funding advice with more readable keys
  const mockResponse = {
    "Connect with Investors":
      "To connect with investors, start by attending industry-specific networking events and conferences. Utilize LinkedIn to identify and connect with potential investors in your sector. Join local entrepreneur groups and participate in pitch events to showcase your startup. Consider using platforms like AngelList or Crunchbase to find investors interested in your industry. Don't forget to leverage your existing network for warm introductions to potential investors, as personal connections can be invaluable in securing meetings and building relationships.",

    "Find Grants":
      "To find grants, begin by searching government databases like Grants.gov for federal funding opportunities relevant to your startup. Explore state and local government websites for regional grant programs that might be a good fit. Look into industry-specific foundations that offer grants in your field, as they often have targeted funding opportunities. Check with your local Small Business Administration (SBA) office for information on grants and other funding resources. Additionally, investigate corporate grant programs from large companies in your industry, as many corporations offer funding to startups as part of their innovation initiatives or corporate social responsibility programs.",

    "Elevator Pitch":
      "Our startup, [Company Name], is revolutionizing [industry] by [unique value proposition]. Currently, [describe the problem your solution addresses], but our innovative [product/service] solves this by [brief explanation of solution]. We're targeting a $[X] billion market, with projected growth of [Y]% annually. We've already [mention key achievements, partnerships, or metrics], and our experienced team includes [brief highlight of key team members]. We're seeking $[amount] in funding to [specific use of funds and growth plans].",

    "Grant Proposal":
      "To create a compelling grant proposal, start with a concise executive summary that overviews your project, its goals, and the funding amount requested. Provide your organization's background, detailing your company's history, mission, and achievements. Thoroughly explain your project, its objectives, and its potential impact in the project description. Present a detailed budget breakdown for the requested funds and outline the project timeline with key milestones and deliverables. Describe how you will measure the project's success and impact in your evaluation plan. Explain how the project will continue after the grant period ends to demonstrate sustainability. Finally, include any supporting documents, such as letters of support or detailed research, in the appendices.",

    "Estimated Funding Needed": "$500,000 - $1,000,000",
    Timeframe: "6-12 months",
  };

  return mockResponse;
}
