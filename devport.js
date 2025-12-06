// Respect reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Parallax effect for the hero video (only if motion is allowed)
if (!prefersReduced) {
    let last = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - last < 16) return; // throttle ~60fps
        last = now;
        const video = document.getElementById('heroVideo');
        if (!video) return;
        const scrolled = window.pageYOffset;
        video.style.transform = `translateY(${scrolled * 0.15}px)`; 
    });
}

// Navbar background toggle when scrolled
const navbar = document.querySelector('.navbar');
if (navbar) {
    const checkNav = () => {
        const y = window.pageYOffset || document.documentElement.scrollTop;
        navbar.classList.toggle('scrolled', y > 40);
    };
    window.addEventListener('scroll', checkNav, { passive: true });
    checkNav();
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
        const open = primaryNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
    });
    // close menu on nav link click
    primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        primaryNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }));
}

// theme selector removed — no runtime theme switching

// Intersection observer for reveal animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // if element declares a slide direction, add corresponding class
        const dir = el.dataset && el.dataset.anim;
        if (dir === 'left') {
            el.classList.add('slide-in-left');
            // trigger visible state after class added
            requestAnimationFrame(() => el.classList.add('visible'));
        } else if (dir === 'right') {
            el.classList.add('slide-in-right');
            requestAnimationFrame(() => el.classList.add('visible'));
        } else if (dir === 'up') {
            el.classList.add('slide-in-up');
            requestAnimationFrame(() => el.classList.add('visible'));
        } else {
            el.classList.add('visible');
        }
        observer.unobserve(el);
    });
}, { threshold: 0.12 });

document.querySelectorAll('.project-card, .project-img, .about-image, .about, .contact, .hero-text, .contact-form, section[data-anim]').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Fallback for cases where IntersectionObserver doesn't trigger as expected
// or in older browsers: ensure elements with .fade-in become visible when scrolled into view.
function revealOnScrollFallback() {
    const items = document.querySelectorAll('.fade-in');
    const threshold = 0.85; // element enters when 85% of viewport height
    items.forEach(el => {
        if (el.classList.contains('visible')) return; // already revealed
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * threshold && rect.bottom >= 0) {
            // apply directional class if data-anim present
            const dir = el.dataset && el.dataset.anim;
            if (dir && !el.classList.contains('slide-in-left') && !el.classList.contains('slide-in-right') && !el.classList.contains('slide-in-up')) {
                el.classList.add(dir === 'left' ? 'slide-in-left' : (dir === 'right' ? 'slide-in-right' : 'slide-in-up'));
            }
            // add visible and mark
            requestAnimationFrame(() => el.classList.add('visible'));
        }
    });
}

// Throttle helper
function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
}

const throttledReveal = throttle(revealOnScrollFallback, 120);
window.addEventListener('scroll', throttledReveal, { passive: true });
window.addEventListener('resize', throttledReveal);
document.addEventListener('DOMContentLoaded', () => setTimeout(revealOnScrollFallback, 120));

// Stagger project card reveals
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.projects-grid .project-card');
    cards.forEach((c, i) => {
        c.style.transitionDelay = (i * 120) + 'ms';
        // alternate project-card directions left/right for visual variety
        if (!c.dataset.anim) c.dataset.anim = (i % 2 === 0) ? 'left' : 'right';
        // also set for observer to pick up
        c.classList.add('fade-in');
        observer.observe(c);
    });
});

// Make about image animations faster: apply data-speed="fast" so it uses the shorter timing
const aboutImage = document.querySelector('.about-image');
if (aboutImage) aboutImage.dataset.speed = 'fast';

// Typing effect (simple, stops automatically if reduced motion)
const words = ["Welcome, I'm Aybanskiee", "Future Web Developer", "Check My Project", "Download My Resume", "Halimaw Magmahal"];
let index = 0;
let charIndex = 0;
let isDeleting = false;
const target = document.getElementById('headline');
const speed = 80;

function typeEffect() {
    if (!target) return;
    if (prefersReduced) { target.textContent = words[0]; return; }
    const current = words[index];
    const displayed = current.substring(0, charIndex);
    target.textContent = displayed;
    if (!isDeleting) {
        if (charIndex < current.length) charIndex++;
        else { isDeleting = true; setTimeout(typeEffect, 1000); return; }
    } else {
        if (charIndex > 0) charIndex--;
        else { isDeleting = false; index = (index + 1) % words.length; }
    }
    setTimeout(typeEffect, isDeleting ? speed / 2 : speed);
}
typeEffect();

// Button ripple effect (improved coordinates + keyboard support)
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 1.2;
        ripple.style.width = ripple.style.height = size + 'px';
        const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// Inject small styles for ripple and ensure btn has relative positioning
