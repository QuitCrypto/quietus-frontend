"use client";

import { ThemeProvider } from "next-themes";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { base, arbitrum, mainnet } from "wagmi/chains";
import { Chain } from "wagmi";
import { GameStateProvider } from "@/contexts/game-state";
import { useEffect, useState } from "react";

// Define local Anvil chain
const anvilChain: Chain = {
  id: 31337,
  name: 'Anvil Local Chain',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [anvilChain, mainnet, base, arbitrum], // Anvil first to use as default
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === anvilChain.id) {
          return { http: 'http://127.0.0.1:8545' };
        }
        return null;
      },
    }),
    publicProvider(), // Fallback for other chains
  ]
);

// Create wagmi config with proper connectors
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ 
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "Quietus",
        reloadOnDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiConfig config={config}>
      {mounted ? children : null}
    </WagmiConfig>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <GameStateProvider>
          {children}
        </GameStateProvider>
      </ThemeProvider>
    </WagmiProvider>
  );
} 