const canvas = document.getElementById('flappyBird');
const context = canvas.getContext('2d');

canvas.width = 1320;
canvas.height = 600;

const birdImage = new Image();
birdImage.src = 'bird.png';

const bird = {
    x: 50,
    y: 150,
    width: 80,
    height: 80,
    gravity: 0.12,
    lift: -2,
    velocity: 0
};

const pipes = [];
let frame = 0;
let score = 0;
const gap = 280;
let gameOver = false;
let gameStarted = false;

const bgImage = new Image();
bgImage.src = 'background.png';

const pipeTopImage = new Image();
pipeTopImage.src = 'pipeTop.png';

const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipeBottom.png';

const nyanCatMusic = new Audio('nyan-cat.mp3');  // Load the Nyan Cat music
nyanCatMusic.loop = true;  // Set the music to loop
nyanCatMusic.volume = 0.1;  // Set the volume lower (10% of full volume)

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

const highScoreInput = document.createElement('input');
highScoreInput.type = 'text';
highScoreInput.placeholder = 'Enter your name';
highScoreInput.style.position = 'absolute';
highScoreInput.style.top = '40%';
highScoreInput.style.left = '50%';
highScoreInput.style.transform = 'translate(-50%, -50%)';
highScoreInput.style.display = 'none';
highScoreInput.style.padding = '10px';
highScoreInput.style.fontSize = '20px';
highScoreInput.style.border = '1px solid #ccc';
highScoreInput.style.borderRadius = '5px';
document.body.appendChild(highScoreInput);

const highScoreText = document.createElement('div');
highScoreText.style.position = 'absolute';
highScoreText.style.top = '35%';
highScoreText.style.left = '50%';
highScoreText.style.transform = 'translate(-50%, -50%)';
highScoreText.style.display = 'none';
highScoreText.style.fontSize = '20px';
highScoreText.style.color = 'white';
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
    nyanCatMusic.play();  // Start playing the music when the game starts
    startCountdown();
});

restartButton.addEventListener('click', () => {
    resetGame();
    restartButton.style.display = 'none';
    highScoreInput.style.display = 'none';
    highScoreText.style.display = 'none';
    nyanCatMusic.play();  // Restart the music on restart
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
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frame = 0;
    gameOver = false;
    gameStarted = false;
}

function drawScore() {
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 20);
}

function showGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText(`Game Over`, canvas.width / 2 - 70, canvas.height / 2 - 10);
    context.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);

    highScoreInput.style.display = 'block';
    restartButton.style.display = 'block';
    highScoreText.style.display = 'block';
    highScoreText.innerText = 'Enter your name and press Enter to save your score';
    displayHighScores(); // Ensure that high scores are displayed after the game over.
}

function saveHighScore() {
    const name = highScoreInput.value.trim();
    if (name) {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ name, score });
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(5); // Keep only top 5 scores
        localStorage.setItem('highScores', JSON.stringify(highScores));
        displayHighScores();
    }
}

function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScoreText.innerHTML = `<h3>High Scores</h3>`;
    highScores.forEach((score, index) => {
        highScoreText.innerHTML += `<p>${index + 1}. ${score.name} - ${score.score}</p>`;
    });
}

function endGame() {
    gameOver = true;
    nyanCatMusic.pause();  // Pause the music when the game ends
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

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameOver && gameStarted) {
        bird.velocity = bird.lift * 1.5;
    }
});

highScoreInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && highScoreInput.style.display !== 'none') {
        saveHighScore();
        highScoreInput.style.display = 'none';
    }
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
