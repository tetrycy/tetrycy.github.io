// ============================================
// INICJALIZACJA GRY I EVENT LISTENERS
// ============================================

// Uruchomienie po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    generateCoachOptions();
    showFactionSelectModal();
});

// ============================================
// GENEROWANIE OPCJI TRENERÓW
// ============================================

function generateCoachOptions() {
    const container = document.getElementById('coach-options');
    container.innerHTML = '';
    
    coaches.forEach(coach => {
        const option = document.createElement('div');
        option.className = 'faction-option';
        option.onclick = () => selectCoach(coach.id);
        
        const typeText = coach.type === 'passive' ? 'PASYWNY' : `AKTYWNY (${coach.cost} many)`;
        
        option.innerHTML = `
            <div class="faction-emoji">${coach.emoji}</div>
            <h3>${coach.name}</h3>
            <p style="color: #000080; font-weight: bold; margin-bottom: 4px;">${typeText}</p>
            <p>${coach.description}</p>
        `;
        
        container.appendChild(option);
    });
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Przycisk zakończenia tury
    document.getElementById('end-turn-btn').onclick = endTurn;
    
    // Przycisk nowej gry
    document.getElementById('new-game-btn').onclick = newGame;
    
    // Przyciski wyboru frakcji
    document.getElementById('faction1-option').onclick = () => selectFaction('faction1');
    document.getElementById('faction2-option').onclick = () => selectFaction('faction2');
    
    // Przycisk umiejętności trenera gracza
    document.getElementById('player-coach-btn').onclick = () => {
        if (gameState.player.field.length === 0) {
            addLog("Nie masz zawodnikow na boisku!", 'play');
            return;
        }
        activateCoachAbility('player');
    };
    
    // Atak na bramkarza bota
    document.getElementById('bot-goalkeeper').onclick = () => {
        if (gameState.attackingCard !== null && gameState.currentPlayer === 'player') {
            const botHasTaunt = gameState.bot.field.some(card => hasAbility(card, 'taunt'));
            if (!botHasTaunt) {
                attack('player', gameState.attackingCard, 'bot', null);
                gameState.attackingCard = null;
                document.getElementById('attack-indicator').classList.remove('active');
            } else {
                addLog("Obronca blokuje atak na bramkarza!", 'attack');
            }
        }
    };
}

// ============================================
// FUNKCJE POMOCNICZE UI
// ============================================

function showFactionSelectModal() {
    document.getElementById('faction-select-modal').classList.add('active');
}

function hideFactionSelectModal() {
    document.getElementById('faction-select-modal').classList.remove('active');
}

function showGameOverModal() {
    document.getElementById('game-over-modal').classList.add('active');
}

function hideGameOverModal() {
    document.getElementById('game-over-modal').classList.remove('active');
}

// ============================================
// DEBUG (opcjonalne - możesz usunąć)
// ============================================

// Dodaj do window dla łatwego debugowania w konsoli
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.debugInfo = function() {
        console.log('=== GAME STATE ===');
        console.log('Turn:', gameState.turn);
        console.log('Current Player:', gameState.currentPlayer);
        console.log('Player Mana:', gameState.player.mana + '/' + gameState.player.maxMana);
        console.log('Player Hand:', gameState.player.hand.length, 'cards');
        console.log('Player Field:', gameState.player.field.length, 'cards');
        console.log('Bot Mana:', gameState.bot.mana + '/' + gameState.bot.maxMana);
        console.log('Bot Hand:', gameState.bot.hand.length, 'cards');
        console.log('Bot Field:', gameState.bot.field.length, 'cards');
        console.log('==================');
    };
}

console.log('Football Card Game - Windows 95 Edition');
console.log('Gra załadowana! Wybierz frakcję aby rozpocząć.');
console.log('Wpisz debugInfo() w konsoli aby zobaczyć stan gry.');
