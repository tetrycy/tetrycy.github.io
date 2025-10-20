// Tryb Focus
const FocusMode = {
    // Przełącz tryb focus
    toggle: function() {
        if (AppState.isFocusMode) {
            this.exit();
        } else {
            this.enter();
        }
    },
    
    // Włącz tryb focus
    enter: function() {
        AppState.isFocusMode = true;
        
        const focusEditor = document.getElementById('focusEditor');
        const mainText = AppState.editor.innerText || AppState.editor.textContent || '';
        focusEditor.value = mainText;
        
        AppState.lastCursorPosition = 0;
        
        // Ustaw czcionkę
        const family = AppState.fontFamily === 'Times New Roman' ? 'Times New Roman, serif' : 'Libre Baskerville, serif';
        focusEditor.style.fontFamily = family;
        
        document.body.classList.add('focus-active');
        
        const focusMode = document.getElementById('focusMode');
        focusMode.classList.add('active');
        
        // Pokaż elementy UI
        const focusControls = document.getElementById('focusControls');
        const focusCounter = document.getElementById('focusWordCount');
        const focusTimer = document.getElementById('focusTimer');
        
        focusControls.classList.remove('hidden-controls');
        AppState.focusControlsHidden = false;
        
        focusCounter.classList.remove('hidden-counter');
        AppState.focusCounterHidden = false;
        
        if (AppState.timerRunning) {
            focusTimer.classList.add('active');
            focusTimer.classList.remove('hidden-timer');
            AppState.focusTimerHidden = false;
        }
        
        AppState.updateWordCount();
        
        // Obsługa przycisków
        this.setupFocusControls(focusEditor);
        
        // Fullscreen
        setTimeout(() => {
            const elem = document.documentElement;
            
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            }
            
            setTimeout(() => {
                focusEditor.focus();
                focusEditor.setSelectionRange(0, 0);
                focusEditor.scrollTop = 0;
            }, 100);
            
        }, 50);
        
        // Synchronizuj zmiany z głównym edytorem
        focusEditor.oninput = () => {
            const newContent = focusEditor.value;
            if (newContent.trim()) {
                const htmlContent = '<p>' + newContent.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
                AppState.editor.innerHTML = htmlContent;
                AppState.saveState();
                AppState.updateWordCount();
            } else {
                AppState.editor.innerHTML = '<p>Zacznij pisać swój dokument...</p>';
                AppState.updateWordCount();
            }
        };
        
        // Śledź pozycję kursora
        focusEditor.addEventListener('mouseup', () => {
            AppState.lastCursorPosition = focusEditor.selectionStart;
        });
        
        focusEditor.addEventListener('keyup', () => {
            AppState.lastCursorPosition = focusEditor.selectionStart;
        });
        
        // Obsługa wyjścia z fullscreen
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
    },
    
    // Konfiguruj przyciski w trybie focus
    setupFocusControls: function(focusEditor) {
        const focusReadBtn = document.getElementById('focusReadBtn');
        const focusHideBtn = document.getElementById('focusHideBtn');
        const focusCounterHideBtn = document.getElementById('focusCounterHideBtn');
        
        focusReadBtn.onclick = () => {
            if (AppState.isReading) {
                this.stopFocusReading();
            } else {
                focusEditor.focus();
                setTimeout(() => {
                    AppState.lastCursorPosition = focusEditor.selectionStart || 0;
                    this.startFocusReading();
                }, 10);
            }
        };
        
        focusHideBtn.onclick = () => {
            document.getElementById('focusControls').classList.add('hidden-controls');
            AppState.focusControlsHidden = true;
        };
        
        focusCounterHideBtn.onclick = () => {
            document.getElementById('focusWordCount').classList.add('hidden-counter');
            AppState.focusCounterHidden = true;
        };
    },
    
    // Rozpocznij czytanie w trybie focus
    startFocusReading: function() {
        if (!speechSynthesis) return;
        
        const focusEditor = document.getElementById('focusEditor');
        const cursorPos = AppState.lastCursorPosition || 0;
        const text = focusEditor.value.substring(cursorPos);
        
        if (!text.trim()) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';
        utterance.rate = AppState.speechRate;
        utterance.pitch = 1;
        
        if (AppState.selectedVoice) {
            utterance.voice = AppState.selectedVoice;
        }
        
        const focusReadBtn = document.getElementById('focusReadBtn');
        
        utterance.onstart = () => {
            AppState.isReading = true;
            focusReadBtn.classList.add('active');
            focusReadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
        };
        
        utterance.onend = () => {
            this.stopFocusReading();
        };
        
        utterance.onerror = (e) => {
            if (e.error === 'canceled' || e.error === 'interrupted') return;
            this.stopFocusReading();
        };
        
        speechSynthesis.speak(utterance);
    },
    
    // Zatrzymaj czytanie w trybie focus
    stopFocusReading: function() {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            speechSynthesis.cancel();
        }
        AppState.isReading = false;
        const focusReadBtn = document.getElementById('focusReadBtn');
        if (focusReadBtn) {
            focusReadBtn.classList.remove('active');
            focusReadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
        }
    },
    
    // Obsługa zmiany fullscreen
    handleFullscreenChange: function() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                            document.mozFullScreenElement || document.msFullscreenElement);
        
        if (!isFullscreen && AppState.isFocusMode) {
            FocusMode.exit();
        }
    },
    
    // Wyjdź z trybu focus
    exit: function() {
        if (!AppState.isFocusMode) return;
        
        if (AppState.isReading) {
            this.stopFocusReading();
        }
        
        AppState.isFocusMode = false;
        
        // Resetuj widoczność elementów
        const focusControls = document.getElementById('focusControls');
        if (!AppState.focusControlsHidden) {
            focusControls.classList.remove('hidden-controls');
        }
        AppState.focusControlsHidden = false;
        
        const focusCounter = document.getElementById('focusWordCount');
        if (!AppState.focusCounterHidden) {
            focusCounter.classList.remove('hidden-counter');
        }
        AppState.focusCounterHidden = false;
        
        const focusTimer = document.getElementById('focusTimer');
        if (!AppState.focusTimerHidden) {
            focusTimer.classList.remove('hidden-timer');
        }
        AppState.focusTimerHidden = false;
        
        document.body.classList.remove('focus-active');
        
        // Usuń listenery fullscreen
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
        
        // Wyjdź z fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        
        document.getElementById('focusMode').classList.remove('active');
        
        // Synchronizuj zawartość z głównym edytorem
        const focusEditor = document.getElementById('focusEditor');
        if (focusEditor.value.trim()) {
            const htmlContent = '<p>' + focusEditor.value.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
            AppState.editor.innerHTML = htmlContent;
            AppState.saveState();
            AppState.updateWordCount();
        }
        
        setTimeout(() => {
            AppState.editor.focus();
        }, 200);
    }
};
