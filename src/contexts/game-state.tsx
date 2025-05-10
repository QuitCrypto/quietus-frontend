"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { gameContractConfig } from "@/lib/contract-config";
import { formatEther } from "viem";
import { fetchEncounterEvents } from "@/lib/events";

// Define types for contract responses
type PlayerStatusResponse = readonly [boolean, boolean, bigint, bigint];
type PlayerResourcesResponse = readonly [bigint, bigint, bigint, bigint];
type GameProgressResponse = readonly [number, number, boolean, boolean, boolean];
type PlayerActionResponse = readonly [number, boolean];

// Define types for game state
export interface PlayerStatus {
  registered: boolean;
  eliminated: boolean;
  resources: string;
  numAllies: number;
}

export interface PlayerResources {
  ethResources: string;
  baseResources: string;
  apeResources: string;
  abstractResources: string;
}

export interface GameProgress {
  currentCycle: number;
  totalCycles: number;
  isMidGame: boolean;
  isLateGame: boolean;
  ended: boolean;
}

export enum ActionType {
  None = 0,
  Attack = 1,
  Avoid = 2,
  Ally = 3
}

export type Ally = {
  address: string;
  since: number; // cycle when alliance was formed
};

export type Encounter = {
  cycle: number;
  opponent: string;
  playerAction: ActionType;
  opponentAction: ActionType;
  outcome: string;
  resourceChange: string;
};

// Game state context type
interface GameStateContextType {
  // Player state
  playerStatus: PlayerStatus | null;
  playerResources: PlayerResources | null;
  playerAllies: string[];
  playerCoordinate: number | null;
  
  // Game state
  gameProgress: GameProgress | null;
  gameStarted: boolean;
  currentCycle: number;
  cycleDuration: number;
  gameStartTime: number;
  
  // Action state
  isActionSubmitted: boolean;
  selectedAction: ActionType;
  setSelectedAction: (action: ActionType) => void;
  
  // Encounters
  encounters: Encounter[];
  
  // Refetch functions
  refetchPlayerStatus: () => void;
  refetchGameProgress: () => void;
  refetchPlayerResources: () => void;
  
  // Loading states
  isPlayerStatusLoading: boolean;
  isGameProgressLoading: boolean;
  isPlayerResourcesLoading: boolean;
  
  // Encounters loading state
  isEncountersLoading: boolean;
  refetchEncounters: () => void;
}

// Default values
const defaultContext: GameStateContextType = {
  playerStatus: null,
  playerResources: null,
  playerAllies: [],
  playerCoordinate: null,
  
  gameProgress: null,
  gameStarted: false,
  currentCycle: 0,
  cycleDuration: 0,
  gameStartTime: 0,
  
  isActionSubmitted: false,
  selectedAction: ActionType.None,
  setSelectedAction: () => {},
  
  encounters: [],
  
  refetchPlayerStatus: () => {},
  refetchGameProgress: () => {},
  refetchPlayerResources: () => {},
  
  isPlayerStatusLoading: false,
  isGameProgressLoading: false,
  isPlayerResourcesLoading: false,
  
  isEncountersLoading: false,
  refetchEncounters: () => {},
};

// Create context
const GameStateContext = createContext<GameStateContextType>(defaultContext);

