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

    // 5. Interactive Category Filter + Hub Search for Calculators Showcase
    const tabButtons = document.querySelectorAll('.calc-tab-btn');
    const calcCards = document.querySelectorAll('.calc-item-card');
    const hubSearchInput = document.getElementById('hub-search-input');
    const hubEmptyState = document.getElementById('hub-empty-state');

    if (calcCards.length > 0 && (tabButtons.length > 0 || hubSearchInput)) {
        let activeCategory = 'all';
        let searchQuery = '';

        const applyCalcFilters = () => {
            let visibleCount = 0;
            calcCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                const catMatch = activeCategory === 'all' || cardCat === activeCategory;
                const haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                const searchMatch = !searchQuery || haystack.includes(searchQuery);
                const visible = catMatch && searchMatch;
                card.style.display = visible ? 'flex' : 'none';
                if (visible) visibleCount++;
            });
            if (hubEmptyState) {
                hubEmptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.getAttribute('data-category') || 'all';
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyCalcFilters();
            });
        });

        if (hubSearchInput) {
            hubSearchInput.addEventListener('input', (e) => {
                searchQuery = (e.target.value || '').trim().toLowerCase();
                applyCalcFilters();
            });
        }
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

    // 8. Mobile Sticky CTA Bar (appears after scrolling past Hero, hides when Cookie Banner is open)
    const stickyCta = document.getElementById('mobile-sticky-cta');
    if (stickyCta) {
        const updateStickyCta = () => {
            const cookieBanner = document.getElementById('edilcalc-cookie-banner');
            const isCookieOpen = cookieBanner && !cookieBanner.hasAttribute('hidden');
            if (window.scrollY > 520 && !isCookieOpen) {
                stickyCta.classList.add('is-visible');
            } else {
                stickyCta.classList.remove('is-visible');
            }
        };
        window.addEventListener('scroll', updateStickyCta, { passive: true });
        document.addEventListener('click', () => setTimeout(updateStickyCta, 60));
        updateStickyCta();
    }
});
