/* Game Constants */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

/* Game State */
let score = 0;
let highScore = localStorage.getItem('neonSnakeHighScore') || 0;
document.getElementById('high-score').innerText = highScore;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let speed = 100;
let gameInterval;
let isGameRunning = false;
let isPaused = false;

/* UI Elements */
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

/* Theme System */
const themes = ['neon', 'cyber', 'sunset', 'ocean', 'monochrome'];
let currentThemeIndex = 0;
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('snakeTheme');
if (savedTheme && themes.includes(savedTheme)) {
    body.className = `theme-${savedTheme}`;
    currentThemeIndex = themes.indexOf(savedTheme);
}

// Theme Toggle Button
document.getElementById('theme-btn').addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    body.className = `theme-${newTheme}`;
    localStorage.setItem('snakeTheme', newTheme);
});

// Theme Dots Functionality
document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-t');
        body.className = `theme-${theme}`;
        localStorage.setItem('snakeTheme', theme);
        currentThemeIndex = themes.indexOf(theme);
    });
});

/* Info Modal Logic */
const infoModal = document.getElementById('info-modal');
const infoBtn = document.getElementById('info-btn');
const closeModal = document.getElementById('close-modal');

infoBtn.addEventListener('click', () => {
    infoModal.classList.add('visible');
    isPaused = true;
});

closeModal.addEventListener('click', () => {
    infoModal.classList.remove('visible');
    if (isGameRunning) isPaused = false;
});

/* Game Logic */
function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1; // Start moving right
    dy = 0;
    score = 0;
    scoreEl.innerText = score;
    isGameRunning = true;
    isPaused = false;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
}

function gameLoop() {
    if (isPaused) return;

    // Move Snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check Wall Collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        spawnFood();
        // Speed up slightly
        if (speed > 50) speed -= 1;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get Theme Colors (Computed Style)
    const computedStyle = getComputedStyle(body);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const glowColor = computedStyle.getPropertyValue('--glow-color').trim();

    // Draw Food
    ctx.fillStyle = primaryColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2, 0, 2 * Math.PI
    );
    ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 0; // Reset shadow for body for performance/clarity or keep it
    snake.forEach((part, index) => {
        // Head glow
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = "#fff"; // White head core
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = primaryColor;
        }

        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    // Reset shadow
    ctx.shadowBlur = 0;
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Check if food spawns on snake
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            spawnFood();
            break;
        }
    }
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonSnakeHighScore', highScore);
        document.getElementById('high-score').innerText = highScore;
    }

    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

/* Input Handling */
document.addEventListener('keydown', (e) => {
    if (!isGameRunning && e.code === 'Space') {
        startGame();
        return;
    }

    changeDirection(e.key);
});

function changeDirection(key) {
    // Prevent reversing
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (key === 'ArrowLeft' && !goingRight) { dx = -1; dy = 0; }
    if (key === 'ArrowUp' && !goingDown) { dx = 0; dy = -1; }
    if (key === 'ArrowRight' && !goingLeft) { dx = 1; dy = 0; }
    if (key === 'ArrowDown' && !goingUp) { dx = 0; dy = 1; }
}

/* Touch / Mouse Control (D-Pad) */
document.querySelectorAll('.d-pad-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Stop zoom/scroll
        const dir = btn.getAttribute('data-dir');
        if (dir === 'left') changeDirection('ArrowLeft');
        if (dir === 'up') changeDirection('ArrowUp');
        if (dir === 'right') changeDirection('ArrowRight');
        if (dir === 'down') changeDirection('ArrowDown');
    });

    // Click support for testing on desktop
    btn.addEventListener('click', (e) => {
        const dir = btn.getAttribute('data-dir');
        if (dir === 'left') changeDirection('ArrowLeft');
        if (dir === 'up') changeDirection('ArrowUp');
        if (dir === 'right') changeDirection('ArrowRight');
        if (dir === 'down') changeDirection('ArrowDown');
    });
});

/* Event Listeners */
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Start game on first load click on canvas wrapper if needed?
// No, keep it specific to button for now.
