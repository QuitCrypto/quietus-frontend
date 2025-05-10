"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState, ActionType } from "@/contexts/game-state";
import { useToast } from "@/hooks/use-toast";
import { gameContractConfig } from "@/lib/contract-config";
import Link from "next/link";

export default function ActionSubmission() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const {
    playerStatus,
    gameProgress,
    currentCycle,
    isActionSubmitted,
    selectedAction,
    setSelectedAction,
  } = useGameState();
  
  // Submit action contract call
  const { 
    write: submitAction, 
    data: submitData,
    isLoading: isSubmitLoading,
    error: submitError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "submitAction",
    args: [selectedAction],
  });
  
  // Wait for action submission transaction
  const {
    isLoading: isWaitingForSubmission,
  } = useWaitForTransaction({
    hash: submitData?.hash,
    onSuccess: () => {
      toast({
        title: "Action Submitted",
        description: `Your ${getActionName(selectedAction)} action has been recorded for the next cycle.`,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your action.",
        variant: "destructive",
      });
    },
  });
  
  // Handle submission errors
  useEffect(() => {
    if (submitError) {
      toast({
        title: "Submission Error",
        description: submitError.message,
        variant: "destructive",
      });
    }
  }, [submitError, toast]);
  
  // Redirect if not connected or not a registered player
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    } else if (playerStatus && !playerStatus.registered) {
      router.push("/dashboard");
    }
  }, [isConnected, playerStatus, router]);
  
  // Helper function to get action name
  const getActionName = (action: ActionType) => {
    switch (action) {
      case ActionType.Attack:
        return "Attack";
      case ActionType.Avoid:
        return "Avoid";
      case ActionType.Ally:
        return "Ally";
      default:
        return "None";
    }
  };
  
  // Submission loading state
  const isSubmitting = isSubmitLoading || isWaitingForSubmission;
  
  // Check if player is eliminated
  const isEliminated = playerStatus?.eliminated;
  
  // Check if game has ended
  const gameEnded = gameProgress?.ended;
  
  if (isEliminated || gameEnded) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{gameEnded ? "Game Ended" : "Player Eliminated"}</CardTitle>
            <CardDescription>
              {gameEnded 
                ? "The game has concluded" 
                : "You can no longer submit actions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {gameEnded 
                ? "Check the dashboard to see final results and any rewards distribution."
                : "You have been eliminated from the game but can still view encounters and game progress."}
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isConnected || !playerStatus) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Action Submission</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Action</CardTitle>
          <CardDescription>
            Choose one action to submit for cycle {currentCycle + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card 
              className={`border cursor-pointer transition-all ${selectedAction === ActionType.Attack ? "border-action-attack bg-action-attack/10" : "border-muted hover:border-action-attack/50"}`}
              onClick={() => setSelectedAction(ActionType.Attack)}
            >
              <CardHeader>
                <CardTitle className={`${selectedAction === ActionType.Attack ? "text-action-attack" : ""}`}>
                  Attack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Target other players to gain resources
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`border cursor-pointer transition-all ${selectedAction === ActionType.Avoid ? "border-action-avoid bg-action-avoid/10" : "border-muted hover:border-action-avoid/50"}`}
              onClick={() => setSelectedAction(ActionType.Avoid)}
            >
              <CardHeader>
                <CardTitle className={`${selectedAction === ActionType.Avoid ? "text-action-avoid" : ""}`}>
                  Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Evade attacks and gather resources safely
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className={`border cursor-pointer transition-all ${selectedAction === ActionType.Ally ? "border-action-ally bg-action-ally/10" : "border-muted hover:border-action-ally/50"}`}
              onClick={() => setSelectedAction(ActionType.Ally)}
            >
              <CardHeader>
                <CardTitle className={`${selectedAction === ActionType.Ally ? "text-action-ally" : ""}`}>
                  Ally
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Propose alliances with other players
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm">
            {isActionSubmitted && (
              <span className="text-green-500">✓ Action already submitted for next cycle</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button 
              disabled={selectedAction === ActionType.None || isSubmitting || isActionSubmitted}
              onClick={() => submitAction?.()}
            >
              {isSubmitting 
                ? "Submitting..." 
                : "Submit Action"
              }
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 