// Minimal Mobile Script - tylko pełnoekranowe aplikacje
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

let originalOpenWindow = null;

function initMobileSupport() {
    if (window.openWindow && !originalOpenWindow) {
        originalOpenWindow = window.openWindow;
    }
    
    window.openWindow = function(windowId, options = {}) {
        if (isMobileDevice()) {
            return openMobileWindow(windowId, options);
        } else {
            return originalOpenWindow(windowId, options);
        }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
}

function openMobileWindow(windowId, options = {}) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return false;
    
    document.querySelectorAll('.window.mobile-fullscreen').forEach(win => {
        if (win.id !== windowId) {
            closeMobileWindow(win.id);
        }
    });
    
    windowEl.classList.remove('minimized', 'maximized');
    windowEl.classList.add('show', 'mobile-fullscreen', 'opening');
    
    if (windowId.includes('paint')) {
        windowEl.classList.add('paint-mobile');
        setTimeout(() => initMobilePaint(), 100);
    } else if (windowId.includes('calculator')) {
        windowEl.classList.add('calculator-mobile');
    } else if (windowId.includes('minesweeper')) {
        windowEl.classList.add('minesweeper-mobile');
    } else if (windowId.includes('notepad')) {
        windowEl.classList.add('notepad-mobile');
    } else if (windowId.includes('solitaire')) {
        windowEl.classList.add('solitaire-mobile');
    }
    
    setTimeout(() => windowEl.classList.remove('opening'), 150);
    
    const taskbar = document.querySelector('.taskbar');
    if (taskbar) taskbar.style.display = 'none';
    
    return true;
}

function closeMobileWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    
    windowEl.classList.remove('mobile-fullscreen', 'paint-mobile', 'calculator-mobile', 'minesweeper-mobile', 'notepad-mobile', 'solitaire-mobile', 'show');
    
    const taskbar = document.querySelector('.taskbar');
    if (taskbar) taskbar.style.display = 'flex';
}

function initMobilePaint() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    canvas.width = Math.min(rect.width - 24, window.innerWidth - 40);
    canvas.height = Math.min(rect.height - 150, window.innerHeight - 250);
    
    // Touch support dla Paint
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const getEventPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    };
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const pos = getEventPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getEventPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDrawing = false;
    }, { passive: false });
}

function handleOrientationChange() {
    setTimeout(() => {
        if (isMobileDevice()) {
            document.querySelectorAll('.window.mobile-fullscreen').forEach(windowEl => {
                if (windowEl.id.includes('paint')) {
                    initMobilePaint();
                }
            });
        }
    }, 300);
}

function handleResize() {
    // Obsługa przełączania desktop/mobile
}

// Nadpisz closeWindow
let originalCloseWindow = window.closeWindow;
window.closeWindow = function(windowId) {
    if (isMobileDevice()) {
        closeMobileWindow(windowId);
    } else if (originalCloseWindow) {
        originalCloseWindow(windowId);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileSupport, 100);
});

if (document.readyState !== 'loading') {
    setTimeout(initMobileSupport, 100);
}
