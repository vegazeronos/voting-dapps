import Link from "next/link";
import Image from "next/image";
import { FaDiscord, FaReddit, FaGithub, FaTwitter } from "react-icons/fa";

const socialIcons = [
  { icon: <FaDiscord />, href: "https://discord.com" },
  { icon: <FaReddit />, href: "https://reddit.com" },
  { icon: <FaGithub />, href: "https://github.com" },
  { icon: <FaTwitter />, href: "https://twitter.com" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "How It Works", href: "/#welcome" },
  { name: "Review", href: "/#testimony" },
  { name: "Contact", href: "/#lets-get-started" },
];

const Footer = () => {
  return (
    <footer className="bg-[var(--background)]">
      <div className="border-t-4 border-[var(--foreground)]/10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        {/* Logo Section */}
        <div className="mb-4 md:mb-0">
          <Image
            src="/logo.png"
            alt="TrustVote Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          {socialIcons.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-2xl"
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
              scroll={true}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-500 text-sm mt-4 bg-[#2A2727]">
        Copyright TrustVote 2025
      </div>
      </div>
    </footer>
  );
};

export default Footer;