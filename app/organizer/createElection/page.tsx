"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { RefObject } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { pinata } from "@/utils/config";
import trustVoteAbi from "@/abi/TrustVote.json";
import type { Abi } from "viem";

interface Candidate {
  id: number;
  name: string;
  photo: File | null;
  cid?: string; // CID setelah upload ke Pinata
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

const typedTrustVoteAbi = trustVoteAbi as Abi;

export default function CreateElection() {
  const [electionTitle, setElectionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, name: "", photo: null },
    { id: 2, name: "", photo: null },
  ]);
  const [nextId, setNextId] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whitelistAddresses, setWhitelistAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync, isPending, isError: isWriteError, error: writeError } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleAddCandidate = () => {
    if (candidates.length < 3) {
      const newCandidate = { id: nextId, name: "", photo: null };
      setCandidates([...candidates, newCandidate]);
      setNextId(nextId + 1);
    }
  };

  const handleDeleteCandidate = (id: number) => {
    if (candidates.length > 2) {
      const newCandidates = candidates.filter((candidate) => candidate.id !== id);
      setCandidates(newCandidates);
      const indexToReset = newCandidates.length;
      if (fileInputRefs[indexToReset]) {
        fileInputRefs[indexToReset].current = null;
      }
    }
  };

  const handleCandidateNameChange = (id: number, name: string) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, name } : candidate
      )
    );
  };

  const handlePhotoUpload = (id: number, file: File | undefined) => {
    if (file) {
      setCandidates(
        candidates.map((candidate) =>
          candidate.id === id ? { ...candidate, photo: file } : candidate
        )
      );
    }
  };

  const handleUploadClick = (index: number) => {
    fileInputRefs[index]?.current?.click();
  };

  const handleWhitelistVoters = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAddress("");
  };

  const handleAddAddress = () => {
    if (newAddress.trim() === "") {
      alert("Please enter a valid wallet address.");
      return;
    }
    if (!newAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert("Invalid wallet address format.");
      return;
    }
    if (whitelistAddresses.includes(newAddress)) {
      alert("This address is already in the whitelist.");
      return;
    }
    setWhitelistAddresses([...whitelistAddresses, newAddress]);
    setNewAddress("");
  };

  const handleRemoveAddress = (address: string) => {
    setWhitelistAddresses(whitelistAddresses.filter((addr) => addr !== address));
  };

  const handleSaveWhitelist = () => {
    if (whitelistAddresses.length === 0) {
      alert("Whitelist cannot be empty.");
      return;
    }
    console.log("Whitelist addresses saved:", whitelistAddresses);
    alert("Whitelist addresses saved successfully!");
    setIsModalOpen(false);
  };

  const uploadToPinata = async (file: File) => {
    try {
      const urlRequest = await fetch("/api/url");
      const urlResponse = await urlRequest.json();
      const upload = await pinata.upload.public
        .file(file)
        .url(urlResponse.url);
      return upload.cid;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error("Failed to upload file to Pinata");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dasar sesuai kontrak
    if (candidates.length < 2) {
      alert("Please add at least 2 candidates.");
      return;
    }
    if (!electionTitle.trim()) {
      alert("Election title cannot be empty.");
      return;
    }
    if (!description.trim()) {
      alert("Description cannot be empty.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please fill in start and end dates.");
      return;
    }
    const hasEmptyCandidateName = candidates.some(
      (candidate) => !candidate.name.trim()
    );
    if (hasEmptyCandidateName) {
      alert("Please fill in all candidate names.");
      return;
    }
    if (whitelistAddresses.length === 0) {
      alert("Whitelist cannot be empty.");
      return;
    }

    // Konversi startDate dan endDate ke uint64 (Unix timestamp dalam detik)
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    // Validasi startDate < endDate
    if (startTimestamp >= endTimestamp) {
      alert("Start date must be earlier than end date.");
      return;
    }

    // Validasi foto kandidat
    const hasMissingPhoto = candidates.some((candidate) => !candidate.photo);
    if (hasMissingPhoto) {
      alert("Please upload a photo for each candidate.");
      return;
    }

    // Validasi alamat whitelist
    const hasInvalidAddress = whitelistAddresses.some(
      (addr) => !addr.match(/^0x[a-fA-F0-9]{40}$/)
    );
    if (hasInvalidAddress) {
      alert("One or more whitelist addresses are invalid.");
      return;
    }

    // Validasi CONTRACT_ADDRESS
    if (!CONTRACT_ADDRESS) {
      alert("Contract address is not defined. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      return;
    }

    setUploading(true);
    try {
      // Upload foto ke Pinata dan dapatkan CID
      const updatedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          if (candidate.photo) {
            const cid = await uploadToPinata(candidate.photo);
            return { ...candidate, cid };
          }
          return candidate;
        })
      );

      // Pastikan semua kandidat memiliki CID
      const hasMissingCid = updatedCandidates.some((candidate) => !candidate.cid);
      if (hasMissingCid) {
        throw new Error("Failed to get CID for one or more photos.");
      }

      // Siapkan data untuk kontrak
      const candidateList = updatedCandidates.map((candidate) => ({
        idCandidate: 0, // Akan diatur oleh kontrak
        name: candidate.name,
        pic: candidate.cid!,
        votedCandidate: 0, // Akan diatur oleh kontrak
      }));

      setUploading(false);
      setSubmitting(true);

      // Submit ke blockchain dan dapatkan hash transaksi
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: typedTrustVoteAbi,
        functionName: "createElection",
        args: [
          electionTitle,
          description,
          startTimestamp,
          endTimestamp,
          whitelistAddresses,
          candidateList,
        ],
      });

      // Simpan hash transaksi untuk ditunggu konfirmasinya
      setTxHash(hash);
    } catch (error: any) {
      console.error("Error submitting election:", error);
      alert("Failed to create election: " + error.message);
      setUploading(false);
      setSubmitting(false);
    }
  };

  // Efek untuk menampilkan alert setelah transaksi dikonfirmasi
  if (isConfirmed) {
    alert("Election Successfully Created");
    // Reset state setelah sukses
    setSubmitting(false);
    setTxHash(undefined);
    // Reset form
    setElectionTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setCandidates([
      { id: 1, name: "", photo: null },
      { id: 2, name: "", photo: null },
    ]);
    setNextId(3);
    setWhitelistAddresses([]);
  }

  // Efek untuk menangani error konfirmasi
  if (confirmError) {
    console.error("Transaction confirmation error:", confirmError);
    alert("Failed to confirm transaction: " + confirmError.message);
    setSubmitting(false);
    setTxHash(undefined);
  }

  return (
    <main className="bg-[#1A202C] text-white min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Judul */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            CREATE ELECTION
          </h1>
        </div>

        {/* Form Create Election */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Election Title */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Election Title
            </label>
            <input
              type="text"
              value={electionTitle}
              onChange={(e) => setElectionTitle(e.target.value)}
              className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter election title"
              required
              disabled={uploading || submitting || isConfirming}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter election description"
              rows={4}
              required
              disabled={uploading || submitting || isConfirming}
            />
          </div>

          {/* Start Date */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={uploading || submitting || isConfirming}
            />
          </div>

          {/* End Date */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={uploading || submitting || isConfirming}
            />
          </div>

          {/* Candidates */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Candidate</h2>
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0"
              >
                <div className="flex-1">
                  <label className="block text-lg font-medium mb-2">
                    {index + 1}
                    {index === 0 ? "st" : index === 1 ? "nd" : "rd"} Candidate
                  </label>
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) =>
                      handleCandidateNameChange(candidate.id, e.target.value)
                    }
                    className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Enter candidate ${index + 1} name`}
                    required
                    disabled={uploading || submitting || isConfirming}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUploadClick(index)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    disabled={uploading || submitting || isConfirming}
                  >
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePhotoUpload(candidate.id, e.target.files?.[0])
                    }
                    className="hidden"
                    ref={fileInputRefs[index]}
                    disabled={uploading || submitting || isConfirming}
                  />
                  {candidate.photo && (
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={URL.createObjectURL(candidate.photo)}
                        alt={`Candidate ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <p className="text-sm text-gray-300 truncate max-w-[120px]">
                        {candidate.photo.name}
                      </p>
                    </div>
                  )}
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      disabled={uploading || submitting || isConfirming}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Candidate */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleAddCandidate}
              disabled={
                candidates.length >= 3 || uploading || submitting || isConfirming
              }
              className={`w-full bg-green-500 text-white px-6 py-3 rounded-lg transition-colors ${
                candidates.length >= 3 || uploading || submitting || isConfirming
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-600"
              }`}
            >
              Add New Candidate
            </button>
          </div>

          {/* Whitelist Voters */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleWhitelistVoters}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={uploading || submitting || isConfirming}
            >
              Whitelist Voters
            </button>
          </div>

          {/* Save Election */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={uploading || submitting || isConfirming}
            >
              {uploading
                ? "Uploading Photos..."
                : submitting
                ? "Waiting for MetaMask..."
                : isConfirming
                ? "Confirming Transaction..."
                : "Save Election"}
            </button>
          </div>

          {/* Tampilkan Error jika Gagal */}
          {(isWriteError || confirmError) && (
            <p className="text-red-500 mt-4 text-center">
              Failed to create election:{" "}
              {writeError?.message || confirmError?.message || "Unknown error"}
            </p>
          )}
        </form>

        {/* Modal Whitelist Voters */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2D3748] text-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Whitelist Voters</h2>

              {/* Input untuk alamat wallet */}
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2">
                  Wallet Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter wallet address"
                    disabled={uploading || submitting || isConfirming}
                  />
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    disabled={uploading || submitting || isConfirming}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Daftar alamat yang sudah ditambahkan */}
              <div className="mb-4 max-h-40 overflow-y-auto">
                <h3 className="text-lg font-medium mb-2">
                  Whitelisted Addresses
                </h3>
                {whitelistAddresses.length === 0 ? (
                  <p className="text-gray-400">No addresses added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {whitelistAddresses.map((address, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-700 p-2 rounded-lg"
                      >
                        <span className="truncate">{address}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddress(address)}
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          disabled={uploading || submitting || isConfirming}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tombol aksi */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  disabled={uploading || submitting || isConfirming}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveWhitelist}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={uploading || submitting || isConfirming}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}