"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  status: "Active" | "Finished"; 
  totalVoted: number; 
  totalWhitelisted: number; 
  percentage: number; 
}

export default function TopVotePage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);

  // Data dummy untuk simulasi
  const dummyElections: Election[] = [
    {
      id: "1",
      title: "US President Election",
      description: "Election for the President of the United States 2024",
      startDate: "2024-10-01T00:00:00",
      endDate: "2024-11-05T23:59:59", 
      candidates: [
        { id: 1, name: "Candidate 1", photo: "/candidate1.png", votes: 500 },
        { id: 2, name: "Candidate 2", photo: "/candidate2.png", votes: 500 },
      ],
      whitelistAddresses: Array(1000).fill("0x123..."), 
      status: "Active", 
      totalVoted: 1000, 
      totalWhitelisted: 1000,
      percentage: 0, 
    },
    {
      id: "2",
      title: "Indonesia President Election",
      description: "Election for the President of Indonesia 2024",
      startDate: "2024-10-01T00:00:00",
      endDate: "2025-04-10T23:59:59", 
      candidates: [
        { id: 1, name: "Anies & Imin", photo: "/1.png", votes: 300 },
        { id: 2, name: "Prabowo & Gibran", photo: "/2.png", votes: 500 },
        { id: 3, name: "Ganjar & Mahfud", photo: "/3.png", votes: 300 },
      ],
      whitelistAddresses: Array(1000).fill("0x123..."), 
      status: "Active", 
      totalVoted: 700, 
      totalWhitelisted: 1000,
      percentage: 0, 
    },
    {
      id: "3",
      title: "Malaysia President Election",
      description: "Election for the President of Malaysia 2024",
      startDate: "2024-10-01T00:00:00",
      endDate: "2025-04-10T23:59:59",
      candidates: [
        { id: 1, name: "Candidate A", photo: "/candidateA.png", votes: 150 },
        { id: 2, name: "Candidate B", photo: "/candidateB.png", votes: 150 },
      ],
      whitelistAddresses: Array(1000).fill("0x123..."), 
      status: "Active", 
      totalVoted: 300, 
      totalWhitelisted: 1000,
      percentage: 0, 
    },
  ];

  
  useEffect(() => {
    const updatedElections = dummyElections.map((election) => {
      // Tentukan status Active/Finished
      const endDate = new Date(election.endDate).getTime();
      const now = new Date().getTime();
      const status: "Active" | "Finished" = now > endDate ? "Finished" : "Active";

      // Hitung persentase total voted
      const percentage = (election.totalVoted / election.totalWhitelisted) * 100;

      return {
        ...election,
        status,
        percentage: Math.round(percentage),
      };
    });

    setElections(updatedElections);
  }, []);

  // Fungsi untuk menangani klik pada election
  const handleElectionClick = (electionId: string, whitelistAddresses: string[]) => {
    // Simulasi alamat pengguna (dalam aplikasi nyata, ini diambil dari wallet provider)
    const userAddress = "0x789..."; // Alamat pengguna dummy

    // Periksa apakah pengguna ada di whitelist
    const isWhitelisted = whitelistAddresses.includes(userAddress);

    if (isWhitelisted) {
      // Jika ada di whitelist, arahkan ke halaman voting
      router.push(`/voters/vote/${electionId}`);
    } else {
      // Jika tidak ada di whitelist, arahkan ke halaman result
      router.push(`/voters/vote/${electionId}/result`);
    }
  };

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Top Vote</h1>
        </div>

        {/* Daftar Election */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-[#2A2A3A] rounded-lg p-4 cursor-pointer hover:bg-[#333344] transition-colors"
              onClick={() => handleElectionClick(election.id, election.whitelistAddresses)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{election.title}</h3>
                  <div className="w-full bg-gray-600 rounded-full h-6">
                    <div
                      className="bg-green-500 h-6 rounded-full"
                      style={{ width: `${election.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg">{election.percentage}%</p>
                  <p
                    className={`text-sm ${
                      election.status === "Active" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {election.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}