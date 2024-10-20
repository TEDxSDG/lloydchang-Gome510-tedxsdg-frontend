"use client";

import React, { useState, useEffect } from "react";
import { fetchLLMResults } from "@/lib/utils";
import request from "./request.json";
import { marked } from "marked";

export default function FundingPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  console.log('req', request)
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: marked.parse(results) }}></div>
}
