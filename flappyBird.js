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
    lift: -2,
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

const startButton = document.createElement('button');
startButton.innerText = "Start Game";
startButton.style.position = 'absolute';
startButton.style.top = '50%';
startButton.style.left = '50%';
startButton.style.transform = 'translate(-50%, -50%)';
startButton.style.padding = '15px 30px';
startButton.style.fontSize = '24px';
startButton.style.cursor = 'pointer';
startButton.style.backgroundColor = '#4a4a4a';
startButton.style.color = 'white';
startButton.style.border = 'none';
startButton.style.borderRadius = '10px';
startButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
document.body.appendChild(startButton);

const restartButton = document.createElement('button');
restartButton.innerText = "Restart";
restartButton.style.position = 'absolute';
restartButton.style.top = '50%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.display = 'none';
restartButton.style.padding = '15px 30px';
restartButton.style.fontSize = '24px';
restartButton.style.cursor = 'pointer';
restartButton.style.backgroundColor = '#4a4a4a';
restartButton.style.color = 'white';
restartButton.style.border = 'none';
restartButton.style.borderRadius = '10px';
restartButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
document.body.appendChild(restartButton);

const highScoreText = document.createElement('div');
highScoreText.style.position = 'absolute';
highScoreText.style.top = '70%';
highScoreText.style.left = '50%';
highScoreText.style.transform = 'translate(-50%, -50%)';
highScoreText.style.display = 'none';
highScoreText.style.fontSize = '20px';
highScoreText.style.color = 'white';
highScoreText.style.textAlign = 'center';
document.body.appendChild(highScoreText);

let countdownText = document.createElement('div');
countdownText.style.position = 'absolute';
countdownText.style.top = '50%';
countdownText.style.left = '50%';
countdownText.style.transform = 'translate(-50%, -50%)';
countdownText.style.fontSize = '50px';
countdownText.style.color = 'white';
countdownText.style.display = 'none';
document.body.appendChild(countdownText);

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
    nyanCatMusic.play().catch((error) => {
        console.log("Music playback failed: ", error);
    });
    startCountdown();
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
    // Ensure pipes are not drawn over the game over screen
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
    drawPipes();
    drawScore();

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);

    context.fillStyle = 'white';
    context.font = `${Math.min(canvas.width, canvas.height) / 15}px Arial`;
    context.textAlign = 'center';
    context.fillText(`Game Over`, canvas.width / 2, canvas.height / 2 - 40);
    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

    restartButton.style.display = 'block';
    displayHighScores();
    highScoreText.style.display = 'block';
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
