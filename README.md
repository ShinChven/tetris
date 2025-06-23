# Tetris Game

A modern, web-based Tetris game with special power-ups and features.

## Features

- **Classic Tetris gameplay** with all 7 standard pieces (I, O, T, S, Z, J, L)
- **Special power-ups**:
  - **Bombs**: Clear a 4x4 area around current piece (earned by clearing 2+ lines at once)
  - **Nukes**: Clear entire board (earned by clearing 4 lines at once - Tetris!)
- **Scoring system** with cores (lines cleared) tracking
- **Progressive difficulty** - speed increases every 10 lines cleared
- **Save/Load game** functionality with localStorage
- **Leaderboard** - tracks top 10 scores locally
- **Next piece preview**
- **Responsive design** with dark theme

## How to Play

1. Open `tetris.html` in your web browser
2. Click "Start" to begin
3. Use keyboard controls to play:
   - **Arrow Keys**: Move and rotate pieces
     - Left/Right: Move piece horizontally
     - Down: Move piece down faster
     - Up: Rotate piece clockwise
   - **Spacebar**: Hard drop (instantly drop piece to bottom)
   - **B**: Use bomb (if available)
   - **N**: Use nuke (if available)

## Game Controls

- **Start**: Begin a new game
- **Pause**: Pause/resume current game
- **Save**: Save current game state
- **Load**: Load previously saved game
- **Bomb**: Use bomb power-up to clear 4x4 area
- **Nuke**: Use nuke power-up to clear entire board

## Scoring

- **Base score**: 100 points per line cleared × current level
- **Bonus points**: 50 for bomb usage, 200 for nuke usage
- **Cores**: Total lines cleared throughout the game
- **Level progression**: Every 10 lines cleared increases level and speed

## Power-ups

- **Bombs**: Earned by clearing 2 or more lines simultaneously
- **Nukes**: Earned by clearing exactly 4 lines (Tetris)

## Files

- `tetris.html` - Main game file with HTML structure and styling
- `tetris.js` - Game logic and functionality
- `README.md` - This documentation file

## Requirements

- Modern web browser with JavaScript enabled
- No additional dependencies required

## Installation

1. Download both `tetris.html` and `tetris.js` files
2. Keep them in the same directory
3. Open `tetris.html` in your web browser
4. Enjoy playing!