// Oyun Değişkenleri
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const menuScreen = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const finalScoreDisplay = document.getElementById('finalScore');
const recordBreakDisplay = document.getElementById('recordBreak');
const leaderboard = document.getElementById('leaderboard');

// Canvas responsive ayarı
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = 400;
    canvas.height = 600;
}
resizeCanvas();

// Oyun State
let gameRunning = false;
let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let isRecordBreak = false;

// Oyuncu
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    gravity: 0.25,
    velocity: 0,
    jump: -6,
    image: new Image()
};

// Resim yükleme
player.image.src = '8203d601-94e5-428c-bb74-a95c1f358ce5.jpg';

// Borular (Çiçekler)
let pipes = [];
let pipeGap = 180;
let pipeWidth = 80;
let pipeSpacing = 200;
let nextPipeX = 300;
let pipeSpeed = 4;
let basePipeGap = 180;
let basePipeSpacing = 200;
let basePipeSpeed = 4;

// En iyi skoru yükle
bestScoreDisplay.textContent = bestScore;

// Oyun Başlat
function startGame() {
    menuScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameOverScreen.style.display = 'none';
    recordBreakDisplay.style.display = 'none';

    gameRunning = true;
    score = 0;
    isRecordBreak = false;

    player.y = 300;
    player.velocity = 0;
    pipes = [];
    nextPipeX = 300;

    // Zorluk parametrelerini sıfırla
    pipeGap = basePipeGap;
    pipeSpacing = basePipeSpacing;
    pipeSpeed = basePipeSpeed;

    scoreDisplay.textContent = score;
    gameLoop();
}

// Çiçek (Boru) Oluştur
function createPipe() {
    const gapStart = Math.random() * (canvas.height - pipeGap - 100) + 50;

    pipes.push({
        x: nextPipeX,
        gapStart: gapStart,
        gapEnd: gapStart + pipeGap,
        width: pipeWidth,
        scored: false
    });

    nextPipeX += pipeSpacing;
}

// Çiçek Çiz
function drawPipe(pipe) {
    // Üst çiçek
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapStart);

    // Alt çiçek
    ctx.fillRect(pipe.x, pipe.gapEnd, pipe.width, canvas.height - pipe.gapEnd);

    // Dekoratif çiçekler
    ctx.fillStyle = '#ffc0cb';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(pipe.x + i * 25, pipe.gapStart - 10, 20, 10);
        ctx.fillRect(pipe.x + i * 25, pipe.gapEnd, 20, 10);
    }
}

// Oyuncu Çiz
function drawPlayer() {
    if (player.image.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        ctx.restore();

        // Çember çerçevesi
        ctx.strokeStyle = '#d946a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Resim yüklenene kadar basit şekil
        ctx.fillStyle = '#d946a6';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Çarpışma Kontrol
function checkCollision() {
    for (let pipe of pipes) {
        if (player.x + player.width > pipe.x && player.x < pipe.x + pipe.width) {
            if (player.y < pipe.gapStart || player.y + player.height > pipe.gapEnd) {
                return true;
            }
        }
    }

    // Ekran dışına çıkma
    if (player.y < 0 || player.y + player.height > canvas.height) {
        return true;
    }

    return false;
}

// Game Over
function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;

    if (score > bestScore) {
        bestScore = score;
        isRecordBreak = true;
        recordBreakDisplay.style.display = 'block';
        localStorage.setItem('bestScore', bestScore);
        bestScoreDisplay.textContent = bestScore;
        updateLeaderboard();
    }

    gameOverScreen.style.display = 'flex';
}

// Leaderboard Güncelle
function updateLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ score: score, date: new Date().toLocaleDateString('tr-TR') });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);
    localStorage.setItem('scores', JSON.stringify(scores));

    leaderboard.innerHTML = '';
    scores.forEach((s, i) => {
        const p = document.createElement('p');
        p.textContent = `${i + 1}. Skor: ${s.score} - ${s.date}`;
        leaderboard.appendChild(p);
    });
}

// Başlangıçta leaderboard'ı yükle
updateLeaderboard();

// Ana Oyun Loop
function gameLoop() {
    // Zorluk seviyeleri - Skor arttıkça daha zor
    pipeGap = Math.max(110, basePipeGap - score / 25); // Boşluk azalıyor (minimum 110)
    pipeSpacing = Math.max(170, basePipeSpacing - score / 40); // Çubuklar yakınlaşıyor (daha yavaş)
    pipeSpeed = basePipeSpeed + (score / 50) * 1.2; // Hız artıyor (daha yumuşak)

    // Arka plan
    ctx.fillStyle = '#fff5f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Oyuncu hareketi
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Çiçekleri hareket ettir
    pipes = pipes.filter(pipe => pipe.x > -pipeWidth);

    // Yeni çiçek oluştur - her zaman yeterli sayıda pipe olmasını sağla
    if (pipes.length < 8 || nextPipeX < canvas.width + 500) {
        createPipe();
    }

    // Çiçekleri çiz
    pipes.forEach(pipe => {
        drawPipe(pipe);

        // Skor artır
        if (!pipe.scored && pipe.x + pipe.width < player.x) {
            pipe.scored = true;
            score++;
            scoreDisplay.textContent = score;
        }

        // Boru hızını ayarla
        pipe.x -= pipeSpeed;
    });

    // Oyuncu çiz
    drawPlayer();

    // Çarpışma kontrolü
    if (checkCollision()) {
        endGame();
        return;
    }

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Kontroller
document.addEventListener('click', (e) => {
    if (gameRunning) {
        player.velocity = player.jump;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        player.velocity = player.jump;
    }
});

// Touch kontrol (mobil)
document.addEventListener('touchstart', () => {
    if (gameRunning) {
        player.velocity = player.jump;
    }
});
