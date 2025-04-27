"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import trustVoteAbi from "../../../abi/TrustVote.json";
import type { Abi } from "viem";

// Tipe untuk hasil kembalian fungsi getElection berdasarkan log
interface ElectionDetail {
  idElection: bigint;
  title: string;
  desc: string;
  startDate: bigint;
  endDate: bigint;
  organizer: `0x${string}`;
  totalVoter: bigint;
  totalHasVoted: bigint;
}

interface Election {
  id: number | string; // Izinkan id sebagai number atau string
  title: string;
  status: "Inactive" | "Active" | "Finished" | "-";
  votedAddress: number;
  whitelistedAddress: number;
  isPlaceholder?: boolean;
}

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  undefined) as `0x${string}` | undefined;

// Pastikan trustVoteAbi dikenali sebagai tipe Abi
const typedTrustVoteAbi = trustVoteAbi as Abi;

export default function OrganizerDashboard() {
  const { address, status, chain } = useAccount();
  const [elections, setElections] = useState<Election[]>([]);
  const [currentElectionIds, setCurrentElectionIds] = useState<bigint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // State untuk slider

  // Langkah 1: Ambil daftar ID pemilu menggunakan getOrganizerElection
  const {
    data: electionIds,
    isLoading: isLoadingIds,
    isError: isErrorIds,
    error: contractError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: typedTrustVoteAbi,
    functionName: "getOrganizerElection",
    args: address ? [address as `0x${string}`] : [],
    query: {
      enabled: !!address && status === "connected",
    },
  }) as {
    data: bigint[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Langkah 2: Sinkronkan electionIds dengan state untuk memastikan konsistensi
  useEffect(() => {
    if (electionIds && Array.isArray(electionIds)) {
      setCurrentElectionIds(electionIds);
    } else if (!electionIds) {
      setCurrentElectionIds([]);
    }
  }, [electionIds]);

  // Langkah 3: Ambil detail untuk setiap electionId menggunakan useReadContracts
  const electionDetailsResults = useReadContracts({
    contracts: currentElectionIds.map((id) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: typedTrustVoteAbi,
      functionName: "getElection" as const,
      args: [id] as const,
    })),
    query: {
      enabled: currentElectionIds.length > 0 && !!CONTRACT_ADDRESS,
    },
  });

  const isLoadingDetails = electionDetailsResults.isLoading;
  const isErrorDetails = electionDetailsResults.isError;
  const errorDetailsMessage = electionDetailsResults.error?.message || "Unknown error";

  // Langkah 4: Format data untuk ditampilkan
  useEffect(() => {
    if (electionDetailsResults.data) {
      const details = electionDetailsResults.data
        .map((result, index) => {
          if (result.status === "success" && result.result) {
            return result.result as ElectionDetail;
          }
          return undefined;
        })
        .filter((data): data is ElectionDetail => data !== undefined);

      if (details.length > 0) {
        const formattedElections = details.map((election) => {
          const startDate = Number(election.startDate || 0);
          const endDate = Number(election.endDate || 0);
          const currentTimestamp = Math.floor(Date.now() / 1000);

          let electionStatus: "Inactive" | "Active" | "Finished";
          if (currentTimestamp < startDate) {
            electionStatus = "Inactive";
          } else if (currentTimestamp >= startDate && currentTimestamp <= endDate) {
            electionStatus = "Active";
          } else {
            electionStatus = "Finished";
          }

          return {
            id: Number(election.idElection || 0),
            title: election.title || "Untitled Election",
            status: electionStatus,
            votedAddress: Number(election.totalHasVoted || 0),
            whitelistedAddress: Number(election.totalVoter || 0),
          };
        });
        setElections(formattedElections);
      } else {
        setElections([]);
      }
    } else {
      setElections([]);
    }
  }, [electionDetailsResults.data]);

  // Langkah 5: Logika slider
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

  // Tambahkan placeholder jika jumlah data kurang dari itemsPerPage
  const placeholderCount = itemsPerPage - displayedElections.length;
  const placeholders: Election[] = Array.from({ length: placeholderCount }, (_, index) => ({
    id: `placeholder-${index}`,
    title: "No Election Available",
    status: "-",
    votedAddress: 0,
    whitelistedAddress: 0,
    isPlaceholder: true,
  }));

  const finalDisplayedItems = [...displayedElections, ...placeholders];

  return (
    <main className="bg-[#1A202C] text-white min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
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

        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold">My Election</h2>
          <Link
            href="/organizer/createElection"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Create New Election
          </Link>
        </div>

        {status !== "connected" ? (
          <div className="text-center text-yellow-400">
            Please connect your wallet to view elections.
          </div>
        ) : isLoadingIds || isLoadingDetails ? (
          <div className="text-center text-gray-400">Memuat data pemilu...</div>
        ) : isErrorIds ? (
          <div className="text-center text-red-500">
            Gagal memuat data pemilu: {contractError?.message || "Unknown error"}
          </div>
        ) : isErrorDetails ? (
          <div className="text-center text-red-500">
            Gagal memuat detail pemilu: {errorDetailsMessage || "Unknown error"}
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center text-gray-400">
            Tidak ada data pemilu tersedia
          </div>
        ) : (
          <div className="relative">
            {/* Slider Container */}
            <div className="flex overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {finalDisplayedItems.map((election, index) => (
                  <div key={`${election.id}-${index}`} className="px-4">
                    <div className="bg-[#2D3748] p-6 rounded-lg h-full">
                      <h3 className="text-xl font-semibold mb-2">
                        {election.isPlaceholder
                          ? "No Election"
                          : `Election ${startIndex + index + 1}`}
                      </h3>
                      <h4 className="text-lg font-medium mb-2">{election.title}</h4>
                      <div className="flex items-center mb-4">
                        {!election.isPlaceholder && (
                          <span
                            className={`inline-block w-4 h-4 rounded-full mr-2 ${
                              election.status === "Inactive"
                                ? "bg-yellow-500"
                                : election.status === "Active"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                        )}
                        <span>{election.status}</span>
                      </div>
                      <p className="text-gray-400 mb-4">
                        {election.votedAddress.toLocaleString()} /{" "}
                        {election.whitelistedAddress.toLocaleString()} telah memilih
                      </p>
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