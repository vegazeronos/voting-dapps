import { Chain } from "@wagmi/core/chains";

export const pharos: Chain = {
  id: 50002, 
  name: "Pharos",
  nativeCurrency: {
    name: "Pharos Token",
    symbol: "PTT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL??""], 
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL??""],
    },
  },
  blockExplorers: {
    default: {
      name: "Pharos Explorer",
      url: "https://pharosscan.xyz/", 
    },
  },
  testnet: true,
};