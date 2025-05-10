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
        description: "Error initiating registration transaction",
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
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);
  
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
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Player Dashboard</h1>
      
      {!playerStatus?.registered ? (
        <Card className="mb-6 border-primary/20 bg-background/60 backdrop-blur-sm">
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
        <>
          {/* Player Status Card */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Player Status</CardTitle>
                <CardDescription>
                  Your current game state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {playerStatus?.eliminated ? (
                  <div className="p-3 bg-destructive/20 rounded-md border border-destructive/30 text-center">
                    <p className="font-semibold">You have been eliminated</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your journey has ended, but your legacy remains
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Resources:</span>
                      <span className="font-medium">{playerStatus?.resources || 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Alliances:</span>
                      <span className="font-medium">{playerStatus?.numAllies || 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="font-medium text-xs truncate max-w-[180px]">{address}</span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                {!playerStatus?.eliminated && (
                  <Link href="/action">
                    <Button variant="outline" size="sm">
                      Submit Actions
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
            
            {/* Game Progress Card */}
            <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Game Progress</CardTitle>
                <CardDescription>
                  Current cycle information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Cycle:</span>
                  <span className="font-medium">
                    {gameProgress?.currentCycle || 0} / {gameProgress?.totalCycles || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Stage:</span>
                  <span className="font-medium">
                    {gameProgress?.isLateGame 
                      ? "Final (Elimination)" 
                      : gameProgress?.isMidGame 
                        ? "Middle (Resource War)" 
                        : "Early (Setup)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Next Cycle In:</span>
                  <span className="font-medium">
                    {isMounted ? <SimpleCountdown targetTime={nextCycleTime} /> : null}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Game Status:</span>
                  <span className={`font-medium ${gameProgress?.ended ? "text-destructive" : "text-green-500"}`}>
                    {gameProgress?.ended ? "Ended" : "In Progress"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/cycles">
                  <Button variant="outline" size="sm">
                    View Cycle History
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Resources Card */}
            <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Chain Resources</CardTitle>
                <CardDescription>
                  Your collected resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-resource-eth mr-2"></span>
                    ETH:
                  </span>
                  <span className="font-medium">{playerResources?.ethResources || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-resource-base mr-2"></span>
                    BASE:
                  </span>
                  <span className="font-medium">{playerResources?.baseResources || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-resource-ape mr-2"></span>
                    APE:
                  </span>
                  <span className="font-medium">{playerResources?.apeResources || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-resource-abstract mr-2"></span>
                    ABSTRACT:
                  </span>
                  <span className="font-medium">{playerResources?.abstractResources || 0}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/resources">
                  <Button variant="outline" size="sm">
                    Manage Resources
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
      
      {/* Quick Actions Section */}
      <h2 className="font-semibold text-xl mb-4">Quick Actions</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Link href="/action" className="w-full">
          <Button variant="outline" className="w-full" disabled={!playerStatus?.registered || playerStatus?.eliminated}>
            Submit Action
          </Button>
        </Link>
        <Link href="/alliances" className="w-full">
          <Button variant="outline" className="w-full" disabled={!playerStatus?.registered || playerStatus?.eliminated}>
            Manage Alliances
          </Button>
        </Link>
        <Link href="/encounters" className="w-full">
          <Button variant="outline" className="w-full">
            View Encounters
          </Button>
        </Link>
        <Link href="/resources" className="w-full">
          <Button variant="outline" className="w-full" disabled={!playerStatus?.registered || playerStatus?.eliminated}>
            Collect Resources
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Use dynamic import with SSR disabled
const Dashboard = dynamic(() => Promise.resolve(DashboardContent), { ssr: false });
export default Dashboard; 