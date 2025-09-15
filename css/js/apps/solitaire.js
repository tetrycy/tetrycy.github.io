// === PASJANS KLONDIKE WINDOWS 98 ===

class Solitaire {
    constructor() {
        this.deck = [];
        this.waste = [];
        this.foundations = [[], [], [], []]; // 4 stosy docelowe
        this.tableau = [[], [], [], [], [], [], []]; // 7 kolumn roboczych
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.draggedCard = null;
        this.draggedFrom = null;
        this.moves = 0;
        
        // Karty
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitSymbols = {
            hearts: '♥',
            diamonds: '♦', 
            clubs: '♣',
            spades: '♠'
        };
    }
    
    init() {
        this.setupEventListeners();
        this.newGame();
    }
    
    setupEventListeners() {
        // Kliknięcie talii
        document.getElementById('deck-pile').addEventListener('click', () => this.drawFromDeck());
        
        // Menu kontekstowe
        document.addEventListener('click', () => {
            const contextMenu = document.getElementById('solitaire-context-menu');
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        });
        
        // Klawiatury
        document.addEventListener('keydown', (e) => {
            const solitaireWindow = document.getElementById('solitaire-window');
            if (solitaireWindow && solitaireWindow.classList.contains('show')) {
                if (e.key === 'F2') {
                    e.preventDefault();
                    this.newGame();
                }
            }
        });
    }
    
