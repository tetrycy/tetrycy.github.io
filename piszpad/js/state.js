// Zarządzanie stanem aplikacji
const AppState = {
    // Elementy DOM
    editor: null,
    
    // Stan dokumentu
    fileName: 'dokument.rtf',
    
    // Ustawienia edytora
    fontFamily: 'Libre Baskerville',
    fontSize: 12,
    speechRate: 1.0,
    
    // Historia zmian (undo)
    undoHistory: [],
    historyIndex: -1,
    
    // Czytanie tekstu
    isReading: false,
    readingParagraphs: [],
    currentParagraphIndex: -1,
    selectedVoice: null,
    lastCursorPosition: 0,
    
    // Tryb focus
    isFocusMode: false,
    focusControlsHidden: false,
    focusCounterHidden: false,
    focusTimerHidden: false,
    
    // Licznik słów
    wordCountVisible: true,
    
    // Timer
    timerMinutes: 0,
    timerSeconds: 0,
    timerInterval: null,
    timerRunning: false,
    
    // Inne
    openAsTextMode: false,
    
    // Inicjalizacja stanu
    init: function() {
        this.editor = document.getElementById('editor');
        this.loadVoices();
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    },
    
    // Ładowanie głosów do czytania
    loadVoices: function() {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) return;
        
        // Szukaj polskiego głosu Paulina
        for (let i = 0; i < voices.length; i++) {
            if (voices[i].lang.includes('pl') && voices[i].name.includes('Paulina')) {
                this.selectedVoice = voices[i];
                console.log('Używam głosu:', voices[i].name);
                return;
            }
        }
        
        // Szukaj dowolnego polskiego głosu
        for (let i = 0; i < voices.length; i++) {
            if (voices[i].lang.includes('pl')) {
                this.selectedVoice = voices[i];
                console.log('Używam głosu:', voices[i].name);
                return;
            }
        }
        
        console.log('Brak polskiego głosu, używam domyślnego');
    },
    
    // Zapisz stan do historii (dla undo)
    saveState: function() {
        const currentState = this.editor.innerHTML;
        
        if (this.undoHistory.length === 0 || this.undoHistory[this.historyIndex] !== currentState) {
            this.undoHistory = this.undoHistory.slice(0, this.historyIndex + 1);
            this.undoHistory.push(currentState);
            this.historyIndex = this.undoHistory.length - 1;
            
            // Ogranicz historię do 50 ostatnich stanów
            if (this.undoHistory.length > 50) {
                this.undoHistory = this.undoHistory.slice(-50);
                this.historyIndex = this.undoHistory.length - 1;
            }
        }
    },
    
    // Aktualizuj licznik słów
    updateWordCount: function() {
        const text = this.editor.innerText || this.editor.textContent || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const chars = text.length;
        const countText = words.length + ' słów | ' + chars + ' znaków';
        
        document.getElementById('wordCountDisplay').textContent = countText;
        
        if (this.isFocusMode) {
            document.getElementById('focusCounterText').textContent = countText;
        }
    },
    
    // Pobierz pozycję kursora
    getCursorPosition: function() {
        const sel = window.getSelection();
        if (sel.rangeCount === 0) return 0;
        const range = sel.getRangeAt(0);
        const pre = range.cloneRange();
        pre.selectNodeContents(this.editor);
        pre.setEnd(range.startContainer, range.startOffset);
        return pre.toString().length;
    }
};
