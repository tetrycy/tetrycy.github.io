// Funkcje czytania tekstu
const Reading = {
    // Przełącz czytanie
    toggle: function() {
        if (AppState.isReading) {
            this.stop();
        } else {
            this.start();
        }
    },
    
    // Rozpocznij czytanie
    start: function() {
        if (!speechSynthesis) {
            alert('Brak obsługi czytania.');
            return;
        }
        
        const allParagraphs = AppState.editor.querySelectorAll('p');
        const cursorPos = AppState.getCursorPosition();
        
        // Znajdź paragraf, w którym jest kursor
        let textSoFar = 0;
        let startParagraphIndex = 0;
        
        for (let i = 0; i < allParagraphs.length; i++) {
            const paraText = allParagraphs[i].innerText || allParagraphs[i].textContent || '';
            if (textSoFar + paraText.length > cursorPos) {
                startParagraphIndex = i;
                break;
            }
            textSoFar += paraText.length;
        }
        
        // Zbierz paragrafy od pozycji kursora
        AppState.readingParagraphs = [];
        for (let j = startParagraphIndex; j < allParagraphs.length; j++) {
            const text = allParagraphs[j].innerText || allParagraphs[j].textContent || '';
            if (text.trim()) {
                AppState.readingParagraphs.push({
                    element: allParagraphs[j],
                    text: text.trim()
                });
            }
        }
        
        if (AppState.readingParagraphs.length === 0) {
            alert('Brak tekstu do czytania od pozycji kursora.');
            return;
        }
        
        AppState.currentParagraphIndex = 0;
        AppState.isReading = true;
        
        // Zaktualizuj przycisk
        const btn = document.getElementById('readBtn');
        btn.classList.add('active');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
        
        this.readNextParagraph();
    },
    
    // Czytaj kolejny paragraf
    readNextParagraph: function() {
        if (!AppState.isReading || AppState.currentParagraphIndex >= AppState.readingParagraphs.length) {
            this.stop();
            return;
        }
        
        const currentPara = AppState.readingParagraphs[AppState.currentParagraphIndex];
        
        // Usuń poprzednie podświetlenie
        const highlighted = AppState.editor.querySelectorAll('.reading-highlight');
        for (let i = 0; i < highlighted.length; i++) {
            highlighted[i].classList.remove('reading-highlight');
        }
        
        // Podświetl aktualny paragraf
        currentPara.element.classList.add('reading-highlight');
        currentPara.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Utwórz utterance
        const utterance = new SpeechSynthesisUtterance(currentPara.text);
        utterance.lang = 'pl-PL';
        utterance.rate = AppState.speechRate;
        utterance.pitch = 1;
        
        if (AppState.selectedVoice) {
            utterance.voice = AppState.selectedVoice;
        }
        
        utterance.onend = () => {
            if (AppState.isReading) {
                AppState.currentParagraphIndex++;
                this.readNextParagraph();
            }
        };
        
        utterance.onerror = (e) => {
            if (e.error === 'canceled' || e.error === 'interrupted') {
                return;
            }
            this.stop();
            alert('Błąd podczas czytania: ' + e.error);
        };
        
        speechSynthesis.speak(utterance);
    },
    
    // Zatrzymaj czytanie
    stop: function() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        AppState.isReading = false;
        
        // Usuń podświetlenie
        const highlighted = AppState.editor.querySelectorAll('.reading-highlight');
        for (let i = 0; i < highlighted.length; i++) {
            highlighted[i].classList.remove('reading-highlight');
        }
        
        AppState.readingParagraphs = [];
        AppState.currentParagraphIndex = -1;
        
        // Przywróć przycisk
        const btn = document.getElementById('readBtn');
        btn.classList.remove('active');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    }
};
