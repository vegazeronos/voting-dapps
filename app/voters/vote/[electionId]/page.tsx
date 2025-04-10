"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Interface untuk kandidat
interface Candidate {
  id: number;
  name: string;
  photo: string | null;
  votes: number;
}

// Interface untuk election
interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  whitelistAddresses: string[];
}

export default function VotePage() {
  const router = useRouter();
  const { electionId } = useParams(); 
  const [election, setElection] = useState<Election | null>(null);
  const [endTime, setEndTime] = useState<string>("");

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
        votes: 0,
      },
      {
        id: 2,
        name: "Prabowo & Gibran",
        photo: "/2.png", 
        votes: 0,
      },
      {
        id: 3,
        name: "Ganjar & Mahfud",
        photo: "/3.png", 
        votes: 0,
      },
    ],
    whitelistAddresses: ["0x123...", "0x456..."],
  };

  // Simulasi pengambilan data berdasarkan electionId
  useEffect(() => {
    if (electionId) {
      setElection({ ...dummyElection, id: electionId as string });
    } else {
      alert("Election not found!");
      router.push("/");
    }
  }, [electionId, router]);

  // Hitung end time (selisih antara endDate dan waktu saat ini)
  useEffect(() => {
    if (!election) return;

    const calculateEndTime = () => {
      const endDate = new Date(election.endDate).getTime();
      const now = new Date().getTime();
      const timeLeft = endDate - now;

      if (timeLeft <= 0) {
        setEndTime("00:00:00");
        return;
      }

      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setEndTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateEndTime();
    const interval = setInterval(calculateEndTime, 1000); // Update setiap detik

    return () => clearInterval(interval); // Cleanup interval saat komponen unmount
  }, [election]);

  // Fungsi untuk menangani vote
  const handleVote = (candidateId: number) => {
    if (!election) return;

    // Periksa apakah voting masih berlangsung
    const endDate = new Date(election.endDate).getTime();
    const now = new Date().getTime();
    if (now > endDate) {
      alert("Voting has ended!");
      return;
    }

    // Tambah vote untuk kandidat yang dipilih
    const updatedCandidates = election.candidates.map((candidate) =>
      candidate.id === candidateId
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate
    );

    
    setElection({ ...election, candidates: updatedCandidates });

    // Simulasi menyimpan data (dalam aplikasi nyata, ini akan disimpan ke backend)
    console.log("Updated election after vote:", { ...election, candidates: updatedCandidates });

    // Redirect ke halaman Voting Result
    router.push(`/voters/vote/${electionId}/result`);
  };

  if (!election) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul Election */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Election: {election.title}
          </h1>
          <p className="text-lg">Real Time Result</p>
        </div>

        {/* Daftar Kandidat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                  className="w-60 h-60 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-60 h-60 bg-gray-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-300">No Photo</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
              <button
                onClick={() => handleVote(candidate.id)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                VOTE
              </button>
            </div>
          ))}
        </div>

        {/* End Time */}
        <div className="text-center mt-8">
          <p className="text-lg">
            Ends in: <span className="text-red-500">{endTime}</span>
          </p>
        </div>
      </div>
    </main>
  );
}