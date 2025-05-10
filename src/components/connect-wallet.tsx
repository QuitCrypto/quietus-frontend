"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";

export function ConnectWallet() {
  const { connectors, connect, error, isLoading } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset connection error when connectors are shown/hidden
  useEffect(() => {
    setConnectionError(null);
  }, [showConnectors]);

  // Handle connect error
  useEffect(() => {
    if (error) {
      console.error("Wallet connection error:", error);
      setConnectionError(error.message);
    }
  }, [error]);

  // Format address display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {!isConnected ? (
        <Button 
          onClick={() => setShowConnectors(!showConnectors)}
          variant="outline"
          size="sm"
          className="px-4"
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium hidden md:inline-block">
            {formatAddress(address || "")}
          </span>
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            size="sm"
          >
            Disconnect
          </Button>
        </div>
      )}

      {/* Simple dropdown for wallet connections instead of dialog */}
      {showConnectors && !isConnected && (
        <div className="absolute top-16 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 w-[300px]">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">Connect Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to play Quietus
            </p>
          </div>
          
          <div className="grid gap-4 py-2">
            {connectors.map((connector) => (
              <Card key={connector.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent 
                  className="p-4 flex items-center justify-between"
                  onClick={() => {
                    try {
                      connect({ connector });
                      console.log(`Connecting with ${connector.name}...`);
                      setShowConnectors(false);
                    } catch (err) {
                      console.error("Error connecting wallet:", err);
                      setConnectionError(err instanceof Error ? err.message : "Unknown connection error");
                    }
                  }}
                >
                  <div>
                    <div className="font-medium">
                      {connector.name === "MetaMask" && "🦊 "}
                      {connector.name === "Coinbase Wallet" && "📱 "}
                      {connector.name === "WalletConnect" && "🔗 "}
                      {connector.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {connector.name === "MetaMask" && "Connect using the MetaMask browser extension"}
                      {connector.name === "Coinbase Wallet" && "Connect using Coinbase Wallet app"}
                      {connector.name === "WalletConnect" && "Connect using your mobile wallet app"}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={!connector.ready || isLoading}
                  >
                    {isLoading && connector.id === connectors.find(c => c.id === connector.id)?.id
                      ? "Connecting..."
                      : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Show more detailed error message */}
          {(error || connectionError) && (
            <div className="text-destructive text-sm p-3 bg-destructive/10 rounded border border-destructive/30 mt-2">
              <p className="font-medium mb-1">Connection Error:</p>
              <p>{error?.message || connectionError}</p>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => setShowConnectors(false)}
          >
            Close
          </Button>
        </div>
      )}
    </>
  );
} 