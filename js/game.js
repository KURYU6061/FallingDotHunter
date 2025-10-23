// 다국어 지원을 위한 언어 팩
const languagePack = {
    ko: {
        // 메인 메뉴
        gameTitle: "Falling Dot Hunter",
        gameModeTitle: "게임 모드 선택",
        dotHunterMode: "🎯 닷헌터",
        dotClickerMode: "🔢 닷클리커",
        difficultyTitle: "난이도 설정",
        easyDifficulty: "🟢 Easy",
        normalDifficulty: "🟡 Normal",
        hardDifficulty: "🟠 Hard",
        veryHardDifficulty: "🔴 Very Hard",
        startButton: "🚀 게임 시작",
        
        // 게임 화면
        scoreLabel: "점수: ",
        timerLabel: "시간: ",
        secondsLabel: "초",
        livesLabel: "생명: ",
        comboPrefix: "콤보: ",
        comboSuffix: "x COMBO!\n(1.5배 점수)",
        pauseButton: "⏸️ 일시정지",
        menuButton: "🏠 메뉴",
        
        // 게임 오버 화면
        gameOverTitle: "🎮 게임 종료!",
        finalScoreLabel: "최종 점수: ",
        finalComboLabel: "최고 콤보: ",
        remainingLivesLabel: "남은 생명: ",
        timeUpReason: "시간 종료!",
        livesDepletedReason: "라이프 소진!",
        restartButton: "🔄 다시 하기",
        mainMenuButton: "🏠 메인 메뉴",
        
        // 일시정지 화면
        pauseTitle: "⏸️ 일시정지",
        resumeButton: "▶️ 계속하기"
    },
    en: {
        // Main Menu
        gameTitle: "Falling Dot Hunter",
        gameModeTitle: "Select Game Mode",
        dotHunterMode: "🎯 Dot Hunter",
        dotClickerMode: "🔢 Dot Clicker",
        difficultyTitle: "Difficulty Setting",
        easyDifficulty: "🟢 Easy",
        normalDifficulty: "🟡 Normal",
        hardDifficulty: "🟠 Hard",
        veryHardDifficulty: "🔴 Very Hard",
        startButton: "🚀 Start Game",
        
        // Game Screen
        scoreLabel: "Score: ",
        timerLabel: "Time: ",
        secondsLabel: "s",
        livesLabel: "Lives: ",
        comboPrefix: "Combo: ",
        comboSuffix: "x COMBO!\n(1.5x Score)",
        pauseButton: "⏸️ Pause",
        menuButton: "🏠 Menu",
        
        // Game Over Screen
        gameOverTitle: "🎮 Game Over!",
        finalScoreLabel: "Final Score: ",
        finalComboLabel: "Max Combo: ",
        remainingLivesLabel: "Lives Left: ",
        timeUpReason: "Time's up!",
        livesDepletedReason: "Out of lives!",
        restartButton: "🔄 Play Again",
        mainMenuButton: "🏠 Main Menu",
        
        // Pause Screen
        pauseTitle: "⏸️ Paused",
        resumeButton: "▶️ Resume"
    }
};

// 현재 언어 설정 (기본값: 한국어)
let currentLanguage = 'ko';

// 게임 상태 관리
class GameManager {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.gameMode = 'dotHunter'; // 'dotHunter' 또는 'dotClicker'
        this.difficulty = 'normal';
        this.score = 0;
        this.timer = 60;
        this.lives = 5;
        this.combo = 0;
        this.maxCombo = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.gameRunning = false;
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // 캔버스 크기를 CSS에서 설정한 크기로 맞춤
        this.canvas.width = 500;
        this.canvas.height = 750;
        
