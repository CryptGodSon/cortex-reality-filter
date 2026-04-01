// background.js - Cortex Neural Link (Final Fix + Cache Optimization + BYOK)
// Używamy stabilnego v1beta gemini-2.5-flash. Z racji wbudowanego "myślenia", zabezpieczamy go gigantycznym limitem tokenów.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const analysisCache = new Map(); // Simple In-Memory Cache for fast repeated queries

// Szybka i prosta funkcja hashująca do tworzenia unikalnych kluczy dla Cache
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE_TEXT") {
        analyzeWithGemini(request.text, request.mode || 'truth_fake', parseInt(request.strict) || 5)
            .then(sendResponse);
        return true;
    }
});

const SCHEMAS = {
    'truth_fake': '{"truth_score": (int), "fake_score": (int), "verdict": (string), "basis": (string), "consensus_supporting": (int), "consensus_refuting": (int)}',
    'fallacies': '{"list": [{"title": (string krótkie nazwa błędu), "desc": (string dowód z tekstu)}], "verdict": "Ogólna ocena logiczna tekstu (Max 2 zdania).", "consensus_supporting": (int), "consensus_refuting": (int)}',
    'ai_scan': '{"truth_score": (int % człowiek), "fake_score": (int % AI), "verdict": (string wnioski z linguistyki), "basis": (string podejrzane frazy), "consensus_supporting": (int), "consensus_refuting": (int)}',
    'tldr': '{"tldr": (string Dwa bardzo mocne, nasycone faktami zdania bez owijania w bawełnę), "verdict": "Krótkie podsumowanie wydźwięku całości", "consensus_supporting": (int), "consensus_refuting": (int)}',
    'quotes': '{"list": [{"title": "Twarda teza/Cytat", "desc": "Znaczenie"}], "verdict": "Zbiór danych znalezionych w tekście", "consensus_supporting": (int), "consensus_refuting": (int)}',
    'polarization': '{"truth_score": (int % Obiektywizm), "fake_score": (int % Polaryzacja i Skłócanie), "verdict": (string ocena polaryzacji), "basis": (string użyte chwyty emocjonalne), "consensus_supporting": (int), "consensus_refuting": (int)}'
};

async function analyzeWithGemini(text, mode, strictMode) {
    const schema = SCHEMAS[mode] || SCHEMAS['truth_fake'];
    const cacheKey = `${mode}_${strictMode}_${simpleHash(text.substring(0, 150))}`;

    let basePromptName = 'sysPromptTruthFake';
    if (mode === 'fallacies') basePromptName = 'sysPromptFallacies';
    else if (mode === 'ai_scan') basePromptName = 'sysPromptAiScan';
    else if (mode === 'tldr') basePromptName = 'sysPromptTldr';
    else if (mode === 'quotes') basePromptName = 'sysPromptQuotes';
    else if (mode === 'polarization') basePromptName = 'sysPromptPolarization';

    let baseSystemPrompt = chrome.i18n.getMessage(basePromptName) || "You are Cortex Analyst.";

    // Sprawdzenie lokalnej pamięci podręcznej przed uderzeniem do Gemini API (Oszczędność czasu i limitów)
    if (analysisCache.has(cacheKey)) {
        return analysisCache.get(cacheKey);
    }

    // Obliczanie poziomu radykalizmu The Strict Mode (1 = Luźno: Temp 0.8 | 10 = Zero-Trust: Temp 0.0 + Explicit Prompt)
    let aiTemperature = 1.0 - (strictMode / 10);
    // Jeśli Strict Mode to 10 (Max), dopisujemy groźbę systemową
    let finalSystemPrompt = baseSystemPrompt;
    if (strictMode >= 8) {
        finalSystemPrompt += chrome.i18n.getMessage("sysPromptStrictMode") || " STRICT MODE ACTIVE: Be brutally rigorous.";
        aiTemperature = Math.max(0.1, aiTemperature - 0.2); // max oziębienie
    }

    try {
        const storedKey = await new Promise(resolve => {
            chrome.storage.local.get(['geminiApiKey'], (result) => resolve(result.geminiApiKey));
        });

        if (!storedKey) {
            return {
                verdict: "Klucz API nie został skonfigurowany. Kliknij PPM na Cortex i wybierz Opcje (Options), aby go dodać.",
                truth_score: 0,
                fake_score: 0
            };
        }

        const response = await fetch(`${API_URL}?key=${storedKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: finalSystemPrompt }] },
                contents: [{
                    parts: [{ text: `Analyze this text and return the result STRICTLY according to this JSON schema ${schema}:\n\n${text}` }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 8192,
                    temperature: aiTemperature
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Błąd API Gemini:", data.error);
            return { verdict: `Błąd API: ${data.error.message}`, truth_score: 0, fake_score: 0 };
        }

        // Zabezpieczenie przed błędem struktury z modeli ucinających odpowiedź:
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
            console.error("Niespodziewana pusta odpowiedź API (prawdopodobnie ucięto ze względu na bezpieczeństwo):", data);
            return { verdict: `Błąd API: Ucięto odpowiedź. (Sprawdź konsolę)`, truth_score: 0, fake_score: 0 };
        }

        let rawOutput = data.candidates[0].content.parts[0].text;

        // API w trybie responseMimeType="application/json" powinno od razu zwrócić poprawny string
        const parsedResult = JSON.parse(rawOutput);

        // Zapis do Cache (Żyjemy w ServiceWorkerze, więc cache zniknie po pełnym uśpieniu przeglądarki)
        analysisCache.set(cacheKey, parsedResult);

        return parsedResult;

    } catch (error) {
        console.error("Cortex Exception:", error);
        return {
            verdict: `Błąd analizatora: nie można odczytać danych wewnątrz (Sprawdź konsolę w background.js).`,
            truth_score: 0,
            fake_score: 0
        };
    }
}