// Context provider component
export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  
  // State for selected action
  const [selectedAction, setSelectedAction] = useState<ActionType>(ActionType.None);
  
  // State for encounters
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [isEncountersLoading, setIsEncountersLoading] = useState<boolean>(false);
  
  // Player status from contract
  const { 
    data: playerStatusData,
    isLoading: isPlayerStatusLoading,
    refetch: refetchPlayerStatus
  } = useContractRead({
    ...gameContractConfig,
    functionName: "getPlayerStatus",
    args: [address || "0x0000000000000000000000000000000000000000"],
    enabled: isConnected && !!address,
  });
  
  // Player resources from contract
  const { 
    data: playerResourcesData,
    isLoading: isPlayerResourcesLoading,
    refetch: refetchPlayerResources
  } = useContractRead({
    ...gameContractConfig,
    functionName: "getPlayerResources",
    args: [address || "0x0000000000000000000000000000000000000000"],
    enabled: isConnected && !!address,
  });
  
  // Game progress from contract
  const {
    data: gameProgressData,
    isLoading: isGameProgressLoading,
    refetch: refetchGameProgress
  } = useContractRead({
    ...gameContractConfig,
    functionName: "getGameProgress",
    enabled: isConnected,
  });
  
  // Game started state
  const { data: gameStartedData } = useContractRead({
    ...gameContractConfig,
    functionName: "gameStarted",
  });
  
  // Current cycle
  const { data: currentCycleData } = useContractRead({
    ...gameContractConfig,
    functionName: "currentCycle",
  });
  
  // Cycle duration
  const { data: cycleDurationData } = useContractRead({
    ...gameContractConfig,
    functionName: "cycleDuration",
  });
  
  // Game start time
  const { data: gameStartTimeData } = useContractRead({
    ...gameContractConfig,
    functionName: "gameStartTime",
  });
  
  // Player coordinate
  const { data: playerCoordinateData } = useContractRead({
    ...gameContractConfig,
    functionName: "getPlayerCoordinate",
    args: [address || "0x0000000000000000000000000000000000000000"],
    enabled: isConnected && !!address,
  });
  
  // Player's allies
  const { data: playerAlliesData } = useContractRead({
    ...gameContractConfig,
    functionName: "getAlliesOfPlayer",
    args: [address || "0x0000000000000000000000000000000000000000"],
    enabled: isConnected && !!address,
  });
  
  // Check if action is submitted for next cycle
  const { data: playerActionData } = useContractRead({
    ...gameContractConfig,
    functionName: "playerActions",
    args: [
      (currentCycleData as number) + 1 || 1, 
      address || "0x0000000000000000000000000000000000000000"
    ],
    enabled: isConnected && !!address && currentCycleData !== undefined,
  });

  // Format player status data
  const playerStatus: PlayerStatus | null = React.useMemo(() => {
    if (!playerStatusData) return null;
    const data = playerStatusData as PlayerStatusResponse;
    return {
      registered: data[0],
      eliminated: data[1],
      resources: data[2] ? data[2].toString() : "0",
      numAllies: data[3] ? Number(data[3]) : 0,
    };
  }, [playerStatusData]);
  
  // Format player resources data
  const playerResources: PlayerResources | null = React.useMemo(() => {
    if (!playerResourcesData) return null;
    const data = playerResourcesData as PlayerResourcesResponse;
    return {
      ethResources: data[0] ? data[0].toString() : "0",
      baseResources: data[1] ? data[1].toString() : "0",
      apeResources: data[2] ? data[2].toString() : "0",
      abstractResources: data[3] ? data[3].toString() : "0",
    };
  }, [playerResourcesData]);
  
  // Format game progress data
  const gameProgress: GameProgress | null = React.useMemo(() => {
    if (!gameProgressData) return null;
    const data = gameProgressData as GameProgressResponse;
    return {
      currentCycle: Number(data[0]),
      totalCycles: Number(data[1]),
      isMidGame: data[2],
      isLateGame: data[3],
      ended: data[4],
    };
  }, [gameProgressData]);
  
  // Extract action submission status
  const isActionSubmitted = playerActionData ? (playerActionData as PlayerActionResponse)[1] : false;

  // Fetch real encounters from blockchain events
  const fetchEncounters = async () => {
    if (!address) return;
    
    setIsEncountersLoading(true);
    try {
      const fetchedEncounters = await fetchEncounterEvents(address);
      setEncounters(fetchedEncounters);
    } catch (error) {
      console.error("Failed to fetch encounters:", error);
    } finally {
      setIsEncountersLoading(false);
    }
  };
  
  // Fetch encounters when address or cycle changes
  useEffect(() => {
    if (address && gameProgress?.currentCycle) {
      fetchEncounters();
    }
  }, [address, gameProgress?.currentCycle]);

  // Create a context value with memoized data to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    playerStatus,
    playerResources,
    playerAllies: playerAlliesData as string[] || [],
    playerCoordinate: playerCoordinateData ? Number(playerCoordinateData) : null,
    
    gameProgress,
    gameStarted: gameStartedData as boolean || false,
    currentCycle: Number(currentCycleData) || 0,
    cycleDuration: Number(cycleDurationData) || 0,
    gameStartTime: Number(gameStartTimeData) || 0,
    
    isActionSubmitted,
    selectedAction,
    setSelectedAction,
    
    encounters,
    isEncountersLoading,
    refetchEncounters: fetchEncounters,
    
    refetchPlayerStatus,
    refetchGameProgress,
    refetchPlayerResources,
    
    isPlayerStatusLoading,
    isGameProgressLoading,
    isPlayerResourcesLoading,
  }), [
    playerStatus,
    playerResources,
    playerAlliesData,
    playerCoordinateData,
    gameProgress,
    gameStartedData,
    currentCycleData,
    cycleDurationData,
    gameStartTimeData,
    isActionSubmitted,
    selectedAction,
    encounters,
    isEncountersLoading,
    refetchPlayerStatus,
    refetchGameProgress,
    refetchPlayerResources,
    isPlayerStatusLoading,
    isGameProgressLoading,
    isPlayerResourcesLoading,
  ]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
}

// Custom hook for using the game state
export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
} 