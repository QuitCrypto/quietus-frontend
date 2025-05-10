"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useGameState } from "@/contexts/game-state";
import dynamic from "next/dynamic";
import { ConnectWallet } from "@/components/connect-wallet";

// Wrap the Navbar in a dynamic import to prevent SSR
const NavbarContent = () => {
  const { isConnected, address } = useAccount();
  const pathname = usePathname();
  const { gameProgress, playerStatus } = useGameState();
  
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">QUIETUS</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard" ? "text-primary" : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            
            {playerStatus?.registered && !playerStatus?.eliminated && (
              <>
                <Link 
                  href="/action" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/action" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Actions
                </Link>
                
                <Link 
                  href="/encounters" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/encounters" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Encounters
                </Link>
                
                <Link 
                  href="/alliances" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/alliances" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Alliances
                </Link>
                
                <Link 
                  href="/resources" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/resources" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Resources
                </Link>
              </>
            )}
            
            <Link 
              href="/cycles" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/cycles" ? "text-primary" : "text-foreground/60"
              }`}
            >
              Cycle Log
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {gameProgress && (
            <div className="hidden md:block">
              <span className="text-sm font-medium">
                Cycle: {gameProgress.currentCycle}/{gameProgress.totalCycles}
              </span>
            </div>
          )}
          
          <ConnectWallet />
          
          <button
            className="block md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden container py-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/dashboard" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium ${
                pathname === "/dashboard" ? "text-primary" : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            
            {playerStatus?.registered && !playerStatus?.eliminated && (
              <>
                <Link 
                  href="/action" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium ${
                    pathname === "/action" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Actions
                </Link>
                
                <Link 
                  href="/encounters" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium ${
                    pathname === "/encounters" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Encounters
                </Link>
                
                <Link 
                  href="/alliances" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium ${
                    pathname === "/alliances" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Alliances
                </Link>
                
                <Link 
                  href="/resources" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium ${
                    pathname === "/resources" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  Resources
                </Link>
              </>
            )}
            
            <Link 
              href="/cycles" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium ${
                pathname === "/cycles" ? "text-primary" : "text-foreground/60"
              }`}
            >
              Cycle Log
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

// Export a client-side only version of the navbar
export const Navbar = dynamic(() => Promise.resolve(NavbarContent), {
  ssr: false,
}); 