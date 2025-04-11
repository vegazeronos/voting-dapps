
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Election {
  id: number | string;
  title: string;
  description: string;
  status: string;
  endVotingTime: number | null;
  isPlaceholder?: boolean;
}

const initialElections: Election[] = [
  {
    id: 1,
    title: "US President Election",
    description: "US Presidential Election between Fufufa and Donald Trump",
    status: "FINISHED",
    endVotingTime: null,
  },
  {
    id: 2,
    title: "Indonesia President Election",
    description: "Indonesia Presidential Election between Anies, Prabowo and Ganjar",
    status: "Active",
    endVotingTime: new Date(Date.now() + 11 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000).getTime(), // 11:59:59 dari sekarang
  },
  {
    id: 3,
    title: "Malaysia President Election",
    description: "Malaysia Presidential Election between Candidate A and Candidate B",
    status: "Active",
    endVotingTime: new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000 + 45 * 1000).getTime(), // 5:30:45 dari sekarang
  },
  {
    id: 4,
    title: "Singapore President Election",
    description: "Singapore Presidential Election between Candidate X and Candidate Y",
    status: "FINISHED",
    endVotingTime: null,
  },
];

export default function VotersDashboard() {
  const [elections, setElections] = useState<Election[]>(initialElections);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: string }>({});


  const calculateTimeRemaining = (endTime: number | null) => {
    if (!endTime) return "00:00:00";
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) return "00:00:00";

    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: number]: string } = {};
      elections.forEach((election) => {
        if (election.status === "Active" && election.endVotingTime) {
          newTimeRemaining[election.id as number] = calculateTimeRemaining(election.endVotingTime);
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [elections]);


  const itemsPerPage = 3;
  const totalSlides = Math.ceil(elections.length / itemsPerPage);

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const startIndex = currentIndex * itemsPerPage;
  const displayedElections = elections.slice(startIndex, startIndex + itemsPerPage);


  const placeholderCount = itemsPerPage - displayedElections.length;
  const placeholders: Election[] = Array.from({ length: placeholderCount }, (_, index) => ({
    id: `placeholder-${index}`,
    title: "No Election Available",
    description: "-",
    status: "-",
    endVotingTime: null,
    isPlaceholder: true,
  }));

  const finalDisplayedItems = [...displayedElections, ...placeholders];

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul dan Link ke Dashboard Organizer */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            DASHBOARD VOTER
          </h1>
          <Link
            href="/organizer/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            click here if you are the organizer
          </Link>
        </div>

        {/* Tabel Available Election */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Available Election</h2>
          <div className="relative">
            {/* Slider Container */}
            <div className="flex overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {finalDisplayedItems.map((election, index) => (
                  <div
                    key={election.id}
                    className="px-4"
                  >
                    <div className="bg-[#2D3748] p-6 rounded-lg h-full">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {election.isPlaceholder ? "No Election" : `Election ${startIndex + index + 1}`}
                      </h3>
                      <h4 className="text-base sm:text-lg font-medium mb-2">
                        {election.title}
                      </h4>
                      <p className="text-gray-400 mb-2 text-sm sm:text-base">
                        {election.description}
                      </p>
                      <div className="flex items-center mb-4">
                        {!election.isPlaceholder && (
                          <span
                            className={`inline-block w-4 h-4 rounded-full mr-2 ${election.status === "FINISHED"
                                ? "bg-gray-500"
                                : "bg-green-500"
                              }`}
                          ></span>
                        )}
                        <span>
                          {election.status === "Active" && election.endVotingTime
                            ? `Ends in: ${timeRemaining[election.id as number] || calculateTimeRemaining(election.endVotingTime)}`
                            : election.status}
                        </span>
                      </div>
                      {!election.isPlaceholder && (
                        <Link
                          href={`/voters/vote/${election.id}`}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-block"
                        >
                          VOTE
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Slider (Di samping tabel) */}
            {elections.length > itemsPerPage && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full ${currentIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-600"
                    }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalSlides - 1}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full ${currentIndex === totalSlides - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-600"
                    }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