const style = document.createElement('style');
style.textContent = `
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
.btn { position: relative; overflow: hidden; }
.ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.5); transform: scale(0); animation: ripple 600ms linear; pointer-events: none; }
`;
document.head.appendChild(style);

// Video play/pause control with accessible state
const heroVideo = document.getElementById('heroVideo');
const videoToggle = document.getElementById('videoToggle');
if (heroVideo && videoToggle) {
    const setState = (playing) => {
        videoToggle.setAttribute('aria-pressed', String(!playing));
        videoToggle.setAttribute('aria-label', playing ? 'Pause background animation' : 'Play background animation');
        videoToggle.innerHTML = playing ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>` : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v18l15-9L5 3z" fill="currentColor"/></svg>`;
    };
    // initial state (video autoplay muted -> playing)
    let playing = true;
    setState(playing);
    videoToggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (playing) {
            heroVideo.pause();
            playing = false;
        } else {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
            playing = true;
        }
        setState(playing);
    });
    // keyboard support (Space/Enter)
    videoToggle.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); videoToggle.click(); }
    });
}

// Pause video when page not visible to save resources
if (heroVideo) {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            try { heroVideo.pause(); } catch (e) {}
        } else {
            const mq = window.matchMedia('(max-width: 640px)');
            if (!mq.matches) {
                const p = heroVideo.play(); if (p && p.catch) p.catch(() => {});
            }
        }
    });

    // If video fails to load (corrupt/missing), hide it and show poster
    heroVideo.addEventListener('error', () => {
        heroVideo.style.display = 'none';
        const poster = document.querySelector('.hero-poster');
        if (poster) poster.style.display = 'block';
    });

    // On mobile devices ensure video is paused and poster visible
    const mqSmall = window.matchMedia('(max-width: 640px)');
    const handleSmall = (e) => {
        const poster = document.querySelector('.hero-poster');
        if (e.matches) {
            try { heroVideo.pause(); } catch (e) {}
            heroVideo.style.display = 'none';
            if (poster) poster.style.display = 'block';
        } else {
            heroVideo.style.display = '';
            if (poster) poster.style.display = '';
        }
    };
    mqSmall.addEventListener ? mqSmall.addEventListener('change', handleSmall) : mqSmall.addListener(handleSmall);
    handleSmall(mqSmall);
}

// Smooth scroll for in-page navigation and scrollspy
document.querySelectorAll('a[href^="#"]').forEach(a => {
    // skip external anchors like '#' only
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    a.addEventListener('click', (e) => {
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // update focus for accessibility
            setTimeout(() => targetEl.setAttribute('tabindex', '-1') || targetEl.focus(), 600);
        }
    });
});

// Scrollspy: mark nav links active when sections are visible
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) link.classList.toggle('active', entry.isIntersecting);
    });
}, { threshold: 0.45 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// Form submission with success/error feedback
const contactForm = document.querySelector('.contact-form');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form fields
        const name = document.getElementById('name')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const message = document.getElementById('message')?.value?.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!name || !email || !message) {
            showFormMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!emailRegex.test(email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission (in production, send to server)
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
        
        setTimeout(() => {
            showFormMessage('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }, 1200);
    });
}

function showFormMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// ============================================
// Progress bar scroll tracking
// ============================================
const progressBar = document.getElementById('progressBar');
if (progressBar) {
    const updateProgressBar = throttle(() => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
        progressBar.style.width = Math.min(scrolled, 100) + '%';
    }, 16); // ~60fps
    
    window.addEventListener('scroll', updateProgressBar, { passive: true });
    updateProgressBar(); // initialize on load
}

// ============================================
// Back-to-top button
// ============================================
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    const toggleBackToTop = throttle(() => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, 100);
    
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Keyboard support (Enter/Space)
    backToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            backToTopBtn.click();
        }
    });
    
    toggleBackToTop(); // initialize on load
}

// ============================================
// Theme toggle with localStorage persistence
// ============================================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    // Load saved theme preference or detect system preference
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const html = document.documentElement;
        
        if (savedTheme === 'dark') {
            html.classList.add('dark');
        } else if (savedTheme === 'light') {
            html.classList.remove('dark');
        } else {
            // Detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        }
    };
    
    // Initialize theme on page load
    initializeTheme();
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Update theme if system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const html = document.documentElement;
        if (e.matches && !localStorage.getItem('theme')) {
            html.classList.add('dark');
        } else if (!e.matches && !localStorage.getItem('theme')) {
            html.classList.remove('dark');
        }
    });
}
