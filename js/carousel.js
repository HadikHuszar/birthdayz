/**
 * BIRTHDAY CAROUSEL JAVASCRIPT - FINALE FIXED VERSION
 * ========================================================================
 * Feature-rich carousel with video support, sound controls, and animations
 * ========================================================================
 */

class FeatureCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 27;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.currentSlideEl = document.getElementById('currentSlide');
        this.totalSlidesEl = document.getElementById('totalSlides');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.progressContainer = document.getElementById('videoProgress');
        this.isAnimating = false;
        this.autoPlayTimer = null;
        this.videoEndListeners = [];
        this.isMuted = false;
        this.isPaused = false;
        this.progressInterval = null;

        this.init();
    }

    init() {
        this.updateCounter();
        this.createParticles();
        this.bindEvents();
        this.setupVideoListeners();
        this.setupSoundControl();
        this.startAutoPlay();
        this.setAllVideosMuted(false);
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        for (let j = 0; j < 20; j++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
            container.appendChild(particle);
        }
    }

    setupSoundControl() {
        if (!this.soundBtn) return;
        
        this.soundBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                this.soundBtn.classList.add('muted');
                this.soundBtn.querySelector('i').textContent = 'volume_off';
            } else {
                this.soundBtn.classList.remove('muted');
                this.soundBtn.querySelector('i').textContent = 'volume_up';
            }
            this.setAllVideosMuted(this.isMuted);
        });
        
        setTimeout(() => {
            if (this.slides.length > 0 && this.currentSlide < this.slides.length) {
                const currentVideo = this.slides[this.currentSlide].querySelector('video');
                if (currentVideo && currentVideo.muted) {
                    this.isMuted = true;
                    this.soundBtn.classList.add('muted');
                    this.soundBtn.querySelector('i').textContent = 'volume_off';
                }
            }
        }, 500);
    }

    setAllVideosMuted(muted) {
        this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            const audio = slide.querySelector('audio');
            if (video) {
                if (!window.userHasInteracted || muted) {
                    video.muted = true;
                } else {
                    video.muted = false;
                }
            }
            if (audio) {
                if (!window.userHasInteracted || muted) {
                    audio.muted = true;
                } else {
                    audio.muted = false;
                }
            }
        });
    }

    updateProgressBar(currentTime, duration) {
        if (!this.progressContainer) return;
        
        const progressRing = this.progressContainer.querySelector('.progress-ring__progress');
        const progressTime = this.progressContainer.querySelector('.progress-time');
        
        if (!progressRing || !progressTime) return;
        
        const remaining = Math.max(0, duration - currentTime);
        const remainingSeconds = Math.ceil(remaining);
        const progress = currentTime / duration;
        
        progressTime.textContent = remainingSeconds;
        
        const circumference = 131.95;
        const offset = circumference - (progress * circumference);
        progressRing.style.strokeDashoffset = offset;
    }

    startProgressTracking(media) {
        this.stopProgressTracking();
        
        const updateProgress = () => {
            if (media && !media.paused && media.duration) {
                this.updateProgressBar(media.currentTime, media.duration);
            }
        };
        
        this.progressInterval = setInterval(updateProgress, 100);
        updateProgress();
    }

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    resetProgressBar() {
        if (!this.progressContainer) return;
        
        const progressRing = this.progressContainer.querySelector('.progress-ring__progress');
        const progressTime = this.progressContainer.querySelector('.progress-time');
        
        if (progressRing) {
            progressRing.style.strokeDashoffset = 131.95;
        }
        if (progressTime) {
            progressTime.textContent = '0';
        }
    }

    setupVideoListeners() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            const audio = slide.querySelector('audio');
            
            if (video) {
                video.loop = false;
                
                const listener = () => {
                    console.log(`Video ended on slide ${index}, current slide: ${this.currentSlide}`);
                    if (this.currentSlide === index && !this.isAnimating && !this.isPaused) {
                        // Check if this is the last slide - FIXED LOGIC
                        if (index === this.totalSlides - 1) {
                            console.log("🎉 LAST SLIDE REACHED - TRIGGERING FINALE! 🎉");
                            this.showBirthdayFinale();
                        } else {
                            console.log(`Moving to next slide from ${index}`);
                            this.nextSlide();
                        }
                    }
                };
                this.videoEndListeners.push({ video: video, listener: listener });
                video.addEventListener('ended', listener);
                
                // Progress tracking for videos
                video.addEventListener('play', () => {
                    if (index === this.currentSlide) {
                        this.startProgressTracking(video);
                    }
                });
                
                video.addEventListener('pause', () => {
                    if (index === this.currentSlide) {
                        this.stopProgressTracking();
                    }
                });
                
                video.addEventListener('loadedmetadata', () => {
                    if (index === this.currentSlide && video.duration) {
                        this.updateProgressBar(0, video.duration);
                    }
                });
                
                video.addEventListener('canplay', () => {
                    if (index === this.currentSlide) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                if (!window.userHasInteracted || this.isMuted) {
                                    video.muted = true;
                                    this.isMuted = true;
                                    if (this.soundBtn) {
                                        this.soundBtn.classList.add('muted');
                                        const icon = this.soundBtn.querySelector('i');
                                        if (icon) icon.textContent = 'volume_off';
                                    }
                                    video.play().catch(e => console.log("Even muted autoplay prevented:", e));
                                }
                            });
                        }
                    }
                });
            }
            
            if (audio) {
                audio.loop = false;
                
                const listener = () => {
                    console.log(`Audio ended on slide ${index}, current slide: ${this.currentSlide}`);
                    if (this.currentSlide === index && !this.isAnimating && !this.isPaused) {
                        // Check if this is the last slide - FIXED LOGIC
                        if (index === this.totalSlides - 1) {
                            console.log("🎉 LAST SLIDE AUDIO REACHED - TRIGGERING FINALE! 🎉");
                            this.showBirthdayFinale();
                        } else {
                            console.log(`Moving to next slide from audio ${index}`);
                            this.nextSlide();
                        }
                    }
                };
                this.videoEndListeners.push({ video: audio, listener: listener });
                audio.addEventListener('ended', listener);
                
                // Progress tracking for audio
                audio.addEventListener('play', () => {
                    if (index === this.currentSlide) {
                        this.startProgressTracking(audio);
                    }
                });
                
                audio.addEventListener('pause', () => {
                    if (index === this.currentSlide) {
                        this.stopProgressTracking();
                    }
                });
                
                audio.addEventListener('loadedmetadata', () => {
                    if (index === this.currentSlide && audio.duration) {
                        this.updateProgressBar(0, audio.duration);
                    }
                });
                
                audio.addEventListener('canplaythrough', () => {
                    if (index === this.currentSlide) {
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                if (!window.userHasInteracted || this.isMuted) {
                                    audio.muted = true;
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    bindEvents() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                console.log("Next button clicked");
                this.clearAutoPlay();
                this.nextSlide();
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                console.log("Prev button clicked");
                this.clearAutoPlay();
                this.prevSlide();
            });
        }
        
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                console.log("Pause button clicked");
                this.togglePause();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                console.log("Left arrow pressed");
                this.clearAutoPlay();
                this.prevSlide();
            }
            if (e.key === 'ArrowRight') {
                console.log("Right arrow pressed");
                this.clearAutoPlay();
                this.nextSlide();
            }
            if (e.key === 'm' || e.key === 'M') {
                if (this.soundBtn) this.soundBtn.click();
            }
            if (e.key === ' ' || e.key === 'Spacebar') {
                this.togglePause();
                e.preventDefault();
            }
        });
        
        this.setupTouchEvents();
        
        document.addEventListener('wheel', (e) => {
            if (document.querySelector('.carousel-container:not(.hidden)')) {
                e.preventDefault();
                if (this.isAnimating) return;
                this.clearAutoPlay();
                if (e.deltaY > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: false });
        
        document.addEventListener('click', () => {
            if (window.userHasInteracted && !this.isMuted) {
                const currentVideo = this.slides[this.currentSlide].querySelector('video');
                if (currentVideo && currentVideo.muted) {
                    currentVideo.muted = false;
                }
            }
        }, { once: true });
    }

    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (document.querySelector('.carousel-container:not(.hidden)')) {
                startX = e.touches[0].clientX;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (document.querySelector('.carousel-container:not(.hidden)')) {
                endX = e.changedTouches[0].clientX;
                const diffX = startX - endX;
                if (Math.abs(diffX) > 50) {
                    this.clearAutoPlay();
                    if (diffX > 0) {
                        console.log("Touch swipe left - going to next slide");
                        this.nextSlide();
                    } else {
                        console.log("Touch swipe right - going to prev slide");
                        this.prevSlide();
                    }
                }
            }
        }, { passive: true });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        console.log("Toggle pause:", this.isPaused);
        
        if (!this.pauseBtn) return;
        
        if (this.isPaused) {
            this.pauseBtn.querySelector('i').textContent = 'play_arrow';
            this.clearAutoPlay();
            this.stopProgressTracking();
            const currentVideo = this.slides[this.currentSlide].querySelector('video');
            const currentAudio = this.slides[this.currentSlide].querySelector('audio');
            if (currentVideo && !currentVideo.paused) {
                currentVideo.pause();
            }
            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
            }
        } else {
            this.pauseBtn.querySelector('i').textContent = 'pause';
            const currentVideo = this.slides[this.currentSlide].querySelector('video');
            const currentAudio = this.slides[this.currentSlide].querySelector('audio');
            if (currentVideo && currentVideo.paused) {
                currentVideo.play().catch(e => console.log("Play prevented:", e));
            }
            if (currentAudio && currentAudio.paused) {
                currentAudio.play().catch(e => console.log("Audio play prevented:", e));
            }
            this.startSlideTimer();
        }
    }

    nextSlide() {
        console.log("Next slide called, current:", this.currentSlide, "total:", this.totalSlides);
        if (this.isAnimating) {
            console.log("Animation in progress, ignoring nextSlide call");
            return;
        }
        
        // FIXED: Check if we're on the last slide
        if (this.currentSlide === this.totalSlides - 1) {
            console.log("🎉 ON LAST SLIDE - CALLING FINALE! 🎉");
            this.showBirthdayFinale();
            return;
        }
        
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        console.log("Going to slide:", nextIndex);
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        console.log("Prev slide called, current:", this.currentSlide);
        if (this.isAnimating) {
            console.log("Animation in progress, ignoring prevSlide call");
            return;
        }
        
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        console.log("Going to slide:", prevIndex);
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        console.log("goToSlide called with index:", index, "current:", this.currentSlide);
        if (this.isAnimating || index === this.currentSlide || index < 0 || index >= this.totalSlides) {
            console.log("Invalid slide transition - aborting");
            return;
        }
        
        this.isAnimating = true;
        console.log("Starting slide transition to:", index);
        
        this.stopProgressTracking();
        
        if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
            this.slides[this.currentSlide].classList.add('slide-exit');
            
            const currentVideo = this.slides[this.currentSlide].querySelector('video');
            const currentAudio = this.slides[this.currentSlide].querySelector('audio');
            if (currentVideo) {
                currentVideo.pause();
                currentVideo.currentTime = 0;  // ADDED THIS LINE
            }
            if (currentAudio) {
                currentAudio.pause();
                currentVideo.currentTime = 0;  // ADDED THIS LINE
            }
        }
        
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('active');
                slide.classList.remove('slide-exit');
            });
            
            this.currentSlide = index;
            
            if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
                this.slides[this.currentSlide].classList.add('active');
                this.updateCounter();
                this.resetSlideAnimations(this.currentSlide);
                
                if (!this.isPaused) {
                    this.startSlideTimer();
                }
            }
            
            setTimeout(() => {
                this.isAnimating = false;
                console.log("Slide transition complete, now on slide:", this.currentSlide);
            }, 100);
        }, 300);
    }

    resetSlideAnimations(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slides.length) return;
        
        const slide = this.slides[slideIndex];
        const featureElement = slide.querySelector('.feature-video') || slide.querySelector('.feature-image');
        const audioElement = slide.querySelector('.feature-audio');
        const title = slide.querySelector('.feature-title');
        const description = slide.querySelector('.feature-description');
        
        this.resetProgressBar();
        
        [featureElement, title, description].forEach(el => {
            if (el) {
                el.style.animation = 'none';
                el.offsetHeight;
                el.style.animation = null;
            }
        });
        
        if (featureElement && featureElement.tagName === 'VIDEO') {
            featureElement.currentTime = 0;
            featureElement.muted = (!window.userHasInteracted || this.isMuted);
            
            if (!this.isPaused) {
                const playPromise = featureElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Video play failed:", error);
                        if (!window.userHasInteracted || this.isMuted) {
                            featureElement.muted = true;
                            this.isMuted = true;
                            if (this.soundBtn) {
                                this.soundBtn.classList.add('muted');
                                const icon = this.soundBtn.querySelector('i');
                                if (icon) icon.textContent = 'volume_off';
                            }
                            featureElement.play().catch(e => console.log("Still failed:", e));
                        }
                    });
                }
            }
        }
        
        if (audioElement && !this.isPaused) {
            audioElement.currentTime = 0;
            audioElement.muted = (!window.userHasInteracted || this.isMuted);
            
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio play failed:", error);
                    if (!window.userHasInteracted || this.isMuted) {
                        audioElement.muted = true;
                    }
                });
            }
        }
    }

    updateCounter() {
        if (!this.currentSlideEl || !this.totalSlidesEl) return;
        
        const current = String(this.currentSlide + 1).padStart(2, '0');
        const total = String(this.totalSlides).padStart(2, '0');
        this.currentSlideEl.textContent = current;
        this.totalSlidesEl.textContent = total;
    }

    clearAutoPlay() {
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    startSlideTimer() {
        this.clearAutoPlay();
        
        if (this.isPaused) return;
        if (this.currentSlide === 0) {
            return;
        }
        
        if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
            const currentSlide = this.slides[this.currentSlide];
            const video = currentSlide.querySelector('video');
            const audio = currentSlide.querySelector('audio');
            
            if (!video && !audio) {
                this.autoPlayTimer = setTimeout(() => {
                    if (!this.isAnimating && !this.isPaused) {
                        this.nextSlide();
                    }
                }, 6000);
            }
        }
    }

    startAutoPlay() {
        if (!this.isPaused) {
            this.startSlideTimer();
        }
    }

    // FIXED FINALE FUNCTION - GUARANTEED TO WORK
 showBirthdayFinale() {
    // Stop all media
    this.stopProgressTracking();

    if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
        const currentVideo = this.slides[this.currentSlide].querySelector('video');
        const currentAudio = this.slides[this.currentSlide].querySelector('audio');
        if (currentVideo) currentVideo.pause();
        if (currentAudio) currentAudio.pause();
    }

    // Hide carousel
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.display = 'none';
    }

    // Finale
    let finale = document.getElementById('birthdayFinale');
    if (!finale) {
        finale = document.createElement('div');
        finale.id = 'birthdayFinale';
        finale.className = 'birthday-finale';
        document.body.appendChild(finale);
        let message = document.createElement('div');
        message.className = 'birthday-message';
        message.textContent = 'Happy Birthday, Moez!';
        finale.appendChild(message);
    }

    // Remove any inline styles
    finale.style.cssText = "";

    // Reset classes
    finale.classList.remove('fade-in', 'show-text');
    finale.classList.add('active');

    // Fade in the black screen
    finale.classList.add('fade-in');

    // Show the birthday message after fade-in
    finale.classList.add('show-text');

    // Start confetti after message appears
    this.createConfetti();
}

    createConfetti() {
        console.log("Creating confetti animation");
        const finale = document.getElementById('birthdayFinale');
        if (!finale) {
            console.error("Cannot create confetti - finale element not found");
            return;
        }
        
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                
                const size = Math.random() * 10 + 5;
                const left = Math.random() * 100;
                const animationDuration = Math.random() * 2 + 3;
                const delay = Math.random() * 1;
                
                confetti.style.cssText = `
                    position: absolute !important;
                    left: ${left}% !important;
                    top: -20px !important;
                    width: ${size}px !important;
                    height: ${size}px !important;
                    background: ${colors[Math.floor(Math.random() * colors.length)]} !important;
                    z-index: 100001 !important;
                    animation: confetti-fall ${animationDuration}s linear ${delay}s forwards !important;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'} !important;
                `;
                
                finale.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, (animationDuration + delay) * 1000 + 500);
                
            }, i * 50);
        }
        
        // Continue confetti waves
        setTimeout(() => {
            if (finale && finale.classList.contains('active')) {
                this.createConfetti();
            }
        }, 3000);
    }
}

// Particle effect initialization
function initializeParticleEffects() {
    document.addEventListener('mousemove', (e) => {
        const particles = document.querySelectorAll('.particle');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        particles.forEach((particle, index) => {
            const speed = (index % 3 + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Init carousel and particles on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded - initializing carousel");
    window.featureCarouselInstance = new FeatureCarousel();
    initializeParticleEffects();
    
    // Emergency keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'b' || e.key === 'B') {
            console.log("B key pressed - forcing birthday finale");
            if (window.featureCarouselInstance) {
                window.featureCarouselInstance.showBirthdayFinale();
            }
        }
    });
});