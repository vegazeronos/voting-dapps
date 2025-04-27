
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Candidate {
  id: number;
  name: string;
  photo: string | null;
  votes: number;
}

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  whitelistAddresses: string[];
}

export default function VotingResultPage() {
  const { electionId } = useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [status, setStatus] = useState<"Active" | "Finished">("Active");
  const [totalVotes, setTotalVotes] = useState<number>(0);

  // Data dummy untuk simulasi
  const dummyElection: Election = {
    id: "1",
    title: "Indonesian President Election",
    description: "Election for the President of Indonesia 2024",
    startDate: "2024-10-01T00:00:00",
    endDate: "2025-04-10T23:59:59",
    candidates: [
      {
        id: 1,
        name: "Anies & Imin",
        photo: "/1.png",
        votes: 300,
      },
      {
        id: 2,
        name: "Prabowo & Gibran",
        photo: "/2.png",
        votes: 500,
      },
      {
        id: 3,
        name: "Ganjar & Mahfud",
        photo: "/3.png",
        votes: 300,
      },
    ],
    whitelistAddresses: ["0x123...", "0x456..."],
  };

  // Simulasi pengambilan data berdasarkan electionId
  useEffect(() => {
    if (electionId) {
      setElection({ ...dummyElection, id: electionId as string });
    }
  }, [electionId]);

  // Hitung end time dan status (Active/Finished)
  useEffect(() => {
    if (!election) return;

    const calculateEndTime = () => {
      const endDate = new Date(election.endDate).getTime();
      const now = new Date().getTime();
      const timeLeft = endDate - now;

      // Tentukan status Active/Finished
      if (timeLeft <= 0) {
        setEndTime("00:00:00");
        setStatus("Finished");
      } else {
        setStatus("Active");
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setEndTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    // Hitung total votes dari semua kandidat
    const total = election.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    setTotalVotes(total);

    calculateEndTime();
    const interval = setInterval(calculateEndTime, 1000); // Update setiap detik

    return () => clearInterval(interval); // Cleanup interval saat komponen unmount
  }, [election]);

  if (!election) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul Election dan Status */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              Election: {election.title}
            </h1>
            <p className="text-sm md:text-lg">Real Time Result</p>
          </div>
          <div className="text-right">
            <span
              className={`text-lg font-semibold ${
                status === "Active" ? "text-green-500" : "text-red-500"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Daftar Kandidat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {election.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-[#2A2A3A] rounded-lg p-4 flex flex-col items-center justify-between"
              style={{
                minHeight: "400px",
              }}
            >
              {candidate.photo ? (
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-48 h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-300">No Photo</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
              <p className="text-lg">{candidate.votes} votes</p>
            </div>
          ))}
        </div>

        {/* End Time dan Total Votes */}
        <div className="text-center mt-8">
          <p className="text-sm md:text-lg">
            Ends in: <span className="text-red-500">{endTime}</span>{" "}
            {totalVotes} of {election.whitelistAddresses.length} have voted
          </p>
        </div>
      </div>
    </main>
  );
}
