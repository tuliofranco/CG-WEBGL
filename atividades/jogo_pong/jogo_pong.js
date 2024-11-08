// Seleciona o canvas e obtém o contexto 2D
const canvas = document.querySelector('#c');
const ctx = canvas.getContext('2d');

// Configura a resolução do canvas para 2000x1000 pixels reais
canvas.width = 2000;
canvas.height = 1000;

// Variáveis globais
let paddle1Y = canvas.height / 2 - 35;
let paddle2Y = canvas.height / 2 - 35;
let paddle1Height = 100;
let paddle2Height = 100;
const paddleWidth = 20;
let paddle1X = 0; // Posição inicial da raquete esquerda (Jogador 1)
let paddle2X = canvas.width - paddleWidth; // Posição inicial da raquete direita (Jogador 2)

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
const initialBallSpeedX = 2;
const initialBallSpeedY = 2;
let ballSpeedX = initialBallSpeedX;
let ballSpeedY = initialBallSpeedY;
const ballSize = 10;

// Variáveis do placar
let scorePlayer1 = 0;
let scorePlayer2 = 0;

// Velocidade inicial das raquetes e fator de aumento de velocidade
const initialPaddleMoveSpeed = 6;
let paddleMoveSpeed = initialPaddleMoveSpeed;
const paddleSpeedIncrease = 1;

// Variáveis para calcular o efeito de rotação
let paddle1SpeedX = 0;
let paddle1SpeedY = 0;
let paddle2SpeedX = 0;
let paddle2SpeedY = 0;
const spinFactor = 0.8;
const speedIncreaseFactor = 0.5;
const paddleImpactFactor = 0.5; // Novo fator para o impacto da raquete

// Controle de teclas
const keys = {};

// Variáveis de power-up
let activePowerUp = null;
const powerUpTypes = ["increasePaddle", "increaseBallSpeed", "shrinkOpponentPaddle"];
const powerUpDuration = 5000;

// Controle de teclas
document.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

// Função para redefinir a bola e as velocidades após um ponto
function resetBallAndSpeeds() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;

    // Reinicia as velocidades para os valores iniciais
    ballSpeedX = initialBallSpeedX * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = initialBallSpeedY * (Math.random() > 0.5 ? 1 : -1);
    paddleMoveSpeed = initialPaddleMoveSpeed;
    activePowerUp = null;
}

// Função para gerar um novo power-up em uma posição aleatória
function spawnPowerUp() {
    const x = Math.random() * (canvas.width - 200) + 100;
    const y = Math.random() * (canvas.height - 200) + 100;
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    activePowerUp = { x, y, type, active: true };
}

