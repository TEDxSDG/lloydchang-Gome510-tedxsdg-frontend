"use client";

import { marked } from "marked";
import React, { useState, useEffect } from "react";
// import { fetchLLMResults } from "@/lib/utils";

export default function PlanningPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [planCollapsed, setPlanCollapsed] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedResults = localStorage.getItem("planningResults");

      if (cachedResults && cachedResults !== "undefined") {
        // If we have cached results, use them
        setResults(JSON.parse(cachedResults));
        setLoading(false);
      } else {
        // If no cached results, make the API call
        try {
          // const newResults = await fetchLLMResults();
          // Fetch business plans
          // const grantResponse = await fetch(
          //   "https://ted-murex.vercel.app/business_plan_roadmap",
          //   {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify(request),
          //   }
          // );
          // const grantData = await grantResponse.json();
          // localStorage.setItem("grantResults", JSON.stringify(grantData));
          // setGrants(grantData);
          // // Store the new results in local storage
          // localStorage.setItem("llmResults", JSON.stringify(newResults));
          // setResults(newResults);
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
      <div className="mb-6">
        <button 
          onClick={() => setPlanCollapsed(!planCollapsed)}
          className="text-3xl font-bold w-full text-left flex justify-between items-center bg-gray-200 p-4 rounded-t"
        >
          <span>Pitch</span>
          <span>{planCollapsed ? '▼' : '▲'}</span>
        </button>
        {!planCollapsed && (
          <div className="bg-gray-100 shadow-md rounded-b px-8 pt-6 pb-8">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(results) }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
