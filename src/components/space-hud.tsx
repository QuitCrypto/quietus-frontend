"use client";

import { useGameState, ActionType } from "@/contexts/game-state";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";

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
  } = useGameState();
  
  // State for action selection UI
  const [showActionSelector, setShowActionSelector] = useState(false);
  
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
    setShowActionSelector(!showActionSelector);
  };
  
  // Handle action selection
  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action);
    setShowActionSelector(false);
  };
  
  // Calculate next cycle time
  const nextCycleTime = gameStartTime && cycleDuration && currentCycle !== undefined
    ? new Date(gameStartTime + ((currentCycle + 1) * cycleDuration * 1000))
    : null;
  
  // Format time remaining until next cycle
  const formatTimeRemaining = () => {
    if (!nextCycleTime) return "Calculating...";
    
    const now = new Date();
    const diff = nextCycleTime.getTime() - now.getTime();
    
    if (diff <= 0) return "New cycle imminent";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-hud relative w-full h-full pointer-events-none">
      {/* Top-Left - Game Cycle Info */}
      <div className="hud-panel absolute top-4 left-4 max-w-[250px] pointer-events-auto">
        <div className="pixel-text text-xs text-primary mb-1">CYCLE: {gameProgress?.currentCycle || 0}/{gameProgress?.totalCycles || 0}</div>
        <div className="pixel-text text-xs text-muted-foreground">NEXT CYCLE: {formatTimeRemaining()}</div>
        <div className="pixel-text text-xs mt-2">
          {playerStatus?.eliminated 
            ? <span className="text-destructive">ELIMINATED</span>
            : <span className="text-green-500">ACTIVE</span>
          }
        </div>
      </div>
      
      {/* Top-Right - Action Selection */}
      <div className="hud-panel absolute top-4 right-4 max-w-[250px] pointer-events-auto">
        <div className="pixel-text text-xs text-primary mb-1">CURRENT ACTION</div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 pixel-text text-xs mb-2"
            disabled={!playerStatus?.registered || playerStatus?.eliminated}
            onClick={toggleActionSelector}
          >
            {selectedAction !== ActionType.None ? 
              <><span className="mr-1">{getActionIcon(selectedAction)}</span>{ActionType[selectedAction].toUpperCase()}</> : 
              "SELECT ACTION"
            }
          </Button>
          
          {/* Action Selector - Expands Upward */}
          {showActionSelector && (
            <Card className="absolute right-0 bottom-12 w-full bg-black/80 border border-primary/50">
              <CardContent className="p-2 space-y-2">
                <Button 
                  variant={selectedAction === ActionType.Attack ? "attack" : "outline"}
                  size="sm" 
                  className="w-full h-8 pixel-text text-xs"
                  onClick={() => handleActionSelect(ActionType.Attack)}
                >
                  <span className="mr-1">⚔️</span>ATTACK
                </Button>
                <Button 
                  variant={selectedAction === ActionType.Avoid ? "avoid" : "outline"}
                  size="sm" 
                  className="w-full h-8 pixel-text text-xs"
                  onClick={() => handleActionSelect(ActionType.Avoid)}
                >
                  <span className="mr-1">👻</span>AVOID
                </Button>
                <Button 
                  variant={selectedAction === ActionType.Ally ? "ally" : "outline"}
                  size="sm" 
                  className="w-full h-8 pixel-text text-xs"
                  onClick={() => handleActionSelect(ActionType.Ally)}
                >
                  <span className="mr-1">🤝</span>ALLY
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="pixel-text text-xs text-green-400 mt-2">
          RESOURCES: {standardResources}
        </div>
      </div>
      
      {/* Bottom-Left - Encounter Log */}
      <div className="hud-panel absolute bottom-4 left-4 max-w-[250px] pointer-events-auto">
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
      
      {/* Bottom-Right - Resources */}
      <div className="hud-panel absolute bottom-4 right-4 max-w-[250px] pointer-events-auto">
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
          <Link href="/resources">
            <Button 
              variant="outline" 
              size="sm" 
              className="pixel-text text-xs h-6"
            >
              COLLECT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SpaceHUD; 