// Banners Slider
class BannersSlider {
    constructor() {
        this.slider = document.querySelector('.banners-slider');
        this.slides = document.querySelectorAll('.banner-slide');
        this.prevBtn = document.querySelector('.banner-prev');
        this.nextBtn = document.querySelector('.banner-next');
        this.dotsContainer = document.querySelector('.banner-dots');
        this.currentIndex = 0;
        
        if (this.slider && this.slides.length > 0) {
            this.init();
        }
    }

    init() {
        // Set first slide as active
        this.slides[0].classList.add('active');
        
        this.createDots();
        this.setupControls();
        this.startAutoplay();
    }

    createDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'banner-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        this.dots = document.querySelectorAll('.banner-dot');
    }

    setupControls() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    updateSlider() {
        // Remove active class from all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Add active class to current slide
        this.slides[this.currentIndex].classList.add('active');
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetAutoplay();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider();
        this.resetAutoplay();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
        this.resetAutoplay();
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 7000);
    }

    resetAutoplay() {
        clearInterval(this.autoplayInterval);
        this.startAutoplay();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.banners-slider')) {
        new BannersSlider();
    }
});
