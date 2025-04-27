"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
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
  totalVoter: number;
  totalHasVoted: number;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

// URL default untuk placeholder gambar
const DEFAULT_PLACEHOLDER_URL = "/placeholder.png";

export default function VotingResultPage() {
  const router = useRouter();
  const { electionId } = useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [status, setStatus] = useState<"Inactive" | "Active" | "Finished">("Inactive");
  const [candidatePhotos, setCandidatePhotos] = useState<{ [key: number]: string }>({});

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

    // Konversi startDate dan endDate dari uint64 (detik) ke string ISO
    const startDateTimestamp = Number(typedElectionData.startDate) * 1000; // Konversi ke milidetik
    const startDate = new Date(startDateTimestamp).toISOString();

    const endDateTimestamp = Number(typedElectionData.endDate) * 1000; // Konversi ke milidetik
    const endDate = new Date(endDateTimestamp).toISOString();

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
      totalVoter: Number(typedElectionData.totalVoter),
      totalHasVoted: Number(typedElectionData.totalHasVoted),
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

  // Hitung end time dan status (Inactive/Active/Finished)
  useEffect(() => {
    if (!election) return;

    const calculateEndTimeAndStatus = () => {
      const startDate = new Date(election.startDate).getTime();
      const endDate = new Date(election.endDate).getTime();
      const now = new Date().getTime();

      // Tentukan status
      if (now < startDate) {
        setStatus("Inactive");
        setEndTime("Not Started");
      } else if (now >= startDate && now <= endDate) {
        setStatus("Active");
        const timeLeft = endDate - now;
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setEndTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setStatus("Finished");
        setEndTime("00:00:00");
      }
    };

    calculateEndTimeAndStatus();
    const interval = setInterval(calculateEndTimeAndStatus, 1000); // Update setiap detik

    return () => clearInterval(interval); // Cleanup interval saat komponen unmount
  }, [election]);

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
                status === "Active"
                  ? "text-green-500"
                  : status === "Finished"
                  ? "text-red-500"
                  : "text-yellow-500"
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
              {candidatePhotos[candidate.id] ? (
                <img
                  src={candidatePhotos[candidate.id]}
                  alt={candidate.name}
                  className="w-48 h-48 object-cover rounded-lg mb-4"
                  style={{ maxWidth: "192px", maxHeight: "192px" }}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_URL; // Fallback jika gagal load
                  }}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-300">Loading...</span>
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
            {election.totalHasVoted} of {election.totalVoter} have voted
          </p>
        </div>
      </div>
    </main>
  );
}