// === Clock ===
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins  = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = hours + ':' + mins;
}
updateClock();
setInterval(updateClock, 1000);

// === Helpers ===
const isMobile = () => window.innerWidth <= 768;

// Z-index counter — each focused window always renders on top
let topZ = 20;

// === Window management ===
function openWindow(name) {
    const win = document.getElementById('win-' + name);
    if (!win) return;
    win.style.display = 'flex';

    // On mobile: center the window in the viewport instead of using
    // the default absolute position (which is often off-screen)
    if (isMobile()) {
        win.style.transform = 'none';
        win.style.width     = '92vw';
        win.style.left      = '4vw';
        win.style.top       = '8px';
    }

    bringToFront(win);

    if (name === 'carousel') {
        currentSlide = 1;
        updateCarousel();
    }

    if (name === 'podcast') {
        const iframe = document.getElementById('podcast-iframe');
        const src = iframe.dataset.src;
        if (src && !iframe.src) {
            iframe.src = src;
        }
    }
}

function closeWindow(name) {
    const win = document.getElementById('win-' + name);
    if (!win) return;
    win.style.display = 'none';

    if (name === 'podcast') {
        const iframe = document.getElementById('podcast-iframe');
        iframe.src = '';
    }
}

function bringToFront(win) {
    topZ++;
    win.style.zIndex = topZ;
}

// === Double-tap detection for mobile ===
// ondblclick never fires on touch screens — this replaces it.
// Attach to any element that uses ondblclick by passing the action as a function.
const tapTimers  = new WeakMap();
const TAP_DELAY  = 300; // ms between taps to count as double

function doubleTapify(el, action) {
    el.addEventListener('touchend', (e) => {
        e.preventDefault(); // prevent the ghost mouse click that follows touch

        if (tapTimers.has(el)) {
            // Second tap within delay — fire the action
            clearTimeout(tapTimers.get(el));
            tapTimers.delete(el);
            action();
        } else {
            // First tap — wait to see if a second comes
            const timer = setTimeout(() => {
                tapTimers.delete(el);
            }, TAP_DELAY);
            tapTimers.set(el, timer);
        }
    });
}

// Wire up double-tap on all icons and folder items after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Desktop icons  — read their ondblclick attr and convert to double-tap
    document.querySelectorAll('.icon').forEach(icon => {
        const attr = icon.getAttribute('ondblclick');
        if (attr) {
            // eslint-disable-next-line no-new-func
            doubleTapify(icon, new Function(attr));
        }
    });

    // Folder items inside windows
    document.querySelectorAll('.folder-item').forEach(item => {
        const attr = item.getAttribute('ondblclick');
        if (attr) {
            doubleTapify(item, new Function(attr));
        }
    });
});

// === Dragging ===
let dragWin     = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.querySelectorAll('.window').forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    // Mouse drag
    titlebar.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const rect = win.getBoundingClientRect();
        win.style.transform = 'none';
        win.style.left = rect.left + 'px';
        win.style.top  = rect.top  + 'px';
        dragWin     = win;
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        bringToFront(win);
        titlebar.style.cursor = 'grabbing';
        e.preventDefault();
    });

    // Touch drag — NON-passive so we can preventDefault and stop page scroll
    titlebar.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const touch = e.touches[0];
        const rect = win.getBoundingClientRect();
        win.style.transform = 'none';
        win.style.left = rect.left + 'px';
        win.style.top  = rect.top  + 'px';
        dragWin     = win;
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;
        bringToFront(win);
        e.preventDefault(); // stops page from scrolling while dragging a window
    }, { passive: false }); // <-- must be false to allow preventDefault

    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });
});

// Global move/end — single listener each
document.addEventListener('mousemove', (e) => {
    if (!dragWin) return;
    dragWin.style.left = (e.clientX - dragOffsetX) + 'px';
    dragWin.style.top  = (e.clientY - dragOffsetY) + 'px';
});

document.addEventListener('mouseup', () => {
    if (!dragWin) return;
    const tb = dragWin.querySelector('.window-titlebar');
    if (tb) tb.style.cursor = 'grab';
    dragWin = null;
});

// Non-passive touchmove on document so window dragging doesn't scroll the page
document.addEventListener('touchmove', (e) => {
    if (!dragWin) return;
    e.preventDefault();
    const touch = e.touches[0];
    dragWin.style.left = (touch.clientX - dragOffsetX) + 'px';
    dragWin.style.top  = (touch.clientY - dragOffsetY) + 'px';
}, { passive: false });

document.addEventListener('touchend', () => { dragWin = null; });

// === Carousel ===
let currentSlide = 1;
const totalSlides = 4;

function updateCarousel() {
    const img     = document.getElementById('carousel-img');
    const counter = document.getElementById('carousel-counter');
    if (img)     img.src = 'slide' + currentSlide + '.png';
    if (counter) counter.textContent = currentSlide + ' / ' + totalSlides;
}

function nextSlide() {
    currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
    updateCarousel();
}

function prevSlide() {
    currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
    updateCarousel();
}

// === Swipe on carousel images ===
(function () {
    let swipeStartX = 0;
    const SWIPE_THRESHOLD = 50;

    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.carousel-viewer')) {
            swipeStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!e.target.closest('.carousel-viewer')) return;
        const dx = e.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (dx < 0) nextSlide(); else prevSlide();
    });
})();

// === Boot sequence ===
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            openWindow('welcome');
        }, 500);
    }, 1000);
});