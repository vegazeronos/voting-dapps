"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
import trustVoteAbi from "../../abi/TrustVote.json";
import type { Abi } from "viem";

// Interface untuk data pemilu dari getTopVotes
interface ElectionDetail {
  idElection: bigint;
  title: string;
  descr: string;
  startDate: bigint;
  endDate: bigint;
  organizer: `0x${string}`;
  totalVoter: bigint;
  totalHasVoted: bigint;
}

interface Election {
  id: string;
  title: string;
  status: "Active" | "Finished";
  totalVoted: number;
  totalWhitelisted: number;
  percentage: number;
}

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  undefined) as `0x${string}` | undefined;

// Pastikan trustVoteAbi dikenali sebagai tipe Abi
const typedTrustVoteAbi = trustVoteAbi as Abi;

export default function TopVotePage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);

  // Langkah 1: Ambil data pemilu menggunakan getTopVotes
  const {
    data: topVotes,
    isLoading: isLoadingVotes,
    isError: isErrorVotes,
    error: contractError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: typedTrustVoteAbi,
    functionName: "getTopVotes",
    args: [],
    query: {
      enabled: !!CONTRACT_ADDRESS,
    },
  }) as {
    data: ElectionDetail[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Langkah 2: Format data dan filter hanya yang Active
  useEffect(() => {
    if (topVotes && Array.isArray(topVotes)) {
      const formattedElections = topVotes
        .map((election) => {
          const startDate = Number(election.startDate || 0);
          const endDate = Number(election.endDate || 0);
          const currentTimestamp = Math.floor(Date.now() / 1000);

          // Tentukan status
          let status: "Active" | "Finished";
          if (currentTimestamp >= startDate && currentTimestamp <= endDate) {
            status = "Active";
          } else {
            status = "Finished"; // Tidak akan ditampilkan
          }

          // Hitung persentase
          const totalVoted = Number(election.totalHasVoted || 0);
          const totalWhitelisted = Number(election.totalVoter || 0);
          const percentage =
            totalWhitelisted > 0 ? (totalVoted / totalWhitelisted) * 100 : 0;

          return {
            id: String(election.idElection),
            title: election.title || "Untitled Election",
            status,
            totalVoted,
            totalWhitelisted,
            percentage: Math.round(percentage),
          };
        })
        .filter((election) => election.status === "Active"); // Hanya ambil yang Active

      setElections(formattedElections);
    } else {
      setElections([]);
    }
  }, [topVotes]);

  // Langkah 3: Fungsi untuk menangani klik pada election
  const handleElectionClick = (electionId: string) => {
    // Redirect ke halaman result
    router.push(`/voters/vote/${electionId}/result`);
  };

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Top Vote</h1>
        </div>

        {/* Daftar Election */}
        {isLoadingVotes ? (
          <div className="text-center text-gray-400">Memuat data pemilu...</div>
        ) : isErrorVotes ? (
          <div className="text-center text-red-500">
            Gagal memuat data pemilu: {contractError?.message || "Unknown error"}
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center text-gray-400">
            Tidak ada pemilu aktif tersedia
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {elections.map((election) => (
              <div
                key={election.id}
                className="bg-[#2A2A3A] rounded-lg p-4 cursor-pointer hover:bg-[#333344] transition-colors"
                onClick={() => handleElectionClick(election.id)}
              >
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{election.title}</h3>
                    <div className="w-full bg-gray-600 rounded-full h-6">
                      <div
                        className="bg-green-500 h-6 rounded-full"
                        style={{ width: `${election.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg sm:text-xl">{election.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}