"use client";

import { useGameState, ActionType } from "@/contexts/game-state";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { gameContractConfig } from "@/lib/contract-config";

// Function to get icon for action
function getActionIcon(action: ActionType) {
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
}

interface SpaceHUDProps {
  address: string | undefined;
}

export function SpaceHUD({ address }: SpaceHUDProps) {
  const {
    playerStatus,
    playerResources,
    gameProgress,
    currentCycle,
    cycleDuration,
    gameStartTime,
    encounters,
    selectedAction,
    setSelectedAction,
    isActionSubmitted,
    refetchGameProgress,
  } = useGameState();
  
  // Get toast function
  const { toast } = useToast();
  
  // State for action selection UI
  const [showActionSelector, setShowActionSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localActionSubmitted, setLocalActionSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("Calculating...");
  const [isCycleImminent, setIsCycleImminent] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  
  // Contract write hooks for blockchain transactions
  const { 
    write: advanceCycle,
    data: advanceCycleData,
    isLoading: isAdvanceCycleLoading,
    error: advanceCycleError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "advanceCycle",
  });
  
  // Wait for advance cycle transaction
  const {
    isLoading: isWaitingForAdvanceCycle,
  } = useWaitForTransaction({
    hash: advanceCycleData?.hash,
    onSuccess: () => {
      toast({
        title: "Cycle Advanced",
        description: "The game has moved to the next cycle",
      });
      // Reset action submission status for new cycle
      setLocalActionSubmitted(false);
      setIsCycleImminent(false);
      
      // Refetch game data to update UI
      refetchGameProgress();
    },
    onError: () => {
      toast({
        title: "Transaction Failed",
        description: "There was an error advancing the cycle",
        variant: "destructive",
      });
    },
  });
  
  // Handle errors from advance cycle
  useEffect(() => {
    if (advanceCycleError) {
      toast({
        title: "Transaction Error",
        description: advanceCycleError.message,
        variant: "destructive",
      });
    }
  }, [advanceCycleError, toast]);
  
  // Format wallet address
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not Connected";
  
  // Get last 3 encounters for the quick log
  const recentEncounters = encounters.slice(0, 3);
  
  // Get total resources across all chains
  const totalResources = playerResources
    ? Number(playerResources.ethResources) 
      + Number(playerResources.baseResources)
      + Number(playerResources.apeResources)
      + Number(playerResources.abstractResources)
    : 0;
  
  // Current standard resources
  const standardResources = playerStatus?.resources || "0";
  
  // Logic to toggle action selector
  const toggleActionSelector = () => {
    if (!isActionSubmitted && !localActionSubmitted) {
      setShowActionSelector(!showActionSelector);
    }
  };
  
  // Handle action selection
  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action);
    setShowActionSelector(false);
  };
  
  // Handle action submission
  const handleSubmitAction = async () => {
    if (selectedAction === ActionType.None) {
      toast({
        title: "No action selected",
        description: "Please select an action before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real implementation, this would call the contract
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocalActionSubmitted(true);
      toast({
        title: "Action submitted",
        description: `Your ${ActionType[selectedAction]} action has been locked in for this cycle`,
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your action",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle collection
  const handleCollect = async (event: React.MouseEvent) => {
    // Prevent default link navigation
    event.preventDefault();
    
    setIsCollecting(true);
    try {
      // In a real implementation, this would call the contract to collect resources
      // For now, we'll just simulate a successful collection
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Resources collected",
        description: `You've successfully collected your chain resources`,
      });
    } catch (error) {
      toast({
        title: "Collection failed",
        description: "There was an error collecting your resources",
        variant: "destructive",
      });
    } finally {
      setIsCollecting(false);
    }
  };
  
  // Handle advancing cycle
  const handleAdvanceCycle = () => {
    // Call the contract to advance the cycle
    advanceCycle?.();
  };
  
  // Calculate next cycle time
  const nextCycleTime = gameStartTime && cycleDuration && currentCycle !== undefined
    ? new Date(gameStartTime + ((currentCycle + 1) * cycleDuration * 1000))
    : null;
  
  // Check if advance cycle is in progress
  const isAdvancingCycle = isAdvanceCycleLoading || isWaitingForAdvanceCycle;
  
  // Update time remaining with useEffect to prevent render loop
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!nextCycleTime) {
        setTimeRemaining("Calculating...");
        setIsCycleImminent(false);
        return;
      }
      
      const now = new Date();
      const diff = nextCycleTime.getTime() - now.getTime();
      
      // Check if cycle is imminent (less than 1 second remaining)
      if (diff <= 1000) {
        // Reset action submission status for new cycle
        setLocalActionSubmitted(false);
        setTimeRemaining("New cycle imminent");
        setIsCycleImminent(true);
        return;
      } else {
        setIsCycleImminent(false);
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    // Update immediately
    updateTimeRemaining();
    
    // Then update every second
    const intervalId = setInterval(updateTimeRemaining, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [nextCycleTime, currentCycle]);
  
  return (
    <div className="space-hud relative w-full h-full pointer-events-none">
      {/* Top-Left - Encounter Log (was Bottom-Left) */}
      <div className="hud-panel absolute top-4 left-4 max-w-[250px] pointer-events-auto">
        <div className="pixel-text text-xs text-primary mb-1">ENCOUNTER LOG</div>
        {recentEncounters.length === 0 ? (
          <div className="pixel-text text-xs text-muted-foreground">NO ENCOUNTERS RECORDED</div>
        ) : (
          <div className="space-y-1">
            {recentEncounters.map((encounter, idx) => (
              <div key={idx} className="text-xs flex items-center">
                <span className="mr-1">{getActionIcon(encounter.playerAction)}</span>
                <span className={encounter.resourceChange.startsWith("+") 
                  ? "text-green-500" 
                  : encounter.resourceChange.startsWith("-") 
                    ? "text-destructive" 
                    : "text-muted-foreground"
                }>
                  {encounter.resourceChange}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2">
          <Link href="/encounters">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-6 pixel-text text-xs"
            >
              FULL LOG
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Top-Right - Game Cycle Info (was Top-Left) */}
      <div className="hud-panel absolute top-4 right-4 max-w-[250px] pointer-events-auto">
        <div className="pixel-text text-xs text-primary mb-1">CYCLE: {gameProgress?.currentCycle || 0}/{gameProgress?.totalCycles || 0}</div>
        <div className="pixel-text text-xs text-muted-foreground">NEXT CYCLE: {timeRemaining}</div>
        <div className="pixel-text text-xs mt-2">
          {playerStatus?.eliminated 
            ? <span className="text-destructive">ELIMINATED</span>
            : <span className="text-green-500">ACTIVE</span>
          }
        </div>
        
        {/* Advance Cycle Button - Only shown when cycle is imminent */}
        {isCycleImminent && (
          <div className="mt-3">
            <Button
              variant="default"
              size="sm"
              className="w-full pixel-text text-xs animate-pulse bg-primary"
              onClick={handleAdvanceCycle}
              disabled={isAdvancingCycle}
            >
              {isAdvancingCycle ? "ADVANCING..." : "ADVANCE CYCLE"}
            </Button>
          </div>
        )}
      </div>
      
      {/* Bottom-Left - Chain Resources (was Bottom-Right) */}
      <div className="hud-panel absolute bottom-4 left-4 max-w-[250px] pointer-events-auto">
        <div className="pixel-text text-xs text-primary mb-1">CHAIN RESOURCES</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-resource-eth mr-1"></div>
            <span>ETH: {playerResources?.ethResources || 0}</span>
          </div>
          <div className="text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-resource-base mr-1"></div>
            <span>BASE: {playerResources?.baseResources || 0}</span>
          </div>
          <div className="text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-resource-ape mr-1"></div>
            <span>APE: {playerResources?.apeResources || 0}</span>
          </div>
          <div className="text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-resource-abstract mr-1"></div>
            <span>ABS: {playerResources?.abstractResources || 0}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="pixel-text text-xs">TOTAL: {totalResources}</span>
          {/* Changed to onClick handler instead of Link */}
          <Button 
            variant="outline" 
            size="sm" 
            className="pixel-text text-xs h-6"
            onClick={handleCollect}
            disabled={isCollecting}
          >
            {isCollecting ? "COLLECTING..." : "COLLECT"}
          </Button>
        </div>
      </div>
      
      {/* Bottom-Right - Current Action - Expanded and with transaction submission */}
      <div className="hud-panel absolute bottom-4 right-4 max-w-[320px] pointer-events-auto p-3">
        <div className="pixel-text text-sm text-primary mb-3">CURRENT ACTION</div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12 pixel-text text-lg mb-2"
            disabled={!playerStatus?.registered || playerStatus?.eliminated || isActionSubmitted || localActionSubmitted}
            onClick={toggleActionSelector}
          >
            {selectedAction !== ActionType.None ? 
              <><span className="mr-3 text-xl">{getActionIcon(selectedAction)}</span>{ActionType[selectedAction].toUpperCase()}</> : 
              "SELECT ACTION"
            }
          </Button>
          
          {/* Action Selector - Expands Upward */}
          {showActionSelector && (
            <Card className="absolute right-0 bottom-24 w-full bg-black/80 border border-primary/50">
              <CardContent className="p-3 space-y-3">
                <Button 
                  variant={selectedAction === ActionType.Attack ? "attack" : "outline"}
                  size="lg" 
                  className="w-full h-11 pixel-text text-base"
                  onClick={() => handleActionSelect(ActionType.Attack)}
                >
                  <span className="mr-3 text-xl">⚔️</span>ATTACK
                </Button>
                <Button 
                  variant={selectedAction === ActionType.Avoid ? "avoid" : "outline"}
                  size="lg" 
                  className="w-full h-11 pixel-text text-base"
                  onClick={() => handleActionSelect(ActionType.Avoid)}
                >
                  <span className="mr-3 text-xl">👻</span>AVOID
                </Button>
                <Button 
                  variant={selectedAction === ActionType.Ally ? "ally" : "outline"}
                  size="lg" 
                  className="w-full h-11 pixel-text text-base"
                  onClick={() => handleActionSelect(ActionType.Ally)}
                >
                  <span className="mr-3 text-xl">🤝</span>ALLY
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Submit Action Button */}
          <Button 
            variant="default" 
            size="lg" 
            className="w-full h-11 pixel-text text-base"
            disabled={selectedAction === ActionType.None || isSubmitting || isActionSubmitted || localActionSubmitted || !playerStatus?.registered || playerStatus?.eliminated}
            onClick={handleSubmitAction}
          >
            {isSubmitting ? "SUBMITTING..." : (isActionSubmitted || localActionSubmitted) ? "ACTION LOCKED" : "SUBMIT ACTION"}
          </Button>
        </div>
        
        <div className="pixel-text text-sm text-green-400 mt-3 flex justify-between items-center">
          <span>RESOURCES:</span>
          <span className="text-base">{standardResources}</span>
        </div>
        
        {(isActionSubmitted || localActionSubmitted) && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Action locked until next cycle
          </div>
        )}
      </div>
    </div>
  );
}

export default SpaceHUD; 