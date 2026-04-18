function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = hours + ':' + mins;
}
updateClock();
setInterval(updateClock, 1000);

function openWindow(name) {
    const win = document.getElementById('win-' + name);
    if (!win) return;
    win.style.display = 'flex';
    bringToFront(win);

    if (name === 'carousel') {
        const img = document.getElementById('carousel-img');
        if (!img.src || img.src === window.location.href || img.src.endsWith('/')) {
            currentSlide = 1;
            updateCarousel();
        }
    }

    if (name === 'podcast') {
        const iframe = document.getElementById('podcast-iframe');
        const savedSrc = iframe.dataset.src;
        if (savedSrc && iframe.src !== savedSrc) {
            iframe.src = savedSrc;
        }
    }
}

function closeWindow(name) {
    const win = document.getElementById('win-' + name);
    if (!win) return;
    win.style.display = 'none';

    if (name === 'podcast') {
        const iframe = document.getElementById('podcast-iframe');
        if (!iframe.dataset.src) {
            iframe.dataset.src = iframe.src;
        }
        iframe.src = '';
    }
}

function bringToFront(win) {
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
    win.style.zIndex = 20;
}

document.querySelectorAll('.window').forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    titlebar.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        bringToFront(win);
        titlebar.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top  = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        titlebar.style.cursor = 'grab';
    });

    titlebar.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const touch = e.touches[0];
        isDragging = true;
        offsetX = touch.clientX - win.offsetLeft;
        offsetY = touch.clientY - win.offsetTop;
        bringToFront(win);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        win.style.left = (touch.clientX - offsetX) + 'px';
        win.style.top  = (touch.clientY - offsetY) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    win.addEventListener('mousedown', () => bringToFront(win));
});

let currentSlide = 1;
const totalSlides = 4;

function updateCarousel() {
    const img = document.getElementById('carousel-img');
    const counter = document.getElementById('carousel-counter');
    if (img) img.src = 'slide' + currentSlide + '.png';
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

window.addEventListener('load', function () {
    const loadingScreen = document.getElementById('loading-screen');
    const podcastIframe = document.getElementById('podcast-iframe');
    if (podcastIframe && podcastIframe.src && !podcastIframe.dataset.src) {
        podcastIframe.dataset.src = podcastIframe.src;
    }

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            openWindow('welcome');
        }, 500);
    }, 800); 
});