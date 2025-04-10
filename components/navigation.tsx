/*export const Navigation = () => {
    return (
      <nav className="bg-[var(--background)] border-b border-[var(--foreground)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-[var(--foreground)]">
                TrustVote
              </h1>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </nav>
    );
  };*/

// components/navigation.tsx
import Link from "next/link";
import Image from "next/image";

const Navigation = () => {
  return (
    <nav className="bg-[var(--background)] border-b-4 border-[var(--foreground)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo dan Navigation Links di Samping */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="TrustVote Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>

            {/* Navigation Links */}
            <Link
              href="/#welcome"
              className="text-gray-400 hover:text-white transition-colors"
              scroll={true}
            >
              How It Works
            </Link>
            <Link
              href="/top-vote"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Top Vote
            </Link>
          </div>

          {/* Connect to Wallet Text */}
          <div className="text-gray-400">Connect to Wallet</div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
