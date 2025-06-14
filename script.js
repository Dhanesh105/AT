// Andhra Treats Website JavaScript

// Loading Screen Functionality
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');

    if (loadingScreen) {
        // Minimum loading time for better UX
        const minLoadingTime = 1500;
        const startTime = Date.now();

        // Hide loading screen when page is fully loaded
        window.addEventListener('load', function() {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

            setTimeout(() => {
                loadingScreen.classList.add('hidden');

                // Remove loading screen from DOM after animation
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.parentNode.removeChild(loadingScreen);
                    }
                }, 500);
            }, remainingTime);
        });

        // Fallback: Hide loading screen after maximum time
        setTimeout(() => {
            if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.parentNode.removeChild(loadingScreen);
                    }
                }, 500);
            }
        }, 5000);
    }
}

// Initialize loading screen immediately
initLoadingScreen();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSlider();
    initReviewsSlider();
    initMobileMenu();
    initSmoothScrolling();
    initProductCards();
    initScrollAnimations();
});

// Hero Slider Functionality
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        stopSlideShow();
        startSlideShow();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        stopSlideShow();
        startSlideShow();
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            stopSlideShow();
            startSlideShow();
        });
    });

    // Start automatic slideshow
    startSlideShow();

    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSlideShow);
        sliderContainer.addEventListener('mouseleave', startSlideShow);
    }
}

// Reviews Slider Functionality
function initReviewsSlider() {
    const reviewCards = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.review-prev');
    const nextBtn = document.querySelector('.review-next');
    let currentReview = 0;

    function showReview(index) {
        reviewCards.forEach(card => card.classList.remove('active'));
        if (reviewCards[index]) {
            reviewCards[index].classList.add('active');
        }
    }

    function nextReview() {
        currentReview = (currentReview + 1) % reviewCards.length;
        showReview(currentReview);
    }

    function prevReview() {
        currentReview = (currentReview - 1 + reviewCards.length) % reviewCards.length;
        showReview(currentReview);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextReview);
    if (prevBtn) prevBtn.addEventListener('click', prevReview);

    // Auto-rotate reviews
    setInterval(nextReview, 4000);
}

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (mobileToggle && navbar) {
        // Add click event to burger menu
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle menu visibility
            navbar.classList.toggle('mobile-active');
            mobileToggle.classList.toggle('active');

            // Toggle icon between hamburger and X
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }

            // Prevent body scroll when menu is open
            if (navbar.classList.contains('mobile-active')) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !mobileToggle.contains(e.target)) {
                navbar.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
                document.body.classList.remove('menu-open');

                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking nav links
        const navLinks = navbar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
                document.body.classList.remove('menu-open');

                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Product Cards Interactivity
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    // Add hover effects and click handlers
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add to cart functionality
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            
            // Add animation
            this.style.transform = 'scale(0.95)';
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.textContent = 'Add to Cart';
                this.style.background = '';
            }, 1500);

            // Show notification
            showNotification(`${productName} added to cart!`);
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-card, .review-card, .footer-section');
    animateElements.forEach(el => observer.observe(el));
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Enhanced Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const dummyHeader = document.getElementById('dummyHeader');

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        if (dummyHeader) {
            dummyHeader.style.height = '80px';
        }
    } else {
        header.classList.remove('scrolled');
        if (dummyHeader) {
            dummyHeader.style.height = '90px';
        }
    }
});

// Active navigation highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
