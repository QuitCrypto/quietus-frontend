# Quietus Frontend

A modern frontend application for the Quietus blockchain strategy game, built with Next.js, TypeScript, and Tailwind CSS.

## Overview

Quietus is a strategic blockchain game where players compete for resources, form alliances, and survive across multiple chains. This frontend provides the interface for players to interact with the game's smart contracts, submit actions, view encounters, manage alliances, and track game progression.

## Features

- Wallet connection with wagmi/viem for Ethereum and L2 support
- Real-time game state tracking with contract data
- Action submission system for Attack, Avoid, and Ally choices
- Encounter history and resolution display
- Alliance management system
- Multi-chain resource collection and tracking
- Game cycle timeline visualization
- Mobile-responsive design with dark theme

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Custom UI components with Radix primitives
- **State Management**: React Context API
- **Blockchain Integration**: wagmi/viem, ethers.js
- **Authentication**: Wallet-based authentication

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── action/           # Action submission page
│   ├── alliances/        # Alliance management page  
│   ├── cycles/           # Game timeline page
│   ├── dashboard/        # Player dashboard
│   ├── encounters/       # Encounter history page
│   ├── resources/        # Resource management page
│   ├── rules/            # Game rules page
├── components/           # Reusable React components
│   ├── ui/               # Base UI components
│   ├── navbar.tsx        # Navigation component
├── contexts/             # React context providers
│   ├── game-state.tsx    # Game state context
├── hooks/                # Custom React hooks
│   ├── use-toast.tsx     # Toast notification hook
├── lib/                  # Utility functions and configs
│   ├── contract-config.ts # Contract ABI and addresses
│   ├── utils.ts          # Helper functions
├── styles/               # Global styles
│   ├── globals.css       # Global CSS and Tailwind imports
└── types/                # TypeScript type definitions
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/quietus-frontend.git
   cd quietus-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## Game Contracts

The frontend interacts with the Quietus game contracts, which are deployed on:

- Ethereum Mainnet (Chain ID: 1)
- Base (Chain ID: 8453)
- Arbitrum (Chain ID: 42161)
- Abstract (Chain ID: 2741)

Contract addresses are configured in `src/lib/contract-config.ts`.

## Gameplay Flow

1. **Register**: Connect wallet and pay entry fee to register
2. **Submit Actions**: Choose between Attack, Avoid, or Ally each cycle
3. **Resolve Encounters**: View outcomes of encounters with other players
4. **Manage Alliances**: Form and dissolve alliances with other players
5. **Collect Resources**: Gather standard and chain-specific resources
6. **Survive**: Last until the end of the game with the most resources

## Game Stages

The game progresses through three distinct stages:

1. **Early Stage (0-30% of cycles)**: Focus on resource gathering and initial alliances
2. **Middle Stage (30-60% of cycles)**: Cross-chain travel unlocks, enabling special resource collection
3. **Final Stage (60-100% of cycles)**: Elimination phase where losing an attack can remove you from the game

## License

MIT # quietus-frontend
