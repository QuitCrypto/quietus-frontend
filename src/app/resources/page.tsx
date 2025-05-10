"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/contexts/game-state";
import { useToast } from "@/hooks/use-toast";
import { gameContractConfig } from "@/lib/contract-config";

export default function ResourcesPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const { 
    playerStatus,
    playerResources,
    gameProgress,
    playerCoordinate,
  } = useGameState();
  
  // Collect resources contract call
  const { 
    write: collectResources, 
    data: collectData,
    isLoading: isCollectLoading,
    error: collectError
  } = useContractWrite({
    ...gameContractConfig,
    functionName: "collectResources",
  });
  
  // Wait for collection transaction
  const {
    isLoading: isWaitingForCollection,
  } = useWaitForTransaction({
    hash: collectData?.hash,
    onSuccess: () => {
      toast({
        title: "Resources Collected",
        description: "You have successfully collected resources from your location",
      });
    },
    onError: () => {
      toast({
        title: "Collection Failed",
        description: "There was an error collecting resources",
        variant: "destructive",
      });
    },
  });
  
  // Handle collection errors
  useState(() => {
    if (collectError) {
      toast({
        title: "Collection Error",
        description: collectError.message,
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
  const isLoading = isCollectLoading || isWaitingForCollection;
  
  // Check if player is eliminated
  const isEliminated = playerStatus?.eliminated;
  
  // Check if game has ended
  const gameEnded = gameProgress?.ended;
  
  // Check total resources
  const totalChainResources = playerResources 
    ? Number(playerResources.ethResources) + 
      Number(playerResources.baseResources) + 
      Number(playerResources.apeResources) + 
      Number(playerResources.abstractResources)
    : 0;

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Resource Management</h1>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Chain Resources Overview */}
        <div className="lg:col-span-1">
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Chain Resources</CardTitle>
              <CardDescription>
                Special resources collected from different chains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/20 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-resource-eth mr-2"></div>
                    <span className="text-sm font-medium">ETH Resources</span>
                  </div>
                  <span className="font-medium">{playerResources?.ethResources || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-resource-base mr-2"></div>
                    <span className="text-sm font-medium">BASE Resources</span>
                  </div>
                  <span className="font-medium">{playerResources?.baseResources || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-resource-ape mr-2"></div>
                    <span className="text-sm font-medium">APE Resources</span>
                  </div>
                  <span className="font-medium">{playerResources?.apeResources || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-resource-abstract mr-2"></div>
                    <span className="text-sm font-medium">ABSTRACT Resources</span>
                  </div>
                  <span className="font-medium">{playerResources?.abstractResources || 0}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-md">
                <span className="font-medium">Total Chain Resources:</span>
                <span className="font-medium text-green-500">{totalChainResources}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Chain resources are discovered at specific coordinates and provide special abilities when activated.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resource Collection */}
        <div className="lg:col-span-2">
          <Card className="bg-background/60 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Resource Collection</CardTitle>
              <CardDescription>
                Collect resources from your current location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Coordinate:</span>
                  <span className="font-medium">{playerCoordinate !== null ? playerCoordinate : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Standard Resources:</span>
                  <span className="font-medium">{playerStatus?.resources || 0}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You can collect resources from your current position. Standard resources are used for survival and
                determine your final score. Chain resources provide special abilities.
              </p>
              
              <div className="bg-primary/10 p-4 rounded-md text-sm">
                <p className="mb-2 font-medium">Resource Discovery Chance</p>
                <p className="text-muted-foreground">
                  Each time you collect resources, there's a 10% chance to discover a special chain resource
                  if one exists at your current coordinate.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                disabled={isLoading || isEliminated || gameEnded}
                onClick={() => collectResources?.()}
                className="w-full"
              >
                {isLoading ? "Collecting..." : "Collect Resources"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Resource Usage Guide */}
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Resource Usage Guide</CardTitle>
              <CardDescription>
                How to use different types of resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-muted/20 rounded-md">
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-resource-eth mr-2"></div>
                    ETH Resources
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Use ETH resources to boost your attack power temporarily. Each resource provides a +10% bonus to your next attack.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/20 rounded-md">
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-resource-base mr-2"></div>
                    BASE Resources
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    BASE resources provide defensive capabilities. Each resource adds +15% to your defense against the next attack.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/20 rounded-md">
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-resource-ape mr-2"></div>
                    APE Resources
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    APE resources allow you to see other players' coordinates for one cycle. Reveals up to 3 players per resource.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/20 rounded-md">
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-resource-abstract mr-2"></div>
                    ABSTRACT Resources
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ABSTRACT resources enable cross-chain travel. Required to move between chains and access other resource types.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 