// ========================================
// ZENU - Landing Page Script
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero canvas animation
    initHeroCanvas();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize feature card interactions
    initFeatureCards();
});

// ========================================
// Hero Canvas Animation
// ========================================

function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouseActive = true;
    });
    
    document.addEventListener('mouseleave', () => {
        mouseActive = false;
    });
    
    // Radio wave particle class
    class RadioWave {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = Math.random() * 0.5 - 0.25;
            this.vy = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.05;
            this.size = Math.random() * 2 + 1;
            this.waveRadius = 0;
            this.maxWaveRadius = 20 + Math.random() * 10;
        }
        
        update() {
            // Base movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Attraction to mouse when active
            if (mouseActive) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    const angle = Math.atan2(dy, dx);
                    const force = 0.02 * (1 - distance / 200);
                    this.vx += Math.cos(angle) * force;
                    this.vy += Math.sin(angle) * force;
                }
            }
            
            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;
            
            // Wrap around edges
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
            
            // Update pulse
            this.pulsePhase += this.pulseSpeed;
            this.waveRadius = this.maxWaveRadius * Math.sin(this.pulsePhase);
            if (this.waveRadius < 0) this.waveRadius = 0;
        }
        
        draw() {
            // Draw core particle
            ctx.fillStyle = `rgba(227, 11, 92, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw radio wave rings
            if (this.waveRadius > 0) {
                ctx.strokeStyle = `rgba(227, 11, 92, ${this.opacity * 0.4 * (1 - this.waveRadius / this.maxWaveRadius)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    // Create particles
    function createParticles() {
        const particleCount = Math.min(40, Math.floor(canvas.width / 25));
        particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new RadioWave());
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections with dynamic opacity based on mouse proximity
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    let connectionOpacity = 0.1 * (1 - distance / 150);
                    
                    // Enhance connections near mouse
                    if (mouseActive) {
                        const toMouseX = (particle.x + otherParticle.x) / 2 - mouseX;
                        const toMouseY = (particle.y + otherParticle.y) / 2 - mouseY;
                        const distToMouse = Math.sqrt(toMouseX * toMouseX + toMouseY * toMouseY);
                        
                        if (distToMouse < 200) {
                            connectionOpacity += 0.15 * (1 - distToMouse / 200);
                        }
                    }
                    
                    ctx.strokeStyle = `rgba(227, 11, 92, ${Math.min(connectionOpacity, 0.5)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                }
            });
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Initialize
    createParticles();
    animate();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
    });
}

// ========================================
// Scroll Animations
// ========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToAnimate = document.querySelectorAll('.feature-card, .step-item, .cta-card');
    
    elementsToAnimate.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 3s ease-out ${index * 1}s, transform 2s ease-out ${index * 1}s`;
        observer.observe(el);
    });
}

// ========================================
// Feature Card Interactions
// ========================================

function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle tilt effect
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click tracking (for analytics)
        card.addEventListener('click', function() {
            const featureTitle = this.querySelector('.feature-title').textContent;
            console.log('Feature clicked:', featureTitle);
            // Here you would send analytics data
        });
    });
}

// ========================================
// Stats Counter Animation
// ========================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const value = parseInt(text.replace(/[^0-9]/g, ''));
                
                if (!isNaN(value)) {
                    stat.textContent = '0';
                    setTimeout(() => {
                        animateCounter(stat, value);
                    }, 300);
                }
            });
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ========================================
// CTA Button Interactions
// ========================================

const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);
