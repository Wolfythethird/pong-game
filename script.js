// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player paddle (left)
const playerPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    maxY: canvas.height - paddleHeight,
    minY: 0
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4,
    maxY: canvas.height - paddleHeight,
    minY: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    maxSpeed: 8
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayerPaddle() {
    // Mouse control
    const targetY = mouseY - playerPaddle.height / 2;
    playerPaddle.y = Math.max(playerPaddle.minY, Math.min(playerPaddle.maxY, targetY));

    // Arrow keys control (override or assist mouse)
    if (keys['ArrowUp']) {
        playerPaddle.y = Math.max(playerPaddle.minY, playerPaddle.y - playerPaddle.speed);
    }
    if (keys['ArrowDown']) {
        playerPaddle.y = Math.min(playerPaddle.maxY, playerPaddle.y + playerPaddle.speed);
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;

    // AI follows the ball with some lag for difficulty balance
    if (computerCenter < ballCenter - 35) {
        computerPaddle.y = Math.min(computerPaddle.maxY, computerPaddle.y + computerPaddle.speed);
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y = Math.max(computerPaddle.minY, computerPaddle.y - computerPaddle.speed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        
        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.size;
        
        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height;
        ball.dy = (hitPos - 0.5) * 8;
    }

    // Ball out of bounds (left side - computer scores)
    if (ball.x - ball.size < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }

    // Ball out of bounds (right side - player scores)
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }

    // Clamp ball speed
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    if (speed > ball.maxSpeed) {
        ball.dx = (ball.dx / speed) * ball.maxSpeed;
        ball.dy = (ball.dy / speed) * ball.maxSpeed;
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowColor = 'transparent';
}

function draw() {
    // Clear canvas with dark background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Main game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
