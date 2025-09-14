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

// Obsługa przycisku Start
document.getElementById('startBtn').addEventListener('click', function() {
    this.classList.toggle('pressed');
    alert('Menu Start - wkrótce więcej funkcji!');
    setTimeout(() => {
        this.classList.remove('pressed');
    }, 100);
});

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
                // Tutaj będzie otwieranie okna "Mój komputer"
                break;
            case 'recycle-bin':
                console.log('Kliknięto: Kosz');
                // Tutaj będzie otwieranie kosza
                break;
            case 'folder-kuba':
                console.log('Kliknięto: Folder Kuby');
                // Tutaj będzie otwieranie folderu Kuby
                break;
            case 'folder-leszek':
                console.log('Kliknięto: Folder Leszka');
                // Tutaj będzie otwieranie folderu Leszka
                break;
            case 'folder-mati':
                console.log('Kliknięto: Folder Matiego');
                // Tutaj będzie otwieranie folderu Matiego
                break;
        }
    });
});

// Obsługa kliknięć na pulpit (odznacz ikony)
document.getElementById('desktop').addEventListener('click', function(e) {
    // Sprawdź czy kliknięto na pusty obszar pulpitu
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
