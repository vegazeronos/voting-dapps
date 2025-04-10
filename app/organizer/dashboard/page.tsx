"use client";

import Link from "next/link";
import { useState } from "react";


const initialElections = [
  {
    id: 1,
    title: "US President Election",
    status: "Finished",
    votedAddress: 1000000,
    whitelistedAddress: 1000000,
  },
  {
    id: 2,
    title: "Indonesia President Election",
    status: "Active",
    votedAddress: 70000,
    whitelistedAddress: 100000,
  },
  {
    id: 3,
    title: "Malaysia President Election",
    status: "Active",
    votedAddress: 30000,
    whitelistedAddress: 100000,
  },
  {
    id: 4,
    title: "Singapore President Election",
    status: "Active",
    votedAddress: 50000,
    whitelistedAddress: 100000,
  },
];

export default function OrganizerDashboard() {
  const [elections, setElections] = useState(initialElections);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  const handleDelete = (id: number) => {
    setElections(elections.filter((election) => election.id !== id));
  };

  // Fungsi untuk slider
  const itemsPerPage = 3; // Hanya tampilkan 3 data per slide
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

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul dan Link ke Dashboard Voters */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            DASHBOARD ORGANIZER
          </h1>
          <Link
            href="/voters/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            click here if you are a voter
          </Link>
        </div>

        {/* Tombol Create New Election dan Tabel My Election */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Election</h2>
          <Link
            href="/organizer/createElection"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Create New Election
          </Link>
        </div>

        {/* Tabel My Election */}
        {elections.length === 0 ? (
          <div className="text-center text-gray-400">
            No Election Data Available
          </div>
        ) : (
          <div className="relative">
            {/* Slider Container */}
            <div className="flex overflow-hidden">
              <div className="flex w-full">
                {displayedElections.map((election) => (
                  <div
                    key={election.id}
                    className="w-1/3 px-4"
                  >
                    <div className="bg-[#2D3748] p-6 rounded-lg h-full">
                      <h3 className="text-xl font-semibold mb-2">
                        {election.title}
                      </h3>
                      <div className="flex items-center mb-4">
                        <span
                          className={`inline-block w-4 h-4 rounded-full mr-2 ${
                            election.status === "Finished"
                              ? "bg-gray-500"
                              : "bg-green-500"
                          }`}
                        ></span>
                        <span>{election.status}</span>
                      </div>
                      <p className="text-gray-400 mb-4">
                        {election.votedAddress.toLocaleString()} /{" "}
                        {election.whitelistedAddress.toLocaleString()} voted
                      </p>
                      <div className="flex space-x-4">
                        <Link
                          href={`/organizer/editElection/${election.id}`}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Edit Election
                        </Link>
                        <button
                          onClick={() => handleDelete(election.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete Election
                        </button>
                      </div>
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
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full ${
                    currentIndex === 0
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
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full ${
                    currentIndex === totalSlides - 1
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
        )}
      </div>
    </main>
  );
}