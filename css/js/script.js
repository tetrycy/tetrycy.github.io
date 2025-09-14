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
    alert('Menu Start - wkrótce więcej funkcji!');
});

// Podstawowa obsługa kliknięć na pulpicie
document.getElementById('desktop').addEventListener('click', function(e) {
    console.log('Kliknięto na pulpit');
});

console.log('Windows 98 Desktop załadowany!');
