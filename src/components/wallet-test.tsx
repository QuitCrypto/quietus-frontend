"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useBalance } from 'wagmi';

export function WalletTest() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-semibold mb-2">Wallet Test Component</h2>
      <div className="space-y-2">
        <div>Connection Status: {isConnected ? "Connected" : "Disconnected"}</div>
        {address && <div>Address: {address}</div>}
        {chain && <div>Chain: {chain.name} (ID: {chain.id})</div>}
        {balance && <div>Balance: {balance.formatted} {balance.symbol}</div>}
        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

export default WalletTest; 