import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { gameContractConfig } from "./contract-config";
import { ActionType, Encounter } from "@/contexts/game-state";

// Create a public client for fetching events
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

// Event types that represent encounters
const ENCOUNTER_EVENTS = [
  "AttackSuccess",
  "AttackFailed",
  "AvoidSuccess",
  "AvoidFailed",
  "AllianceFormed",
  "AllianceBetrayed"
];

// Map event names to encounter outcomes for display
const EVENT_TO_OUTCOME: Record<string, string> = {
  AttackSuccess: "AttackSuccess",
  AttackFailed: "AttackFailed",
  AvoidSuccess: "AvoidSuccess",
  AvoidFailed: "AvoidFailed",
  AllianceFormed: "AllianceFormed",
  AllianceBetrayed: "AllianceBetrayed"
};

// Resource change estimates based on event type
const EVENT_TO_RESOURCE_CHANGE: Record<string, string> = {
  AttackSuccess: "+15",
  AttackFailed: "-10",
  AvoidSuccess: "0", 
  AvoidFailed: "-15",
  AllianceFormed: "+5",
  AllianceBetrayed: "-20"
};

// Action mapping based on event type
const inferActionType = (eventName: string, isAttacker: boolean): ActionType => {
  if (eventName.startsWith("Attack")) {
    return isAttacker ? ActionType.Attack : ActionType.None;
  } else if (eventName.startsWith("Avoid")) {
    return isAttacker ? ActionType.Avoid : ActionType.Attack;
  } else if (eventName === "AllianceFormed") {
    return ActionType.Ally;
  } else if (eventName === "AllianceBetrayed") {
    return isAttacker ? ActionType.Attack : ActionType.Ally;
  }
  return ActionType.None;
};

/**
 * Fetch encounter events from the blockchain for a specific address
 */
export const fetchEncounterEvents = async (address: string): Promise<Encounter[]> => {
  try {
    // Don't proceed if no address
    if (!address) return [];
    
    const encounters: Encounter[] = [];
    
    // For each event type in the ABI that represents an encounter
    for (const abiItem of gameContractConfig.abi) {
      if (abiItem.type !== 'event' || !ENCOUNTER_EVENTS.includes(abiItem.name || '')) {
        continue;
      }
      
      try {
        // Get logs for this event
        const logs = await publicClient.getLogs({
          address: gameContractConfig.address,
          event: abiItem as any, // Type cast to satisfy TS
          fromBlock: BigInt(0),
          toBlock: 'latest',
        });
        
        for (const log of logs) {
          // Extract event name
          const eventName = abiItem.name;
          if (!eventName) continue;
          
          // Get the topics
          const topics = log.topics || [];
          
          // We expect at least 3 topics for most events (event signature + 2 indexed params)
          if (topics.length < 3) continue;
          
          // Extract the addresses from topics (simplified)
          // This assumes that indexed addresses are in the first two positions after the event signature
          const addr1 = '0x' + topics[1]?.slice(26);
          const addr2 = '0x' + topics[2]?.slice(26);
          
          // Skip if both addresses are not valid
          if (!addr1 || !addr2) continue;
          
          // Check if this player is involved in the event
          const addrLower = address.toLowerCase();
          const addr1Lower = addr1.toLowerCase();
          const addr2Lower = addr2.toLowerCase();
          
          if (addr1Lower !== addrLower && addr2Lower !== addrLower) {
            continue;
          }
          
          // Determine opponent address
          const opponent = addr1Lower === addrLower ? addr2 : addr1;
          
          // Use block number as a proxy for cycle
          const cycle = Number(log.blockNumber) % 100; // Simple mapping to keep cycles small
          
          // For simplicity, assume first address is the initiator
          const isInitiator = addr1Lower === addrLower;
          
          // Determine actions
          const playerAction = inferActionType(eventName, isInitiator);
          const opponentAction = inferActionType(eventName, !isInitiator);
          
          // Determine outcome
          const outcome = EVENT_TO_OUTCOME[eventName] || "Unknown";
          
          // Determine resource change
          const resourceChange = EVENT_TO_RESOURCE_CHANGE[eventName] || "0";
          
          // Adjust resource change based on player role
          const adjustedResourceChange = isInitiator ? 
            resourceChange : 
            resourceChange.startsWith("+") ? "-" + resourceChange.substring(1) : 
            resourceChange.startsWith("-") ? "+" + resourceChange.substring(1) : 
            resourceChange;
          
          // Add to encounters list
          encounters.push({
            cycle,
            opponent,
            playerAction,
            opponentAction,
            outcome,
            resourceChange: adjustedResourceChange
          });
        }
      } catch (error) {
        console.error(`Error fetching ${abiItem.name} events:`, error);
      }
    }
    
    // Sort by cycle
    return encounters.sort((a, b) => a.cycle - b.cycle);
  } catch (error) {
    console.error("Error fetching encounter events:", error);
    return [];
  }
}; 