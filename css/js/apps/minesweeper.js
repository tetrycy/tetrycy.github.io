// === MINESWEEPER WINDOWS 98 ===

class Minesweeper {
    constructor() {
        this.board = [];
        this.gameState = 'ready'; // ready, playing, won, lost
        this.timer = 0;
        this.timerInterval = null;
        this.mineCount = 10;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.allowQuestionMarks = true;
        
        // Poziomy trudności
        this.difficulties = {
            beginner: { width: 9, height: 9, mines: 10 },
            intermediate: { width: 16, height: 16, mines: 40 },
            expert: { width: 30, height: 16, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.firstClick = true;
    }
    
    init() {
        this.setupEventListeners();
        this.newGame('beginner');
    }
    
    setupEventListeners() {
        // Obsługa prawego przycisku myszy
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('mine-cell')) {
                e.preventDefault();
                this.handleRightClick(e.target);
            }
        });
        
        // Zamknij menu kontekstowe
        document.addEventListener('click', () => {
            document.getElementById('mine-context-menu').style.display = 'none';
        });
        
        // Obsługa klawiatury
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('minesweeper-window').classList.contains('show')) {
                if (e.key === 'F2') {
                    e.preventDefault();
                    this.resetMinesweeper();
                }
            }
        });
    }
    
    newGame(difficulty = 'beginner') {
        this.currentDifficulty = difficulty;
        const config = this.difficulties[difficulty];
        
        this.gameState = 'ready';
        this.timer = 0;
        this.firstClick = true;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.mineCount = config.mines;
        
        this.clearTimer();
        this.updateDisplay();
        this.createBoard(config.width, config.height, config.mines);
        this.updateSmiley('😊');
        
        // Ukryj menu kontekstowe
        document.getElementById('mine-context-menu').style.display = 'none';
    }
    
    createBoard(width, height, mineCount) {
        const board = document.getElementById('minesweeper-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${width}, 20px)`;
        
        // Inicjalizuj tablicę planszy
        this.board = [];
        for (let y = 0; y < height; y++) {
            this.board[y] = [];
            for (let x = 0; x < width; x++) {
                this.board[y][x] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    isQuestioned: false,
                    neighborMines: 0
                };
                
                // Stwórz element DOM
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                cell.addEventListener('click', (e) => this.handleLeftClick(e.target));
                cell.addEventListener('mousedown', (e) => {
                    if (e.button === 0) { // lewy przycisk
                        this.updateSmiley('😮');
                    }
                });
                cell.addEventListener('mouseup', () => {
                    if (this.gameState === 'playing' || this.gameState === 'ready') {
                        this.updateSmiley('😊');
                    }
                });
                
                board.appendChild(cell);
            }
        }
    }
    
    placeMines(width, height, mineCount, firstClickX, firstClickY) {
        let minesPlaced = 0;
        
        while (minesPlaced < mineCount) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            // Nie umieszczaj miny na pierwszym kliknięciu ani wokół niego
            const isFirstClickArea = Math.abs(x - firstClickX) <= 1 && Math.abs(y - firstClickY) <= 1;
            
            if (!this.board[y][x].isMine && !isFirstClickArea) {
                this.board[y][x].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateNeighborMines(width, height);
    }
    
    calculateNeighborMines(width, height) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!this.board[y][x].isMine) {
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                if (this.board[ny][nx].isMine) count++;
                            }
                        }
                    }
                    this.board[y][x].neighborMines = count;
                }
            }
        }
    }
    
    handleLeftClick(cell) {
        if (this.gameState === 'won' || this.gameState === 'lost') return;
        
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const cellData = this.board[y][x];
        
        if (cellData.isFlagged || cellData.isQuestioned) return;
        
        // Pierwszy klik - umieść miny
        if (this.firstClick) {
            const config = this.difficulties[this.currentDifficulty];
            this.placeMines(config.width, config.height, config.mines, x, y);
            this.startTimer();
            this.gameState = 'playing';
            this.firstClick = false;
        }
        
        this.revealCell(x, y);
    }
    
    handleRightClick(cell) {
        if (this.gameState === 'won' || this.gameState === 'lost') return;
        
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const cellData = this.board[y][x];
        
        if (cellData.isRevealed) return;
        
        if (!cellData.isFlagged && !cellData.isQuestioned) {
            // Ustaw flagę
            cellData.isFlagged = true;
            cell.classList.add('flagged');
            this.flaggedCount++;
        } else if (cellData.isFlagged) {
            // Usuń flagę, ustaw znak zapytania (jeśli włączone)
            cellData.isFlagged = false;
            cell.classList.remove('flagged');
            this.flaggedCount--;
            
            if (this.allowQuestionMarks) {
                cellData.isQuestioned = true;
                cell.classList.add('questioned');
            }
        } else if (cellData.isQuestioned) {
            // Usuń znak zapytania
            cellData.isQuestioned = false;
            cell.classList.remove('questioned');
        }
        
        this.updateDisplay();
    }
    
    revealCell(x, y) {
        const config = this.difficulties[this.currentDifficulty];
        if (x < 0 || x >= config.width || y < 0 || y >= config.height) return;
        
        const cellData = this.board[y][x];
        const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        
        if (cellData.isRevealed || cellData.isFlagged) return;
        
        cellData.isRevealed = true;
        cell.classList.add('revealed');
        this.revealedCount++;
        
        if (cellData.isMine) {
            // Gra przegrana
            cell.classList.add('exploded');
            this.gameState = 'lost';
            this.updateSmiley('😵');
            this.clearTimer();
            this.revealAllMines();
            return;
        }
        
        if (cellData.neighborMines > 0) {
            cell.textContent = cellData.neighborMines;
            cell.dataset.count = cellData.neighborMines;
        } else {
            // Odkryj sąsiednie pola
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    this.revealCell(x + dx, y + dy);
                }
            }
        }
        
        this.checkWinCondition();
    }
    
    revealAllMines() {
        const config = this.difficulties[this.currentDifficulty];
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const cellData = this.board[y][x];
                const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                
                if (cellData.isMine && !cellData.isFlagged) {
                    cell.classList.add('mine');
                } else if (!cellData.isMine && cellData.isFlagged) {
                    cell.classList.add('wrong-flag');
                }
            }
        }
    }
    
    checkWinCondition() {
        const config = this.difficulties[this.currentDifficulty];
        const totalCells = config.width * config.height;
        const safeCells = totalCells - config.mines;
        
        if (this.revealedCount === safeCells) {
            this.gameState = 'won';
            this.updateSmiley('😎');
            this.clearTimer();
            this.flagAllRemainingMines();
            
            // Pokaż powiadomienie
            setTimeout(() => {
                alert(`Gratulacje! Wygrałeś w czasie ${this.timer} sekund!`);
            }, 500);
        }
    }
    
    flagAllRemainingMines() {
        const config = this.difficulties[this.currentDifficulty];
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const cellData = this.board[y][x];
                const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                
                if (cellData.isMine && !cellData.isFlagged) {
                    cellData.isFlagged = true;
                    cell.classList.add('flagged');
                    this.flaggedCount++;
                }
            }
        }
        this.updateDisplay();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        const mineCountDisplay = document.getElementById('mine-count');
        const timeCountDisplay = document.getElementById('time-count');
        
        const remainingMines = this.mineCount - this.flaggedCount;
        mineCountDisplay.textContent = String(Math.max(0, remainingMines)).padStart(3, '0');
        timeCountDisplay.textContent = String(Math.min(999, this.timer)).padStart(3, '0');
    }
    
    updateSmiley(emoji) {
        document.getElementById('smiley-btn').textContent = emoji;
    }
    
    reset() {
        this.newGame(this.currentDifficulty);
    }
}

