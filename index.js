// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio initialized ✨');

    // Theme toggle functionality
    setupThemeToggle();

    // Mobile menu toggle
    setupMobileMenu();

    // Smooth scrolling for navigation links
    setupSmoothScrolling();

    // Scroll animations
    setupScrollAnimations();
});

/**
 * Sets up dark/light theme toggle functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('checkbox');
    const themeLabel = document.querySelector('.theme-label i');

    // Check for saved theme preference or use preferred color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeLabel.className = 'fas fa-sun';
    }

    // Add event listener for theme toggle
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeLabel.className = 'fas fa-sun';
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeLabel.className = 'fas fa-moon';
        }
    });
}

/**
 * Sets up mobile menu toggle functionality
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!menuToggle) return;

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Toggle hamburger/close icon
        const bars = menuToggle.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.toggle('active'));

        // Prevent scrolling when menu is open
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');

            // Reset hamburger icon
            const bars = menuToggle.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.remove('active'));
        });
    });
}

/**
 * Sets up smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            const yOffset = -80; // Header offset
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Sets up animations for elements when they scroll into view
 */
function setupScrollAnimations() {
    // Add fade-in animation to sections when they come into view
    const sections = document.querySelectorAll('.section-container');

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally stop observing the element after it's visible
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '-50px' // Trigger 50px before element enters viewport
    });

    // Observe each section
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Add animation to skill items with delay
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Add CSS for animations and mobile menu
document.head.insertAdjacentHTML('beforeend', `
<style>
    /* Animation styles */
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .skill-item {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Mobile menu styles */
    body.menu-open {
        overflow: hidden;
    }

    .mobile-menu-toggle .bar.active:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }

    .mobile-menu-toggle .bar.active:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-toggle .bar.active:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
</style>
`);
