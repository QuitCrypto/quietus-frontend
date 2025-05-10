"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RulesPage() {
  const router = useRouter();

  return (
    <div className="container py-10">
      <h1 className="font-bold text-3xl mb-6">Game Rules</h1>
      
      <div className="grid gap-6 grid-cols-1">
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Game Overview</CardTitle>
            <CardDescription>
              A strategic blockchain game of survival and alliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              Quietus is a strategic blockchain game where players compete for resources, form alliances, and survive across multiple chains.
              The game progresses through timed cycles, with increasing stakes and changing mechanics as it approaches the endgame.
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Game Structure</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>The game consists of a fixed number of cycles, typically between 10-20.</li>
                  <li>Each cycle lasts for a predetermined duration, usually 24-48 hours.</li>
                  <li>Players submit one action per cycle: Attack, Avoid, or Ally.</li>
                  <li>Actions resolve at the end of each cycle based on player coordinates.</li>
                  <li>The game evolves through three stages: Early, Middle, and Final.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Player Actions</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <Card className="border border-action-attack/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-action-attack">Attack</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div>
                        Target other players at your coordinate to steal resources. Success chance depends on your attack bonus and the defender's defenses.
                      </div>
                      <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground">
                        <li>Base success chance: 50%</li>
                        <li>On success: Take ~20% of defender's resources</li>
                        <li>On failure: Lose ~10% of your resources</li>
                        <li>In final stage: Successful attacks eliminate players</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-action-avoid/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-action-avoid">Avoid</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div>
                        Attempt to evade encounters with other players. Gain passive resources each cycle regardless of outcome.
                      </div>
                      <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground">
                        <li>Base avoidance chance: 50%</li>
                        <li>Passive gain: +5 resources per cycle</li>
                        <li>On success: Evade the encounter completely</li>
                        <li>On failure: Attack proceeds as normal</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-action-ally/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-action-ally">Ally</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div>
                        Propose an alliance with players at your coordinate. Both players must choose Ally to form an alliance.
                      </div>
                      <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground">
                        <li>If both choose Ally: Alliance formed</li>
                        <li>Per ally: +5% attack, +3% defense bonus</li>
                        <li>Per ally: +2 resources per cycle</li>
                        <li>Allies cannot attack each other</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Resources</h3>
                <div className="mb-2 text-sm text-muted-foreground">
                  Resources determine your survival and final score. There are two types:
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 bg-muted/20 rounded-md">
                    <h4 className="font-medium mb-1">Standard Resources</h4>
                    <div className="text-sm text-muted-foreground">
                      The main resource that determines your success at the end of the game.
                      These are earned through avoiding, winning attacks, and alliance bonuses.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/20 rounded-md">
                    <h4 className="font-medium mb-1">Chain Resources</h4>
                    <div className="text-sm text-muted-foreground">
                      Special resources discovered at specific coordinates across different chains:
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-resource-eth mr-2"></span>
                        <span>ETH: Attack bonus</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-resource-base mr-2"></span>
                        <span>BASE: Defense bonus</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-resource-ape mr-2"></span>
                        <span>APE: Player scouting</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-resource-abstract mr-2"></span>
                        <span>ABSTRACT: Cross-chain travel</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Game Stages</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/20 rounded-md border-l-4 border-green-500">
                    <h4 className="font-medium text-green-500 mb-1">Early Stage (0-30% of cycles)</h4>
                    <div className="text-sm text-muted-foreground">
                      Focus on gathering resources and forming initial alliances.
                      Players cannot be eliminated during this stage.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/20 rounded-md border-l-4 border-yellow-500">
                    <h4 className="font-medium text-yellow-500 mb-1">Middle Stage (30-60% of cycles)</h4>
                    <div className="text-sm text-muted-foreground">
                      Cross-chain travel unlocks, enabling collection of special resources.
                      Strategy shifts to resource competition and alliance strengthening.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/20 rounded-md border-l-4 border-destructive">
                    <h4 className="font-medium text-destructive mb-1">Final Stage (60-100% of cycles)</h4>
                    <div className="text-sm text-muted-foreground">
                      Elimination phase begins. Losing an attack can result in permanent elimination.
                      Alliances become critical, but betrayal is common as players compete for the final prize pool.
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Winning the Game</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  The game ends after the final cycle completes. Survivors split the reward pool proportionally based on their final resource count.
                  70% of the entry fees go to survivors, and 30% to the game creator.
                </div>
                <div className="text-sm font-medium">
                  Strategies for success:
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>Form strategic alliances early</li>
                  <li>Collect chain-specific resources for bonuses</li>
                  <li>Know when to attack and when to avoid</li>
                  <li>Balance resource acquisition with player elimination in the final stage</li>
                  <li>Be careful who you trust in the late game</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>
          
          <Link href="/">
            <Button>
              Play Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 