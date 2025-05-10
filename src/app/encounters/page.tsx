"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState, ActionType, Encounter } from "@/contexts/game-state";
import { useEffect } from "react";

export default function EncountersPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { 
    encounters, 
    gameProgress, 
    playerStatus, 
    isEncountersLoading, 
    refetchEncounters 
  } = useGameState();
  const [filteredEncounters, setFilteredEncounters] = useState<Encounter[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  
  // Create filter for encounters
  useEffect(() => {
    if (selectedCycle) {
      setFilteredEncounters(encounters.filter(e => e.cycle === selectedCycle));
    } else {
      setFilteredEncounters(encounters);
    }
  }, [encounters, selectedCycle]);
  
  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);
  
  // Manual refresh function
  const handleRefresh = () => {
    refetchEncounters();
  };
  
  // Get action icon
  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case ActionType.Attack:
        return "⚔️";
      case ActionType.Avoid:
        return "👻";
      case ActionType.Ally:
        return "🤝";
      default:
        return "❓";
    }
  };
  
  // Get outcome style
  const getOutcomeStyle = (outcome: string) => {
    if (outcome.includes("Success") || outcome === "AllianceFormed") {
      return "text-green-500";
    } else if (outcome.includes("Failed") || outcome === "AllianceBetrayed") {
      return "text-destructive";
    }
    return "text-muted-foreground";
  };
  
  // Count encounters per cycle for stats
  const cycleStats = encounters.reduce<Record<number, { count: number, wins: number, losses: number }>>(
    (acc, encounter) => {
      const cycle = encounter.cycle;
      if (!acc[cycle]) {
        acc[cycle] = { count: 0, wins: 0, losses: 0 };
      }
      
      acc[cycle].count++;
      
      if (encounter.outcome.includes("Success") || encounter.outcome === "AllianceFormed") {
        acc[cycle].wins++;
      } else if (encounter.outcome.includes("Failed") || encounter.outcome === "AllianceBetrayed") {
        acc[cycle].losses++;
      }
      
      return acc;
    }, 
    {}
  );
  
  // Get available cycles for filter
  const availableCycles = Object.keys(cycleStats).map(Number).sort((a, b) => a - b);

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-3xl">Encounter Log</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isEncountersLoading}
          >
            {isEncountersLoading ? "Loading..." : "Refresh"}
          </Button>
          <select 
            className="px-3 py-2 rounded-md border border-border bg-background"
            value={selectedCycle || ""}
            onChange={(e) => setSelectedCycle(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Cycles</option>
            {availableCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                Cycle {cycle} ({cycleStats[cycle].count} encounters)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isEncountersLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading encounter data...</p>
          </div>
        </div>
      ) : encounters.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">No encounters found</p>
              <p className="text-muted-foreground mb-6">
                You haven't had any encounters yet. Submit actions in a cycle to interact with other players.
              </p>
              <Button onClick={() => router.push("/action")}>
                Submit an Action
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cycle Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {availableCycles.map(cycle => (
              <Card key={cycle} className="bg-background/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cycle {cycle}</CardTitle>
                  <CardDescription>
                    {cycleStats[cycle].count} encounters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-muted/20 rounded-md">
                      <span className="text-green-500 text-xl font-medium">{cycleStats[cycle].wins}</span>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded-md">
                      <span className="text-destructive text-xl font-medium">{cycleStats[cycle].losses}</span>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        
          {/* Encounters List */}
          <div className="space-y-4">
            {filteredEncounters.map((encounter, index) => (
              <Card key={index} className="bg-background/60 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-2">
                        {encounter.cycle === gameProgress?.currentCycle ? "👁️" : encounter.cycle}
                      </span>
                      <div>
                        <p className="font-medium">Cycle {encounter.cycle}</p>
                        <p className="text-xs text-muted-foreground">Opponent: {encounter.opponent.slice(0, 6)}...{encounter.opponent.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${encounter.resourceChange.startsWith("+") ? "text-green-500" : encounter.resourceChange.startsWith("-") ? "text-destructive" : ""}`}>
                        {encounter.resourceChange} resources
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <span className="text-xl">{getActionIcon(encounter.playerAction)}</span>
                        <p className="text-xs text-muted-foreground mt-1">You</p>
                      </div>
                      <div className="text-center">
                        <span className="text-xl">⚔️</span>
                        <p className="text-xs text-muted-foreground mt-1">vs</p>
                      </div>
                      <div className="text-center">
                        <span className="text-xl">{getActionIcon(encounter.opponentAction)}</span>
                        <p className="text-xs text-muted-foreground mt-1">Them</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className={`text-sm font-medium ${getOutcomeStyle(encounter.outcome)}`}>
                        {encounter.outcome}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 