
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { RefObject } from "react";

interface Candidate {
  id: number;
  name: string;
  photo: File | null;
}

export default function CreateElection() {
  const [electionTitle, setElectionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, name: "", photo: null },
    { id: 2, name: "", photo: null },
  ]);
  const [nextId, setNextId] = useState(3); // Counter untuk ID unik

  // State untuk modal whitelist voters
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whitelistAddresses, setWhitelistAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");

  // Inisialisasi array RefObject untuk maksimum 3 kandidat di tingkat atas
  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Fungsi untuk menambah kandidat baru
  const handleAddCandidate = () => {
    if (candidates.length < 3) {
      const newCandidate = { id: nextId, name: "", photo: null };
      setCandidates([...candidates, newCandidate]);
      setNextId(nextId + 1);
    }
  };

  // Fungsi untuk menghapus kandidat
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

  // Fungsi untuk mengupdate nama kandidat
  const handleCandidateNameChange = (id: number, name: string) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, name } : candidate
      )
    );
  };

  // Fungsi untuk mengupdate foto kandidat
  const handlePhotoUpload = (id: number, file: File | undefined) => {
    if (file) {
      setCandidates(
        candidates.map((candidate) =>
          candidate.id === id ? { ...candidate, photo: file } : candidate
        )
      );
    }
  };

  // Fungsi untuk menangani klik tombol "Upload Photo"
  const handleUploadClick = (index: number) => {
    fileInputRefs[index]?.current?.click();
  };

  // Fungsi untuk membuka modal whitelist voters
  const handleWhitelistVoters = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAddress(""); // Reset input alamat
  };

  // Fungsi untuk menambah alamat ke whitelist
  const handleAddAddress = () => {
    if (newAddress.trim() === "") {
      alert("Please enter a valid wallet address.");
      return;
    }
    if (whitelistAddresses.includes(newAddress)) {
      alert("This address is already in the whitelist.");
      return;
    }
    setWhitelistAddresses([...whitelistAddresses, newAddress]);
    setNewAddress("");
  };

  // Fungsi untuk menghapus alamat dari whitelist
  const handleRemoveAddress = (address: string) => {
    setWhitelistAddresses(whitelistAddresses.filter((addr) => addr !== address));
  };

  // Fungsi untuk menyimpan whitelist (simulasi)
  const handleSaveWhitelist = () => {
    console.log("Whitelist addresses saved:", whitelistAddresses);
    alert("Whitelist addresses saved successfully!");
    setIsModalOpen(false);
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidates.length < 2) {
      alert("Please add at least 2 candidates.");
      return;
    }
    if (!electionTitle || !description || !startDate || !endDate) {
      alert("Please fill in all required fields.");
      return;
    }
    const hasEmptyCandidateName = candidates.some((candidate) => !candidate.name);
    if (hasEmptyCandidateName) {
      alert("Please fill in all candidate names.");
      return;
    }
    console.log({
      electionTitle,
      description,
      startDate,
      endDate,
      candidates,
      whitelistAddresses,
    });
    alert("Election created successfully!");
  };

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
            <label className="block text-lg font-medium mb-2">Election Title</label>
            <input
              type="text"
              value={electionTitle}
              onChange={(e) => setElectionTitle(e.target.value)}
              className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter election title"
              required
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
            />
          </div>

          {/* Candidates */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Candidate</h2>
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <label className="block text-lg font-medium mb-2">
                    {index + 1}{index === 0 ? "st" : index === 1 ? "nd" : "rd"} Candidate
                  </label>
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => handleCandidateNameChange(candidate.id, e.target.value)}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Enter candidate ${index + 1} name`}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUploadClick(index)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(candidate.id, e.target.files?.[0])}
                    className="hidden"
                    ref={fileInputRefs[index]}
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
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
              disabled={candidates.length >= 3}
              className={`w-full bg-green-500 text-white px-6 py-3 rounded-lg transition-colors ${candidates.length >= 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
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
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Whitelist Voters
            </button>
          </div>

          {/* Save Election */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Save Election
            </button>
          </div>
        </form>

        {/* Modal Whitelist Voters */}
        {
          isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#2D3748] text-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Whitelist Voters</h2>

                {/* Input untuk alamat wallet */}
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Wallet Address</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full p-3 bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter wallet address"
                    />
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Daftar alamat yang sudah ditambahkan */}
                <div className="mb-4 max-h-40 overflow-y-auto">
                  <h3 className="text-lg font-medium mb-2">Whitelisted Addresses</h3>
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
                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
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
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWhitelist}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </main>
  );
}