// Função para desenhar o power-up na tela
function drawPowerUp() {
    if (!activePowerUp) return;

    ctx.fillStyle = activePowerUp.type === "increasePaddle" ? "green" :
                    activePowerUp.type === "increaseBallSpeed" ? "red" : "blue";
    ctx.beginPath();
    ctx.arc(activePowerUp.x, activePowerUp.y, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Função para aplicar o efeito do power-up
function applyPowerUpEffect(type, player) {
    if (type === "increasePaddle") {
        if (player === "player1") {
            paddle1Height += 50;
            setTimeout(() => paddle1Height = 100, powerUpDuration);
        } else {
            paddle2Height += 50;
            setTimeout(() => paddle2Height = 100, powerUpDuration);
        }
    } else if (type === "increaseBallSpeed") {
        ballSpeedX *= 1.5;
        ballSpeedY *= 1.5;
        setTimeout(() => {
            ballSpeedX = initialBallSpeedX * (ballSpeedX > 0 ? 1 : -1);
            ballSpeedY = initialBallSpeedY * (ballSpeedY > 0 ? 1 : -1);
        }, powerUpDuration);
    } else if (type === "shrinkOpponentPaddle") {
        if (player === "player1") {
            paddle2Height = Math.max(50, paddle2Height - 50);
            setTimeout(() => paddle2Height = 100, powerUpDuration);
        } else {
            paddle1Height = Math.max(50, paddle1Height - 50);
            setTimeout(() => paddle1Height = 100, powerUpDuration);
        }
    }
    activePowerUp.active = false;
}

// Função para verificar colisão entre o paddle e o power-up
function checkPaddlePowerUpCollision() {
    if (!activePowerUp || !activePowerUp.active) return;

    const dist1X = activePowerUp.x - (paddle1X + paddleWidth / 2);
    const dist1Y = activePowerUp.y - (paddle1Y + paddle1Height / 2);
    const dist2X = activePowerUp.x - (paddle2X + paddleWidth / 2);
    const dist2Y = activePowerUp.y - (paddle2Y + paddle2Height / 2);

    const distance1 = Math.sqrt(dist1X * dist1X + dist1Y * dist1Y);
    const distance2 = Math.sqrt(dist2X * dist2X + dist2Y * dist2Y);

    if (distance1 < paddleWidth / 2 + 15) {
        applyPowerUpEffect(activePowerUp.type, "player1");
        activePowerUp = null;
    } else if (distance2 < paddleWidth / 2 + 15) {
        applyPowerUpEffect(activePowerUp.type, "player2");
        activePowerUp = null;
    }
}

// Função para aumentar a velocidade da bola a cada 5 segundos
function increaseBallSpeed() {
    ballSpeedX += (ballSpeedX > 0 ? speedIncreaseFactor : -speedIncreaseFactor);
    ballSpeedY += (ballSpeedY > 0 ? speedIncreaseFactor : -speedIncreaseFactor);
}

// Define o aumento da velocidade da bola e spawn de power-up
setInterval(increaseBallSpeed, 5000);
setInterval(spawnPowerUp, 10000);

let lastFrameTime = 0;
const FPS = 80;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= 1000 / FPS) {
        lastFrameTime = currentTime;

        // Salva as posições anteriores das raquetes
        let previousPaddle1X = paddle1X;
        let previousPaddle1Y = paddle1Y;
        let previousPaddle2X = paddle2X;
        let previousPaddle2Y = paddle2Y;

        // Controles dos paddles com limites de movimento no eixo X (metade da tela)
        if (keys['ArrowUp']) paddle2Y -= paddleMoveSpeed;
        if (keys['ArrowDown']) paddle2Y += paddleMoveSpeed;
        if (keys['ArrowLeft']) paddle2X = Math.max(canvas.width / 2, paddle2X - paddleMoveSpeed);
        if (keys['ArrowRight']) paddle2X = Math.min(canvas.width - paddleWidth, paddle2X + paddleMoveSpeed);

        if (keys['w'] || keys['W']) paddle1Y -= paddleMoveSpeed;
        if (keys['s'] || keys['S']) paddle1Y += paddleMoveSpeed;
        if (keys['a'] || keys['A']) paddle1X = Math.max(0, paddle1X - paddleMoveSpeed);
        if (keys['d'] || keys['D']) paddle1X = Math.min(canvas.width / 2 - paddleWidth, paddle1X + paddleMoveSpeed);

        // Limita as posições das raquetes dentro do canvas
        paddle1Y = Math.max(Math.min(paddle1Y, canvas.height - paddle1Height), 0);
        paddle2Y = Math.max(Math.min(paddle2Y, canvas.height - paddle2Height), 0);

        // Calcula as velocidades das raquetes
        paddle1SpeedX = paddle1X - previousPaddle1X;
        paddle1SpeedY = paddle1Y - previousPaddle1Y;
        paddle2SpeedX = paddle2X - previousPaddle2X;
        paddle2SpeedY = paddle2Y - previousPaddle2Y;

        // Atualização da posição da bola
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Colisões com as bordas superior e inferior
        if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
            ballSpeedY = -ballSpeedY;
        }

        // Verifica se a bola saiu dos limites para marcar ponto
        if (ballX + ballSize < 0) {
            scorePlayer2++;
            resetBallAndSpeeds();
        } else if (ballX - ballSize > canvas.width) {
            scorePlayer1++;
            resetBallAndSpeeds();
        }

        // Colisões com as raquetes
        if (ballX - ballSize < paddle1X + paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddle1Height) {
            ballX = paddle1X + paddleWidth + ballSize; // Corrige a posição para fora do paddle
            // Ajusta as velocidades da bola com base na velocidade da raquete
            ballSpeedX = -ballSpeedX + paddle1SpeedX * paddleImpactFactor;
            ballSpeedY += paddle1SpeedY * paddleImpactFactor;
        }
        if (ballX + ballSize > paddle2X && ballY > paddle2Y && ballY < paddle2Y + paddle2Height) {
            ballX = paddle2X - ballSize; // Corrige a posição para fora do paddle
            // Ajusta as velocidades da bola com base na velocidade da raquete
            ballSpeedX = -ballSpeedX + paddle2SpeedX * paddleImpactFactor;
            ballSpeedY += paddle2SpeedY * paddleImpactFactor;
        }

        checkPaddlePowerUpCollision();
        drawScene();
    }

    requestAnimationFrame(gameLoop);
}

function drawScene() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${scorePlayer1} - ${scorePlayer2}`, canvas.width / 2, 80);

    ctx.fillRect(paddle1X, paddle1Y, paddleWidth, paddle1Height);
    ctx.fillRect(paddle2X, paddle2Y, paddleWidth, paddle2Height);

    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();

    drawPowerUp();
}

requestAnimationFrame(gameLoop);
