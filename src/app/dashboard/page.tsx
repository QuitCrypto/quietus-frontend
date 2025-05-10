"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { useGameState } from "@/contexts/game-state";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { gameContractConfig } from "@/lib/contract-config";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import dynamic from 'next/dynamic';
import StarField from "@/components/star-field";
import SpaceBarge from "@/components/space-barge";
import SpaceHUD from "@/components/space-hud";

// Simple client-side only countdown component
function SimpleCountdown({ targetTime }: { targetTime: number | null }) {
  const [timeLeft, setTimeLeft] = useState<string>("Calculating...");
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    if (!targetTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = targetTime - now;
      
      if (remaining <= 0) {
        setTimeLeft("New cycle imminent");
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetTime]);
  
  if (!isMounted) return null;
  
  return <span>{timeLeft}</span>;
}

function DashboardContent() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const {
    playerStatus,
    playerResources,
    gameProgress,
    gameStarted,
    currentCycle,
    cycleDuration,
    gameStartTime,
    refetchPlayerStatus,
    isPlayerStatusLoading,
  } = useGameState();
  
  // State for estimated next cycle time
  const [nextCycleTime, setNextCycleTime] = useState<number | null>(null);
  
  // Client-side effect
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Format registration call
  const { 
    write: registerPlayer,
    data: registerData,
    isLoading: isRegisterLoading,
    error: registerError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "registerPlayer",
    // Add entry cost value from contract when available - currently hardcoded for demo
    value: BigInt("10000000000000000"), // 0.01 ETH
    // Add gas parameter to ensure transaction goes through
    gas: BigInt(300000), // Add more gas to ensure transaction completes
    onError: (error) => {
      console.error("Registration contract write error:", error);
    }
  });
  
  // Use a function to handle registration with better error handling
  const handleRegistration = async () => {
    console.log("Attempting to register player...");
    
    if (!registerPlayer) {
      toast({
        title: "Wallet Error",
        description: "Please make sure your wallet is connected and on the Anvil network.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Explicitly logging info about the registration transaction
      console.log("Registration transaction parameters:", {
        contractAddress: gameContractConfig.address,
        functionName: "registerPlayer",
        entryCost: "0.01 ETH (10000000000000000 wei)"
      });
      
      // Call the registerPlayer function
      registerPlayer();
      
      // Log transaction attempt for debugging
      console.log("Registration transaction initiated");
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Error initiating registration transaction",
        variant: "destructive"
      });
    }
  };
  
  // Wait for registration transaction
  const {
    isLoading: isWaitingForRegistration,
    isSuccess: isRegistrationSuccess,
  } = useWaitForTransaction({
    hash: registerData?.hash,
    onSuccess: () => {
      console.log("Registration transaction successful");
      toast({
        title: "Registration Successful",
        description: "You are now registered as a player!",
      });
      refetchPlayerStatus();
    },
    onError: (error) => {
      console.error("Registration transaction error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error during registration.",
        variant: "destructive",
      });
    },
  });
  
  // Calculate next cycle time
  useEffect(() => {
    if (gameStartTime && cycleDuration && currentCycle !== undefined) {
      const nextCycle = gameStartTime + ((currentCycle + 1) * cycleDuration * 1000);
      setNextCycleTime(nextCycle);
    }
  }, [gameStartTime, cycleDuration, currentCycle]);
  
  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected && isMounted) {
      router.push("/");
    }
  }, [isConnected, router, isMounted]);
  
  // Handle registration errors
  useEffect(() => {
    if (registerError) {
      console.error("Register error in effect:", registerError);
      toast({
        title: "Registration Error",
        description: registerError.message,
        variant: "destructive",
      });
    }
  }, [registerError, toast]);
  
  // Registration loading state
  const isRegistering = isRegisterLoading || isWaitingForRegistration;

  if (!isConnected || !isMounted) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Animated Starfield Background */}
      <StarField />
      
      {/* HUD Layout */}
      <div className="absolute inset-0 flex items-center justify-center">
        {!playerStatus?.registered ? (
          <Card className="max-w-md w-full border-primary/20 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Register to Play</CardTitle>
              <CardDescription>
                Join the game by paying the entry fee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                The entry fee is 0.01 ETH and contributes to the reward pool.
                Survivors at the end of the game will share the pool based on their final resources.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleRegistration}
                disabled={isRegistering || !gameStarted || !isConnected}
                className="mr-2"
              >
                {isRegistering ? "Registering..." : "Register Player"}
              </Button>
              
              {!gameStarted && (
                <p className="text-sm text-muted-foreground">
                  Game has not started yet
                </p>
              )}
              
              {!isConnected && (
                <p className="text-sm text-destructive">
                  Wallet not connected
                </p>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="relative w-full h-full">
            {/* Centered Space Barge Ship */}
            <SpaceBarge />
            
            {/* Game Status Badge */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="hud-panel pixel-text text-center px-4 py-1">
                <span className="text-xs text-muted-foreground mr-2">NEXT CYCLE:</span>
                <span className="text-xs text-primary">
                  <SimpleCountdown targetTime={nextCycleTime} />
                </span>
                
                {playerStatus?.eliminated ? (
                  <div className="mt-1 text-xs bg-destructive/30 px-2 py-1 rounded">
                    <span className="text-destructive">SHIP DESTROYED</span>
                  </div>
                ) : gameProgress?.ended ? (
                  <div className="mt-1 text-xs bg-orange-500/30 px-2 py-1 rounded">
                    <span className="text-orange-400">GAME CONCLUDED</span>
                  </div>
                ) : (
                  <div className="mt-1 text-xs bg-green-500/10 px-2 py-1 rounded">
                    <span className="text-green-400">SYSTEMS NOMINAL</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* HUD Panels */}
            <SpaceHUD address={address} />
          </div>
        )}
      </div>
    </div>
  );
}

// Use dynamic import with SSR disabled
const Dashboard = dynamic(() => Promise.resolve(DashboardContent), { ssr: false });
export default Dashboard; 