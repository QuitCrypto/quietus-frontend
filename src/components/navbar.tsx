"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useGameState } from "@/contexts/game-state";
import dynamic from "next/dynamic";
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
          
          <ConnectButton />
          
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isMenuOpen ? "hidden" : "block"}>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isMenuOpen ? "block" : "hidden"}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
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