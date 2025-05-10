"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import dynamic from 'next/dynamic';
import WalletTest from "@/components/wallet-test";

// Use dynamic import to prevent hydration errors
const WalletTestWithNoSSR = dynamic(
  () => import('@/components/wallet-test'),
  { ssr: false }
);

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  
  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-10 relative">
      <div className="absolute inset-0 bg-gradient-radial from-background/20 to-background pointer-events-none" />
      
      <h1 className="font-bold text-5xl md:text-7xl mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
        QUIETUS
      </h1>
      <p className="text-muted-foreground max-w-[700px] text-center mb-8">
        A strategic blockchain game where survival depends on your wits, alliances, and resource management across multiple chains
      </p>
      
      <Card className="max-w-md w-full border-primary/20 bg-background/60 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle>Welcome to Quietus</CardTitle>
          <CardDescription>
            Connect your wallet to join the game
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-sm text-muted-foreground">
            Quietus is a survival strategy game where players compete for resources and territory across multiple blockchain networks.
            Form alliances, attack rivals, and collect resources to ensure your survival.
          </p>
          
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </CardContent>
      </Card>
      
      {/* Wallet test component */}
      <div className="max-w-md w-full">
        <WalletTestWithNoSSR />
      </div>
    </div>
  );
} 