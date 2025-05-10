"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/contexts/game-state";
import { useToast } from "@/hooks/use-toast";
import { gameContractConfig } from "@/lib/contract-config";
import { Input } from "@/components/ui/input";

export default function AlliancesPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { 
    playerStatus, 
    playerAllies,
    gameProgress
  } = useGameState();
  
  // State for betrayal target
  const [betrayalTarget, setBetrayalTarget] = useState<string>("");
  
  // Betray alliance contract call
  const { 
    write: betrayAlly, 
    data: betrayData,
    isLoading: isBetrayLoading,
    error: betrayError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "betray",
    args: [betrayalTarget],
  });

  // Wait for betrayal transaction
  const {
    isLoading: isWaitingForBetrayal,
  } = useWaitForTransaction({
    hash: betrayData?.hash,
    onSuccess: () => {
      toast({
        title: "Alliance Betrayed",
        description: "You have successfully dissolved your alliance",
      });
      setBetrayalTarget("");
    },
    onError: () => {
      toast({
        title: "Betrayal Failed",
        description: "There was an error dissolving the alliance",
        variant: "destructive",
      });
    },
  });
  
  // Handle betrayal errors
  useState(() => {
    if (betrayError) {
      toast({
        title: "Betrayal Error",
        description: betrayError.message,
        variant: "destructive",
      });
    }
  });
  
  // Redirect if not connected or not a registered player
  useState(() => {
    if (!isConnected) {
      router.push("/");
    } else if (playerStatus && !playerStatus.registered) {
      router.push("/dashboard");
    }
  });
  
  // Loading state
  const isLoading = isBetrayLoading || isWaitingForBetrayal;
  
  // Check if player is eliminated
  const isEliminated = playerStatus?.eliminated;
  
  // Check if game has ended
  const gameEnded = gameProgress?.ended;
  
  // Calculate alliance bonus values
  const attackBonus = playerAllies.length * 5; // 5% per ally
  const defenseBonus = playerAllies.length * 3; // 3% per ally
  const resourceBonus = playerAllies.length * 2; // 2 resources per cycle per ally
  
  // Truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Alliance Management</h1>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Alliance Status Card */}
        <div className="lg:col-span-1">
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Alliance Status</CardTitle>
              <CardDescription>
                Your current alliance benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Alliances:</span>
                <span className="font-medium">{playerAllies.length}</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Bonus Effects</h3>
                <div className="p-3 bg-muted/20 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Attack Bonus:</span>
                    <span className="font-medium text-action-attack">+{attackBonus}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Defense Bonus:</span>
                    <span className="font-medium text-action-avoid">+{defenseBonus}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resource Per Cycle:</span>
                    <span className="font-medium text-green-500">+{resourceBonus}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Alliance Rules</h3>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Alliances form when both players choose "Ally"</li>
                  <li>Allies cannot attack each other</li>
                  <li>Attack and defense bonuses scale with number of allies</li>
                  <li>Alliances can be dissolved through betrayal</li>
                  <li>Betrayal gives no resources but breaks the alliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Alliance List */}
        <div className="lg:col-span-2">
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Alliances</CardTitle>
              <CardDescription>
                Current active alliances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playerAllies.length > 0 ? (
                <div className="space-y-4">
                  {playerAllies.map((ally, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                      <div>
                        <p className="font-medium">{truncateAddress(ally)}</p>
                        <p className="text-xs text-muted-foreground">Active Alliance</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isLoading || isEliminated || gameEnded}
                        onClick={() => {
                          setBetrayalTarget(ally);
                          betrayAlly?.();
                        }}
                      >
                        {isLoading && betrayalTarget === ally ? "Dissolving..." : "Dissolve"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">You have no active alliances</p>
                  <p className="text-sm text-muted-foreground">
                    To form an alliance, both you and another player must choose the "Ally" action when at the same coordinate.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="text-sm text-muted-foreground">
                <p>To form a new alliance, select the "Ally" action in the Action Submission page.</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => router.push("/action")}
                disabled={isEliminated || gameEnded}
              >
                Go to Action Submission
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 