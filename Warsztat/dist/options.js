document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Wczytaj zapisany klucz przy starcie
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
    });

    // Zapisz po kliknięciu
    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key.length > 10) {
            chrome.storage.local.set({ geminiApiKey: key }, () => {
                statusDiv.innerText = "System aktualizacji potwierdzony: Klucz zapisany w bezpiecznym sektorze Pamięci.";
                statusDiv.className = "success";
                setTimeout(() => { statusDiv.innerText = ""; }, 3000);
            });
        } else {
            statusDiv.innerText = "Błąd autoryzacji: Wprowadź poprawny klucz Gemini API.";
            statusDiv.className = "error";
            setTimeout(() => { statusDiv.innerText = ""; }, 3000);
        }
    });
});