// Globalne funkcje
let minesweeper = null;

function initMinesweeper() {
    if (!minesweeper) {
        minesweeper = new Minesweeper();
        minesweeper.init();
    }
}

function resetMinesweeper() {
    if (minesweeper) {
        minesweeper.reset();
    }
}

function newGame(difficulty) {
    if (minesweeper) {
        minesweeper.newGame(difficulty);
    }
}

function toggleMarks() {
    if (minesweeper) {
        minesweeper.allowQuestionMarks = !minesweeper.allowQuestionMarks;
        alert(`Znaki zapytania: ${minesweeper.allowQuestionMarks ? 'Włączone' : 'Wyłączone'}`);
    }
}

function showStatistics() {
    alert('Najlepsze czasy:\n\nPoczątkujący: Brak rekordów\nŚredniozaawansowany: Brak rekordów\nEkspert: Brak rekordów');
}

function showMinesweeperMenu(type) {
    if (type === 'game') {
        const menu = document.getElementById('mine-context-menu');
        menu.style.display = 'block';
        menu.style.left = '20px';
        menu.style.top = '80px';
    } else if (type === 'help') {
        alert('Saper - Windows 98\n\nCel: Odkryj wszystkie pola, które nie zawierają min.\n\nLewy przycisk: Odkryj pole\nPrawy przycisk: Oznacz flagą/znakiem zapytania\n\nF2: Nowa gra');
    }
}

// Auto-inicjalizacja gdy okno jest otwarte
const originalOpenMinesweeper = window.openMinesweeper || function() {
    openWindow('minesweeper-window', {
        width: 250,
        height: 320
    });
};

window.openMinesweeper = function() {
    originalOpenMinesweeper();
    setTimeout(() => {
        initMinesweeper();
    }, 100);
};

console.log('💣 Minesweeper załadowany!');
