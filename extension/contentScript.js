// Wstrzykiwanie zaawansowanych arkuszy stylów (Animacje i Glassmorphism + Focus Mode)
function injectCortexStyles() {
    if (document.getElementById('cortex-styles')) return;

    const style = document.createElement('style');
    style.id = 'cortex-styles';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* ANIMACJE */
        @keyframes cortexReveal {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); filter: blur(5px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes cortexScanPulse {
            0% { border-color: rgba(0, 255, 204, 0.2); box-shadow: 0 4px 15px rgba(0, 255, 204, 0.1); }
            50% { border-color: rgba(0, 255, 204, 0.8); box-shadow: 0 4px 25px rgba(0, 255, 204, 0.4); }
            100% { border-color: rgba(0, 255, 204, 0.2); box-shadow: 0 4px 15px rgba(0, 255, 204, 0.1); }
        }
        @keyframes fillBar { from { width: 0%; } }
        @keyframes skeletonLoading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes pulseBlock { from { opacity: 0.4; box-shadow: 0 0 2px #00ffcc; } to { opacity: 1; box-shadow: 0 0 12px #00ffcc; } }
        @keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes fadeInOverlay { 0% { backdrop-filter: blur(0px) brightness(1); } 100% { backdrop-filter: blur(12px) brightness(0.2); } }

        /* FOCUS MODE OBSCURA */
        .cortex-focus-obscura {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483640; /* Tuż pod overlayem Cortexu */
            background: rgba(0, 0, 0, 0.1);
            animation: fadeInOverlay 0.8s forwards;
            pointer-events: none; /* Żeby dało się klikać w stronę, chociaż jest zasłonięta */
        }

        /* GŁÓWNY PANEL CORTEX */
        #cortex-overlay {
            position: fixed;
            top: 24px; right: 24px; width: 340px;
            background: rgba(12, 12, 14, 0.90);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px; padding: 20px;
            color: #fff; font-family: 'Inter', sans-serif;
            z-index: 2147483647;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: cortexReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transition: opacity 0.3s ease, transform 0.3s ease;
            max-height: 80vh; overflow-y: auto;
        }

        #cortex-overlay::-webkit-scrollbar { width: 4px; }
        #cortex-overlay::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.5); border-radius: 4px; }

        #cortex-overlay.cortex-loading {
            animation: cortexReveal 0.5s forwards, cortexScanPulse 2s infinite ease-in-out;
            border-color: rgba(0, 255, 204, 0.4);
        }

        #cortex-overlay.cortex-closing {
            opacity: 0 !important;
            transform: translateY(-15px) scale(0.95) !important;
            pointer-events: none;
        }

        /* POZOSTAŁE STYLE (SKELETON, TYPOGRAFIA, PASKI) */
        .cx-skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(0,255,204,0.1) 50%, rgba(255,255,255,0.02) 75%);
            background-size: 200% 100%; animation: skeletonLoading 1.5s infinite; border-radius: 4px; height: 12px; margin-bottom: 8px;
        }
        .cx-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px; }
        .cx-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #00ffcc; letter-spacing: 0.5px; text-shadow: 0 0 10px rgba(0, 255, 204, 0.3); text-transform: uppercase;}
        .cx-logo { width: 8px; height: 8px; background: #00ffcc; border-radius: 50%; box-shadow: 0 0 8px #00ffcc; }
        .cx-logo.pulsing { animation: pulseBlock 1s infinite alternate; }
        .cx-close { cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255, 255, 255, 0.05); color: #888; transition: all 0.2s; }
        .cx-close:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }

        /* BARS */
        .cx-stat-row { margin-bottom: 12px; }
        .cx-stat-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .cx-bar-bg { height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; position: relative; }
        .cx-bar-fill { height: 100%; border-radius: 4px; animation: fillBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative; }
        .cx-bar-fill::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: sweep 2s infinite; }

        /* TEKSTY I KAFELKI DLA LIST (V2) */
        .cx-verdict { margin-top: 16px; font-size: 13px; line-height: 1.6; color: #e0e0e0; }
        .cx-basis { margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #888; font-style: italic; line-height: 1.5; }
        
        .cx-data-card {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
            border-left: 3px solid #00ffcc; padding: 12px; border-radius: 6px; margin-bottom: 10px;
        }
        .cx-card-title { font-weight: 700; font-size: 12px; color: #00ffcc; margin-bottom: 6px; line-height: 1.4; }
        .cx-card-desc { font-size: 11px; color: #bbb; line-height: 1.5; }

        /* LASER SCANNER SELECTION FX */
        @keyframes laserScan {
            0% { top: -10px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .cortex-selection-highlight {
            position: absolute;
            z-index: 2147483645;
            border: 2px solid rgba(0, 255, 204, 0.8);
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 255, 204, 0.2) inset;
            border-radius: 4px;
            pointer-events: none;
            transition: all 0.5s ease;
            overflow: hidden;
        }
        .cortex-selection-laser {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: #00ffcc;
            box-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc;
            animation: laserScan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* CROWDSOURCING */
        .cx-feedback { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
        .cx-vote-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #888; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); font-family: 'Inter', sans-serif; }
        .cx-vote-btn:hover { transform: translateY(-2px); }
        .cx-vote-btn.upvote:hover { background: rgba(0, 255, 204, 0.15); color: #00ffcc; border-color: rgba(0, 255, 204, 0.3); box-shadow: 0 0 10px rgba(0, 255, 204, 0.2); }
        .cx-vote-btn.downvote:hover { background: rgba(255, 51, 102, 0.15); color: #ff3366; border-color: rgba(255, 51, 102, 0.3); box-shadow: 0 0 10px rgba(255, 51, 102, 0.2); }
        .cx-vote-btn.active.upvote { background: rgba(0, 255, 204, 0.2); color: #00ffcc; border-color: #00ffcc; }
        .cx-vote-btn.active.downvote { background: rgba(255, 51, 102, 0.2); color: #ff3366; border-color: #ff3366; }

        /* QUICK ACTION BUBBLE */
        .cortex-quick-bubble {
            position: absolute;
            z-index: 2147483646; /* Tuż pod głównym panelem */
            width: 32px; height: 32px;
            background: rgba(12, 12, 14, 0.85);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 255, 204, 0.3);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 255, 204, 0.2);
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transform: scale(0.5) translateY(10px);
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }
        .cortex-quick-bubble.show {
            opacity: 1; transform: scale(1) translateY(0);
            pointer-events: auto;
        }
        .cortex-quick-bubble:hover {
            background: rgba(20, 20, 24, 0.95);
            border-color: rgba(0, 255, 204, 0.8);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 255, 204, 0.4);
            transform: scale(1.1);
        }
        .cortex-quick-bubble svg {
            width: 16px; height: 16px; color: #00ffcc;
        }
    `;
    document.head.appendChild(style);
}

let currentHighlightNode = null;
let currentQuickBubble = null;

function clearSelectionHighlight() {
    if (currentHighlightNode) {
        currentHighlightNode.remove();
        currentHighlightNode = null;
    }
}

function clearQuickBubble() {
    if (currentQuickBubble) {
        currentQuickBubble.remove();
        currentQuickBubble = null;
    }
}

// Obsługa zaznaczania tekstu i wywoływania Quick Action Bubble
document.addEventListener('mouseup', (e) => {
    // Zapobiegamy odpalaniu z samego siebie
    if (e.target.closest('.cortex-quick-bubble') || e.target.closest('#cortex-overlay')) {
        return;
    }

    setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 5 && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Jeśli Bubble już istnieje, po prostu go usuwamy przed stworzeniem nowego
            clearQuickBubble();

            // MUSIMY ZALADOWAĆ STYLE, INACZEJ DYMEK BĘDZIE NIEWIDZIALNY!
            injectCortexStyles();

            // Obliczenia pozycji względem dokumentu (uwzględnienie scrolla)
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            currentQuickBubble = document.createElement('div');
            currentQuickBubble.className = 'cortex-quick-bubble';

            // Ikonka Cortex z SVG
            currentQuickBubble.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;

            // Ustawienie pod zaznaczonym tekstem
            currentQuickBubble.style.top = (rect.bottom + scrollTop + 8) + 'px';
            currentQuickBubble.style.left = (rect.right + scrollLeft - 16) + 'px';

            // Zdarzenie kliknięcia w Bubble
            currentQuickBubble.addEventListener('mousedown', (evt) => {
                evt.stopPropagation(); // Zapobiega utracie zaznaczenia
                clearQuickBubble();

                // Pobieramy StrictMode z zapisu, jeśli jest pusty dajemy default 5
                chrome.storage.local.get(['strictMode'], (res) => {
                    initCortexAnalysis(selectedText, 'truth_fake', res.strictMode || 5, false);
                });
            });

            document.body.appendChild(currentQuickBubble);

            // Drobne opóźnienie przed dodaniem klasy animującej płynnego wejścia
            requestAnimationFrame(() => {
                if (currentQuickBubble) currentQuickBubble.classList.add('show');
            });

        } else {
            // Zamknij dymek, jeśli nie wybrano odpowiedniego tekstu
            clearQuickBubble();
        }
    }, 10);
});

// Zniknij przy rozpoczęciu nowego zaznaczania
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.cortex-quick-bubble') && !e.target.closest('#cortex-overlay')) {
        clearQuickBubble();
    }
});

function drawSelectionHighlight(rect) {
    clearSelectionHighlight();

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const highlight = document.createElement('div');
    highlight.className = 'cortex-selection-highlight';

    const padding = 6;
    highlight.style.top = (rect.top + scrollTop - padding) + 'px';
    highlight.style.left = (rect.left + scrollLeft - padding) + 'px';
    highlight.style.width = (rect.width + padding * 2) + 'px';
    highlight.style.height = (rect.height + padding * 2) + 'px';

    const laser = document.createElement('div');
    laser.className = 'cortex-selection-laser';
    highlight.appendChild(laser);

    document.body.appendChild(highlight);
    currentHighlightNode = highlight;
}

function startFocusMode() {
    if (document.getElementById('cortex-focus-bg')) return;
    const obscura = document.createElement('div');
    obscura.id = 'cortex-focus-bg';
    obscura.className = 'cortex-focus-obscura';
    document.body.appendChild(obscura);
}

function stopFocusMode() {
    const obscura = document.getElementById('cortex-focus-bg');
    if (obscura) obscura.remove();
}

function showCortexOverlay(data) {
    injectCortexStyles();

    const existingOverlay = document.getElementById('cortex-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cortex-overlay';

    const isLoading = data._isLoading || data.truth_score === "ERR";

    if (!isLoading && currentHighlightNode) {
        // Usuń laser po otrzymaniu werdyktu
        const laser = currentHighlightNode.querySelector('.cortex-selection-laser');
        if (laser) laser.remove();
        currentHighlightNode.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 255, 204, 0.5) inset";
        currentHighlightNode.style.borderColor = "rgba(0, 255, 204, 1)";
    }

    if (isLoading) {
        overlay.classList.add('cortex-loading');
    }

    const modeNames = {
        'truth_fake': chrome.i18n.getMessage("modeTruthFake") || 'Truth/Fake Scan',
        'fallacies': chrome.i18n.getMessage("modeFallacies") || 'Błędy Logiczne',
        'ai_scan': chrome.i18n.getMessage("modeAiScan") || 'Skaner AI',
        'tldr': chrome.i18n.getMessage("modeTldr") || 'TL;DR',
        'quotes': chrome.i18n.getMessage("modeQuotes") || 'Quotes',
        'polarization': chrome.i18n.getMessage("modePolarization") || 'Polarization'
    };

    const headerTitle = modeNames[data._modeId] || 'CORTEX VERDICT';

    let contentInnerHtml = '';

    if (isLoading) {
        contentInnerHtml = `
            <div style="margin-top: 12px; margin-bottom: 20px;">
                <div style="color: #00ffcc; font-size: 11px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    ${chrome.i18n.getMessage("overlayLoading") || "Neural Scan in Progress..."}
                </div>
                <div class="cx-skeleton" style="width: 100%;"></div>
                <div class="cx-skeleton" style="width: 85%;"></div>
                <div class="cx-skeleton" style="width: 92%;"></div>
                <div class="cx-skeleton" style="width: 60%;"></div>
            </div>
        `;
    } else {
        // --- DYNAMICZNY SYSTEM RENDEROWANIA DANYCH RÓZNEGO TYPU (V2 OMNITOOL) ---

        // 1. Zbiór Kafelków (Kategoria: fallacies, quotes)
        if (data.list && Array.isArray(data.list)) {
            contentInnerHtml += `<div style="margin-top: 12px;">`;
            data.list.forEach(item => {
                contentInnerHtml += `
                    <div class="cx-data-card">
                        <div class="cx-card-title">${item.title}</div>
                        <div class="cx-card-desc">${item.desc}</div>
                    </div>
                `;
            });
            contentInnerHtml += `</div>`;
        }

        // 2. Gruby Tekst TL;DR (Kategoria: tldr)
        else if (data.tldr) {
            contentInnerHtml += `
                <div style="font-size: 14px; font-weight: 600; color: #00ffcc; line-height: 1.5; padding: 12px; background: rgba(0, 255, 204, 0.05); border-radius: 8px; margin-top: 12px; border: 1px solid rgba(0,255,204,0.1);">
                    ${data.tldr}
                </div>
            `;
        }

        // 3. Paski Postępu (Kategoria: truth_fake, ai_scan, polarization)
        else {
            let val1 = parseInt(data.truth_score) || 0;
            let val2 = parseInt(data.fake_score || data.polarization_score) || 0;

            // Dopasowanie Etykiet Pasków na podstawie Mode
            let label1 = chrome.i18n.getMessage("labelTruth") || "TRUTH";
            let label2 = chrome.i18n.getMessage("labelFake") || "FAKE";
            let color1 = val1 > 50 ? '#00ffcc' : '#a0a0a0';
            let color2 = val2 > 50 ? '#ff3366' : '#a0a0a0';

            if (data._modeId === 'ai_scan') {
                label1 = chrome.i18n.getMessage("labelHuman") || "HUMAN";
                label2 = chrome.i18n.getMessage("labelSynthetic") || "AI SYNTHETIC";
            } else if (data._modeId === 'polarization') {
                label1 = chrome.i18n.getMessage("labelObjective") || "OBJECTIVE";
                label2 = chrome.i18n.getMessage("labelPolarized") || "POLARIZED";
            }

            contentInnerHtml += `
                <div class="cx-stat-row">
                    <div class="cx-stat-labels">
                        <span style="color: ${color1}">${label1}</span>
                        <span style="color: ${color1}">${val1}%</span>
                    </div>
                    <div class="cx-bar-bg">
                        <div class="cx-bar-fill" style="width: ${val1}%; background: ${color1}; box-shadow: 0 0 10px ${color1};"></div>
                    </div>
                </div>

                <div class="cx-stat-row">
                    <div class="cx-stat-labels">
                        <span style="color: ${color2}">${label2}</span>
                        <span style="color: ${color2}">${val2}%</span>
                    </div>
                    <div class="cx-bar-bg">
                        <div class="cx-bar-fill" style="width: ${val2}%; background: ${color2}; box-shadow: 0 0 10px ${color2};"></div>
                    </div>
                </div>
            `;
        }

        // Zawsze dodajemy główny Werdykt AI
        contentInnerHtml += `
            <div class="cx-verdict">
                ${data.verdict || ''}
            </div>
        `;

        // Oraz podstawy (jeśli istnieją i nie użyto już trybu kafelków)
        if (data.basis) {
            contentInnerHtml += `
                <div class="cx-basis">
                    <strong>${chrome.i18n.getMessage("labelBasis") || "Uzasadnienie:"}</strong> ${data.basis}
                </div>
            `;
        }

        // Moduł Ocen (Konsensus Sieci ze sztucznej inteligencji)
        const consensusSupporting = data.consensus_supporting !== undefined ? data.consensus_supporting : '?';
        const consensusRefuting = data.consensus_refuting !== undefined ? data.consensus_refuting : '?';

        contentInnerHtml += `
            <div class="cx-feedback">
                <span style="font-size: 10px; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${chrome.i18n.getMessage("labelConsensus") || "Wiarygodność Zewnętrznych Źródeł"}</span>
                <div style="display: flex; gap: 8px;">
                    <button class="cx-vote-btn upvote" style="pointer-events: none;" title="${chrome.i18n.getMessage("tooltipUpvote") || "Źródła potwierdzające tezę"}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                        <span id="cx-uv-count">${consensusSupporting}</span>
                    </button>
                    <button class="cx-vote-btn downvote" style="pointer-events: none;" title="${chrome.i18n.getMessage("tooltipDownvote") || "Źródła zaprzeczające tezie"}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <span id="cx-dv-count">${consensusRefuting}</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Wstawienie do DOM
    overlay.innerHTML = `
        <div class="cx-header">
            <div class="cx-brand">
                <div class="cx-logo ${isLoading ? 'pulsing' : ''}"></div>
                ${headerTitle}
            </div>
            <div class="cx-close" id="cx-close-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
        </div>
        ${contentInnerHtml}
    `;

    document.body.appendChild(overlay);

    // Wydarzenia kliknięcia zamykania okna
    const closeBtn = document.getElementById('cx-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.add('cortex-closing');
            stopFocusMode();
            clearSelectionHighlight();
            setTimeout(() => overlay.remove(), 300);
        });
    }

}

// Funkcja przetwarzająca zadanie analityczne wysłane z Popup.js
async function initCortexAnalysis(textToAnalyze, reqMode, reqStrict, reqFocus) {
    if (textToAnalyze.length === 0) {
        alert(chrome.i18n.getMessage("errNoText") || "Cortex: No text to analyze found!");
        return;
    }

    // Załączenie FocusMode (Ściemnienie strony uderzeniem z CSS)
    if (reqFocus) {
        startFocusMode();
    }

    textToAnalyze = textToAnalyze.substring(0, 4000).trim();

    // Pokazujemy zaawansowany stan ładowania szkieletowego w prawidłowej chmurce trybu
    showCortexOverlay({ _isLoading: true, _modeId: reqMode });

    try {
        const response = await chrome.runtime.sendMessage({
            type: "ANALYZE_TEXT",
            text: textToAnalyze,
            mode: reqMode,
            strict: reqStrict
        });

        if (response) {
            response._modeId = reqMode; // Doklejenie metadanych dla renderera
            showCortexOverlay(response);
        }
    } catch (e) {
        console.error("Cortex Error:", e);
        showCortexOverlay({ truth_score: "ERR", text: "ERR", verdict: chrome.i18n.getMessage("errConnection") || "Connection error." });
    }
}

// Nasłuchiwacz V2 nasłuchujący komend nowej siatki popupu Omnitool
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SCAN_CUSTOM") {

        let selectionObj = window.getSelection();
        let textToAnalyze = selectionObj.toString();

        if (textToAnalyze && textToAnalyze.length >= 5 && selectionObj.rangeCount > 0) {
            // Opcja Laser Scan: Użytkownik konkretnie zaznaczył tekst na stronie. Rysujemy skaner i zaciemnienie strony wokół pudełka.
            let rect = selectionObj.getRangeAt(0).getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                drawSelectionHighlight(rect);
            }
        } else {
            textToAnalyze = "";
            // OPTYMALIZACJA WYDAJNOŚCI: Szybka pętla przerywająca się po uzyskaniu max znaków dla AI (4000)
            const elements = document.querySelectorAll('h1, h2, h3, p');
            for (let i = 0; i < elements.length; i++) {
                textToAnalyze += elements[i].innerText + " ";
                if (textToAnalyze.length >= 4000) {
                    textToAnalyze = textToAnalyze.substring(0, 4200); // Mały zapas dla ucięcia słowa w init
                    break;
                }
            }
        }

        // Strzelamy do rdzenia wstrzykując parametry z Popupu
        initCortexAnalysis(textToAnalyze, request.mode, request.strict, request.focus);
    }
    return true;
});

// Auto Scanner Observer (uruchamia się po załadowaniu nowej strony, omijając duże sekcje tekstu dla wydajności)
window.addEventListener('load', () => {
    chrome.storage.local.get(['autoScanMode', 'strictMode', 'focusMode'], (result) => {
        if (result.autoScanMode) {
            // Zbieramy tylko tytuł i najważniejsze nagłówki (h1, h2, h3), aby nie psuć wydajności
            let textToAnalyze = document.title + ".\n";
            const elements = document.querySelectorAll('h1, h2, h3, header h1, article h1');

            for (let i = 0; i < elements.length; i++) {
                let text = elements[i].innerText.trim();
                // Odrzucamy bardzo krótkie fragmenty i minimalizujemy puste przebiegi
                if (text.length > 5) {
                    textToAnalyze += text + ".\n";
                }
                if (textToAnalyze.length >= 1000) { // Maksymalnie 1000 znaków (bardzo szybki prompt)
                    textToAnalyze = textToAnalyze.substring(0, 1000);
                    break;
                }
            }

            if (textToAnalyze.length > 20) {
                initCortexAnalysis(textToAnalyze, 'truth_fake', result.strictMode || 5, result.focusMode || false);
            }
        }
    });
});