const canvas = document.getElementById('flappyBird');
const context = canvas.getContext('2d');

canvas.width = 1320;
canvas.height = 500;

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

const bgImage = new Image();
bgImage.src = 'background.png';

const pipeTopImage = new Image();
pipeTopImage.src = 'pipeTop.png';

const pipeBottomImage = new Image();
pipeBottomImage.src = 'pipeBottom.png';

const restartButton = document.createElement('button');
restartButton.innerText = "Restart";
restartButton.style.position = 'absolute';
restartButton.style.top = '50%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.display = 'none';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '20px';
restartButton.style.cursor = 'pointer';
document.body.appendChild(restartButton);

const highScoreInput = document.createElement('input');
highScoreInput.type = 'text';
highScoreInput.placeholder = 'Enter your name';
highScoreInput.style.position = 'absolute';
highScoreInput.style.top = '40%';
highScoreInput.style.left = '50%';
highScoreInput.style.transform = 'translate(-50%, -50%)';
highScoreInput.style.display = 'none';
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

restartButton.addEventListener('click', () => {
    resetGame();
    restartButton.style.display = 'none';
    highScoreInput.style.display = 'none';
    highScoreText.style.display = 'none';
    gameOver = false;
    update();
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
    showGameOver();
}

function update() {
    if (gameOver) return;

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
    if (event.code === 'Space' && !gameOver) {
        bird.velocity = bird.lift * 1.5;
    }
});

highScoreInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && highScoreInput.style.display !== 'none') {
        saveHighScore();
        highScoreInput.style.display = 'none';
    }
});

birdImage.onload = update;
