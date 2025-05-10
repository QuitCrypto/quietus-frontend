"use client";

import { ThemeProvider } from "next-themes";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { base, arbitrum, mainnet } from "wagmi/chains";
import { Chain } from "wagmi";
import { GameStateProvider } from "@/contexts/game-state";
import { useEffect, useState } from "react";

// RainbowKit imports
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

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

// Get RainbowKit wallets - use a valid projectId for WalletConnect
const { connectors } = getDefaultWallets({
  appName: 'Quietus',
  // Valid WalletConnect project ID 
  projectId: '7f0793c4d8b20795d1c3f8ea1e3634f9',
  chains
});

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains} theme={darkTheme({
        accentColor: 'hsl(142.1 70.6% 45.3%)',
        accentColorForeground: 'black',
        borderRadius: 'medium',
        fontStack: 'system',
      })}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <GameStateProvider>
            {mounted ? children : null}
          </GameStateProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 