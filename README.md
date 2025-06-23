# Tetris Game

**Start Playing:** [https://shinchven.github.io/tetris/](https://shinchven.github.io/tetris/)

A classic Tetris game with a modern twist, featuring special abilities and a persistent leaderboard.

## How to Play

-   **Start Game:** Click the "Start" button to begin.
-   **Move Piece:** Use the `ArrowLeft` and `ArrowRight` keys to move the falling piece horizontally.
-   **Rotate Piece:** Use the `ArrowUp` key to rotate the piece.
-   **Soft Drop:** Use the `ArrowDown` key to speed up the piece's descent.
-   **Hard Drop:** Press the `Space` bar to instantly drop the piece to the bottom.
-   **Pause/Resume:** Click the "Pause" button or press the `P` key to pause or resume the game.

## Features

### Special Abilities

Earn points to unlock powerful abilities:

-   **Bomb (50 points):** Press the `B` key or click the "Bomb" button to activate. The next piece will be a bomb that clears a 4x4 area upon landing.
-   **Tank (500 points):** Press the `T` key or click the "Tank" button. Control a tank at the top of the screen with the arrow keys and press `Space` to fire, clearing three columns of blocks.
-   **Nuke (1000 points):** Press the `N` key or click the "Nuke" button to clear the entire board instantly.

### Scoring & Resources

-   **Score:** Earn points by clearing lines. The higher the level, the more points you get per line.
-   **Cores:** Earn one "Core" for each line cleared. This is a secondary resource.

### Leaderboard

The game features a local leaderboard that saves the top 10 scores. Compete against yourself to get the highest score!

### Save/Load Game

You can save your game progress at any time by clicking the "Save" button and load it later with the "Load" button.

## Technical Details

-   **Frontend:** Built with HTML, CSS, and vanilla JavaScript.
-   **Graphics:** Rendered using the HTML5 Canvas API.
-   **State Management:** Game state, including the leaderboard and saved games, is stored in the browser's `localStorage`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
