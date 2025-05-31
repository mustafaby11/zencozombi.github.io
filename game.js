document.addEventListener('DOMContentLoaded', () => {
  let userAgent = navigator.userAgent.toLowerCase();
  
  // Android ve iOS tespiti
  if (/android/i.test(userAgent) || /iphone|ipod|ipad/i.test(userAgent)) {
    // Mobil cihazlarda uyarı mesajını göster
    document.getElementById('alertMessage').classList.remove('hidden');
    return;  // Oyun çalışmasın
  }

  let score = 0;
  let player = document.getElementById('player');
  let scoreElement = document.getElementById('score');
  let gameOverMessage = document.getElementById('gameOverMessage');
  let finalScore = document.getElementById('finalScore');
  let restartButton = document.getElementById('restartButton');

  let playerSpeed = 10;
  let bulletSpeed = 5;
  let zombieSpeed = 2;
  let bullets = [];
  let zombies = [];
  let gameRunning = true;

  // Ses dosyasını çal ve döngüye al
  function playSound() {
    let sound = document.getElementById('gameSound');
    if (sound.paused) {
      sound.play();  // Sesi çal
    }
    sound.loop = true;  // Döngüye al
  }

  document.getElementById('soundToggle').addEventListener('click', () => {
    let sound = document.getElementById('gameSound');
    if (sound.paused) {
      sound.play();
      sound.loop = true;
      document.getElementById('soundToggle').textContent = "🔊"; // Ses açıldı
    } else {
      sound.pause();
      document.getElementById('soundToggle').textContent = "🔇"; // Ses kapalı
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Sağ ok tuşu ile sağa hareket et
    if (e.key === 'ArrowRight') {
      let left = parseInt(window.getComputedStyle(player).left);
      if (left < gameArea.offsetWidth - player.offsetWidth) {
        player.style.left = left + playerSpeed + 'px';
      }
    }

    // Sol ok tuşu ile sola hareket et
    if (e.key === 'ArrowLeft') {
      let left = parseInt(window.getComputedStyle(player).left);
      if (left > 0) {
        player.style.left = left - playerSpeed + 'px';
      }
    }

    // Boşluk tuşu ile mermi fırlat
    if (e.key === ' ') {
      shootBullet();
      playSound();  // Ses çal
    }
  });

  restartButton.addEventListener('click', () => {
    // Oyunu sıfırla
    score = 0;
    gameRunning = true;
    scoreElement.textContent = `Puan: ${score}`;
    gameOverMessage.classList.add('hidden');
    restartButton.classList.add('hidden');
    
    // Müziği yeniden başlat
    let sound = document.getElementById('gameSound');
    sound.currentTime = 0;
    sound.play();
    sound.loop = true;
  });

  function createZombie() {
    if (!gameRunning) return;

    let zombie = document.createElement('div');
    zombie.classList.add('zombie');
    zombie.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
    zombie.style.top = '-30px';
    gameArea.appendChild(zombie);
    zombies.push(zombie);
  }

  function moveZombies() {
    if (!gameRunning) return;

    zombies.forEach(zombie => {
      let top = parseInt(window.getComputedStyle(zombie).top);
      if (top < gameArea.offsetHeight) {
        zombie.style.top = top + zombieSpeed + 'px';
        checkCollision(zombie);
      } else {
        gameArea.removeChild(zombie);
        zombies.splice(zombies.indexOf(zombie), 1);
        score -= 5;  // 5 puan kaybet
        scoreElement.textContent = `Puan: ${score}`;
        if (score < 0) {
          endGame(); // Puan negatif olursa oyun bitsin
        }
      }
    });
  }

  function shootBullet() {
    let bullet = document.createElement('div');
    bullet.classList.add('bullet');
    let playerLeft = parseInt(window.getComputedStyle(player).left);
    bullet.style.left = playerLeft + player.offsetWidth / 2 - 2.5 + 'px'; // Meriği oyuncuya göre ortala
    bullet.style.bottom = '70px';
    gameArea.appendChild(bullet);
    bullets.push(bullet);
  }

  function moveBullets() {
    if (!gameRunning) return;

    bullets.forEach(bullet => {
      let bottom = parseInt(window.getComputedStyle(bullet).bottom);
      if (bottom < gameArea.offsetHeight) {
        bullet.style.bottom = bottom + bulletSpeed + 'px';
        checkBulletCollision(bullet);
      } else {
        gameArea.removeChild(bullet);
        bullets.splice(bullets.indexOf(bullet), 1);
      }
    });
  }

  function checkCollision(zombie) {
    let playerRect = player.getBoundingClientRect();
    let zombieRect = zombie.getBoundingClientRect();
    if (
      zombieRect.left < playerRect.right &&
      zombieRect.right > playerRect.left &&
      zombieRect.top < playerRect.bottom &&
      zombieRect.bottom > playerRect.top
    ) {
      endGame();
    }
  }

  function checkBulletCollision(bullet) {
    zombies.forEach(zombie => {
      let zombieRect = zombie.getBoundingClientRect();
      let bulletRect = bullet.getBoundingClientRect();
      if (
        bulletRect.left < zombieRect.right &&
        bulletRect.right > zombieRect.left &&
        bulletRect.top < zombieRect.bottom &&
        bulletRect.bottom > zombieRect.top
      ) {
        gameArea.removeChild(zombie);
        gameArea.removeChild(bullet);
        zombies.splice(zombies.indexOf(zombie), 1);
        bullets.splice(bullets.indexOf(bullet), 1);
        score += 10;
        scoreElement.textContent = `Puan: ${score}`;
      }
    });
  }

  function endGame() {
    gameRunning = false;
    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    
    // Müziği durdur
    let sound = document.getElementById('gameSound');
    sound.pause();
    sound.currentTime = 0;
    
    // Tüm zombileri ve mermileri temizle
    zombies.forEach(zombie => {
      gameArea.removeChild(zombie);
    });
    bullets.forEach(bullet => {
      gameArea.removeChild(bullet);
    });
    zombies = [];
    bullets = [];
  }

  setInterval(createZombie, 2000); // Zombi her 2 saniyede bir yaratılır
  setInterval(moveZombies, 20); // Zombiler her 20ms'ye hareket eder
  setInterval(moveBullets, 10); // Mermiler her 10ms'ye hareket eder
});
