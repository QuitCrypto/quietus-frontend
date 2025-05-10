"use client";

import { useRouter } from "next/navigation";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/contexts/game-state";
import { useToast } from "@/hooks/use-toast";
import { gameContractConfig } from "@/lib/contract-config";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Client-side only component for rendering dates
function ClientDate({ timestamp }: { timestamp: number }) {
  const [formattedDate, setFormattedDate] = useState<string>("Loading...");
  
  useEffect(() => {
    if (!timestamp) {
      setFormattedDate("Unknown");
      return;
    }
    
    try {
      const date = new Date(timestamp);
      setFormattedDate(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
    } catch(e) {
      setFormattedDate("Invalid Date");
    }
  }, [timestamp]);
  
  return <span>{formattedDate}</span>;
}

// Main component content
const CyclesPageContent = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { 
    gameProgress, 
    currentCycle,
    gameStartTime,
    cycleDuration,
    encounters
  } = useGameState();
  
  // Advance cycle contract call (admin only in real implementation)
  const { 
    write: advanceCycle, 
    data: advanceData,
    isLoading: isAdvanceLoading,
    error: advanceError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "advanceCycle",
  });
  
  // Wait for advance cycle transaction
  const {
    isLoading: isWaitingForAdvance,
  } = useWaitForTransaction({
    hash: advanceData?.hash,
    onSuccess: () => {
      toast({
        title: "Cycle Advanced",
        description: "The game cycle has been advanced",
      });
    },
    onError: () => {
      toast({
        title: "Advance Failed",
        description: "There was an error advancing the cycle",
        variant: "destructive",
      });
    },
  });
  
  // Handle advance errors
  useEffect(() => {
    if (advanceError) {
      toast({
        title: "Advance Error",
        description: advanceError.message,
        variant: "destructive",
      });
    }
  }, [advanceError, toast]);
  
  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);
  
  // Calculate cycle timestamps
  const cycleTimestamps = useMemo(() => {
    const timestamps = [];
    if (gameStartTime && cycleDuration) {
      for (let i = 0; i <= (gameProgress?.totalCycles || 0); i++) {
        timestamps.push({
          cycle: i,
          timestamp: gameStartTime + (i * cycleDuration * 1000),
        });
      }
    }
    return timestamps;
  }, [gameStartTime, cycleDuration, gameProgress?.totalCycles]);
  
  // Loading state
  const isLoading = isAdvanceLoading || isWaitingForAdvance;
  
  // Game stage helper
  const getGameStage = (cycle: number) => {
    const totalCycles = gameProgress?.totalCycles || 1;
    
    if (cycle >= Math.floor(totalCycles * 0.6)) {
      return "Final Stage";
    } else if (cycle >= Math.floor(totalCycles * 0.3)) {
      return "Middle Stage";
    } else {
      return "Early Stage";
    }
  };
  
  // Game stage color helper
  const getStageColor = (cycle: number) => {
    const totalCycles = gameProgress?.totalCycles || 1;
    
    if (cycle >= Math.floor(totalCycles * 0.6)) {
      return "text-destructive";
    } else if (cycle >= Math.floor(totalCycles * 0.3)) {
      return "text-yellow-500";
    } else {
      return "text-green-500";
    }
  };
  
  // Count encounters per cycle
  const encountersByCycle = useMemo(() => {
    const counts: Record<number, number> = {};
    encounters.forEach(encounter => {
      counts[encounter.cycle] = (counts[encounter.cycle] || 0) + 1;
    });
    return counts;
  }, [encounters]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Game Timeline</h1>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Game Info */}
        <Card className="lg:col-span-1 bg-background/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Game Status</CardTitle>
            <CardDescription>
              Current cycle information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Cycle:</span>
              <span className="font-medium">{currentCycle} / {gameProgress?.totalCycles}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Game Stage:</span>
              <span className={`font-medium ${getStageColor(currentCycle)}`}>
                {getGameStage(currentCycle)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Game Status:</span>
              <span className={`font-medium ${gameProgress?.ended ? "text-destructive" : "text-green-500"}`}>
                {gameProgress?.ended ? "Ended" : "In Progress"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium text-xs">
                <ClientDate timestamp={gameStartTime} />
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cycle Duration:</span>
              <span className="font-medium">
                {cycleDuration ? `${cycleDuration} seconds` : "Unknown"}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => advanceCycle?.()}
              disabled={isLoading || gameProgress?.ended}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Trigger Cycle Advancement"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Cycle Timeline */}
        <Card className="lg:col-span-2 bg-background/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Cycle Timeline</CardTitle>
            <CardDescription>
              History of game cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cycleTimestamps.map((cycle, index) => (
                <div key={index} className={`relative flex ${index !== cycleTimestamps.length - 1 ? "pb-8" : ""}`}>
                  {/* Timeline line */}
                  {index !== cycleTimestamps.length - 1 && (
                    <div className="absolute inset-0 flex items-center justify-center h-full w-6">
                      <div className="h-full w-px bg-border"></div>
                    </div>
                  )}
                  
                  {/* Cycle dot */}
                  <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${
                    cycle.cycle === currentCycle ? "border-primary" : ""
                  }`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      cycle.cycle <= currentCycle ? "bg-primary" : "bg-muted"
                    }`}></span>
                  </div>
                  
                  {/* Cycle content */}
                  <div className="flex-grow ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-medium ${
                        cycle.cycle === currentCycle ? "text-primary" : ""
                      }`}>
                        {cycle.cycle === 0 ? "Game Start" : `Cycle ${cycle.cycle}`}
                      </h3>
                      <time dateTime={new Date(cycle.timestamp).toISOString()} className="text-xs text-muted-foreground">
                        <ClientDate timestamp={cycle.timestamp} />
                      </time>
                    </div>
                    
                    <div className="space-y-1">
                      {cycle.cycle <= currentCycle ? (
                        <>
                          <p className="text-sm">
                            <span className={getStageColor(cycle.cycle)}>{getGameStage(cycle.cycle)}</span>
                            {cycle.cycle === currentCycle && !gameProgress?.ended && " (Current)"}
                            {cycle.cycle === 0 && " - Game Initialized"}
                          </p>
                          
                          {cycle.cycle > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {encountersByCycle[cycle.cycle] 
                                ? `${encountersByCycle[cycle.cycle]} player encounters` 
                                : "No player encounters"}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Future cycle - not yet started</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Stage Explanation */}
      <Card className="bg-background/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Game Stages</CardTitle>
          <CardDescription>
            How the game evolves through cycles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="p-4 bg-muted/20 rounded-md">
              <h3 className="font-medium text-green-500 mb-2">Early Stage (0-30%)</h3>
              <p className="text-sm text-muted-foreground">
                Focus on gathering resources and forming initial alliances. 
                Players cannot be eliminated during this stage, making it ideal for building your strategy.
              </p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-md">
              <h3 className="font-medium text-yellow-500 mb-2">Middle Stage (30-60%)</h3>
              <p className="text-sm text-muted-foreground">
                The resource war intensifies, and competition for special resources begins.
                Cross-chain travel becomes available, allowing players to seek resources on other chains.
              </p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-md">
              <h3 className="font-medium text-destructive mb-2">Final Stage (60-100%)</h3>
              <p className="text-sm text-muted-foreground">
                The elimination phase begins. Losing an attack can result in permanent elimination.
                Alliances become critical for survival, but betrayal is common as the end approaches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export as client-only component
const CyclesPage = dynamic(() => Promise.resolve(CyclesPageContent), { ssr: false });
export default CyclesPage; 