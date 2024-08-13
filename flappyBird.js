const canvas = document.getElementById('flappyBird');
const context = canvas.getContext('2d');

// Set canvas size dynamically based on the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const birdImage = new Image();
birdImage.src = 'bird.png';

const bird = {
    x: canvas.width / 6, // Adjust bird position based on canvas size
    y: canvas.height / 2,
    width: 80,
    height: 80,
    gravity: 0.12,
    lift: -2.5,
    velocity: 0
};

const pipes = [];
let frame = 0;
let score = 0;
let gap = Math.min(canvas.height / 3, 280); // Adjust gap based on canvas height
let gameOver = false;
let gameStarted = false;

const bgImage = new Image();
bgImage.src = 'background.png';

const pipeTopImage = new Image();
pipeTopImage.src = 'pipeTop.png';

const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipeBottom.png';

const nyanCatMusic = new Audio('nyan-cat.mp3');
nyanCatMusic.loop = true;
nyanCatMusic.volume = 0.1;

const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const highScoreText = document.getElementById('highScoreText');
const countdownText = document.getElementById('countdownText');

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    nyanCatMusic.play().catch((error) => {
        console.log("Music playback failed: ", error);
    });
    startCountdown();
});

restartButton.addEventListener('click', () => {
    saveHighScore();
    resetGame();
    restartButton.style.display = 'none';
    highScoreText.style.display = 'none';
    startButton.style.display = 'block';
    startButton.innerText = 'Start Again';
});

function drawBird() {
    context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        context.drawImage(pipeTopImage, pipe.x, pipe.topHeight - pipeTopImage.height / 2, pipeTopImage.width / 2, pipeTopImage.height / 2);
        context.drawImage(pipeBottomImage, pipe.x, pipe.topHeight + gap, pipeBottomImage.width / 2, pipeBottomImage.height / 2);
        pipe.x -= 2;

        if (pipe.x + pipe.width <= 0) {
            pipes.shift();
            score++;
        }

        if (
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + gap) &&
            bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width
        ) {
            endGame();
        }
    });

    if (frame % 140 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height / 2)) + 50;
        pipes.push({ x: canvas.width, topHeight: pipeHeight, width: 26 });
    }
}

function drawBackground() {
    const bgWidth = canvas.width;
    const bgX = -(frame * 1.4 % bgWidth);
    context.drawImage(bgImage, bgX, 0, bgWidth, canvas.height);
    context.drawImage(bgImage, bgX + bgWidth, 0, bgWidth, canvas.height);
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frame = 0;
    gameOver = false;
    gameStarted = false;
}

function drawScore() {
    context.fillStyle = 'black';
    context.font = `${Math.min(canvas.width, canvas.height) / 20}px Arial`; // Adjust font size based on canvas size
    context.fillText(`Score: ${score}`, 10, 30);
}

function showGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);

    context.fillStyle = 'white';
    context.font = `${Math.min(canvas.width, canvas.height) / 15}px Arial`;
    context.textAlign = 'center';
    context.fillText(`Game Over`, canvas.width / 2, canvas.height / 2 - 40);
    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

    restartButton.style.display = 'block';
    highScoreText.style.display = 'block';
    displayHighScores();
}

function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ score: score, date: new Date().toLocaleString() });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5); // Keep only top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
    displayHighScores();
}

function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScoreText.innerHTML = `<h3>High Scores</h3>`;
    highScores.forEach((entry, index) => {
        highScoreText.innerHTML += `<p>${index + 1}. ${entry.score} - ${entry.date}</p>`;
    });
}

function endGame() {
    gameOver = true;
    nyanCatMusic.pause();
    // Draw the game over screen last to ensure it is in the foreground
    requestAnimationFrame(() => {
        drawGameOverScreen();
    });
}

function drawGameOverScreen() {
    // Clear the canvas before drawing the game over screen
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();

    showGameOver();
}

function update() {
    if (gameOver || !gameStarted) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        endGame();
        return;
    }

    frame++;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();

    requestAnimationFrame(update);
}

function flyBird() {
    if (!gameOver && gameStarted) {
        bird.velocity = bird.lift * 1.5;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        flyBird();
    }
});

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    flyBird();
});

function startCountdown() {
    let countdown = 3;
    countdownText.style.display = 'block';
    countdownText.innerText = countdown;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.innerText = countdown;
        } else {
            clearInterval(countdownInterval);
            countdownText.style.display = 'none';
            gameStarted = true;
            update();
        }
    }, 1000);
}

birdImage.onload = update;
