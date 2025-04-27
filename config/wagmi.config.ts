import { createConfig, http } from "wagmi";
import { pharos } from "./pharosChain";
import { walletConnect, injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [pharos],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: "YOUR_WALLETCONNECT_PROJECT_ID" }),
  ],
  transports: {
    [pharos.id]: http(process.env.RPC_URL), // Replace with Pharos RPC URL
  },
});