import { Address } from "viem";

// ABI for the GameInstance contract (contains the functions we need)
import gameAbi from "./abi.json";

// Define ethereum interface without extending Window
interface EthereumProvider {
  chainId: string;
  selectedAddress: string;
  isMetaMask?: boolean;
  [key: string]: any;
}

// Contract addresses per chain
const   contractAddresses: Record<number, Address> = {
  // Production chains - using null address as placeholders until deployment
  1: "0x0000000000000000000000000000000000000000", // Ethereum Mainnet
  8453: "0x0000000000000000000000000000000000000000", // Base
  42161: "0x0000000000000000000000000000000000000000", // Arbitrum
  2741: "0x0000000000000000000000000000000000000000", // Abstract
  
  // Local development (Anvil fork)
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local address
};

// Get the active chain ID safely with a fallback
export const getActiveChainId = (): number => {
  // Default to Anvil for local development
  try {
    // In a browser environment, check for ethereum provider
    if (typeof window !== 'undefined' && window.ethereum) {
      // Use type assertion instead of global declaration
      const provider = window.ethereum as EthereumProvider;
      const chainIdHex = provider.chainId;
      
      if (chainIdHex && typeof chainIdHex === 'string') {
        const chainId = parseInt(chainIdHex, 16);
        console.log("Detected chain ID:", chainId);
        return contractAddresses[chainId] ? chainId : 31337;
      }
    }
  } catch (error) {
    console.error("Error getting chain ID:", error);
  }
  
  console.log("Using default chain ID: 31337 (Anvil)");
  return 31337; // Default to Anvil
};

// Create and export contract configuration for registerPlayer function
export const gameContractConfig = {
  address: contractAddresses[getActiveChainId()] as Address,
  abi: gameAbi,
}; 