    newGame() {
        this.score = 0;
        this.timer = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.clearTimer();
        
        // Resetuj wszystkie stosy
        this.deck = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.updateDisplay();
        this.renderGame();
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let value of this.values) {
                this.deck.push({
                    suit: suit,
                    value: value,
                    color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                    faceUp: false,
                    id: `${value}-${suit}`
                });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        // Rozdaj karty do tableau
        let cardIndex = 0;
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck[cardIndex++];
                if (row === col) {
                    card.faceUp = true; // Ostatnia karta w kolumnie odkryta
                }
                this.tableau[col].push(card);
            }
        }
        
        // Pozostałe karty do talii
        this.deck = this.deck.slice(cardIndex);
    }
    
    renderGame() {
        this.renderDeck();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }
    
    renderDeck() {
        const deckPile = document.getElementById('deck-pile');
        deckPile.innerHTML = '';
        
        if (this.deck.length > 0) {
            const cardElement = this.createCardElement(this.deck[this.deck.length - 1], false);
            cardElement.classList.add('face-down');
            deckPile.appendChild(cardElement);
        }
    }
    
    renderWaste() {
        const wastePile = document.getElementById('waste-pile');
        wastePile.innerHTML = '';
        
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardElement = this.createCardElement(topCard, true);
            this.addCardEventListeners(cardElement, topCard, 'waste');
            wastePile.appendChild(cardElement);
        }
    }
    
    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundation = document.getElementById(`foundation-${i}`);
            foundation.innerHTML = '';
            
            if (this.foundations[i].length > 0) {
                const topCard = this.foundations[i][this.foundations[i].length - 1];
                const cardElement = this.createCardElement(topCard, true);
                foundation.appendChild(cardElement);
            }
            
            // Drop zone dla foundation
            this.addDropZone(foundation, 'foundation', i);
        }
    }
    
    renderTableau() {
        for (let col = 0; col < 7; col++) {
            const column = document.getElementById(`tableau-${col}`);
            column.innerHTML = '';
            
            for (let i = 0; i < this.tableau[col].length; i++) {
                const card = this.tableau[col][i];
                const cardElement = this.createCardElement(card, card.faceUp);
                cardElement.style.top = `${i * 16}px`;
                cardElement.style.zIndex = i;
                
                if (card.faceUp) {
                    this.addCardEventListeners(cardElement, card, 'tableau', col, i);
                } else {
                    cardElement.addEventListener('click', () => this.flipCard(col, i));
                }
                
                column.appendChild(cardElement);
            }
            
            // Drop zone dla kolumny
            this.addDropZone(column, 'tableau', col);
        }
    }
    
    createCardElement(card, faceUp) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.dataset.cardId = card.id;
        
        if (faceUp) {
            cardElement.innerHTML = `
                <div class="card-top">
                    <div class="card-value">${card.value}</div>
                    <div class="card-suit">${this.suitSymbols[card.suit]}</div>
                </div>
                <div class="card-center">${this.suitSymbols[card.suit]}</div>
                <div class="card-bottom">
                    <div class="card-value">${card.value}</div>
                    <div class="card-suit">${this.suitSymbols[card.suit]}</div>
                </div>
            `;
        } else {
            cardElement.classList.add('face-down');
        }
        
        return cardElement;
    }
    
    addCardEventListeners(cardElement, card, from, index = null, cardIndex = null) {
        cardElement.draggable = true;
        
        cardElement.addEventListener('dragstart', (e) => {
            this.draggedCard = card;
            this.draggedFrom = { type: from, index: index, cardIndex: cardIndex };
            cardElement.classList.add('dragging');
        });
        
        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('dragging');
        });
        
        cardElement.addEventListener('dblclick', () => {
            this.autoMoveToFoundation(card, from, index, cardIndex);
        });
    }
    
    addDropZone(element, type, index) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drop-zone');
        });
        
        element.addEventListener('dragleave', () => {
            element.classList.remove('drop-zone');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drop-zone');
            this.handleDrop(type, index);
        });
    }
    
    handleDrop(toType, toIndex) {
        if (!this.draggedCard || !this.draggedFrom) return;
        
        const canMove = this.canMoveCard(this.draggedCard, toType, toIndex);
        
        if (canMove) {
            this.moveCard(this.draggedFrom, toType, toIndex);
            this.moves++;
            this.updateScore(10);
            this.checkWinCondition();
        }
        
        this.draggedCard = null;
        this.draggedFrom = null;
    }
    
    canMoveCard(card, toType, toIndex) {
        if (toType === 'foundation') {
            const foundation = this.foundations[toIndex];
            if (foundation.length === 0) {
                return card.value === 'A';
            } else {
                const topCard = foundation[foundation.length - 1];
                return card.suit === topCard.suit && this.getCardValue(card.value) === this.getCardValue(topCard.value) + 1;
            }
        } else if (toType === 'tableau') {
            const column = this.tableau[toIndex];
            if (column.length === 0) {
                return card.value === 'K';
            } else {
                const topCard = column[column.length - 1];
                return card.color !== topCard.color && this.getCardValue(card.value) === this.getCardValue(topCard.value) - 1;
            }
        }
        return false;
    }
    
    moveCard(from, toType, toIndex) {
        let cards = [];
        
        // Pobierz karty do przeniesienia
        if (from.type === 'waste') {
            cards = [this.waste.pop()];
        } else if (from.type === 'tableau') {
            cards = this.tableau[from.index].splice(from.cardIndex);
        } else if (from.type === 'foundation') {
            cards = [this.foundations[from.index].pop()];
        }
        
        // Przenieś karty
        if (toType === 'foundation') {
            this.foundations[toIndex].push(...cards);
        } else if (toType === 'tableau') {
            this.tableau[toIndex].push(...cards);
        }
        
        // Odkryj kartę jeśli kolumna tableau ma zakryte karty
        if (from.type === 'tableau') {
            const column = this.tableau[from.index];
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                    this.updateScore(5);
                }
            }
        }
        
        this.renderGame();
    }
    
    drawFromDeck() {
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }
        
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            card.faceUp = true;
            this.waste.push(card);
        } else if (this.waste.length > 0) {
            // Odwróć waste do deck
            while (this.waste.length > 0) {
                const card = this.waste.pop();
                card.faceUp = false;
                this.deck.push(card);
            }
        }
        
        this.renderDeck();
        this.renderWaste();
    }
    
    flipCard(col, cardIndex) {
        const card = this.tableau[col][cardIndex];
        if (!card.faceUp && cardIndex === this.tableau[col].length - 1) {
            card.faceUp = true;
            this.updateScore(5);
            this.renderTableau();
        }
    }
    
    autoMoveToFoundation(card, from, index, cardIndex) {
        for (let i = 0; i < 4; i++) {
            if (this.canMoveCard(card, 'foundation', i)) {
                this.moveCard({ type: from, index: index, cardIndex: cardIndex }, 'foundation', i);
                this.moves++;
                this.updateScore(10);
                this.checkWinCondition();
                break;
            }
        }
    }
    
    getCardValue(value) {
        const values = { 'A': 1, 'J': 11, 'Q': 12, 'K': 13 };
        return values[value] || parseInt(value);
    }
    
    updateScore(points) {
        this.score += points;
        this.updateDisplay();
    }
    
    checkWinCondition() {
        const totalFoundationCards = this.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
        if (totalFoundationCards === 52) {
            this.gameWon();
        }
    }
    
    gameWon() {
        this.clearTimer();
        const bonus = Math.max(0, 10000 - (this.timer * 10) - (this.moves * 5));
        this.updateScore(bonus);
        
        setTimeout(() => {
            alert(`Gratulacje! Wygrałeś!\nCzas: ${this.formatTime(this.timer)}\nRuchy: ${this.moves}\nWynik: ${this.score}`);
        }, 500);
        
        // Animacja wygranej
        document.querySelector('.solitaire').classList.add('game-won');
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
        const scoreDisplay = document.getElementById('solitaire-score');
        const timeDisplay = document.getElementById('solitaire-time');
        
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
        
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(this.timer);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Globalne funkcje
let solitaire = null;

function initSolitaire() {
    if (!solitaire) {
        solitaire = new Solitaire();
        solitaire.init();
    }
}

function newSolitaireGame() {
    if (solitaire) {
        solitaire.newGame();
    }
}

function restartSolitaireGame() {
    if (solitaire) {
        if (confirm('Czy na pewno chcesz rozpocząć grę od nowa?')) {
            solitaire.newGame();
        }
    }
}

function toggleSolitaireMode() {
    alert('Dostępny tylko tryb Klondike');
}

function showSolitaireStats() {
    if (solitaire) {
        alert(`Statystyki obecnej gry:\n\nCzas: ${solitaire.formatTime(solitaire.timer)}\nRuchy: ${solitaire.moves}\nWynik: ${solitaire.score}`);
    }
}

function showSolitaireMenu(type) {
    if (type === 'game') {
        const menu = document.getElementById('solitaire-context-menu');
        if (menu) {
            menu.style.display = 'block';
            menu.style.left = '20px';
            menu.style.top = '80px';
        }
    } else if (type === 'help') {
        alert('Pasjans Klondike - Windows 98\n\nCel: Przenieś wszystkie karty do stosów docelowych.\n\nZasady:\n- Stosy docelowe: As do Króla, ta sama masta\n- Kolumny: Król do Asa, na przemian kolory\n- Kliknij talię aby odkryć kartę\n- Przeciągnij karty lub kliknij dwukrotnie\n\nF2: Nowa gra');
    }
}

console.log('🃏 Pasjans Klondike załadowany!');
