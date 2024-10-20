"use client";

import React, { useState, useEffect } from "react";
import { fetchLLMResults } from "@/lib/utils";
import request from "./request.json";

export default function FundingPage() {
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
          const newResults = await fetch(
            "https://ted-murex.vercel.app/grantInfo",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: request,
              mode: "no-cors",
            }
          );
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

  return <div>{JSON.stringify(results)}</div>;
}
