// Główna inicjalizacja aplikacji
function init() {
    // Inicjalizuj stan aplikacji
    AppState.init();
    AppState.saveState();
    
    // Podłącz obsługę menu opcji
    document.getElementById('newBtn').onclick = () => Editor.newDocument();
    document.getElementById('openBtn').onclick = () => FileHandler.openDocument();
    document.getElementById('saveBtn').onclick = () => FileHandler.saveDocument();
    document.getElementById('exportTxtBtn').onclick = () => FileHandler.exportToTxt();
    document.getElementById('openAsTextBtn').onclick = () => FileHandler.openAsText();
    document.getElementById('exportPdfBtn').onclick = () => FileHandler.exportToPdf();
    document.getElementById('optionsBtn').onclick = () => Editor.toggleOptionsMenu();
    
    // Podłącz przyciski edytora
    document.getElementById('undoBtn').onclick = () => Editor.undo();
    document.getElementById('boldBtn').onclick = () => Editor.formatText('bold');
    document.getElementById('italicBtn').onclick = () => Editor.formatText('italic');
    document.getElementById('underlineBtn').onclick = () => Editor.formatText('underline');
    
    // Podłącz przyciski funkcjonalności
    document.getElementById('focusBtn').onclick = () => FocusMode.toggle();
    document.getElementById('searchBtn').onclick = () => Editor.toggleSearch();
    document.getElementById('readBtn').onclick = () => Reading.toggle();
    document.getElementById('timerBtn').onclick = () => Timer.openSetup();
    document.getElementById('toggleCounterBtn').onclick = () => Editor.toggleWordCount();
    
    // Podłącz selecty
    document.getElementById('fontSelect').onchange = function() {
        AppState.fontFamily = this.value;
        Editor.updateStyle();
    };
    
    document.getElementById('fontSizeSelect').onchange = function() {
        AppState.fontSize = parseInt(this.value);
        Editor.updateStyle();
    };
    
    document.getElementById('speechRateSelect').onchange = function() {
        AppState.speechRate = parseFloat(this.value);
    };
    
    // Podłącz wyszukiwanie
    document.getElementById('findBtn').onclick = () => Editor.doSearch();
    document.getElementById('closeSearchBtn').onclick = () => Editor.toggleSearch();
    document.getElementById('searchInput').onkeydown = function(e) {
        if (e.key === 'Enter') Editor.doSearch();
    };
    
    // Podłącz obsługę plików
    document.getElementById('fileInput').onchange = (e) => FileHandler.loadFile(e);
    document.getElementById('textFileInput').onchange = (e) => FileHandler.loadFileAsText(e);
    
    // Podłącz timer
    Timer.setupPresets();
    document.getElementById('timerCancelBtn').onclick = () => Timer.closeSetup();
    document.getElementById('timerStartBtn').onclick = () => Timer.start();
    document.getElementById('timerCloseBtn').onclick = () => Timer.reset();
    document.getElementById('focusTimerCloseBtn').onclick = () => Timer.reset();
    Timer.setupFocusHideButton();
    
    // Podłącz obsługę klawiatury
    document.onkeydown = (e) => Editor.handleKeyPress(e);
    
    // Podłącz obsługę zmian w edytorze
    AppState.editor.addEventListener('input', function() {
        AppState.saveState();
        AppState.updateWordCount();
    });
    
    AppState.editor.addEventListener('mouseup', () => Editor.updateFormatButtons());
    AppState.editor.addEventListener('keyup', () => Editor.updateFormatButtons());
    
    // Podłącz obsługę kopiowania
    Editor.setupCopyHandler();
    
    // Podłącz zamykanie menu po kliknięciu poza nim
    document.addEventListener('click', function(e) {
        const optionsMenu = document.getElementById('optionsMenu');
        const optionsBtn = document.getElementById('optionsBtn');
        const timerSetupModal = document.getElementById('timerSetupModal');
        
        if (!optionsMenu.contains(e.target) && !optionsBtn.contains(e.target)) {
            optionsMenu.classList.remove('show');
        }
        
        if (e.target === timerSetupModal) {
            Timer.closeSetup();
        }
    });
    
    // Ustaw styl i zaktualizuj licznik
    Editor.updateStyle();
    AppState.updateWordCount();
}

// Uruchom inicjalizację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', init);

// Obsługa automatycznego czytania po załadowaniu (z localStorage)
window.addEventListener('load', function() {
    const textToRead = localStorage.getItem('textToRead');
    const shouldAutoRead = localStorage.getItem('autoReadText');
    
    if (textToRead && shouldAutoRead === 'true') {
        const paragraphs = textToRead.split('\n\n');
        let htmlContent = '';
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            if (para) {
                htmlContent += '<p>' + para + '</p>';
            }
        }
        AppState.editor.innerHTML = htmlContent;
        
        localStorage.removeItem('textToRead');
        localStorage.removeItem('autoReadText');
        
        AppState.undoHistory = [];
        AppState.historyIndex = -1;
        AppState.saveState();
        AppState.updateWordCount();
        
        // Auto-czytanie po 800ms
        setTimeout(function() {
            if (!speechSynthesis) return;
            
            const fullText = AppState.editor.innerText || AppState.editor.textContent || '';
            if (!fullText.trim()) return;
            
            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'pl-PL';
            utterance.rate = AppState.speechRate;
            utterance.pitch = 1;
            
            if (AppState.selectedVoice) {
                utterance.voice = AppState.selectedVoice;
            }
            
            const btn = document.getElementById('readBtn');
            
            utterance.onstart = function() {
                AppState.isReading = true;
                btn.classList.add('active');
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
            };
            
            utterance.onend = function() {
                Reading.stop();
            };
            
            utterance.onerror = function(e) {
                if (e.error === 'canceled' || e.error === 'interrupted') return;
                console.error('Błąd czytania:', e.error);
                Reading.stop();
            };
            
            speechSynthesis.speak(utterance);
        }, 800);
    }
});
