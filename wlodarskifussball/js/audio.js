// audio.js - System zarządzania dźwiękiem
const AudioSystem = {
    sounds: {},
    isMuted: false,
    musicVolume: 0.4,
    sfxVolume: 0.6,
    
    init() {
        // Definicje dźwięków - WPISZ ŚCIEŻKI DO SWOICH PLIKÓW MP3
        this.sounds = {
            welcome: {
                audio: new Audio('wilkommen.mp3'),
                loop: true,
                volume: 0.8,
                type: 'music'
            },
            menu: {
                audio: new Audio('menu2.mp3'),
                loop: true,
                volume: 0.6,
                type: 'music'
            },
            goalScored: {
                audio: new Audio('wunderbar.mp3'),
                loop: false,
                volume: 0.8,
                type: 'sfx'
            },
            goalScored2: {
                audio: new Audio('weltklasse.mp3'),
                loop: false,
                volume: 0.8,
                type: 'sfx'
            },
            goalConceded: {
                audio: new Audio('schade.mp3'),
                loop: false,
                volume: 0.8,
                type: 'sfx'
            }
        };
        
        // Ustaw właściwości dla każdego dźwięku
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            sound.audio.loop = sound.loop;
            sound.audio.volume = sound.volume * (sound.type === 'music' ? this.musicVolume : this.sfxVolume);
            sound.audio.preload = 'auto';
        });
    },
    
    play(soundName) {
        if (this.isMuted) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Dźwięk ${soundName} nie istnieje`);
            return;
        }
        
        // Reset dla efektów dźwiękowych (żeby mogły się nakładać)
        if (!sound.loop) {
            sound.audio.currentTime = 0;
        }
        
        const playPromise = sound.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log(`Nie można odtworzyć ${soundName}:`, error);
            });
        }
    },
    
    stop(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        sound.audio.pause();
        sound.audio.currentTime = 0;
    },
    
    stopAll() {
        Object.keys(this.sounds).forEach(key => {
            this.stop(key);
        });
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopAll();
        }
        
        return this.isMuted;
    },
    
    playRandom(soundNames) {
        const randomSound = soundNames[Math.floor(Math.random() * soundNames.length)];
        this.play(randomSound);
    }
};

// Inicjalizuj system audio po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    AudioSystem.init();
});
