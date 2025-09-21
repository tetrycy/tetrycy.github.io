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
            case 'documents':
                openDocuments();
                toggleStartMenu();
                break;
            case 'search':
                openSearch();
                toggleStartMenu();
                break;
            case 'help':
                openHelp();
                toggleStartMenu();
                break;
            case 'run':
                openRun();
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
    openWindow('notepad-window', {
        width: 400,
        height: 350
    });
}

function openCalculator() {
    openWindow('calculator-window', {
        width: 250,
        height: 300
    });
}

function showShutdownDialog() {
    openWindow('shutdown-dialog', {
        width: 350,
        height: 250
    });
}

// Nowe funkcje menu Start
function openDocuments() {
    window.open('https://leszekmilewski.pl', '_blank');
}

function openSearch() {
    window.open('https://www.youtube.com/@Tetrycy', '_blank');
}

function openHelp() {
    window.open('https://patronite.pl/tetrycy', '_blank');
}

function openRun() {
    showBSOD();
}
// Menu Start - dodatkowe funkcje
function openMaps() {
    window.open('https://maps.google.com', '_blank');
    document.getElementById('startMenu').classList.remove('show');
}

function openOutlook() {
    document.getElementById('outlook-window').style.display = 'block';
    document.getElementById('startMenu').classList.remove('show');
}

function closeOutlook() {
    document.getElementById('outlook-window').style.display = 'none';
}

function openSettings() {
    openWindow('settings-window', {
        width: 300,
        height: 220
    });
}

// Blue Screen of Death
function showBSOD() {
    const bsod = document.createElement('div');
    bsod.className = 'bsod';
    bsod.innerHTML = `
        <div class="bsod-content">
            <h1>Windows</h1>
            <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +<br>
            00010E36. The current application will be terminated.</p>
            
            <p>* Press any key to terminate the current application.<br>
            * Press CTRL+ALT+DEL again to restart your computer. You will<br>
            &nbsp;&nbsp;lose any unsaved information in all open applications.</p>
            
            <p>Press any key to continue _</p>
        </div>
    `;
    
    document.body.appendChild(bsod);
    
    // Kliknięcie lub klawisz usuwa BSOD
    const removeBSOD = () => {
        bsod.remove();
        document.removeEventListener('keydown', removeBSOD);
    };
    
    bsod.addEventListener('click', removeBSOD);
    document.addEventListener('keydown', removeBSOD);
}

// Funkcje Ustawień
let isDarkMode = false;

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Aktualizuj checkbox
    const checkbox = document.getElementById('dark-mode-toggle');
    if (checkbox) {
        checkbox.checked = isDarkMode;
    }
}

function startDefragmentation() {
    closeWindow('settings-window');
    showDefragmentation();
}

function showDefragmentation() {
    const defrag = document.createElement('div');
    defrag.className = 'defrag-screen';
    defrag.innerHTML = `
        <div class="defrag-content">
            <h2>Defragmentacja dysku (C:)</h2>
            <div class="defrag-progress">
                <div class="defrag-bar">
                    <div class="defrag-fill" id="defrag-fill"></div>
                </div>
                <div class="defrag-percent" id="defrag-percent">0%</div>
            </div>
            <div class="defrag-blocks" id="defrag-blocks"></div>
            <p class="defrag-status" id="defrag-status">Analizowanie dysku...</p>
            <p class="defrag-help">Naciśnij dowolny klawisz aby anulować</p>
        </div>
    `;
    
    document.body.appendChild(defrag);
    
    // Animacja defragmentacji
    animateDefragmentation();
    
    // Wyłączenie klawiszem
    const removeDefrag = () => {
        defrag.remove();
        document.removeEventListener('keydown', removeDefrag);
    };
    
    defrag.addEventListener('click', removeDefrag);
    document.addEventListener('keydown', removeDefrag);
}

function animateDefragmentation() {
    const blocks = document.getElementById('defrag-blocks');
    const fill = document.getElementById('defrag-fill');
    const percent = document.getElementById('defrag-percent');
    const status = document.getElementById('defrag-status');
    
    // Stwórz bloki
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    for (let i = 0; i < 200; i++) {
        const block = document.createElement('div');
        block.className = 'defrag-block';
        block.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        blocks.appendChild(block);
    }
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 2;
        if (progress > 100) progress = 100;
        
        fill.style.width = progress + '%';
        percent.textContent = Math.floor(progress) + '%';
        
        // Zmień status
        if (progress < 30) {
            status.textContent = 'Analizowanie dysku...';
        } else if (progress < 70) {
            status.textContent = 'Defragmentowanie...';
        } else if (progress < 95) {
            status.textContent = 'Optymalizowanie...';
        } else {
            status.textContent = 'Finalizowanie...';
        }
        
        // Poruszaj blokami
        const blockElements = blocks.children;
        for (let i = 0; i < 10; i++) {
            const randomBlock = blockElements[Math.floor(Math.random() * blockElements.length)];
            if (randomBlock) {
                randomBlock.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                randomBlock.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    randomBlock.style.transform = 'scale(1)';
                }, 100);
            }
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            status.textContent = 'Defragmentacja zakończona pomyślnie';
        }
    }, 100);
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
