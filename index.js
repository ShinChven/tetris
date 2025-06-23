class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = 30;

        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.score = 0;
        this.cores = 0;
        this.level = 1;
        this.linesCleared = 0;

        this.isRunning = false;
        this.isPaused = false;
        this.isBombActive = false;
        this.isTankActive = false;
        this.targetColumns = [];
        this.gameLoop = null;

        this.currentPiece = null;
        this.nextPiece = null;
        this.isBombActive = false;
        this.isTankActive = false;
        this.tankPosition = 0;
        this.targetColumns = [];
        this.screenShake = 0;

        this.pieceTypes = [
            { // I piece
                shape: [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                color: '#00FFFF'
            },
            { // O piece
                shape: [
                    [0,0,0],
                    [0,1,1],
                    [0,1,1]
                ],
                color: '#FFFF00'
            },
            { // T piece
                shape: [
                    [0,1,0],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#800080'
            },
            { // S piece
                shape: [
                    [0,1,1],
                    [1,1,0],
                    [0,0,0]
                ],
                color: '#00FF00'
            },
            { // Z piece
                shape: [
                    [1,1,0],
                    [0,1,1],
                    [0,0,0]
                ],
                color: '#FF0000'
            },
            { // J piece
                shape: [
                    [1,0,0],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#0000FF'
            },
            { // L piece
                shape: [
                    [0,0,1],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#FFA500'
            }
        ];

        this.initializeControls();
        this.updateDisplay();
        this.loadLeaderboard();
    }

    initializeControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPaused) return;

            let needsRender = false;

            // Tank controls when active
            if (this.isTankActive) {
                switch(e.key) {
                    case 'ArrowLeft':
                        if (this.tankPosition > 0) {
                            this.tankPosition--;
                            this.updateTargetColumns();
                            needsRender = true;
                        }
                        break;
                    case 'ArrowRight':
                        if (this.tankPosition < this.COLS - 3) {
                            this.tankPosition++;
                            this.updateTargetColumns();
                            needsRender = true;
                        }
                        break;
                    case ' ':
                        this.fireTank();
                        needsRender = true;
                        break;
                }
            } else {
                // Normal game controls
                switch(e.key) {
                    case 'ArrowLeft':
                        if (this.movePiece(-1, 0)) needsRender = true;
                        break;
                    case 'ArrowRight':
                        if (this.movePiece(1, 0)) needsRender = true;
                        break;
                    case 'ArrowDown':
                        if (this.movePiece(0, 1)) needsRender = true;
                        break;
                    case 'ArrowUp':
                        if (this.rotatePiece()) needsRender = true;
                        break;
                    case ' ':
                        this.dropPiece();
                        needsRender = true;
                        break;
                    case 'b':
                    case 'B':
                        if (this.useBomb()) needsRender = true;
                        break;
                    case 'n':
                    case 'N':
                        if (this.useNuke()) needsRender = true;
                        break;
                    case 't':
                    case 'T':
                        if (this.useTank()) needsRender = true;
                        break;
                }
            }

            // Render immediately after input
            if (needsRender) {
                this.render();
            }

            e.preventDefault();
        });
    }

    createPiece() {
        const type = Math.floor(Math.random() * this.pieceTypes.length);
        const pieceType = this.pieceTypes[type];
        return {
            shape: pieceType.shape,
            color: pieceType.color,
            x: Math.floor(this.COLS / 2) - Math.floor(pieceType.shape[0].length / 2),
            y: 0
        };
    }

    start() {
        if (this.isRunning) return;

        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.score = 0;
        this.cores = 0;
        this.level = 1;
        this.linesCleared = 0;

        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();

        this.isRunning = true;
        this.isPaused = false;

        this.gameLoop = setInterval(() => {
            this.update();
        }, Math.max(100, 1000 - (this.level - 1) * 100));

        this.updateDisplay();
        this.render();
    }

    pause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => {
                this.update();
            }, Math.max(100, 1000 - (this.level - 1) * 100));
        }
        this.updateDisplay();
    }

    update() {
        if (!this.movePiece(0, 1)) {
            // If it's a bomb, detonate it
            if (this.isBombActive) {
                this.detonateBomb(this.currentPiece.x, this.currentPiece.y);
            } else {
                this.placePiece();
                this.clearLines();
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.createPiece();
            }

            if (this.checkGameOver()) {
                this.gameOver();
                return;
            }
        }
        this.render();
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        // For bomb pieces, only allow horizontal movement and downward movement
        if (this.isBombActive && dy < 0) {
            return false;
        }

        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        return false;
    }

    rotatePiece() {
        // Don't allow bomb rotation
        if (this.isBombActive) {
            return false;
        }

        const rotated = this.rotateShape(this.currentPiece.shape);
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
            return true;
        }
        return false;
    }

    rotateShape(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = shape[i][j];
            }
        }
        return rotated;
    }

    dropPiece() {
        while (this.movePiece(0, 1)) {}

        // If it's a bomb, detonate it
        if (this.isBombActive) {
            this.detonateBomb(this.currentPiece.x, this.currentPiece.y);
            return;
        }

        // After dropping, place the piece and handle line clearing
        this.placePiece();
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();

        if (this.checkGameOver()) {
            this.gameOver();
        }
    }

    isValidPosition(shape, x, y) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    const newX = x + j;
                    const newY = y + i;

                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return false;
                    }

                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece() {
        for (let i = 0; i < this.currentPiece.shape.length; i++) {
            for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
                if (this.currentPiece.shape[i][j]) {
                    const x = this.currentPiece.x + j;
                    const y = this.currentPiece.y + i;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let i = this.ROWS - 1; i >= 0; i--) {
            if (this.board[i].every(cell => cell !== 0)) {
                this.board.splice(i, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                i++; // Check the same row again
            }
        }

        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            this.cores += linesCleared;
            this.score += linesCleared * 100 * this.level;

            // Level up every 10 lines
            this.level = Math.floor(this.linesCleared / 10) + 1;

            this.updateDisplay();
        }
    }

    useBomb() {
        if (this.score < 50 || !this.isRunning || this.isPaused || this.isBombActive) return false;

        // Replace current piece with bomb
        this.currentPiece = {
            shape: [[1]],
            color: '#FF6B35',
            x: this.currentPiece ? this.currentPiece.x : Math.floor(this.COLS / 2),
            y: this.currentPiece ? this.currentPiece.y : 0
        };

        this.isBombActive = true;
        this.updateDisplay();
        return true;
    }

    useTank() {
        if (this.score < 500 || !this.isRunning || this.isPaused || this.isTankActive) return false;

        this.isTankActive = true;
        this.tankPosition = Math.floor(this.COLS / 2) - 1; // Center the tank targeting
        this.updateTargetColumns();

        this.updateDisplay();
        return true;
    }

    updateTargetColumns() {
        this.targetColumns = [
            this.tankPosition,
            this.tankPosition + 1,
            this.tankPosition + 2
        ];
    }

    fireTank() {
        if (!this.isTankActive) return;

        // Screen shake effect
        this.startScreenShake(10);

        // Clear the three targeted columns
        for (let col of this.targetColumns) {
            for (let row = 0; row < this.ROWS; row++) {
                this.board[row][col] = 0;
            }
        }

        this.score -= 500;
        this.isTankActive = false;
        this.targetColumns = [];
        this.updateDisplay();
    }

    startScreenShake(intensity) {
        this.screenShake = intensity;
        const shakeTimer = setInterval(() => {
            this.screenShake = Math.max(0, this.screenShake - 1);
            if (this.screenShake === 0) {
                clearInterval(shakeTimer);
            }
        }, 50);
    }

    detonateBomb(x, y) {
        // Screen shake effect
        this.startScreenShake(8);

        // Clear 4x4 area around bomb position
        for (let i = y - 2; i < y + 2; i++) {
            for (let j = x - 2; j < x + 2; j++) {
                if (i >= 0 && i < this.ROWS && j >= 0 && j < this.COLS) {
                    this.board[i][j] = 0;
                }
            }
        }

        this.score -= 50;
        this.isBombActive = false;

        // Get next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();

        if (this.checkGameOver()) {
            this.gameOver();
        }

        this.updateDisplay();
    }

    useNuke() {
        if (this.score < 1000 || !this.isRunning || this.isPaused) return false;

        // Clear entire board
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));

        this.score -= 1000;
        this.updateDisplay();
        return true;
    }

    checkGameOver() {
        return this.board[0].some(cell => cell !== 0);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);

        // Save score to leaderboard
        this.saveScore();

        alert(`Game Over! Final Score: ${this.score} | Cores: ${this.cores}`);
        this.updateDisplay();
    }

    saveScore() {
        const scores = this.getLeaderboard();
        scores.push({
            score: this.score,
            cores: this.cores,
            date: new Date().toLocaleDateString()
        });

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Keep only top 10
        const topScores = scores.slice(0, 10);

        localStorage.setItem('tetrisLeaderboard', JSON.stringify(topScores));
        this.loadLeaderboard();
    }

    getLeaderboard() {
        const saved = localStorage.getItem('tetrisLeaderboard');
        return saved ? JSON.parse(saved) : [];
    }

    loadLeaderboard() {
        const scores = this.getLeaderboard();
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';

        scores.forEach((score, index) => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = score.score;
            row.insertCell(2).textContent = score.cores;
        });
    }

    saveGame() {
        if (!this.isRunning) return;

        const gameState = {
            board: this.board,
            score: this.score,
            cores: this.cores,
            level: this.level,
            linesCleared: this.linesCleared,
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece
        };

        localStorage.setItem('tetrisSave', JSON.stringify(gameState));
        alert('Game saved!');
    }

    loadGame() {
        const saved = localStorage.getItem('tetrisSave');
        if (!saved) {
            alert('No saved game found!');
            return;
        }

        try {
            const gameState = JSON.parse(saved);

            this.board = gameState.board;
            this.score = gameState.score;
            this.cores = gameState.cores;
            this.level = gameState.level;
            this.linesCleared = gameState.linesCleared;
            this.currentPiece = gameState.currentPiece;
            this.nextPiece = gameState.nextPiece;

            this.isRunning = true;
            this.isPaused = false;

            this.gameLoop = setInterval(() => {
                this.update();
            }, Math.max(100, 1000 - (this.level - 1) * 100));

            this.updateDisplay();
            this.render();
            alert('Game loaded!');
        } catch (e) {
            alert('Failed to load game!');
        }
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('cores').textContent = `Cleared: ${this.cores}`;
        document.getElementById('bombBtn').textContent = `Bomb (${Math.floor(this.score / 50)}) -50`;
        document.getElementById('nukeBtn').textContent = `Nuke (${Math.floor(this.score / 1000)}) -1000`;
        document.getElementById('tankBtn').textContent = `Tank (${Math.floor(this.score / 500)}) -500`;

        // Update pause button text
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        }

        // Update button states
        document.getElementById('bombBtn').disabled = this.score < 50;
        document.getElementById('nukeBtn').disabled = this.score < 1000;
        document.getElementById('tankBtn').disabled = this.score < 500;
    }

    render() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw targeted columns (red highlighting)
        if (this.isTankActive && this.targetColumns.length > 0) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            for (let col of this.targetColumns) {
                this.ctx.fillRect(col * this.BLOCK_SIZE, 0, this.BLOCK_SIZE, this.canvas.height);
            }
        }

        // Draw board
        for (let i = 0; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLS; j++) {
                if (this.board[i][j]) {
                    this.ctx.fillStyle = this.board[i][j];
                    this.ctx.fillRect(j * this.BLOCK_SIZE, i * this.BLOCK_SIZE,
                                    this.BLOCK_SIZE - 1, this.BLOCK_SIZE - 1);
                }
            }
        }

        // Draw tank if active
        if (this.isTankActive) {
            this.ctx.fillStyle = '#FFD700'; // Gold color for tank
            const tankWidth = this.BLOCK_SIZE * 3;
            const tankHeight = this.BLOCK_SIZE / 2;
            const tankX = this.tankPosition * this.BLOCK_SIZE;
            const tankY = -tankHeight - 5; // Above the game board

            // Draw tank body
            this.ctx.fillRect(tankX, tankY, tankWidth, tankHeight);

            // Draw tank cannon pointing down
            this.ctx.fillRect(tankX + this.BLOCK_SIZE + this.BLOCK_SIZE/4, tankY + tankHeight,
                            this.BLOCK_SIZE/2, this.BLOCK_SIZE/2);
        }

        // Draw current piece (only if not tank active)
        if (this.currentPiece && !this.isTankActive) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let i = 0; i < this.currentPiece.shape.length; i++) {
                for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
                    if (this.currentPiece.shape[i][j]) {
                        const x = (this.currentPiece.x + j) * this.BLOCK_SIZE;
                        const y = (this.currentPiece.y + i) * this.BLOCK_SIZE;
                        this.ctx.fillRect(x, y, this.BLOCK_SIZE - 1, this.BLOCK_SIZE - 1);
                    }
                }
            }
        }

        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.BLOCK_SIZE);
            this.ctx.lineTo(this.COLS * this.BLOCK_SIZE, i * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let j = 0; j <= this.COLS; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(j * this.BLOCK_SIZE, this.ROWS * this.BLOCK_SIZE);
            this.ctx.stroke();
        }

        // Draw next piece
        this.renderNextPiece();

        // Restore canvas transform
        this.ctx.restore();
    }

    renderNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        if (this.nextPiece) {
            this.nextCtx.fillStyle = this.nextPiece.color;
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

            for (let i = 0; i < this.nextPiece.shape.length; i++) {
                for (let j = 0; j < this.nextPiece.shape[i].length; j++) {
                    if (this.nextPiece.shape[i][j]) {
                        this.nextCtx.fillRect(
                            offsetX + j * blockSize,
                            offsetY + i * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );
                    }
                }
            }
        }
    }
}

// Initialize game
const game = new TetrisGame();
