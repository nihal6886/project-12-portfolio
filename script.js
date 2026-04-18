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
    win.style.display = 'flex';
    bringToFront(win);

    if (name === 'carousel') {
        const img = document.getElementById('carousel-img');
        if (!img.src || img.src === window.location.href) {
            img.src = 'slide1.png';
        }
    }

    if (name === 'podcast') {
        const iframe = document.getElementById('podcast-iframe');
        if (!iframe.src) {
            iframe.src = iframe.dataset.src;
        }
    }
}

function closeWindow(name) {
    document.getElementById('win-' + name).style.display = 'none';

    if (name === 'podcast') {
        document.getElementById('podcast-iframe').src = '';
    }
}

function bringToFront(win) {
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
    win.style.zIndex = 20;
}

document.querySelectorAll('.window').forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    let isDragging = false;
    let offsetX, offsetY;

    titlebar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        bringToFront(win);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            win.style.left = (e.clientX - offsetX) + 'px';
            win.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});

let currentSlide = 1;
const totalSlides = 4;

function updateCarousel() {
    document.getElementById('carousel-img').src = 'slide' + currentSlide + '.png';
    document.getElementById('carousel-counter').textContent = currentSlide + ' / ' + totalSlides;
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
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        openWindow('welcome');
    }, 500);
});