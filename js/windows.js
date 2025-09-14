// System zarządzania oknami Windows 98
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndex = 100;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        // Inicjalizuj wszystkie istniejące okna
        document.querySelectorAll('.window').forEach(windowEl => {
            this.registerWindow(windowEl);
        });
        
        // Globalne event listenery
        document.addEventListener('mousedown', this.handleGlobalMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
    }
    
    registerWindow(windowEl) {
        const windowId = windowEl.id;
        
        if (this.windows.has(windowId)) return;
        
        const windowData = {
            element: windowEl,
            isMinimized: false,
            isMaximized: false,
            originalBounds: null,
            zIndex: this.zIndex++
        };
        
        this.windows.set(windowId, windowData);
        
        // Dodaj event listenery dla tego okna
        this.setupWindowEvents(windowEl);
        
        // Wyśrodkuj okno przy pierwszym pokazaniu
        this.centerWindow(windowEl);
    }
    
    setupWindowEvents(windowEl) {
        const header = windowEl.querySelector('.window-header');
        const controls = windowEl.querySelectorAll('.window-btn');
        
        // Przeciąganie okna
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('window-btn')) return;
                this.startDrag(windowEl, e);
            });
            
            header.addEventListener('dblclick', () => {
                this.toggleMaximize(windowEl.id);
            });
        }
        
        // Przyciski kontrolne
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                
                switch(action) {
                    case 'close':
                        this.closeWindow(windowEl.id);
                        break;
                    case 'minimize':
                        this.minimizeWindow(windowEl.id);
                        break;
                    case 'maximize':
                        this.toggleMaximize(windowEl.id);
                        break;
                }
            });
        });
        
        // Focus przy kliknięciu na okno
        windowEl.addEventListener('mousedown', () => {
            this.focusWindow(windowEl.id);
        });
    }
    
    openWindow(windowId, options = {}) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return false;
        
        const windowEl = windowData.element;
        
        // Resetuj stan okna
        windowData.isMinimized = false;
        windowEl.classList.remove('minimized', 'maximized');
        
        // Pokaż okno
        windowEl.classList.add('show', 'opening');
        windowEl.style.zIndex = this.zIndex++;
        windowData.zIndex = this.zIndex;
        
        // Usuń animację po zakończeniu
        setTimeout(() => {
            windowEl.classList.remove('opening');
        }, 150);
        
        // Ustawiania pozycji i rozmiaru
        if (options.width) windowEl.style.width = options.width + 'px';
        if (options.height) windowEl.style.height = options.height + 'px';
        if (options.x !== undefined) windowEl.style.left = options.x + 'px';
        if (options.y !== undefined) windowEl.style.top = options.y + 'px';
        
        this.focusWindow(windowId);
        this.addToTaskbar(windowId);
        
        return true;
    }
    
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = windowData.element;
        
        windowEl.classList.add('closing');
        
        setTimeout(() => {
            windowEl.classList.remove('show', 'closing');
            this.removeFromTaskbar(windowId);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
        }, 100);
    }
    
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = windowData.element;
        
        windowData.isMinimized = true;
        windowEl.classList.add('minimized');
        
        if (this.activeWindow === windowId) {
            this.activeWindow = null;
        }
        
        this.updateTaskbarButton(windowId, 'minimized');
    }
    
    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = windowData.element;
        
        if (windowData.isMinimized) {
            windowData.isMinimized = false;
            windowEl.classList.remove('minimized');
            this.focusWindow(windowId);
        }
        
        this.updateTaskbarButton(windowId, 'active');
    }
    
    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = windowData.element;
        
        if (windowData.isMaximized) {
            // Przywróć rozmiar
            windowData.isMaximized = false;
            windowEl.classList.remove('maximized');
            
            if (windowData.originalBounds) {
                windowEl.style.left = windowData.originalBounds.left;
                windowEl.style.top = windowData.originalBounds.top;
                windowEl.style.width = windowData.originalBounds.width;
                windowEl.style.height = windowData.originalBounds.height;
            }
        } else {
            // Zapamiętaj obecny rozmiar
            windowData.originalBounds = {
                left: windowEl.style.left || '100px',
                top: windowEl.style.top || '100px',
                width: windowEl.style.width || '400px',
                height: windowEl.style.height || '300px'
            };
            
            // Maksymalizuj
            windowData.isMaximized = true;
            windowEl.classList.add('maximized');
        }
    }
    
    focusWindow(windowId) {
        // Usuń focus z poprzedniego okna
        if (this.activeWindow) {
            const prevWindow = this.windows.get(this.activeWindow);
            if (prevWindow) {
                prevWindow.element.classList.remove('active');
                const prevHeader = prevWindow.element.querySelector('.window-header');
                if (prevHeader) prevHeader.classList.add('inactive');
            }
        }
        
        // Ustaw nowe aktywne okno
        const windowData = this.windows.get(windowId);
        if (windowData) {
            this.activeWindow = windowId;
            windowData.element.classList.add('active');
            windowData.element.style.zIndex = this.zIndex++;
            windowData.zIndex = this.zIndex;
            
            const header = windowData.element.querySelector('.window-header');
            if (header) header.classList.remove('inactive');
            
            this.updateTaskbarButton(windowId, 'active');
        }
    }
    
    startDrag(windowEl, e) {
        const windowData = Array.from(this.windows.values()).find(w => w.element === windowEl);
        if (!windowData || windowData.isMaximized) return;
        
        this.isDragging = true;
        this.draggedWindow = windowEl;
        
        const rect = windowEl.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        document.body.style.userSelect = 'none';
        this.focusWindow(windowEl.id);
    }
    
    centerWindow(windowEl) {
        const width = parseInt(windowEl.style.width) || 400;
        const height = parseInt(windowEl.style.height) || 300;
        
        const x = Math.max(0, (window.innerWidth - width) / 2);
        const y = Math.max(0, (window.innerHeight - height - 60) / 2);
        
        windowEl.style.left = x + 'px';
        windowEl.style.top = y + 'px';
    }
    
    addToTaskbar(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const title = windowData.element.querySelector('.window-title').textContent;
        const taskbarMiddle = document.querySelector('.taskbar-middle');
        
        // Sprawdź czy przycisk już istnieje
        let button = document.getElementById(`taskbar-${windowId}`);
        if (!button) {
            button = document.createElement('div');
            button.className = 'taskbar-app';
            button.id = `taskbar-${windowId}`;
            button.textContent = title;
            
            button.addEventListener('click', () => {
                if (windowData.isMinimized) {
                    this.restoreWindow(windowId);
                } else if (this.activeWindow === windowId) {
                    this.minimizeWindow(windowId);
                } else {
                    this.focusWindow(windowId);
                }
            });
            
            taskbarMiddle.appendChild(button);
        }
    }
    
    removeFromTaskbar(windowId) {
        const button = document.getElementById(`taskbar-${windowId}`);
        if (button) {
            button.remove();
        }
    }
    
    updateTaskbarButton(windowId, state) {
        const button = document.getElementById(`taskbar-${windowId}`);
        if (!button) return;
        
        button.className = 'taskbar-app';
        if (state === 'active') {
            button.classList.add('active');
        } else if (state === 'minimized') {
            button.classList.add('minimized');
        }
    }
    
    handleGlobalMouseDown(e) {
        // Usuń focus z okien jeśli kliknięto poza nimi
        if (!e.target.closest('.window') && !e.target.closest('.taskbar')) {
            if (this.activeWindow) {
                const windowData = this.windows.get(this.activeWindow);
                if (windowData) {
                    windowData.element.classList.remove('active');
                    const header = windowData.element.querySelector('.window-header');
                    if (header) header.classList.add('inactive');
                }
                this.activeWindow = null;
            }
        }
    }
    
    handleGlobalMouseMove(e) {
        if (this.isDragging && this.draggedWindow) {
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            // Ogranicz pozycję do granic ekranu
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            
            this.draggedWindow.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
            this.draggedWindow.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
        }
    }
    
    handleGlobalMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedWindow = null;
            document.body.style.userSelect = '';
        }
    }
}

// Inicjalizuj system okien
const windowManager = new WindowManager();

// Funkcje globalne do użytku w aplikacjach
window.openWindow = (windowId, options) => windowManager.openWindow(windowId, options);
window.closeWindow = (windowId) => windowManager.closeWindow(windowId);
window.minimizeWindow = (windowId) => windowManager.minimizeWindow(windowId);
window.maximizeWindow = (windowId) => windowManager.toggleMaximize(windowId);
