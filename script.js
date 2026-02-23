document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('#game');
    const scoreElement = document.querySelector('#score');
    const finalScoreElement = document.querySelector('#final-score');
    const gameOverScreen = document.querySelector('#game-over');
    const startScreen = document.querySelector('#start-screen');
    const startButton = document.querySelector('#start');
    const restartButton = document.querySelector('#restart');
    
    let bird;
    let pipes = [];
    let gameSpeed = 3;
    let gravity = 0.5;
    let jumpForce = -10;
    let score = 0;
    let isGameOver = false;
    let gameLoop;
    let pipeGap = 200;
    let pipeFrequency = 1800;
    
    const birdImages = [
        './5897551102197483320.jpg', 
        './5897551102197483319.jpg', 
        './5897551102197483318.jpg'  
    ];
    
    function initGame() {
        bird = document.createElement('img');
                 gravity = game.offsetHeight * 0.0017;

        bird.id = 'bird';
        bird.src = birdImages[0];
        bird.style.top = '300px';
        gameContainer.appendChild(bird);
        
        score = 0;
        scoreElement.textContent = score;
        isGameOver = false;
        pipes.forEach(pipe => {
            if (pipe.top && pipe.top.parentNode) pipe.top.remove();
            if (pipe.bottom && pipe.bottom.parentNode) pipe.bottom.remove();
        });
        pipes = [];
        
        gameOverScreen.style.display = 'none';
        
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, 20);
        
        if (pipeInterval) clearInterval(pipeInterval);
        pipeInterval = setInterval(createPipe, pipeFrequency);
    }
    
    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        initGame();
    });
    
    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        initGame();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isGameOver) {
            jump();
        }
    });
    
    gameContainer.addEventListener('click', () => {
        if (!isGameOver && startScreen.style.display === 'none') {
            jump();
        }
    });
    
    function jump() {
        if (!bird.dataset.velocity) bird.dataset.velocity = '0';
        bird.dataset.velocity = jumpForce;
        
        bird.src = birdImages[2];
        
        setTimeout(() => {
            if (!isGameOver) {
                bird.src = birdImages[0];
            }
        }, 300);
    }
    
    let pipeInterval;
    function createPipe() {
        if (isGameOver) return;

        const pipeTopHeight = Math.floor(Math.random() * 200) + 50;
        const pipeBottomHeight = gameContainer.offsetHeight - pipeTopHeight - pipeGap;

        const pipeTop = document.createElement('div');
        pipeTop.className = 'pipe pipe-top';
        pipeTop.style.height = `${pipeTopHeight}px`;
        pipeTop.style.position = 'absolute';
        pipeTop.style.top = '0px';
        pipeTop.style.left = gameContainer.offsetWidth + 'px';
        pipeTop.style.width = '58px';
        pipeTop.style.border = '2px solid #000';
        pipeTop.style.borderBottom = 'none';
        pipeTop.style.borderRadius = '10px 10px 0 0';
        pipeTop.style.backgroundImage = 'url(R.png)'; 
        pipeTop.style.backgroundSize = '58px 100%';
        pipeTop.style.backgroundRepeat = 'no-repeat';
        pipeTop.style.backgroundPosition = 'bottom';

        const pipeBottom = document.createElement('div');
        pipeBottom.className = 'pipe pipe-bottom';
        pipeBottom.style.height = `${pipeBottomHeight}px`;
        pipeBottom.style.position = 'absolute';
        pipeBottom.style.bottom = '0';
        pipeBottom.style.left = gameContainer.offsetWidth + 'px';
        pipeBottom.style.width = '58px';
        pipeBottom.style.border = '2px solid #000';
        pipeBottom.style.borderTop = 'none';
        pipeBottom.style.borderRadius = '0 0 10px 10px';
        pipeBottom.style.backgroundImage = 'url(s.png)'; 
        pipeBottom.style.backgroundSize = '58px 100%';
        pipeBottom.style.backgroundRepeat = 'no-repeat';
        pipeBottom.style.backgroundPosition = 'top';

        gameContainer.appendChild(pipeTop);
        gameContainer.appendChild(pipeBottom);

        pipes.push({
            top: pipeTop,
            bottom: pipeBottom,
            passed: false
        });
    }

    function updateGame() {
        if (isGameOver) return;
        
        if (!bird.dataset.velocity) bird.dataset.velocity = '0';
        let velocity = parseFloat(bird.dataset.velocity);
        velocity += gravity;
        bird.dataset.velocity = velocity;
        
        const currentTop = parseFloat(bird.style.top || 250);
        const newTop = currentTop + velocity;
        bird.style.top = newTop + 'px';
        
        bird.style.transform = `rotate(${Math.min(Math.max(velocity * 3, -30), 90)}deg)`;
        
        if (newTop <= 0 || newTop + bird.offsetHeight >= gameContainer.offsetHeight) {
            gameOver();
            return;
        }
        
        pipes = pipes.filter(pipe => {
            if (!pipe || !pipe.top || !pipe.bottom) return false;
            
            const pipeLeft = parseFloat(pipe.top.style.left);
            const newPipeLeft = pipeLeft - gameSpeed;
            
            pipe.top.style.left = newPipeLeft + 'px';
            pipe.bottom.style.left = newPipeLeft + 'px';
            
            const birdRect = bird.getBoundingClientRect();
            const topPipeRect = pipe.top.getBoundingClientRect();
            const bottomPipeRect = pipe.bottom.getBoundingClientRect();
            
            if (
                (birdRect.right > topPipeRect.left &&
                birdRect.left < topPipeRect.right &&
                birdRect.bottom > topPipeRect.top &&
                birdRect.top < topPipeRect.bottom) ||
                (birdRect.right > bottomPipeRect.left &&
                birdRect.left < bottomPipeRect.right &&
                birdRect.bottom > bottomPipeRect.top &&
                birdRect.top < bottomPipeRect.bottom)
            ) {
                gameOver();
                return false;
            }
            
            if (newPipeLeft < -pipe.top.offsetWidth) {
                pipe.top.remove();
                pipe.bottom.remove();
                return false;
            }
            
            if (!pipe.passed && pipeLeft + pipe.top.offsetWidth < bird.offsetLeft) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = score;
                
                if (score % 10 === 0) {
                    bird.src = birdImages[1];
                    setTimeout(() => {
                        if (!isGameOver) {
                            bird.src = birdImages[0];
                        }
                    }, 5000);
                }
            }
            
            return true;
        });
    }
    
    function gameOver() {
        isGameOver = true;
        clearInterval(gameLoop);
        clearInterval(pipeInterval);
        
        pipes.forEach(pipe => {
            if (pipe.top && pipe.top.parentNode) {
                pipe.top.remove();
            }
            if (pipe.bottom && pipe.bottom.parentNode) {
                pipe.bottom.remove();
            }
        });
        pipes = []; 
        
        if (bird && bird.parentNode) {
            bird.remove();
        }
        
        finalScoreElement.textContent = score;
        
        gameOverScreen.style.display = 'block';
    }
    
    startScreen.style.display = 'flex';
});
