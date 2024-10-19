"use client";

import React, { useState, useEffect } from "react";
import { fetchLLMResults } from "@/api/llmApi"; // Assume this function makes the API calls

function LLMResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have cached results in local storage
      const cachedResults = localStorage.getItem("llmResults");

      if (cachedResults) {
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
      <h2>LLM Results</h2>
      {/* Render your results here */}
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}

export default LLMResultsPage;
