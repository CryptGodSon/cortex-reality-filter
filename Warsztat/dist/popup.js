document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja i18n
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const msg = chrome.i18n.getMessage(elem.getAttribute('data-i18n'));
        if (msg) elem.innerHTML = msg;
    });

    const themeBtn = document.getElementById('theme-btn');
    const themeIconPath = document.querySelector('#theme-icon path');
    const moonPath = "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z";
    const sunPath = "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z";

    // Odtwarzanie zapisanych stanów (Motyw, Suwak, Przełącznik, Auto Scan)
    chrome.storage.local.get(['theme', 'strictMode', 'focusMode', 'autoScanMode'], (result) => {
        if (result.theme === 'light') {
            document.body.classList.add('light-theme');
            themeIconPath.setAttribute('d', sunPath);
        }
        if (result.strictMode) {
            document.getElementById('strict-slider').value = result.strictMode;
            document.getElementById('strict-val').innerText = result.strictMode;
        }
        if (result.focusMode !== undefined) {
            document.getElementById('focus-toggle').checked = result.focusMode;
        }
        if (result.autoScanMode !== undefined) {
            document.getElementById('auto-scan-toggle').checked = result.autoScanMode;
        }
    });

    // Obsługa motywów
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        themeIconPath.setAttribute('d', isLight ? sunPath : moonPath);
        chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
    });

    // Obsługa Suwaka Strict Mode
    const slider = document.getElementById('strict-slider');
    const sliderVal = document.getElementById('strict-val');
    slider.addEventListener('input', (e) => {
        sliderVal.innerText = e.target.value;
        chrome.storage.local.set({ strictMode: e.target.value });
    });

    // Obsługa przełącznika Focus
    const focusToggle = document.getElementById('focus-toggle');
    focusToggle.addEventListener('change', (e) => {
        chrome.storage.local.set({ focusMode: e.target.checked });
    });

    // Obsługa przełącznika Auto Scan
    const autoScanToggle = document.getElementById('auto-scan-toggle');
    autoScanToggle.addEventListener('change', (e) => {
        chrome.storage.local.set({ autoScanMode: e.target.checked });
    });

    // Nasłuchiwacz na nową siatkę 6 przycisków analizy AI
    const actionButtons = document.querySelectorAll('.cx-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedMode = btn.dataset.mode;
            const strictVal = slider.value;
            const isFocusOn = focusToggle.checked;

            // Wypełnienie paczki danych i wysłanie do wstrzykniętego skryptu
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "SCAN_CUSTOM",
                        mode: selectedMode,
                        strict: strictVal,
                        focus: isFocusOn
                    }).catch(error => {
                        console.log("Cortex: Nie można połączyć się z tą stroną (Może to być np. domyślna strona Google lub wewnętrzne opcje Chrome).", error);
                    });
                }
            });
            window.close(); // Automatyczne zamknięcie menu po wydaniu rozkazu
        });
    });
});
