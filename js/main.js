document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 3. Smooth Scroll for same-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Safe Scroll Reveal (CSS Class-based so hover & transforms never break)
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    // 5. Interactive Category Filter for the 20+ Calculators Showcase
    const tabButtons = document.querySelectorAll('.calc-tab-btn');
    const calcCards = document.querySelectorAll('.calc-item-card');

    if (tabButtons.length > 0 && calcCards.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');

                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                calcCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (category === 'all' || cardCat === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 6. Interactive Workflow Screen Switcher
    const workflowSteps = document.querySelectorAll('.workflow-step-card');
    const screenPills = document.querySelectorAll('.screen-pill');
    const workflowScreenImg = document.getElementById('workflow-screen-img');

    const setActiveScreen = (index) => {
        workflowSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === index);
        });
        screenPills.forEach((pill, idx) => {
            pill.classList.toggle('active', idx === index);
        });
        if (workflowScreenImg && workflowSteps[index]) {
            const newSrc = workflowSteps[index].getAttribute('data-img');
            const newAlt = workflowSteps[index].getAttribute('data-alt');
            if (newSrc && workflowScreenImg.getAttribute('src') !== newSrc) {
                workflowScreenImg.style.opacity = '0.35';
                setTimeout(() => {
                    workflowScreenImg.setAttribute('src', newSrc);
                    if (newAlt) workflowScreenImg.setAttribute('alt', newAlt);
                    workflowScreenImg.style.opacity = '1';
                }, 140);
            }
        }
    };

    workflowSteps.forEach((step, idx) => {
        step.addEventListener('click', () => setActiveScreen(idx));
    });
    screenPills.forEach((pill, idx) => {
        pill.addEventListener('click', () => setActiveScreen(idx));
    });

    // 7. FAQ Accordion & Live Search Filter
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isAlreadyActive = item.classList.contains('active');
            faqItems.forEach(other => other.classList.remove('active'));
            if (!isAlreadyActive) {
                item.classList.add('active');
            }
        });
    });

    const faqSearchInput = document.getElementById('faq-search-input');
    if (faqSearchInput && faqItems.length > 0) {
        faqSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            faqItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
