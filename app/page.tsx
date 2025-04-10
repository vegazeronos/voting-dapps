import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="bg-[#1A202C] text-white">
      {/* Section 1: Welcome Section */}
      <section
        id="welcome"
        className="min-h-screen flex items-center justify-center py-16 border-b-4 border-[var(--foreground)]/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Secure, Platform-Based DApp Voting
            </h1>
            <ConnectButton/>
            <p className="text-gray-400 mb-6">
              Create an election for your school or organization in seconds.
              Your voters can vote from any location on any device.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/organizer/dashboard"
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Create an Election
              </Link>
              <Link
                href="/voters/dashboard"
                className="border border-green-500 text-green-500 px-6 py-3 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
              >
                Make a Vote
              </Link>
            </div>
          </div>

          {/* Placeholder Image/Video */}
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-gray-300 w-64 h-64 flex items-center justify-center rounded-lg relative">
              <span className="text-gray-500">Demo App</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-800 bg-opacity-50 rounded-full p-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Feature Section */}
      <section className="min-h-screen flex items-center justify-center py-16 border-b-4 border-[var(--foreground)]/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Building an Vote is Easy
          </h2>
          <p className="text-gray-400 mb-12">
            You’re always in control with Election Runner. It’s easy to build
            and customize an election.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#2D3748] p-6 rounded-lg">
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Keterangan</h3>
              <p className="text-gray-400">Gambar</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#2D3748] p-6 rounded-lg">
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Keterangan</h3>
              <p className="text-gray-400">Gambar</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#2D3748] p-6 rounded-lg">
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Keterangan</h3>
              <p className="text-gray-400">Gambar</p>
              
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Team Section */}
      <section className="min-h-screen flex items-center justify-center py-16 border-b-4 border-[var(--foreground)]/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
          <p className="text-gray-400 mb-12">
            Explore Our Success Stories and Innovative Projects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="bg-gray-300 h-48 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Gambar</span>
            </div>
            {/* Team Member 2 */}
            <div className="bg-gray-300 h-48 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Gambar</span>
            </div>
            {/* Team Member 3 */}
            <div className="bg-gray-300 h-48 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Gambar</span>
            </div>
            {/* Team Member 4 */}
            <div className="bg-gray-300 h-48 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Gambar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Testimony Section */}
      <section
        id="testimony"
        className="min-h-screen flex items-center justify-center py-16 border-b-4 border-[var(--foreground)]/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            What Customers are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimony 1 */}
            <div className="bg-gray-300 h-32 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Komentar</span>
            </div>
            {/* Testimony 2 */}
            <div className="bg-gray-300 h-32 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Komentar</span>
            </div>
            {/* Testimony 3 */}
            <div className="bg-gray-300 h-32 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Komentar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Let's Get Started Section */}
      <section
        id="lets-get-started"
        className="min-h-screen flex items-center justify-center py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start building your first voting
          </h2>
          <p className="text-gray-400 mb-8">
            Trust Vote is the most powerful online voting software available.
            Don’t believe us? See for yourself.
          </p>
          <Link
            href="/get-started"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center"
          >
            Get Started
            <svg
              className="w-5 h-5 ml-2"
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
          </Link>
          <div className="mt-12 bg-gray-300 h-32 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Gambar</span>
          </div>
        </div>
      </section>
    </main>
  );
}