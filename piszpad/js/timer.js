// Timer pisania
const Timer = {
    // Otwórz modal ustawień timera
    openSetup: function() {
        document.getElementById('timerSetupModal').classList.add('show');
    },
    
    // Zamknij modal ustawień
    closeSetup: function() {
        document.getElementById('timerSetupModal').classList.remove('show');
        const allBtns = document.querySelectorAll('.timer-preset-btn');
        for (let i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.remove('selected');
        }
        document.getElementById('timerCustomInput').value = '';
    },
    
    // Rozpocznij timer
    start: function() {
        const selectedBtn = document.querySelector('.timer-preset-btn.selected');
        const customInput = document.getElementById('timerCustomInput');
        let minutes = 0;
        
        if (customInput.value) {
            minutes = parseInt(customInput.value);
        } else if (selectedBtn) {
            minutes = parseInt(selectedBtn.getAttribute('data-minutes'));
        } else {
            alert('Wybierz czas lub wpisz własny');
            return;
        }
        
        if (minutes < 1) {
            alert('Czas musi być większy niż 0');
            return;
        }
        
        AppState.timerMinutes = minutes;
        AppState.timerSeconds = 0;
        AppState.timerRunning = true;
        
        this.updateDisplay();
        
        const normalDisplay = document.getElementById('timerDisplay');
        const focusDisplay = document.getElementById('focusTimer');
        
        normalDisplay.classList.add('active');
        normalDisplay.classList.remove('finished');
        document.getElementById('timerMessage').textContent = '';
        
        if (AppState.isFocusMode) {
            focusDisplay.classList.add('active');
            focusDisplay.classList.remove('finished');
            focusDisplay.classList.remove('hidden-timer');
            AppState.focusTimerHidden = false;
            document.getElementById('focusTimerMessage').textContent = '';
        }
        
        this.closeSetup();
        
        AppState.timerInterval = setInterval(() => {
            if (AppState.timerSeconds === 0) {
                if (AppState.timerMinutes === 0) {
                    this.finish();
                    return;
                }
                AppState.timerMinutes--;
                AppState.timerSeconds = 59;
            } else {
                AppState.timerSeconds--;
            }
            this.updateDisplay();
        }, 1000);
    },
    
    // Aktualizuj wyświetlanie czasu
    updateDisplay: function() {
        const timeStr = AppState.timerMinutes + ':' + (AppState.timerSeconds < 10 ? '0' : '') + AppState.timerSeconds;
        document.getElementById('timerTime').textContent = timeStr;
        document.getElementById('focusTimerTime').textContent = timeStr;
    },
    
    // Resetuj timer
    reset: function() {
        if (AppState.timerInterval) {
            clearInterval(AppState.timerInterval);
        }
        AppState.timerRunning = false;
        AppState.timerMinutes = 0;
        AppState.timerSeconds = 0;
        
        document.getElementById('timerDisplay').classList.remove('active');
        document.getElementById('timerDisplay').classList.remove('finished');
        document.getElementById('focusTimer').classList.remove('active');
        document.getElementById('focusTimer').classList.remove('finished');
        document.getElementById('timerMessage').textContent = '';
        document.getElementById('focusTimerMessage').textContent = '';
    },
    
    // Zakończ timer
    finish: function() {
        if (AppState.timerInterval) {
            clearInterval(AppState.timerInterval);
        }
        AppState.timerRunning = false;
        
        // Losowy cytat pisarza
        const randomIndex = Math.floor(Math.random() * writerCongratulations.length);
        const congratulation = writerCongratulations[randomIndex];
        
        document.getElementById('timerDisplay').classList.add('finished');
        document.getElementById('timerMessage').textContent = congratulation;
        
        if (AppState.isFocusMode) {
            document.getElementById('focusTimer').classList.add('finished');
            document.getElementById('focusTimerMessage').textContent = congratulation;
        }
    },
    
    // Konfiguruj przyciski presetów
    setupPresets: function() {
        const presetBtns = document.querySelectorAll('.timer-preset-btn');
        for (let i = 0; i < presetBtns.length; i++) {
            presetBtns[i].onclick = function() {
                const allBtns = document.querySelectorAll('.timer-preset-btn');
                for (let j = 0; j < allBtns.length; j++) {
                    allBtns[j].classList.remove('selected');
                }
                this.classList.add('selected');
                document.getElementById('timerCustomInput').value = '';
            };
        }
    },
    
    // Konfiguruj przyciski ukrywania w trybie focus
    setupFocusHideButton: function() {
        document.getElementById('focusTimerHideBtn').onclick = function() {
            document.getElementById('focusTimer').classList.add('hidden-timer');
            AppState.focusTimerHidden = true;
        };
    }
};
