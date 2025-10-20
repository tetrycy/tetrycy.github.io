// Funkcje edytora: formatowanie, undo, wyszukiwanie
const Editor = {
    // Formatowanie tekstu (bold, italic, underline)
    formatText: function(command) {
        document.execCommand(command, false, null);
        AppState.editor.focus();
        
        const btnId = command + 'Btn';
        const btn = document.getElementById(btnId);
        if (btn) {
            const isFormatted = document.queryCommandState(command);
            if (isFormatted) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        
        AppState.saveState();
    },
    
    // Aktualizuj przyciski formatowania
    updateFormatButtons: function() {
        const commands = ['bold', 'italic', 'underline'];
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const btn = document.getElementById(cmd + 'Btn');
            if (btn) {
                if (document.queryCommandState(cmd)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        }
    },
    
    // Cofnij (undo)
    undo: function() {
        if (AppState.historyIndex > 0) {
            AppState.historyIndex--;
            AppState.editor.innerHTML = AppState.undoHistory[AppState.historyIndex];
            AppState.editor.focus();
            
            // Ustaw kursor na końcu
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(AppState.editor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    },
    
    // Nowy dokument
    newDocument: function() {
        AppState.editor.innerHTML = '<p>Zacznij pisać swój dokument...</p>';
        AppState.fileName = 'dokument.rtf';
        document.getElementById('fileName').textContent = AppState.fileName;
        
        AppState.undoHistory = [];
        AppState.historyIndex = -1;
        AppState.saveState();
        AppState.updateWordCount();
        document.getElementById('optionsMenu').classList.remove('show');
    },
    
    // Aktualizuj styl czcionki
    updateStyle: function() {
        const family = AppState.fontFamily === 'Times New Roman' ? 'Times New Roman, serif' : 'Libre Baskerville, serif';
        AppState.editor.style.fontFamily = family;
        AppState.editor.style.fontSize = AppState.fontSize + 'pt';
    },
    
    // Wyszukiwanie
    toggleSearch: function() {
        const panel = document.getElementById('searchPanel');
        const btn = document.getElementById('searchBtn');
        if (panel.classList.contains('show')) {
            this.closeSearch();
        } else {
            panel.classList.add('show');
            btn.classList.add('active');
            document.getElementById('searchInput').focus();
        }
    },
    
    closeSearch: function() {
        document.getElementById('searchPanel').classList.remove('show');
        document.getElementById('searchBtn').classList.remove('active');
    },
    
    doSearch: function() {
        const term = document.getElementById('searchInput').value;
        if (term && window.find) {
            window.find(term, false, false, true);
        }
    },
    
    // Przełącz widoczność licznika słów
    toggleWordCount: function() {
        AppState.wordCountVisible = !AppState.wordCountVisible;
        const display = document.getElementById('wordCountDisplay');
        const btn = document.getElementById('toggleCounterBtn');
        
        if (AppState.wordCountVisible) {
            display.classList.remove('hidden');
            btn.classList.add('active');
        } else {
            display.classList.add('hidden');
            btn.classList.remove('active');
        }
    },
    
    // Przełącz menu opcji
    toggleOptionsMenu: function() {
        const menu = document.getElementById('optionsMenu');
        menu.classList.toggle('show');
    },
    
    // Obsługa kopiowania - pojedyncze entery zamiast podwójnych
    setupCopyHandler: function() {
        AppState.editor.addEventListener('copy', function(e) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            
            const paragraphs = container.querySelectorAll('p');
            const textParts = [];
            
            for (let i = 0; i < paragraphs.length; i++) {
                const text = paragraphs[i].innerText || paragraphs[i].textContent || '';
                if (text.trim()) {
                    textParts.push(text);
                }
            }
            
            if (textParts.length === 0) {
                textParts.push(selection.toString());
            }
            
            const plainText = textParts.join('\n');
            
            e.clipboardData.setData('text/plain', plainText);
            e.preventDefault();
        });
    },
    
    // Obsługa klawiszy skrótowych
    handleKeyPress: function(e) {
        if (e.ctrlKey) {
            if (e.key === 'n') { e.preventDefault(); this.newDocument(); }
            if (e.key === 's') { e.preventDefault(); FileHandler.saveDocument(); }
            if (e.key === 'o') { e.preventDefault(); FileHandler.openDocument(); }
            if (e.key === 'f') { e.preventDefault(); this.toggleSearch(); }
            if (e.key === 'r') { e.preventDefault(); Reading.toggle(); }
            if (e.key === 'z') { e.preventDefault(); this.undo(); }
            if (e.key === 'b') { e.preventDefault(); this.formatText('bold'); }
            if (e.key === 'i') { e.preventDefault(); this.formatText('italic'); }
            if (e.key === 'u') { e.preventDefault(); this.formatText('underline'); }
        }
        if (e.key === 'F11') {
            e.preventDefault();
            FocusMode.toggle();
        }
        if (e.key === 'Escape') {
            if (AppState.isFocusMode) {
                FocusMode.exit();
            } else {
                this.closeSearch();
                if (AppState.isReading) Reading.stop();
            }
        }
    }
};
