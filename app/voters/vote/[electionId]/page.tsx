"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { pinata } from "@/utils/config";
import trustVoteAbi from "@/abi/TrustVote.json";
import type { Abi } from "viem";

// Interface untuk kandidat dari smart contract
interface ContractCandidate {
  idCandidate: bigint;
  name: string;
  pic: string;
  votedCandidate: bigint;
}

// Interface untuk election dari smart contract
interface ContractElection {
  idElection: bigint;
  title: string;
  descr: string;
  startDate: bigint;
  endDate: bigint;
  addrOrg: `0x${string}`;
  totalVoter: bigint;
  totalHasVoted: bigint;
}

// Interface untuk kandidat di frontend
interface Candidate {
  id: number;
  name: string;
  photo: string; // URL gambar dari Pinata
  votes: number;
}

// Interface untuk election di frontend
interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  whitelistAddresses: string[];
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

// URL default untuk placeholder gambar (jika tidak ada di public)
const DEFAULT_PLACEHOLDER_URL = "/placeholder.png";

export default function VotePage() {
  const router = useRouter();
  const { electionId } = useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [candidatePhotos, setCandidatePhotos] = useState<{ [key: number]: string }>({});

  const { writeContractAsync, isPending, isError: isWriteError, error: writeError } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Ambil data election dari blockchain
  const { data: electionData, isLoading: isLoadingElection, error: electionError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: trustVoteAbi as Abi,
    functionName: "getElection",
    args: [electionId ? BigInt(electionId as string) : BigInt(0)],
  });

  // Ambil data kandidat dari blockchain
  const { data: candidatesData, isLoading: isLoadingCandidates, error: candidatesError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: trustVoteAbi as Abi,
    functionName: "getCandidates",
    args: [electionId ? BigInt(electionId as string) : BigInt(0)],
  });

  // Proses data election dan kandidat
  useEffect(() => {
    if (!electionData || !candidatesData || !electionId) return;

    const typedElectionData = electionData as ContractElection;
    const typedCandidatesData = candidatesData as ContractCandidate[];

    // Konversi endDate dari uint64 (detik) ke string ISO
    const endDateTimestamp = Number(typedElectionData.endDate) * 1000; // Konversi ke milidetik
    const endDate = new Date(endDateTimestamp).toISOString();

    // Konversi startDate dari uint64 (detik) ke string ISO
    const startDateTimestamp = Number(typedElectionData.startDate) * 1000; // Konversi ke milidetik
    const startDate = new Date(startDateTimestamp).toISOString();

    // Proses kandidat
    const candidates: Candidate[] = typedCandidatesData.map((candidate: ContractCandidate) => ({
      id: Number(candidate.idCandidate),
      name: candidate.name,
      photo: "", // Akan diisi setelah pengambilan URL
      votes: Number(candidate.votedCandidate),
    }));

    const newElection: Election = {
      id: electionId as string,
      title: typedElectionData.title,
      description: typedElectionData.descr,
      startDate: startDate,
      endDate: endDate,
      candidates: candidates,
      whitelistAddresses: [], // Tidak diambil dari getElection, bisa diambil dari getWhitelistedVoter jika diperlukan
    };

    setElection(newElection);
  }, [electionData, candidatesData, electionId]);

  // Ambil URL gambar untuk setiap kandidat
  useEffect(() => {
    if (!election || !election.candidates) return;

    const fetchCandidatePhotos = async () => {
      const photos: { [key: number]: string } = {};
      const typedCandidatesData = candidatesData as ContractCandidate[];

      for (const candidate of typedCandidatesData) {
        const candidateId = Number(candidate.idCandidate);
        try {
          if (candidate.pic) {
            const fileUrl = await pinata.gateways.public.convert(candidate.pic);
            photos[candidateId] = fileUrl;
          } else {
            photos[candidateId] = DEFAULT_PLACEHOLDER_URL;
          }
        } catch (error) {
          console.error(`Failed to fetch photo for candidate ${candidateId}:`, error);
          photos[candidateId] = DEFAULT_PLACEHOLDER_URL;
        }
      }

      setCandidatePhotos(photos);
    };

    fetchCandidatePhotos();
  }, [election, candidatesData]);

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

  // Redirect setelah voting selesai
  useEffect(() => {
    if (isConfirmed && electionId) {
      router.push(`/voters/vote/${electionId}/result`);
    }
  }, [isConfirmed, electionId, router]);

  // Fungsi untuk menangani vote
  const handleVote = async (candidateId: number) => {
    if (!election || !electionId) return;

    // Periksa apakah voting masih berlangsung
    const endDate = new Date(election.endDate).getTime();
    const now = new Date().getTime();
    if (now > endDate) {
      alert("Voting has ended!");
      return;
    }

    // Validasi CONTRACT_ADDRESS
    if (!CONTRACT_ADDRESS) {
      alert("Contract address is not defined. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      return;
    }

    try {
      // Kirim transaksi voting ke blockchain
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: trustVoteAbi as Abi,
        functionName: "voting",
        args: [
          BigInt(electionId as string),
          BigInt(candidateId),
        ],
      });

      // Simpan hash transaksi untuk ditunggu konfirmasinya
      setTxHash(hash);
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      alert("Failed to vote: " + error.message);
    }
  };

  // Handle error atau loading state
  if (isLoadingElection || isLoadingCandidates) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (electionError || candidatesError || !electionId) {
    alert("Election not found or error loading data!");
    router.push("/");
    return null;
  }

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
              {candidatePhotos[candidate.id] ? (
                <img
                  src={candidatePhotos[candidate.id]}
                  alt={candidate.name}
                  className="w-60 h-60 object-cover rounded-lg mb-4"
                  style={{ maxWidth: "240px", maxHeight: "240px" }}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_URL; // Fallback jika gagal load
                  }}
                />
              ) : (
                <div className="w-60 h-60 bg-gray-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-300">Loading...</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
              <button
                onClick={() => handleVote(candidate.id)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isPending || isConfirming}
              >
                {isPending ? "Waiting for MetaMask..." : isConfirming ? "Confirming..." : "VOTE"}
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

        {/* Tampilkan Error jika Gagal */}
        {(isWriteError || confirmError) && (
          <p className="text-red-500 mt-4 text-center">
            Failed to vote: {writeError?.message || confirmError?.message || "Unknown error"}
          </p>
        )}
      </div>
    </main>
  );
}