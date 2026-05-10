// PAGE ROUTER
function goToPage(pageName) {
    console.log('goToPage called with:', pageName);

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageName);
    console.log('Target page found:', targetPage);

    if (targetPage) {
        targetPage.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const navLink = document.getElementById('nav-' + pageName);
    if (navLink) {
        navLink.classList.add('active');
    }

    if (pageName === 'game') {
        showGameMenu();
    }
    window.scrollTo(0, 0);
}

// GAME SELECTION
const gameMenu = document.getElementById('gameMenu');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const memoryContainer = document.getElementById('memoryContainer');

function showGameMenu() {
    gameMenu.style.display = 'block';
    menu.style.display = 'none';
    gameContainer.style.display = 'none';
    memoryContainer.style.display = 'none';
}

function selectGame(gameName) {
    gameMenu.style.display = 'none';
    if (gameName === 'flappy') {
        menu.style.display = 'block';
        gameContainer.style.display = 'none';
        memoryContainer.style.display = 'none';
    } else if (gameName === 'memory') {
        menu.style.display = 'none';
        gameContainer.style.display = 'none';
        memoryContainer.style.display = 'block';
        setTimeout(() => initMemoryGame(), 100);
    }
}

// SPECIAL MESSAGES
const specialMessages = [
    "Seni seviyorum Anne! 💜",
    "Her gün bir hediye gibi senin yüzüne bakmak... 💌",
    "Anneler olmadan hiçbir şey eksik kalırdı. Teşekkürler! 💐",
    "Sen benim en güzel hatıram, en güzel hediyem... 💫",
    "Sevgin, hayatımın en önemli parçası. Teşekkürler! ❤️",
    "Bu dünyada senin gibi birisi var olduğu için şanslıyım. 💜",
    "Her skor, sana olan sevgimin bir göstergesi... 🌸"
];

// SOUND FUNCTIONS (Disabled)
function playSound(type) {
    // Sesler kapalı
}

function fireConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d946a6', '#ec4899', '#ffd700', '#ffed4e', '#ffd6e8']
    });
}

// Oyun Değişkenleri
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const finalScoreDisplay = document.getElementById('finalScore');
const recordBreakDisplay = document.getElementById('recordBreak');
const leaderboard = document.getElementById('leaderboard');
const specialMessageDiv = document.getElementById('specialMessage');
const messageText = document.getElementById('messageText');

// Canvas responsive ayarı
function resizeCanvas() {
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

// Oyun Başlat (Flappy Bird)
function startGame() {
    gameMenu.style.display = 'none';
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    memoryContainer.style.display = 'none';
    gameOverScreen.style.display = 'none';
    recordBreakDisplay.style.display = 'none';
    specialMessageDiv.style.display = 'none';

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
    // Gradient background for pipe
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, '#ff1493');
    gradient.addColorStop(0.5, '#ff69b4');
    gradient.addColorStop(1, '#ff1493');

    // Üst çiçek (gradient)
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapStart);

    // Alt çiçek (gradient)
    ctx.fillRect(pipe.x, pipe.gapEnd, pipe.width, canvas.height - pipe.gapEnd);

    // Border for top pipe
    ctx.strokeStyle = '#ff1493';
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapStart);

    // Border for bottom pipe
    ctx.strokeRect(pipe.x, pipe.gapEnd, pipe.width, canvas.height - pipe.gapEnd);

    // Dekoratif çiçekler - üst kısım
    ctx.fillStyle = '#ffc0cb';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(pipe.x + 5 + i * 15, pipe.gapStart - 15, 12, 12);
        ctx.fillRect(pipe.x + 5 + i * 15, pipe.gapStart - 3, 12, 3);
    }

    // Dekoratif çiçekler - alt kısım
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(pipe.x + 5 + i * 15, pipe.gapEnd + 3, 12, 12);
        ctx.fillRect(pipe.x + 5 + i * 15, pipe.gapEnd + 15, 12, 3);
    }

    // Inner glow effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(pipe.x + 2, pipe.gapStart - 5, pipe.width - 4, 5);
    ctx.fillRect(pipe.x + 2, pipe.gapEnd, pipe.width - 4, 5);
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
        fireConfetti();
        playSound('record');
    }

    // Özel mesaj göster
    const randomMessage = specialMessages[Math.floor(Math.random() * specialMessages.length)];
    messageText.textContent = randomMessage;
    specialMessageDiv.style.display = 'block';

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
    pipeGap = Math.max(110, basePipeGap - score / 25);
    pipeSpacing = Math.max(170, basePipeSpacing - score / 40);
    pipeSpeed = basePipeSpeed + (score / 50) * 1.2;

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
            playSound('score');
        }

        // Boru hızını ayarla
        pipe.x -= pipeSpeed;
    });

    // Oyuncu çiz
    drawPlayer();

    // Çarpışma kontrolü
    if (checkCollision()) {
        playSound('jump');
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
        playSound('jump');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        player.velocity = player.jump;
        playSound('jump');
    }
});

// Touch kontrol (mobil)
document.addEventListener('touchstart', () => {
    if (gameRunning) {
        player.velocity = player.jump;
        playSound('jump');
    }
});

// MEMORY GAME
let memoryCards = [];
let flipped = [];
let matched = 0;
let moves = 0;
let startTime = 0;
let gameTime = 0;

const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg',
                'photo5.jpg', 'photo6.jpg', 'photo7.jpg', 'photo8.jpg'];

function initMemoryGame() {
    memoryCards = [];
    flipped = [];
    matched = 0;
    moves = 0;
    startTime = Date.now();

    // Kartları oluştur (her foto 2 kez)
    const gamePhotos = [...photos, ...photos];
    gamePhotos.sort(() => Math.random() - 0.5);

    const board = document.getElementById('memoryBoard');
    board.innerHTML = '';

    gamePhotos.forEach((photo, index) => {
        const card = document.createElement('button');
        card.className = 'memory-card';
        card.dataset.photo = photo;
        card.dataset.index = index;

        const img = document.createElement('img');
        img.src = photo;
        card.appendChild(img);

        card.addEventListener('click', () => flipCard(card));
        board.appendChild(card);
        memoryCards.push(card);
    });

    document.getElementById('matches').textContent = '0';
    document.getElementById('moves').textContent = '0';
}

function flipCard(card) {
    if (flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;

        setTimeout(() => {
            if (flipped[0].dataset.photo === flipped[1].dataset.photo) {
                flipped[0].classList.add('matched');
                flipped[1].classList.add('matched');
                matched++;
                document.getElementById('matches').textContent = matched;

                if (matched === photos.length) {
                    endMemoryGame();
                }
            } else {
                flipped[0].classList.remove('flipped');
                flipped[1].classList.remove('flipped');
            }
            flipped = [];
        }, 600);
    }
}

function endMemoryGame() {
    gameTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = gameTime;
    document.getElementById('memoryGameOver').style.display = 'flex';
}

function restartMemory() {
    document.getElementById('memoryGameOver').style.display = 'none';
    initMemoryGame();
}

// Başlangıç - Home page'i göster
goToPage('home');