        this.dots = [];
        this.activeDots = 0; // 활성 도트 개수 추적
        this.gameOverReason = '';
        this.timerInterval = null;
        this.spawnTimeout = null;
        this.animationFrameId = null;
        
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        try {
            // 메뉴 버튼 이벤트
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.gameMode = btn.dataset.mode;
                    console.log('게임 모드 변경:', this.gameMode);
                });
            });

            document.querySelectorAll('.diff-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.difficulty = btn.dataset.difficulty;
                    console.log('난이도 변경:', this.difficulty);
                });
            });
            
            // 시작 버튼은 외부에서 처리됨 (중복 이벤트 방지)
            // 이 생성자에서는 시작 버튼에 리스너를 추가하지 않음

            // 게임 컨트롤 버튼
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => {
                    this.pauseGame();
                });
            }

            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    this.goToMenu();
                });
            }

            // 게임 오버 버튼
            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    // 다시 하기 버튼은 외부 이벤트 핸들러인 startGameHandler를 호출
                    // 이벤트 중복 실행 방지를 위해 외부 함수 사용
                    startGameHandler();
                });
            }

            const mainMenuBtn = document.getElementById('mainMenuBtn');
            if (mainMenuBtn) {
                mainMenuBtn.addEventListener('click', () => {
                    this.playSound(this.buttonSound);
                    this.goToMenu();
                });
            }

            // 일시정지 화면 버튼
            const resumeBtn = document.getElementById('resumeBtn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => {
                    this.resumeGame();
                });
            }

            const pauseMenuBtn = document.getElementById('pauseMenuBtn');
            if (pauseMenuBtn) {
                pauseMenuBtn.addEventListener('click', () => {
                    this.goToMenu();
                });
            }

            // 캔버스 클릭 이벤트
            this.canvas.addEventListener('click', (e) => {
                if (this.gameRunning && !this.isPaused) {
                    this.handleCanvasClick(e);
                }
            });

            // 키보드 이벤트
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && this.gameRunning) {
                    e.preventDefault();
                    this.pauseGame();
                }
            });
        } catch (error) {
            console.error('이벤트 리스너 초기화 중 오류:', error);
        }
    }

    showScreen(screenName) {
        // 일시정지 화면 특별 처리
        if (screenName === 'pauseScreen') {
            // pauseGame 메서드에서 처리하므로 여기서는 처리하지 않음
            return;
        }
        
        console.log(`화면 전환: ${screenName}`);
        
        // 모든 화면 비활성화
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            console.log(`비활성화: ${screen.id}`);
        });
        
        // 선택한 화면 활성화
        const screen = document.getElementById(screenName);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
            console.log(`활성화: ${screenName}`);
        } else {
            console.error(`화면을 찾을 수 없습니다: ${screenName}`);
        }
    }

    startGame() {
        try {
            console.log('startGame() 호출됨');
            console.log('현재 게임 모드:', this.gameMode);
            console.log('현재 난이도:', this.difficulty);
            console.log('현재 언어:', currentLanguage);
            
            // 게임 상태 초기화
            this.resetGame();
            
            // 모든 화면 초기화
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            // 게임 화면 활성화
            const gameScreen = document.getElementById('gameScreen');
            if (gameScreen) {
                gameScreen.classList.add('active');
                this.currentScreen = 'gameScreen';
            }
            
            // 게임 시작 상태 설정
            this.gameRunning = true;
            this.gameOver = false;
            this.isPaused = false;
            
            // 게임 루프, 타이머, 점 생성 시작 (순서 중요)
            this.gameLoop();
            this.startTimer();
            this.spawnDots();
        } catch (error) {
            console.error('게임 시작 중 오류:', error);
        }
    }

    resetGame() {
        // 게임 상태 초기화
        this.score = 0;
        this.timer = 60;
        this.lives = 5;
        this.combo = 0;
        this.maxCombo = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.gameRunning = false;
        
        // 모든 타이머와 애니메이션 프레임 취소
        this.clearTimers();
        
        // 도트 배열 초기화 - 반드시 새 배열을 할당하여 이전 참조 제거
        this.dots = [];
        this.activeDots = 0; // 활성 도트 카운터 초기화
        
        this.gameOverReason = '';
        this.updateUI();
    }

    pauseGame() {
        // 게임이 실행 중이고, 아직 일시정지되지 않은 경우에만 일시정지
        if (!this.isPaused && this.gameRunning && !this.gameOver) {
            this.isPaused = true;
            
            // 타이머 정지 - 모든 타이머 취소
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            if (this.spawnTimeout) {
                clearTimeout(this.spawnTimeout);
                this.spawnTimeout = null;
            }
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // 게임 화면은 그대로 두고 일시정지 화면만 띄움
            const pauseScreen = document.getElementById('pauseScreen');
            if (pauseScreen) {
                pauseScreen.classList.add('active');
            }
        }
    }

    resumeGame() {
        // 이미 정지 상태가 아니면 동작하지 않도록 함
        if (!this.isPaused) return;
        
        this.isPaused = false;
        
        // 일시정지 화면만 닫음
        const pauseScreen = document.getElementById('pauseScreen');
        if (pauseScreen) {
            pauseScreen.classList.remove('active');
        }
        
        // 게임 루프, 타이머, 점 생성 재개
        if (this.gameRunning) {
            // 일시정지 중 타이머가 멈추지 않았던 문제 해결
            if (this.timerInterval === null) {
                this.startTimer();
            }
            
            // 점 생성 재개
            if (this.spawnTimeout === null) {
                this.spawnDots();
            }
            
            // 게임 루프 재개 (animationFrameId가 null인 경우에만)
            if (this.animationFrameId === null) {
                this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
            }
        }
    }

    goToMenu() {
        // 게임 상태 종료
        this.gameRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        
        // 모든 타이머, 애니메이션 프레임 종료
        this.clearTimers();
        
        // 도트 배열 초기화 - 메뉴로 가면 모든 도트 제거
        this.dots = [];
        
        // 모든 화면 비활성화
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 일시정지 화면 비활성화 확실히 하기
        const pauseScreen = document.getElementById('pauseScreen');
        if (pauseScreen) {
            pauseScreen.classList.remove('active');
        }
        
        // 게임오버 화면 비활성화 확실히 하기
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('active');
        }
        
        // 메인 메뉴 활성화
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.add('active');
            this.currentScreen = 'mainMenu';
        }
    }

    clearTimers() {
        // 모든 타이머와 애니메이션 프레임 ID를 정리
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.spawnTimeout) {
            clearTimeout(this.spawnTimeout);
            this.spawnTimeout = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        // 게임 중지 상태 설정
        this.gameRunning = false;
    }

    endGame(reason) {
        this.gameRunning = false;
        this.gameOver = true;
        this.gameOverReason = reason;
        this.clearTimers();
        
        // 모든 도트 제거
        this.dots = [];
        this.activeDots = 0; // 활성 도트 카운터도 초기화
        
        // 점수 및 상태 정보 업데이트
        const finalScore = document.getElementById('finalScore');
        const finalCombo = document.getElementById('finalCombo');
        const remainingLives = document.getElementById('remainingLives');
        const gameOverReason = document.getElementById('gameOverReason');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalCombo) finalCombo.textContent = this.maxCombo;
        if (remainingLives) remainingLives.textContent = this.lives;
        
        // 현재 언어에 맞는 게임 오버 이유 텍스트
        const texts = languagePack[currentLanguage];
        if (gameOverReason) {
            if (reason.includes('시간') || reason.includes('Time')) {
                gameOverReason.textContent = texts.timeUpReason;
            } else {
                gameOverReason.textContent = texts.livesDepletedReason;
            }
        }
        
        this.showScreen('gameOverScreen');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            // 게임 실행 중이 아니면 타이머 중지
            if (!this.gameRunning) return;
            
            // 일시정지 상태에서는 타이머 카운트다운 중지
            if (this.isPaused) return;
            
            this.timer--;
            this.updateUI();
            
            if (this.timer <= 0) {
                this.endGame('시간 종료!');
            }
        }, 1000);
    }

    updateUI() {
        try {
            const scoreValue = document.getElementById('scoreValue');
            const timerValue = document.getElementById('timerValue');
            const livesValue = document.getElementById('livesValue');
            const comboValue = document.getElementById('comboValue');
            
            if (scoreValue) scoreValue.textContent = this.score;
            if (timerValue) timerValue.textContent = this.timer;
            if (livesValue) livesValue.textContent = this.lives;
            
            const texts = languagePack[currentLanguage];
            if (comboValue) {
                if (this.combo >= 3) {
                    // 3 이상의 콤보는 줄바꿈 형태로 표시
                    const comboText = `<span class="combo-text">${this.combo}x COMBO!</span>`;
                    const bonusText = `<span class="combo-bonus">(1.5배 점수)</span>`;
                    comboValue.innerHTML = currentLanguage === 'ko' ? 
                        comboText + bonusText : 
                        comboText + bonusText.replace("1.5배 점수", "1.5x Score");
                } else {
                    // 일반 콤보는 기존대로 표시
                    comboValue.textContent = `${texts.comboPrefix}${this.combo}`;
                }
            }
        } catch (error) {
            console.error('UI 업데이트 중 오류:', error);
        }
    }

    getDifficultySettings() {
        // 기본 설정 (Normal 기준)
        const baseSettings = {
            speed: 2,
            dotSize: 35,
            dotHunterSpawnRate: 1500,  // 닷헌터 기본 스폰 간격
            dotClickerSpawnRate: 1500  // 닷클리커 기본 스폰 간격
        };

        const difficultyMultipliers = {
            easy: { 
                speed: 0.5,     // 속도 반으로
                size: 1.14,     // 크기 40/35 = 1.14배
                dotHunterSpawn: 1.33,  // 스폰 간격 1.33배 (더 느리게)
                dotClickerSpawn: 1.33
            },
            normal: { 
                speed: 1, 
                size: 1, 
                dotHunterSpawn: 1, 
                dotClickerSpawn: 1 
            },
            hard: { 
                speed: 1.5,     // 속도 1.5배
                size: 0.86,     // 크기 30/35 = 0.86배
                dotHunterSpawn: 0.33,  // 스폰 간격 1/3배 (3배 빠르게)
                dotClickerSpawn: 0.5   // 스폰 간격 1/2배 (2배 빠르게)
            },
            veryhard: { 
                speed: 2,       // 속도 2배
                size: 0.71,     // 크기 25/35 = 0.71배
                dotHunterSpawn: 0.27,  // 스폰 간격 더 빠르게
                dotClickerSpawn: 0.4   // 스폰 간격 더 빠르게
            }
        };

        const multiplier = difficultyMultipliers[this.difficulty];
        const spawnRateKey = this.gameMode === 'dotHunter' ? 'dotHunterSpawn' : 'dotClickerSpawn';
        
        return {
            speed: baseSettings.speed * multiplier.speed,
            dotSize: Math.round(baseSettings.dotSize * multiplier.size),
            spawnRate: Math.round(baseSettings.dotHunterSpawnRate * multiplier[spawnRateKey])
        };
    }

    spawnDots() {
        if (!this.gameRunning) return;
        
        // 이미 타이머가 설정되어 있으면 중복 호출 방지
        if (this.spawnTimeout !== null) return;
        
        const settings = this.getDifficultySettings();
        
        // activeDots 속성을 사용하여 활성 점 개수 확인
        
        // 일시정지 상태가 아닌 경우에만 새 점 생성
        if (!this.isPaused) {
            if (this.gameMode === 'dotHunter') {
                // 여러 개의 점이 동시에 떨어지는 모드
                if (this.activeDots < 3) {
                    this.createDot();
                }
            } else {
                // 숫자가 있는 점을 여러 번 클릭해야 하는 모드
                if (this.activeDots < 2) {
                    this.createNumberDot();
                }
            }
        }
        
        // 일시정지 상태에서도 타이머는 계속 유지하되 중복 타이머 설정 방지
        this.spawnTimeout = setTimeout(() => {
            // 타이머 ID 초기화
            this.spawnTimeout = null;
            // 계속 실행 중인 경우에만 다음 스폰 예약
            if (this.gameRunning && !this.isPaused) {
                this.spawnDots();
            }
        }, settings.spawnRate);
    }

    createDot() {
        const settings = this.getDifficultySettings();
        const dot = new Dot(
            Math.random() * (this.canvas.width - settings.dotSize * 2) + settings.dotSize,
            -settings.dotSize,
            settings.dotSize,
            settings.speed,
            this.getRandomColor()
        );
        this.dots.push(dot);
        this.activeDots++; // 활성 도트 카운터 증가
    }

    createNumberDot() {
        const settings = this.getDifficultySettings();
        const clicksRequired = Math.floor(Math.random() * 3) + 2; // 2-4번 클릭 필요
        const dot = new NumberDot(
            Math.random() * (this.canvas.width - settings.dotSize * 2) + settings.dotSize,
            -settings.dotSize,
            settings.dotSize,
            settings.speed,
            this.getRandomColor(),
            clicksRequired
        );
        this.dots.push(dot);
        this.activeDots++; // 활성 도트 카운터 증가
    }

    getRandomColor() {
        const colors = ['#4299e1', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        // 일시정지 상태가 아닌 경우에만 게임 로직 업데이트
        if (!this.isPaused) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 떨어지는 점 업데이트 및 그리기
            for (let i = this.dots.length - 1; i >= 0; i--) {
                const dot = this.dots[i];
                
                // 이미 제거된 점은 배열에서 삭제하고 다음 점으로 넘어감
                if (dot.isRemoved) {
                    this.dots.splice(i, 1);
                    continue;
                }
                
                // 점 위치 업데이트
                dot.update();
                
                // 화면 밖으로 나간 점 처리
                if (dot.y > this.canvas.height + dot.radius) {
                    // 제거되지 않은 점이 화면 밖으로 나가면 생명력 감소
                    this.combo = 0;    // 놓친 경우 콤보 초기화
                    this.lives--;
                    this.activeDots--; // 활성 도트 수 감소
                    this.updateUI();
                    
                    if (this.lives <= 0) {
                        this.endGame('라이프 소진!');
                        return;
                    }
                    
                    // 화면 밖으로 나간 점은 배열에서 제거
                    this.dots.splice(i, 1);
                    continue;
                }
                
                // 화면에 그리기 (제거되지 않고 화면 안에 있는 점만)
                dot.draw(this.ctx);
            }
        }
        
        // 게임이 실행 중인 경우에만 애니메이션 프레임 요청
        if (this.gameRunning) {
            // 이전 애니메이션 프레임을 취소하고 새로 요청
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    handleCanvasClick(e) {
        // 게임이 실행 중이 아니거나 일시정지 상태면 클릭 처리 안 함
        if (!this.gameRunning || this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        let clickedDot = false;
        
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            
            // 이미 제거된 점은 무시
            if (dot.isRemoved) continue;
            
            const distance = Math.sqrt(
                Math.pow(clickX - dot.x, 2) + Math.pow(clickY - dot.y, 2)
            );
            
            if (distance < dot.radius) {
                // 클릭 효과음 재생 코드 제거됨
                
                // 클릭 처리 - NumberDot은 여러번 클릭이 필요하고, Dot은 한번 클릭으로 제거됨
                if (dot.onClick()) {
                    // 점이 제거 조건을 만족하면
                    dot.isRemoved = true;
                    this.activeDots--; // 활성 도트 수 감소
                    this.score += 10 * (this.combo >= 3 ? 1.5 : 1); // 콤보 시 1.5배 점수
                    this.combo++;
                    if (this.combo > this.maxCombo) {
                        this.maxCombo = this.combo;
                    }
                    
                    // 제거 시 팝 효과음 재생 코드 제거됨
                    
                    this.updateUI();
                }
                clickedDot = true;
                break;
            }
        }
        
        // 점을 클릭하지 않은 경우에는 콤보를 초기화하지 않음
    }
    
    // 효과음 재생 메서드 (호환성을 위해 빈 메소드로 추가)
    stopComboTimer() {
        // 효과음 기능이 제거되어 아무 동작 없음
    }
    
    // 효과음 재생 메서드 (빈 메서드로 추가)
    playSound(soundType) {
        // 효과음 기능 제거됨
    }
}

// 기본 점 클래스
class Dot {
    constructor(x, y, radius, speed, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.color = color;
        this.isRemoved = false; // 점이 제거되었는지 추적하는 플래그
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        // 이미 제거된 점은 그리지 않음
        if (this.isRemoved) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    onClick() {
        // 이미 제거된 점은 다시 처리하지 않음
        if (this.isRemoved) return false;
        
        return true; // 한 번 클릭으로 제거됨
    }
}

// 숫자 점 클래스 (여러 번 클릭 필요)
class NumberDot extends Dot {
    constructor(x, y, radius, speed, color, clicksRequired) {
        super(x, y, radius, speed, color);
        this.clicksRequired = clicksRequired;
        this.clicksRemaining = clicksRequired;
    }

    draw(ctx) {
        // 부모 draw 메서드를 호출하여 점 그리기 (이미 제거된 점 체크 포함)
        super.draw(ctx);
        
        // 이미 제거된 점이면 숫자를 표시하지 않음
        if (this.isRemoved) return;
        
        // 숫자 표시
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.clicksRemaining, this.x, this.y);
    }

    onClick() {
        // 이미 제거된 점은 다시 처리하지 않음
        if (this.isRemoved) return false;
        
        this.clicksRemaining--;
        
        // 클릭 횟수가 모두 소진되면 점을 제거
        if (this.clicksRemaining <= 0) {
            return true; // 점 제거 신호
        }
        return false; // 아직 클릭이 더 필요함
    }
}

// 안전하게 요소에 접근하는 함수
function safeSetText(selector, text) {
    try {
        const element = typeof selector === 'string' ? 
            (selector.startsWith('.') || selector.startsWith('#') ? 
                document.querySelector(selector) : document.getElementById(selector)) : 
            selector;
        
        if (element) {
            element.textContent = text;
            return true;
        } else {
            console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}`);
            return false;
        }
    } catch (error) {
        console.error(`Error setting text for ${selector}:`, error);
        return false;
    }
}

// 언어 변경 함수
function changeLanguage(language) {
    currentLanguage = language;
    updateAllTexts();
}

// 모든 텍스트 업데이트
function updateAllTexts() {
    try {
        const texts = languagePack[currentLanguage];
        
        // 메인 메뉴
        safeSetText('.game-title', texts.gameTitle);
        safeSetText('.game-mode-section h3', texts.gameModeTitle);
        
        // 효과음 버튼 텍스트 업데이트
        const soundToggleBtn = document.getElementById('soundToggle');
        if (soundToggleBtn) {
            if (game && game.soundEnabled) {
                soundToggleBtn.innerHTML = texts.soundToggle;
            } else if (game) {
                soundToggleBtn.innerHTML = currentLanguage === 'ko' ? '🔇 효과음 OFF' : '🔇 Sound Off';
            }
        }
        
        const modeButtons = document.querySelectorAll('.mode-btn');
        if (modeButtons.length > 0) safeSetText(modeButtons[0], texts.dotHunterMode);
        if (modeButtons.length > 1) safeSetText(modeButtons[1], texts.dotClickerMode);
        
        safeSetText('.difficulty-section h3', texts.difficultyTitle);
        
        const diffButtons = document.querySelectorAll('.diff-btn');
        if (diffButtons.length > 0) safeSetText(diffButtons[0], texts.easyDifficulty);
        if (diffButtons.length > 1) safeSetText(diffButtons[1], texts.normalDifficulty);
        if (diffButtons.length > 2) safeSetText(diffButtons[2], texts.hardDifficulty);
        if (diffButtons.length > 3) safeSetText(diffButtons[3], texts.veryHardDifficulty);
        
        safeSetText('startGameBtn', texts.startButton);
        
        // 게임 화면
        const scoreValue = document.getElementById('scoreValue');
        const timerValue = document.getElementById('timerValue');
        const livesValue = document.getElementById('livesValue');
        
        if (document.querySelector('.score-display') && scoreValue) {
            document.querySelector('.score-display').textContent = texts.scoreLabel + scoreValue.textContent;
        }
        if (document.querySelector('.timer-display') && timerValue) {
            document.querySelector('.timer-display').textContent = texts.timerLabel + timerValue.textContent;
        }
        if (document.querySelector('.lives-display') && livesValue) {
            document.querySelector('.lives-display').textContent = texts.livesLabel + livesValue.textContent;
        }
        
        // 콤보 텍스트는 게임 상태에 따라 다름
        const comboValueEl = document.getElementById('comboValue');
        if (comboValueEl) {
            let comboText = comboValueEl.textContent;
            let comboCount = comboText.match(/\d+/);
            if (comboCount && parseInt(comboCount[0]) >= 3) {
                comboValueEl.textContent = comboCount[0] + texts.comboSuffix;
            } else if (comboCount) {
                comboValueEl.textContent = texts.comboPrefix + comboCount[0];
            }
        }
        
        safeSetText('pauseBtn', texts.pauseButton);
        safeSetText('menuBtn', texts.menuButton);
        
        // 게임 오버 화면
        safeSetText('.gameover-title', texts.gameOverTitle);
        
        const finalScore = document.getElementById('finalScore');
        const finalCombo = document.getElementById('finalCombo');
        const remainingLives = document.getElementById('remainingLives');
        
        if (document.querySelector('.final-score') && finalScore) {
            document.querySelector('.final-score').textContent = texts.finalScoreLabel + finalScore.textContent;
        }
        if (document.querySelector('.final-combo') && finalCombo) {
            document.querySelector('.final-combo').textContent = texts.finalComboLabel + finalCombo.textContent;
        }
        if (document.querySelector('.remaining-lives') && remainingLives) {
            document.querySelector('.remaining-lives').textContent = texts.remainingLivesLabel + remainingLives.textContent;
        }
        
        // 게임 오버 이유 업데이트
        const gameOverReason = document.getElementById('gameOverReason');
        if (gameOverReason) {
            const reason = gameOverReason.textContent;
            if (reason.includes('시간')) {
                gameOverReason.textContent = texts.timeUpReason;
            } else if (reason.includes('라이프')) {
                gameOverReason.textContent = texts.livesDepletedReason;
            }
        }
        
        safeSetText('restartBtn', texts.restartButton);
        safeSetText('mainMenuBtn', texts.mainMenuButton);
        
        // 일시정지 화면
        safeSetText('.pause-title', texts.pauseTitle);
        safeSetText('resumeBtn', texts.resumeButton);
        safeSetText('pauseMenuBtn', texts.menuButton);
    } catch (error) {
        console.error('텍스트 업데이트 중 오류:', error);
    }
}

// 게임 시작
let game;

// 모든 화면 초기 상태 설정 함수
function setupScreens() {
    // 메인 메뉴를 제외한 모든 화면 비활성화
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('pauseScreen').classList.remove('active');
    
    // 메인 메뉴만 활성화
    document.getElementById('mainMenu').classList.add('active');
}

// 페이지 로드 완료 후 초기화 함수
function initializeGame() {
    console.log('페이지 로딩 완료');
    try {
        // 모든 화면 초기화 (메인 메뉴만 활성화)
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id === 'mainMenu') {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        
        game = new GameManager();
        console.log('GameManager 인스턴스 생성됨');
        
        // 언어 선택기 이벤트 리스너 추가
        const languageSelector = document.getElementById('languageSelect');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                // 효과음 코드 제거됨
                changeLanguage(e.target.value);
            });
        }
        
        // 게임 시작 버튼에 이벤트 리스너 직접 추가
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            // 기존 이벤트 리스너 제거하여 중복 실행 방지
            startBtn.removeEventListener('click', startGameHandler);
            // 새 이벤트 리스너 등록
            startBtn.addEventListener('click', startGameHandler);
        } else {
            console.error('시작 버튼이 HTML에 존재하지 않습니다!');
        }
    } catch (error) {
        console.error('게임 초기화 중 오류:', error);
    }
}

// 게임 시작 핸들러 함수
function startGameHandler() {
    try {
        // 이전 게임 객체가 있다면 게임 초기화 및 캔버스 초기화
        if (game) {
            // 진행 중인 게임이 있으면 완전히 정리
            game.clearTimers();
            game.dots = [];
            game.activeDots = 0;
        } else {
            // 게임 인스턴스가 없으면 새로 생성
            game = new GameManager();
        }
        // 효과음 코드 제거됨
        
        // 게임 시작
        game.startGame();
    } catch (error) {
        console.error('게임 시작 중 오류:', error);
    }
}

// 페이지 로드 시 이벤트 리스너
window.addEventListener('load', function() {
    setupScreens();  // 화면 초기 설정
    initializeGame();
});

// DOMContentLoaded 이벤트도 추가 (혹시 모를 경우)
document.addEventListener('DOMContentLoaded', function() {
    setupScreens();  // 화면 초기 설정
    setTimeout(initializeGame, 500);
});