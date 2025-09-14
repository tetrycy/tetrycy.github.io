// Notatnik Windows 98 - Podstawowa funkcjonalność
let notepadTextarea = null;

function initNotepad() {
    notepadTextarea = document.getElementById('notepad-textarea');
    
    if (!notepadTextarea) {
        setTimeout(initNotepad, 100);
        return;
    }
    
    // Obsługa skrótów klawiszowych
    notepadTextarea.addEventListener('keydown', handleNotepadKeys);
    
    // Focus przy otwieraniu okna
    notepadTextarea.addEventListener('focus', () => {
        notepadTextarea.style.caretColor = 'black';
    });
}

function handleNotepadKeys(e) {
    // Ctrl+A - zaznacz wszystko
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        notepadTextarea.select();
    }
    
    // Ctrl+Z - cofnij (domyślnie obsługiwane przez przeglądarkę)
    // Ctrl+Y - powtórz (domyślnie obsługiwane przez przeglądarkę)
}

// Inicjalizuj Notatnik
setTimeout(initNotepad, 200);
