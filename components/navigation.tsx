
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";




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
          <ConnectButton 
            label="Connect to Wallet"
            showBalance={false}
            chainStatus={"none"}
            accountStatus={"address"}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
