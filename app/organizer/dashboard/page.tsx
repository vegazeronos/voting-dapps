
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

  const handleDelete = (id: number) => {
    setElections(elections.filter((election) => election.id !== id));
  };

  return (
    <main className="bg-[#1A202C] text-white min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* My Elections */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold">My Election</h2>
          <Link
            href="/organizer/createElection"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Create New Election
          </Link>
        </div>

        {elections.length === 0 ? (
          <div className="text-center text-gray-400">
            No Election Data Available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election.id} className="bg-[#2D3748] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{election.title}</h3>
                <div className="flex items-center mb-4">
                  <span
                    className={`inline-block w-4 h-4 rounded-full mr-2 ${election.status === "Finished"
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

                {/* Optional Action Buttons */}
                {/* <div className="flex space-x-4">
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
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
