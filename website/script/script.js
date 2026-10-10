document.addEventListener('DOMContentLoaded', () => {

    const t = (key) => (window.cortexT ? window.cortexT(key) : key);

    /* --- PAGE TRANSITIONS --- */
    const transitionEl = document.querySelector('.page-transition');
    if (transitionEl) {
        setTimeout(() => transitionEl.classList.add('loaded'), 150);
    }

    // Po powrocie przyciskiem "Wstecz" strona wraca z bfcache - bez tego zostawał czarny ekran
    window.addEventListener('pageshow', (e) => {
        if (e.persisted && transitionEl) transitionEl.classList.add('loaded');
    });

    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || link.target === '_blank' || link.hasAttribute('download')) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

            const url = new URL(href, window.location.href);
            // Tylko wewnętrzne podstrony - mailto:, tel: i linki zewnętrzne działają normalnie
            if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;
            // Kotwica na tej samej stronie - zostaw płynne przewijanie
            if (url.pathname === window.location.pathname && url.hash) return;

            e.preventDefault();
            if (transitionEl) transitionEl.classList.remove('loaded');
            setTimeout(() => {
                window.location.href = url.href;
            }, 400); // 400ms fade out
        });
    });

    /* --- COOKIE BANNER --- */
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    let cookiesAccepted = false;
    try { cookiesAccepted = localStorage.getItem('cortex_cookies_accepted') === 'true'; } catch (e) { }

    if (cookieBanner && !cookiesAccepted) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1500);
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            try { localStorage.setItem('cortex_cookies_accepted', 'true'); } catch (e) { }
            cookieBanner.classList.remove('show');
        });
    }

    /* --- 3D TILT EFFECT + HOVER GLOW --- */
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
        if (!canHover) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // update glow position
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
        });
    });

    /* --- PLAYGROUND SCANNER --- */
    // Lekka heurystyka działająca w przeglądarce (demo). Wynik zależy od wklejonego tekstu.
    const LEXICON = {
        emotion: [
            'szok', 'skandal', 'przeraż', 'niewiarygod', 'katastrof', 'wściek', 'oburz', 'zdrad', 'horror',
            'dramat', 'panik', 'tragedi', 'hańb', 'kompromitac', 'masakr', 'apokalip', 'zagłada', 'koszmar',
            'nienawi', 'zło', 'zniszcz', 'kłam', 'oszust', 'złodziej', 'zdrajc', 'bezczel', 'żenad',
            'shock', 'outrage', 'terrif', 'disaster', 'unbeliev', 'insane', 'furious', 'scandal', 'betray',
            'horrif', 'panic', 'destroy', 'evil', 'disgust', 'catastroph', 'nightmare', 'liar', 'traitor',
            'corrupt', 'fraud', 'hate', 'apocalyp', 'devastat', 'slam', 'chaos'
        ],
        clickbait: [
            'nie uwierzysz', 'musisz zobaczyć', 'musisz to zobaczyć', 'zobacz co', 'to cię zaskoczy',
            'lekarze nienawidzą', 'nikt ci nie powie', 'nikt o tym nie mówi', 'prawda o', 'ukrywają',
            'nie chcą, żebyś', 'nie chcą żebyś', 'udostępnij', 'zanim usuną', 'media milczą',
            'obudźcie się', 'otwórzcie oczy', 'jeden prosty trik', 'zaskakujący sposób', 'pilne',
            "you won't believe", 'you wont believe', 'doctors hate', 'what happens next', "they don't want you",
            'they dont want you', 'share before', 'the truth about', 'mainstream media', 'wake up',
            'one simple trick', 'must see', 'breaking', 'exposed', 'before it gets deleted', 'nobody is talking'
        ],
        absolute: [
            'zawsze', 'nigdy', 'wszyscy', 'wszystkie', 'nikt', 'każdy', 'każda', 'całkowicie', 'absolutnie',
            'kompletnie', 'na pewno', 'bez wyjątku', 'gwarant', 'jedyn',
            'always', 'never', 'everyone', 'everybody', 'nobody', 'totally', 'absolutely', 'definitely',
            'guaranteed', 'completely', 'only', 'all of them', '100%'
        ]
    };

    const analyzeText = (text) => {
        const lower = text.toLowerCase();
        const words = lower.match(/[\p{L}\p{N}%']+/gu) || [];
        const rawWords = text.match(/[\p{L}]+/gu) || [];

        const countStems = (stems) => words.filter(w => stems.some(s => !s.includes(' ') && w.startsWith(s))).length
            + stems.filter(s => s.includes(' ') && lower.includes(s)).length;
        const countPhrases = (phrases) => phrases.filter(p => lower.includes(p)).length;

        const emotion = countStems(LEXICON.emotion);
        const clickbait = countPhrases(LEXICON.clickbait);
        const absolute = countStems(LEXICON.absolute);
        const longWords = rawWords.filter(w => w.length >= 4);
        const capsWords = longWords.filter(w => w === w.toUpperCase() && w !== w.toLowerCase()).length;
        const capsRatio = longWords.length ? capsWords / longWords.length : 0;
        const exclamations = (text.match(/!/g) || []).length;

        // Normalizacja do długości tekstu, żeby długie artykuły nie dostawały automatycznie wysokiego wyniku
        const lengthFactor = Math.min(1, 25 / Math.max(words.length, 1)) * 0.6 + 0.4;
        let score = (emotion * 11 + clickbait * 16 + absolute * 6 + exclamations * 4) * lengthFactor + capsRatio * 45;
        score = Math.round(Math.max(0, Math.min(98, score)));

        return { score, emotion, clickbait, absolute, capsRatio, exclamations };
    };

    const levelOf = (value, mid, high) => (value >= high ? 'high' : value >= mid ? 'mid' : 'low');

    const playgroundBtn = document.getElementById('playground-scan-btn');
    const playgroundSampleBtn = document.getElementById('playground-sample-btn');
    const playgroundInput = document.getElementById('playground-input');
    const playgroundResults = document.getElementById('playground-results');
    const playgroundHint = document.getElementById('playground-hint');

    if (playgroundBtn && playgroundInput && playgroundResults) {
        const processingText = playgroundResults.querySelector('.processing-text');
        const resultsContent = playgroundResults.querySelector('.results-content');
        let lastResult = null;
        let scanTimer = null;

        const renderResult = (r) => {
            const level = levelOf(r.score, 30, 60);
            const valueEl = document.getElementById('res-risk-value');
            const bar = document.getElementById('res-risk-bar');
            const verdict = document.getElementById('res-verdict');
            const colors = { low: 'var(--accent-color)', mid: '#ffbd2e', high: '#ff5f56' };

            valueEl.textContent = `${r.score}%`;
            valueEl.className = `result-value risk-${level}`;
            bar.style.backgroundColor = colors[level];
            requestAnimationFrame(() => { bar.style.width = `${Math.max(r.score, 3)}%`; });

            const emotionLevel = levelOf(r.emotion + r.exclamations / 2 + r.capsRatio * 6, 1.5, 4);
            document.getElementById('res-emotion').textContent = t(`play_level_${emotionLevel}`);
            document.getElementById('res-emotion').className = `risk-${emotionLevel}`;
            document.getElementById('res-clickbait').textContent = r.clickbait;
            document.getElementById('res-clickbait').className = r.clickbait ? 'risk-high' : 'risk-low';
            document.getElementById('res-absolute').textContent = r.absolute;
            document.getElementById('res-absolute').className = r.absolute >= 3 ? 'risk-mid' : '';

            verdict.textContent = t(`play_verdict_${level}`);
            verdict.className = `result-verdict risk-${level}`;
        };

        const setHint = (key, warn) => {
            if (!playgroundHint) return;
            playgroundHint.textContent = t(key);
            playgroundHint.classList.toggle('warn', !!warn);
        };

        const runScan = () => {
            const text = playgroundInput.value.trim();
            const wordCount = (text.match(/[\p{L}\p{N}]+/gu) || []).length;
            if (wordCount < 3) {
                setHint('play_hint_short', true);
                playgroundInput.focus();
                return;
            }
            setHint('play_hint');

            playgroundResults.hidden = false;
            processingText.hidden = false;
            resultsContent.hidden = true;
            playgroundBtn.disabled = true;
            document.getElementById('res-risk-bar').style.width = '0';

            clearTimeout(scanTimer);
            // Simulate AI scan delay
            scanTimer = setTimeout(() => {
                lastResult = analyzeText(text);
                processingText.hidden = true;
                resultsContent.hidden = false;
                playgroundBtn.disabled = false;
                renderResult(lastResult);
            }, 900);
        };

        playgroundBtn.addEventListener('click', runScan);
        playgroundInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runScan();
        });

        if (playgroundSampleBtn) {
            playgroundSampleBtn.addEventListener('click', () => {
                playgroundInput.value = t('play_sample_text');
                runScan();
            });
        }

        // Po zmianie języka przetłumacz ostatni wynik
        document.addEventListener('cortex:langchange', () => {
            if (lastResult && !resultsContent.hidden) renderResult(lastResult);
        });
    }

    /* --- MOBILE MENU --- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        const setMenu = (open) => {
            navLinks.classList.toggle('active', open);
            document.body.classList.toggle('menu-open', open);
            mobileMenuBtn.setAttribute('aria-expanded', String(open));

            // Zmiana ikony menu na krzyżyk
            mobileMenuBtn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));

        // Zamknięcie menu po kliknięciu w link (poza przełącznikiem języka)
        navLinks.querySelectorAll('a').forEach(link => {
            if (link.classList.contains('lang-option') || link.classList.contains('github-button')) return;
            link.addEventListener('click', () => setMenu(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) setMenu(false);
        });
    }


    /* --- SCROLL: PROGRESS BAR, NAVBAR BLUR, SCROLL TO TOP --- */
    const progressBar = document.getElementById('scroll-progress-bar');
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scrollToTopBtn');

    const onScroll = () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (progressBar) progressBar.style.width = (height > 0 ? (winScroll / height) * 100 : 0) + '%';
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* --- LIGHTBOX LOGIC --- */
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const featureCards = Array.from(document.querySelectorAll('.feature-card[data-video]'));

    let currentLightboxIndex = 0;
    let lastFocusedCard = null;

    if (featureCards.length > 0 && lightboxModal) {

        // Znane formaty plików - bez zgadywania (wcześniej każde otwarcie generowało błędy 404)
        const MEDIA = {
            truth_fake: 'gif',
            fallacies: 'png',
            ai_scan: 'png',
            tldr: 'png',
            polarization: 'png',
            focus_mode: 'png'
        };

        const isSubdir = window.location.pathname.includes('/html/');
        const prefix = isSubdir ? '../' : '';

        const openLightboxAtIndex = (index) => {
            currentLightboxIndex = index;
            const card = featureCards[index];
            const videoName = card.getAttribute('data-video');
            if (!videoName) return;

            const ext = MEDIA[videoName] || 'png';
            const path = `${prefix}assets/${videoName}.${ext}`;
            const title = card.querySelector('.card-title');

            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');
            lightboxVideo.style.display = 'none';

            if (ext === 'mp4') {
                lightboxImg.style.display = 'none';
                lightboxVideo.src = path;
                lightboxVideo.style.display = 'block';
                lightboxVideo.play().catch(() => { });
            } else {
                lightboxImg.src = path;
                lightboxImg.alt = title ? title.textContent : 'CORTEX preview';
                lightboxImg.style.display = 'block';
            }

            if (!lightboxModal.classList.contains('active')) {
                lightboxModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                if (lightboxClose) lightboxClose.focus();
            }
        };

        featureCards.forEach((card, index) => {
            // Stylistyczny dodatek - kursor rączki + obsługa klawiatury
            card.style.cursor = 'pointer';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            const open = () => {
                lastFocusedCard = card;
                openLightboxAtIndex(index);
            };

            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        });

        // Navigation controls
        const goPrev = (e) => {
            if (e) e.stopPropagation();
            let newIndex = currentLightboxIndex - 1;
            if (newIndex < 0) newIndex = featureCards.length - 1;
            openLightboxAtIndex(newIndex);
        };

        const goNext = (e) => {
            if (e) e.stopPropagation();
            let newIndex = currentLightboxIndex + 1;
            if (newIndex >= featureCards.length) newIndex = 0;
            openLightboxAtIndex(newIndex);
        };

        if (lightboxPrev) lightboxPrev.addEventListener('click', goPrev);
        if (lightboxNext) lightboxNext.addEventListener('click', goNext);

        // Close logic
        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');
            lightboxImg.removeAttribute('src');
            document.body.style.overflow = ''; // Restore scroll
            if (lastFocusedCard) lastFocusedCard.focus();
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

        lightboxModal.addEventListener('click', (e) => {
            // Zamknij tylko jeśli kliknięto w tło (nie w wideo / strzałki)
            if (e.target === lightboxModal || e.target === lightboxModal.querySelector('.lightbox-content')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightboxModal.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') goPrev();
                if (e.key === 'ArrowRight') goNext();
            }
        });
    }

    /* --- SHOWCASE VIDEO: odtwarzaj tylko gdy widoczne --- */
    const showcaseVideo = document.querySelector('.showcase-video');
    if (showcaseVideo && 'IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showcaseVideo.play().catch(() => { });
                } else {
                    showcaseVideo.pause();
                }
            });
        }, { threshold: 0.25 }).observe(showcaseVideo);
    }

    /* --- REVEAL ON SCROLL --- */
    const revealElements = document.querySelectorAll('.reveal-elem');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    // Trigger hero animations immediately
    setTimeout(() => {
        const heroElems = document.querySelectorAll('.hero .reveal-elem');
        heroElems.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('active');
            }, index * 150);
        });
    }, 100);

    /* --- TEXT DECIPHER ANIMATION --- */
    const decipherLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.startDecipherForElement = (el) => {
        const originalText = el.getAttribute('data-text');
        if (!originalText) return;

        if (el._decipherInterval) {
            clearInterval(el._decipherInterval);
        }

        if (reduceMotion) {
            el.textContent = originalText;
            return;
        }

        let iteration = 0;

        el._decipherInterval = setInterval(() => {
            el.textContent = originalText.split("").map((letter, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                if (originalText[index] === " ") return " ";
                return decipherLetters[Math.floor(Math.random() * decipherLetters.length)];
            }).join("");

            if (iteration >= originalText.length) {
                clearInterval(el._decipherInterval);
                el.textContent = originalText;
            }

            iteration += 1 / 1.5;
        }, 30);
    };

    const decipherTexts = document.querySelectorAll('.decipher-text');
    decipherTexts.forEach((el, index) => {
        setTimeout(() => window.startDecipherForElement(el), 300 + (index * 600));
    });

    /* --- FAQ ACCORDION LOGIC --- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');
        questionBtn.setAttribute('aria-expanded', 'false');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other open items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
                questionBtn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Po zmianie języka otwarta odpowiedź FAQ może mieć inną wysokość
    document.addEventListener('cortex:langchange', () => {
        document.querySelectorAll('.faq-item.active .faq-answer').forEach(answer => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        });
    });

});
