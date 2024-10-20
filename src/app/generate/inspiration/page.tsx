'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SDG {
  id: number;
  name: string;
  icon: string;
}

const SDGs: SDG[] = [
  { id: 1, name: "No Poverty", icon: "/assets/sdg-icons/E-WEB-Goal-01.svg" },
  { id: 2, name: "Zero Hunger", icon: "/assets/sdg-icons/E-WEB-Goal-02.svg" },
  // ... add all 17 SDGs here
];

export default function InspirationPage() {
  const [selectedSDG, setSelectedSDG] = useState<SDG | null>(null);
  const [apiResponse, setApiResponse] = useState<string>('');

  const handleSDGClick = async (sdg: SDG) => {
    setSelectedSDG(sdg);
    try {
      // First API call
      const response1 = await fetch('/api/getSDGInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdgId: sdg.id }),
      });
      const data1 = await response1.json();

      // Second API call using the response from the first
      const response2 = await fetch('/api/generateIdea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdgInfo: data1 }),
      });
      const data2 = await response2.json();

      setApiResponse(data2.idea);
    } catch (error) {
      console.error('Error:', error);
      setApiResponse('An error occurred while processing your request.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Choose an SDG for Inspiration</h1>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {SDGs.map((sdg) => (
          <button
            key={sdg.id}
            onClick={() => handleSDGClick(sdg)}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Image src={sdg.icon} alt={sdg.name} width={80} height={80} />
            <span className="mt-2 text-sm text-center">{sdg.name}</span>
          </button>
        ))}
      </div>
      {selectedSDG && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Selected SDG: {selectedSDG.name}</h2>
          <p className="text-lg">{apiResponse || 'Loading...'}</p>
        </div>
      )}
    </div>
  );
}

