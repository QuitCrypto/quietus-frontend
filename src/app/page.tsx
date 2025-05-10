"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-16">
        <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Strategic Gameplay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose your actions wisely between attacking, avoiding, or forming alliances in a zero-sum game for survival.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Multi-Chain Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Collect and trade resources across ETH, BASE, APE, and ABSTRACT chains to gain advantage over your opponents.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Cycle-Based Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The game evolves through timed cycles, with increasing stakes and permanent elimination in the final stages.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="max-w-md w-full border-primary/20 bg-background/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Join the Game</CardTitle>
          <CardDescription>
            Connect your wallet to register and start playing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            The registration fee covers your entry and contributes to the reward pool distributed to survivors at the end of the game.
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => connect()}
          >
            Connect Wallet
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/rules" className="text-sm text-primary hover:underline">
            Read Game Rules
          </Link>
          <Link href="/cycles" className="text-sm text-primary hover:underline">
            View Current Cycle
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 