// === Clock ===
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins  = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = hours + ':' + mins;
}
updateClock();
setInterval(updateClock, 1000);

// === Z-index counter (each focused window always on top) ===
let topZ = 20;

// === Window management ===
function openWindow(name) {
    const win = document.getElementById('win-' + name);
    if (!win) return;
    win.style.display = 'flex';
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
        iframe.src = ''; // stop video playback
    }
}

function bringToFront(win) {
    topZ++;
    win.style.zIndex = topZ;
}

// === Dragging ===
// Single shared drag state — avoids N duplicate listeners on document
let dragWin     = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.querySelectorAll('.window').forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    titlebar.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;

        // Clear CSS transform (welcome window uses translate(-50%,-50%))
        // getBoundingClientRect gives real screen position regardless of transform
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
    }, { passive: true });

    win.addEventListener('mousedown', () => bringToFront(win));
});

// One global move/end handler (not per-window)
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

document.addEventListener('touchmove', (e) => {
    if (!dragWin) return;
    const touch = e.touches[0];
    dragWin.style.left = (touch.clientX - dragOffsetX) + 'px';
    dragWin.style.top  = (touch.clientY - dragOffsetY) + 'px';
}, { passive: true });

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

// === Boot sequence ===
// DOMContentLoaded fires once HTML is parsed — does NOT wait for fonts,
// images, favicon, or external resources. No more stuck loading screen.
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