// Aktualizacja czasu w pasku zadań
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('time').textContent = timeString;
}

// Uruchom zegar
updateTime();
setInterval(updateTime, 1000);

// Obsługa przycisku Start i menu
let startMenuOpen = false;

document.getElementById('startBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleStartMenu();
});

function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const programsSubmenu = document.getElementById('programsSubmenu');
    
    startMenuOpen = !startMenuOpen;
    
    if (startMenuOpen) {
        startMenu.classList.add('show');
        document.getElementById('startBtn').classList.add('pressed');
    } else {
        startMenu.classList.remove('show');
        programsSubmenu.classList.remove('show');
        document.getElementById('startBtn').classList.remove('pressed');
    }
}

// Zamknij menu po kliknięciu poza nim
document.addEventListener('click', function(e) {
    const startMenu = document.getElementById('startMenu');
    const programsSubmenu = document.getElementById('programsSubmenu');
    const startBtn = document.getElementById('startBtn');
    
    if (!startMenu.contains(e.target) && !programsSubmenu.contains(e.target) && e.target !== startBtn) {
        startMenu.classList.remove('show');
        programsSubmenu.classList.remove('show');
        startBtn.classList.remove('pressed');
        startMenuOpen = false;
    }
});

// Obsługa elementów menu Start
document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const app = this.getAttribute('data-app');
        
        switch(app) {
            case 'programs':
                toggleProgramsSubmenu();
                break;
            case 'paint':
                openPaint();
                toggleStartMenu();
                break;
            case 'notepad':
                openNotepad();
                toggleStartMenu();
                break;
            case 'calculator':
                openCalculator();
                toggleStartMenu();
                break;
            case 'shutdown':
                showShutdownDialog();
                toggleStartMenu();
                break;
            default:
                alert(`Otwieranie: ${this.querySelector('.menu-text').textContent}`);
                toggleStartMenu();
        }
    });
});

function toggleProgramsSubmenu() {
    const programsSubmenu = document.getElementById('programsSubmenu');
    programsSubmenu.classList.toggle('show');
}

// Funkcje aplikacji - używają systemu okien
function openPaint() {
    openWindow('paint-window', {
        width: 500,
        height: 450
    });
}

function openNotepad() {
    alert('Notatnik - wkrótce dostępny!');
}

function openCalculator() {
    // Używa systemu okien zamiast alertu
    openWindow('calculator-window', {
        width: 250,
        height: 300
    });
}

function showShutdownDialog() {
    if (confirm('Czy chcesz zamknąć system Windows 98?')) {
        alert('System został zamknięty. Możesz bezpiecznie wyłączyć komputer.');
    }
}

// Obsługa kliknięć na ikony pulpitu
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        // Usuń zaznaczenie z innych ikon
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        // Zaznacz kliknięta ikonę
        this.classList.add('selected');
        
        // Akcje dla konkretnych ikon
        const iconId = this.id;
        switch(iconId) {
            case 'my-computer':
                console.log('Kliknięto: Mój komputer');
                // openWindow('my-computer-window');
                break;
            case 'recycle-bin':
                console.log('Kliknięto: Kosz');
                // openWindow('recycle-bin-window');
                break;
            case 'folder-kuba':
                console.log('Kliknięto: Folder Kuby');
                // openWindow('folder-kuba-window');
                break;
            case 'folder-leszek':
                console.log('Kliknięto: Folder Leszka');
                // openWindow('folder-leszek-window');
                break;
            case 'folder-mati':
                console.log('Kliknięto: Folder Matiego');
                // openWindow('folder-mati-window');
                break;
        }
    });
});

// Obsługa kliknięć na pulpit (odznacz ikony)
document.getElementById('desktop').addEventListener('click', function(e) {
    if (e.target === this) {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
    }
});

// Obsługa ikon systemowych
document.querySelectorAll('.system-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const title = this.getAttribute('title');
        alert(`Kliknięto: ${title}`);
    });
});

console.log('Windows 98 Desktop załadowany!');
