# Texas Hold'em Poker Online

A browser-based Texas Hold'em Poker game built with React, featuring single-player gameplay against 3 CPU opponents.

## Features

- **Single Player vs 3 CPU Opponents**: Play against intelligent AI opponents
- **Full Texas Hold'em Rules**: Complete implementation of poker rules including blinds, betting rounds, and hand rankings
- **Smart CPU AI**: CPU players make strategic decisions based on hand strength, position, and pot odds
- **Beautiful UI**: Clean, responsive design with poker table layout
- **Real-time Gameplay**: Smooth game flow with automatic phase transitions
- **Hand Evaluation**: Accurate poker hand rankings from Royal Flush to High Card

## Game Controls

- **Fold**: Discard your hand and forfeit the pot
- **Check**: Pass the action (only available when no bet is required)
- **Call**: Match the current bet
- **Bet**: Make the first bet in a round
- **Raise**: Increase the current bet (use slider to adjust amount)
- **All-In**: Bet all remaining chips

## How to Play

1. Click "Start Game" to begin
2. Players are dealt two hole cards
3. Blinds are automatically posted
4. Betting rounds:
   - **Pre-flop**: After receiving hole cards
   - **Flop**: After 3 community cards are dealt
   - **Turn**: After 4th community card
   - **River**: After 5th community card
5. Best 5-card hand wins the pot
6. Game continues until you run out of chips or want to quit

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages

This project uses GitHub Actions for automatic deployment. Simply push to the `main` branch and the site will be automatically deployed to GitHub Pages.

**Setup Instructions:**

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push your code to the `main` branch

The site will be automatically deployed to: `https://<username>.github.io/holdem-poker-online/`

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **JavaScript**: Game logic and AI

## Project Structure

```
src/
├── components/         # React components
│   ├── game/          # Game-specific components (Table, Player, Card, etc.)
│   └── ui/            # Reusable UI components (Modal, Button)
├── game-logic/        # Core game logic
│   ├── deck.js        # Card deck management
│   ├── handEvaluator.js  # Poker hand evaluation
│   ├── gameState.js   # Game state management
│   └── betting.js     # Betting logic
├── ai/                # CPU player AI
│   ├── cpuStrategy.js # Decision-making logic
│   └── handStrength.js # Hand strength evaluation
├── context/           # React context for state management
│   └── GameContext.jsx
└── utils/             # Constants and utilities
    └── constants.js
```

## Hand Rankings

1. **Royal Flush**: A-K-Q-J-10 of the same suit
2. **Straight Flush**: Five consecutive cards of the same suit
3. **Four of a Kind**: Four cards of the same rank
4. **Full House**: Three of a kind plus a pair
5. **Flush**: Five cards of the same suit
6. **Straight**: Five consecutive cards
7. **Three of a Kind**: Three cards of the same rank
8. **Two Pair**: Two different pairs
9. **One Pair**: Two cards of the same rank
10. **High Card**: Highest card wins

## Credits

Built with React, Vite, and Tailwind CSS.

## License

MIT
