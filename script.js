/* ==================== JARVIS AI ASSISTANT ==================== */
/* Vanilla JavaScript - No external libraries */
/* FULLY FUNCTIONAL VERSION */

// ==================== STATE MANAGEMENT ====================
const state = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    commandHistory: [],
    wakeWordDetected: false,
    currentTranscript: '',
    recognitionAttempts: 0,
    openaiKey: localStorage.getItem('openaiKey') || null,
    useOpenAI: localStorage.getItem('useOpenAI') === 'true' || false,
};

// ==================== OPENAI API INTEGRATION ====================
/**
 * Set OpenAI API key
 */
function setOpenAIKey(key) {
    state.openaiKey = key;
    localStorage.setItem('openaiKey', key);
    state.useOpenAI = true;
    localStorage.setItem('useOpenAI', 'true');
    console.log('[OPENAI] API key configured');
    console.log('[OPENAI] State updated - useOpenAI:', state.useOpenAI, 'hasKey:', !!state.openaiKey);
    showNotification('✓ OpenAI API key configured successfully', 'success');
    
    // Test the API key immediately
    testOpenAIKey(key);
}

/**
 * Test if OpenAI API key is valid
 */
async function testOpenAIKey(key) {
    try {
        console.log('[OPENAI] Testing API key...');
        console.log('[OPENAI] Testing with model: gpt-3.5-turbo');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 10,
            }),
        });

        console.log('[OPENAI] Test Response Status:', response.status);
        const data = await response.json();
        
        if (response.ok) {
            console.log('[OPENAI] ✓ API key is VALID and working!');
            console.log('[OPENAI] Model response:', data.choices[0].message.content);
            showNotification('✓ API key verified and working!', 'success');
            return true;
        } else {
            console.error('[OPENAI] API Error Response:', data);
            const errorMsg = data.error?.message || 'Unknown error';
            const errorType = data.error?.type || 'unknown';
            
            console.error('[OPENAI] Error Type:', errorType);
            console.error('[OPENAI] Error Message:', errorMsg);
            
            // Provide specific guidance based on error
            let userMessage = `❌ API Test Failed (${response.status}): ${errorMsg}`;
            
            if (response.status === 401) {
                userMessage += ' - Invalid or expired API key.';
            } else if (response.status === 429) {
                userMessage += ' - Rate limited. Check account quota.';
            } else if (response.status === 403) {
                userMessage += ' - Check billing status at openai.com/account/billing';
            }
            
            showNotification(userMessage, 'error');
            return false;
        }
    } catch (error) {
        console.error('[OPENAI] Error testing key:', error);
        showNotification(`❌ Network Error: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Clear OpenAI API key
 */
function clearOpenAIKey() {
    state.openaiKey = null;
    state.useOpenAI = false;
    localStorage.removeItem('openaiKey');
    localStorage.setItem('useOpenAI', 'false');
    console.log('[OPENAI] API key cleared');
    showNotification('✓ OpenAI API key cleared', 'success');
}

/**
 * Show API settings modal
 */
function showAPIModal() {
    if (!elements.apiModal) return;
    
    // Always clear the input field for security and to allow fresh paste
    if (elements.apiKeyInput) {
        elements.apiKeyInput.value = '';
        elements.apiKeyInput.placeholder = 'sk-...';
    }
    
    if (elements.useOpenAICheckbox) {
        elements.useOpenAICheckbox.checked = state.useOpenAI;
    }
    
    elements.apiModal.classList.add('visible');
    console.log('[MODAL] API settings shown');
    
    // Focus on the input field
    if (elements.apiKeyInput) {
        setTimeout(() => elements.apiKeyInput.focus(), 100);
    }
}

/**
 * Hide API settings modal
 */
function hideAPIModal() {
    if (!elements.apiModal) return;
    elements.apiModal.classList.remove('visible');
    console.log('[MODAL] API settings hidden');
}

/**
 * Get dynamic response from OpenAI API
 */
async function getOpenAIResponse(userMessage) {
    if (!state.openaiKey) {
        console.warn('[OPENAI] No API key configured');
        return null;
    }

    try {
        console.log('[OPENAI] Calling API with message:', userMessage);
        state.isProcessing = true;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are JARVIS, an AI assistant inspired by Iron Man\'s JARVIS. You are sophisticated, helpful, and speak in a formal yet friendly manner. Keep responses concise and natural.'
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        console.log('[OPENAI] Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = '';
            let errorData = null;
            
            try {
                errorData = await response.json();
                errorMessage = errorData.error?.message || 'Unknown error';
            } catch (e) {
                errorMessage = response.statusText || 'Unknown error';
            }
            
            console.error('[OPENAI] API Error - Status:', response.status, 'Message:', errorMessage);
            
            // Handle different error types
            if (response.status === 401) {
                console.error('[OPENAI] Authentication failed - Invalid or expired API key');
                showNotification('❌ Invalid OpenAI API key. Please check your key at https://platform.openai.com/api-keys', 'error');
                state.useOpenAI = false;
                localStorage.setItem('useOpenAI', 'false');
            } else if (response.status === 403) {
                console.error('[OPENAI] Forbidden - Account may not have access');
                showNotification('❌ Access denied. Check if your account is active and billing is set up.', 'error');
                state.useOpenAI = false;
            } else if (response.status === 429) {
                console.error('[OPENAI] Rate limit exceeded');
                showNotification('⚠️ Too many requests. Please wait a moment before trying again.', 'error');
            } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                console.error('[OPENAI] Server error');
                showNotification('⚠️ OpenAI service is temporarily unavailable. Please try again later.', 'error');
            } else {
                console.error('[OPENAI] API Error:', errorMessage);
                showNotification(`❌ Error: ${errorMessage}`, 'error');
            }
            
            state.isProcessing = false;
            return null;
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        console.log('[OPENAI] ✓ Response received:', aiResponse.substring(0, 50) + '...');
        state.isProcessing = false;
        return aiResponse;

    } catch (error) {
        console.error('[OPENAI] Network/CORS Error:', error.message);
        
        // Check if it's a CORS error
        if (error.message.includes('CORS') || error.message.includes('cors')) {
            showNotification('⚠️ CORS Error: Browser cannot reach OpenAI API directly. Using fallback mode.', 'error');
            console.log('[OPENAI] Suggestion: Use a backend proxy to avoid CORS issues');
        } else {
            showNotification('❌ Failed to connect to OpenAI API: ' + error.message, 'error');
        }
        
        state.isProcessing = false;
        return null;
    }
}

// ==================== DOM ELEMENTS (Lazy Loading) ====================
let elements = {};

function initializeElements() {
    elements = {
        micButton: document.getElementById('micButton'),
        displayContent: document.getElementById('displayContent'),
        responseText: document.getElementById('responseText'),
        statusLight: document.getElementById('statusLight'),
        statusText: document.getElementById('statusText'),
        waveform: document.getElementById('waveform'),
        pulseCircle: document.getElementById('pulseCircle'),
        loader: document.getElementById('loader'),
        historyPanel: document.getElementById('historyPanel'),
        historyContent: document.getElementById('historyContent'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        toggleHistoryBtn: document.getElementById('toggleHistoryBtn'),
        closeHistoryBtn: document.getElementById('closeHistoryBtn'),
        inputLine: document.getElementById('inputLine'),
        cursor: document.getElementById('cursor'),
        micLabel: document.getElementById('micLabel'),
        particlesContainer: document.getElementById('particlesContainer'),
        settingsBtn: document.getElementById('settingsBtn'),
        apiModal: document.getElementById('apiModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        useOpenAICheckbox: document.getElementById('useOpenAICheckbox'),
        saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
        clearApiKeyBtn: document.getElementById('clearApiKeyBtn'),
    };
    
    // Verify all elements are loaded
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.warn(`Element '${key}' not found in DOM`);
        }
    }
}

// ==================== WEB SPEECH API SETUP ====================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

let recognition;
let synthesisVoices = [];
let recognitionActive = false;

/**
 * Initialize Web Speech API
 */
function initializeSpeechAPI() {
    console.log('[INIT] Starting Speech API initialization...');
    
    if (!SpeechRecognition) {
        console.error('[ERROR] Speech Recognition not supported');
        showNotification('⚠️ Speech Recognition not supported in this browser', 'error');
        return false;
    }

    try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Handle recognition start
        recognition.onstart = () => {
            console.log('[RECOGNITION] Started listening');
            recognitionActive = true;
            updateListeningState(true);
        };

        // Handle recognition results
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // Process all results from resultIndex to end
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                console.log(`[RESULT] Transcript: "${transcript}" (isFinal: ${event.results[i].isFinal})`);

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update interim display
            if (interimTranscript) {
                displayInterimTranscript(interimTranscript);
            }

            // Process final result
            if (finalTranscript) {
                state.currentTranscript = finalTranscript.trim();
                console.log(`[FINAL] Command: "${state.currentTranscript}"`);
                recognition.stop();
                recognitionActive = false;
                setTimeout(() => handleCommand(state.currentTranscript), 200);
            }
        };

        // Handle recognition errors
        recognition.onerror = (event) => {
            console.error('[ERROR] Recognition error:', event.error);
            recognitionActive = false;
            updateListeningState(false);
            
            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'network': 'Network error. Check your connection.',
                'audio-capture': 'No microphone found. Check permissions.',
                'not-allowed': 'Microphone permission denied.',
            };
            
            const message = errorMessages[event.error] || `Error: ${event.error}`;
            showNotification(`❌ ${message}`, 'error');
        };

        // Handle recognition end
        recognition.onend = () => {
            console.log('[RECOGNITION] Stopped');
            recognitionActive = false;
            updateListeningState(false);
        };

        // Load voices for TTS
        if (window.speechSynthesis) {
            const loadVoices = () => {
                synthesisVoices = window.speechSynthesis.getVoices();
                console.log(`[VOICES] Loaded ${synthesisVoices.length} voices`);
            };
            
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
            loadVoices();
        }

        console.log('[INIT] Speech API initialized successfully');
        return true;
    } catch (error) {
        console.error('[ERROR] Failed to initialize Speech API:', error);
        showNotification('❌ Failed to initialize voice recognition', 'error');
        return false;
    }
}

// ==================== LISTENING STATE MANAGEMENT ====================
/**
 * Update UI to reflect listening state
 */
function updateListeningState(isListening) {
    state.isListening = isListening;
    
    if (!elements.micButton) return; // Safety check

    if (isListening) {
        elements.micButton.classList.add('listening');
        if (elements.statusLight) elements.statusLight.classList.add('listening');
        if (elements.statusText) elements.statusText.textContent = '🎤 Listening...';
        if (elements.waveform) elements.waveform.classList.add('active');
        if (elements.pulseCircle) elements.pulseCircle.classList.add('active');
        if (elements.micLabel) elements.micLabel.textContent = 'Active';
    } else {
        elements.micButton.classList.remove('listening');
        if (elements.statusLight) {
            elements.statusLight.classList.remove('listening');
            elements.statusLight.classList.remove('speaking');
        }
        if (elements.statusText) elements.statusText.textContent = '✓ Idle';
        if (elements.waveform) elements.waveform.classList.remove('active');
        if (elements.pulseCircle) elements.pulseCircle.classList.remove('active');
        if (elements.micLabel) elements.micLabel.textContent = 'Activate';
    }
}

/**
 * Update speaking state
 */
function updateSpeakingState(isSpeaking) {
    state.isSpeaking = isSpeaking;
    
    if (!elements.statusLight || !elements.statusText) return;

    if (isSpeaking) {
        elements.statusLight.classList.add('speaking');
        elements.statusText.textContent = '💬 Speaking...';
    } else {
        elements.statusLight.classList.remove('speaking');
        elements.statusText.textContent = '✓ Idle';
    }
}

/**
 * Display interim transcript while listening
 */
function displayInterimTranscript(transcript) {
    if (!elements.inputLine) return;
    
    if (transcript) {
        elements.inputLine.innerHTML = `<span style="opacity: 0.6; margin-right: 10px;">${escapeHtml(transcript)}</span><span class="cursor">▊</span>`;
    }
}

// ==================== COMMAND HANDLING ====================
/**
 * Main command handler - routes commands to appropriate functions
 */
function handleCommand(transcript) {
    console.log('[COMMAND] Processing:', transcript);
    
    if (!transcript || transcript.trim().length === 0) {
        console.log('[COMMAND] Empty transcript, skipping');
        return;
    }

    const command = transcript.toLowerCase().trim();
    
    // Add to history
    addToHistory(command);
    displayCommand(command);

    // Wake word detection
    if (command.includes('hey jarvis') || command.includes('hey robot') || 
        (command.includes('jarvis') && command.length < 20)) {
        state.wakeWordDetected = true;
        respond('Hey there! What can I do for you?');
        setTimeout(() => startListening(), 800);
        return;
    }

    // Route to appropriate handler
    if (command.match(/time|what.*time|tell.*time/i)) {
        handleTime();
    } else if (command.match(/date|what.*date|tell.*date|today/i)) {
        handleDate();
    } else if (command.match(/search|google/i)) {
        const query = command
            .replace(/^(search|google)\s+(for\s+)?/i, '')
            .replace(/^on\s+google/i, '')
            .trim();
        handleSearch(query);
    } else if (command.match(/^open\s+/i)) {
        const site = command.replace(/^open\s+/i, '').trim();
        handleOpenSite(site);
    } else if (command.match(/clear|history/i)) {
        clearCommandHistory();
    } else if (command.match(/goodbye|exit|quit|bye|close|shut.*down/i)) {
        respond('Goodbye! Stay awesome.');
        state.wakeWordDetected = false;
    } else {
        // Default: conversation handler
        handleConversation(command);
    }
}

// ==================== COMMAND HANDLERS ====================
/**
 * Tell current time
 */
function handleTime() {
    const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    respond(`The current time is ${time}`);
    displayResponse(`Time: ${time}`);
}

/**
 * Tell current date
 */
function handleDate() {
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    respond(`Today is ${date}`);
    displayResponse(`Date: ${date}`);
}

/**
 * Search on Google
 */
function handleSearch(query) {
    if (!query.trim()) {
        respond('Please specify what you want to search for');
        return;
    }
    respond(`Searching for ${query}...`);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    displayResponse(`<strong>Opening Search:</strong> ${query}`);
    setTimeout(() => {
        window.open(searchUrl, '_blank');
    }, 500);
}

/**
 * Open specific websites
 */
function handleOpenSite(site) {
    const siteName = site.toLowerCase().trim();
    const sites = {
        'google': 'https://www.google.com',
        'youtube': 'https://www.youtube.com',
        'github': 'https://www.github.com',
        'linkedin': 'https://www.linkedin.com',
        'twitter': 'https://www.twitter.com',
        'facebook': 'https://www.facebook.com',
        'reddit': 'https://www.reddit.com',
        'stackoverflow': 'https://stackoverflow.com',
        'mdn': 'https://developer.mozilla.org',
        'wikipedia': 'https://www.wikipedia.org',
    };

    const url = Object.keys(sites).find(key => siteName.includes(key))
        ? sites[Object.keys(sites).find(key => siteName.includes(key))]
        : null;

    if (url) {
        respond(`Opening ${Object.keys(sites).find(key => siteName.includes(key))} for you`);
        displayResponse(`<strong>Opening:</strong> ${site}`);
        setTimeout(() => {
            window.open(url, '_blank');
        }, 500);
    } else {
        respond(`I don't know how to open ${site}. Try: google, youtube, github, linkedin, twitter, facebook, reddit, stackoverflow, mdn, or wikipedia`);
    }
}

/**
 * Handle general conversation
 */
function handleConversation(command) {
    console.log('[CONVERSATION] Handling command:', command);
    console.log('[CONVERSATION] useOpenAI:', state.useOpenAI, 'hasKey:', !!state.openaiKey);
    
    // If OpenAI is enabled and key is set, use API
    if (state.useOpenAI && state.openaiKey) {
        console.log('[CONVERSATION] Using OpenAI API for response');
        getOpenAIResponse(command).then(response => {
            if (response) {
                console.log('[CONVERSATION] Got OpenAI response');
                respond(response);
                displayResponse(response);
            } else {
                console.log('[CONVERSATION] OpenAI failed, using fallback');
                // Fallback to local responses if API fails
                fallbackConversationResponse(command);
            }
        });
        return;
    }

    // Fallback to local static responses
    console.log('[CONVERSATION] Using fallback static responses');
    fallbackConversationResponse(command);
}

/**
 * Fallback conversation handler with static responses
 */
function fallbackConversationResponse(command) {
    // JARVIS personality responses
    const responses = {
        'hello': 'Good day. How may I be of service?',
        'hi': 'Greetings. What can I assist you with?',
        'how are you': 'I am functioning optimally, thank you for asking.',
        'what is your name': 'I am JARVIS, Just A Rather Very Intelligent System. At your service.',
        'who are you': 'I am JARVIS, an artificial intelligence assistant. How may I assist you?',
        'what can you do': 'I can tell you the time, date, search the web, open websites, and have conversations. Simply ask me anything.',
        'thank you': 'You are most welcome. Is there anything else I can assist with?',
        'thanks': 'My pleasure. How else may I be of service?',
        'what time is it': 'Allow me to check... It is currently ' + new Date().toLocaleTimeString() + '.',
        'good morning': 'Good morning. I hope you have a productive day ahead.',
        'good night': 'Good night. Rest well.',
        'what is the weather': 'I apologize, but I cannot access real-time weather data at this moment.',
        'joke': 'Why don\'t scientists trust atoms? Because they make up everything!',
        'define intelligence': 'Intelligence is the ability to acquire and apply knowledge and skills effectively.',
    };

    // Check for keyword matches
    for (const [key, response] of Object.entries(responses)) {
        if (command.includes(key)) {
            respond(response);
            return;
        }
    }

    // Default response
    const defaultResponses = [
        'That is an interesting query. I shall process that information.',
        'I appreciate the question. Please provide more details if needed.',
        'Processing... That is noted.',
        'Very well. I have taken that into consideration.',
        'Understood. Is there anything else you require?',
    ];

    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    respond(randomResponse);
}

// ==================== SPEECH SYNTHESIS ====================
/**
 * Text-to-speech response with fallback
 */
function respond(text) {
    console.log('[TTS] Responding:', text);
    
    if (!text || text.length === 0) {
        console.warn('[TTS] Empty response text');
        return;
    }

    // Always display response first
    displayResponse(text);

    // Try to use speech synthesis
    if (!window.speechSynthesis) {
        console.warn('[TTS] Speech Synthesis not available');
        return;
    }

    try {
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to use a male voice
        if (synthesisVoices && synthesisVoices.length > 0) {
            const maleVoice = synthesisVoices.find(voice => 
                voice.name.toLowerCase().includes('male') || 
                voice.name.toLowerCase().includes('google uk')
            );
            if (maleVoice) {
                utterance.voice = maleVoice;
                console.log('[TTS] Using voice:', maleVoice.name);
            }
        }
        
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.volume = 1;

        // Event handlers
        utterance.onstart = () => {
            console.log('[TTS] Speech started');
            updateSpeakingState(true);
        };

        utterance.onend = () => {
            console.log('[TTS] Speech ended');
            updateSpeakingState(false);
        };

        utterance.onerror = (event) => {
            console.error('[TTS] Speech error:', event.error);
            updateSpeakingState(false);
        };

        // Speak
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('[TTS] Error during speech:', error);
        updateSpeakingState(false);
    }
}

// ==================== UI UPDATES ====================
/**
 * Display command in terminal
 */
function displayCommand(command) {
    if (!elements.displayContent) {
        console.warn('[UI] displayContent element not found');
        return;
    }

    // Clear welcome message on first command
    const welcomeMsg = elements.displayContent.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const entry = document.createElement('div');
    entry.className = 'command-entry';
    entry.innerHTML = `
        <div class="entry-label">$ Command:</div>
        <div class="entry-value">${escapeHtml(command)}</div>
    `;

    elements.displayContent.insertBefore(entry, elements.displayContent.firstChild);

    // Keep only last 15 commands visible
    const entries = elements.displayContent.querySelectorAll('.command-entry');
    if (entries.length > 15) {
        entries[entries.length - 1].remove();
    }

    // Auto scroll to top
    elements.displayContent.scrollTop = 0;
    console.log('[UI] Command displayed:', command);
}

/**
 * Display response with safe HTML handling
 */
function displayResponse(text) {
    if (!elements.responseText) {
        console.warn('[UI] responseText element not found');
        return;
    }

    // Escape HTML but allow basic tags for formatting
    let safeText = escapeHtml(text)
        .replace(/&lt;strong&gt;/g, '<strong>')
        .replace(/&lt;\/strong&gt;/g, '</strong>')
        .replace(/&lt;br&gt;/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    elements.responseText.innerHTML = safeText;
    console.log('[UI] Response displayed');
}

/**
 * Add command to history
 */
function addToHistory(command) {
    state.commandHistory.unshift({
        command,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    // Keep only last 50 in history
    if (state.commandHistory.length > 50) {
        state.commandHistory.pop();
    }

    updateHistoryPanel();
    console.log('[HISTORY] Added command, total:', state.commandHistory.length);
}

/**
 * Update history panel display
 */
function updateHistoryPanel() {
    if (!elements.historyContent) {
        console.warn('[HISTORY] historyContent element not found');
        return;
    }

    elements.historyContent.innerHTML = '';

    if (state.commandHistory.length === 0) {
        elements.historyContent.innerHTML = '<p class="history-empty">No commands yet</p>';
        return;
    }

    state.commandHistory.forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="time">${item.timestamp}</span>
            <span class="command">${escapeHtml(item.command)}</span>
        `;
        elements.historyContent.appendChild(historyItem);
    });

    console.log('[HISTORY] Panel updated with ' + state.commandHistory.length + ' items');
}

/**
 * Clear command history
 */
function clearCommandHistory() {
    console.log('[HISTORY] Clearing history');
    state.commandHistory = [];
    updateHistoryPanel();
    respond('Command history cleared');
    displayResponse('✓ History cleared');
}

// ==================== VOICE CONTROL ====================
/**
 * Start listening for commands
 */
function startListening() {
    console.log('[LISTEN] Starting recognition...');
    
    if (!recognition) {
        console.error('[LISTEN] Recognition not initialized');
        showNotification('❌ Voice recognition not initialized', 'error');
        return;
    }

    if (recognitionActive) {
        console.log('[LISTEN] Recognition already active');
        return;
    }

    // Clear interim input
    if (elements.inputLine) {
        elements.inputLine.innerHTML = '<span class="cursor">▊</span>';
    }
    
    try {
        recognition.start();
        recognitionActive = true;
        updateListeningState(true);
        console.log('[LISTEN] Recognition started successfully');
    } catch (error) {
        console.warn('[LISTEN] Start error (may be already running):', error);
        // This can happen if recognition is already running
        recognitionActive = true;
        updateListeningState(true);
    }
}

/**
 * Stop listening
 */
function stopListening() {
    console.log('[LISTEN] Stopping recognition...');
    
    if (recognition && recognitionActive) {
        try {
            recognition.stop();
            recognitionActive = false;
            updateListeningState(false);
            console.log('[LISTEN] Recognition stopped');
        } catch (error) {
            console.warn('[LISTEN] Stop error:', error);
        }
    }
}

/**
 * Toggle listening
 */
function toggleListening() {
    console.log('[LISTEN] Toggle requested, current state:', state.isListening);
    
    if (state.isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// ==================== EVENT LISTENERS ====================
/**
 * Attach all event listeners with safety checks
 */
function attachEventListeners() {
    console.log('[EVENTS] Attaching event listeners...');

    if (elements.micButton) {
        elements.micButton.addEventListener('click', (e) => {
            console.log('[EVENT] Mic button clicked');
            e.preventDefault();
            toggleListening();
        });
    }

    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', () => {
            console.log('[EVENT] Clear history clicked');
            clearCommandHistory();
        });
    }

    if (elements.toggleHistoryBtn) {
        elements.toggleHistoryBtn.addEventListener('click', () => {
            console.log('[EVENT] Toggle history clicked');
            if (elements.historyPanel) {
                elements.historyPanel.classList.toggle('visible');
            }
        });
    }

    if (elements.closeHistoryBtn) {
        elements.closeHistoryBtn.addEventListener('click', () => {
            console.log('[EVENT] Close history clicked');
            if (elements.historyPanel) {
                elements.historyPanel.classList.remove('visible');
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Prevent shortcuts when typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'm':
                event.preventDefault();
                console.log('[HOTKEY] M pressed - toggle microphone');
                toggleListening();
                break;
            case 'h':
                event.preventDefault();
                console.log('[HOTKEY] H pressed - toggle history');
                if (elements.historyPanel) {
                    elements.historyPanel.classList.toggle('visible');
                }
                break;
            case 'c':
                event.preventDefault();
                console.log('[HOTKEY] C pressed - clear history');
                clearCommandHistory();
                break;
            case 'escape':
                console.log('[HOTKEY] Escape pressed - close history');
                if (elements.historyPanel) {
                    elements.historyPanel.classList.remove('visible');
                }
                if (elements.apiModal && elements.apiModal.classList.contains('visible')) {
                    hideAPIModal();
                }
                break;
        }
    });

    // Settings button
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            console.log('[EVENT] Settings clicked');
            showAPIModal();
        });
    }

    // Modal close button
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            console.log('[EVENT] Modal close clicked');
            hideAPIModal();
        });
    }

    // Save API Key button
    if (elements.saveApiKeyBtn) {
        elements.saveApiKeyBtn.addEventListener('click', () => {
            console.log('[EVENT] Save API key clicked');
            let apiKey = elements.apiKeyInput.value.trim();
            
            // If it's masked (contains ...), clear it - user needs to paste full key
            if (apiKey.includes('...')) {
                console.log('[MODAL] Masked key detected, clearing field');
                elements.apiKeyInput.value = '';
                showNotification('⚠️ Please paste the full API key (it will be masked after saving)', 'warning');
                return;
            }
            
            if (!apiKey) {
                showNotification('❌ Please enter an API key', 'error');
                return;
            }
            
            // Validate it looks like an OpenAI key
            if (!apiKey.startsWith('sk-')) {
                showNotification('❌ Invalid API key format. Should start with "sk-"', 'error');
                return;
            }
            
            console.log('[MODAL] Saving API key, length:', apiKey.length);
            setOpenAIKey(apiKey);
            elements.apiKeyInput.value = ''; // Clear the input after saving
            hideAPIModal();
        });
    }

    // Clear API Key button
    if (elements.clearApiKeyBtn) {
        elements.clearApiKeyBtn.addEventListener('click', () => {
            console.log('[EVENT] Clear API key clicked');
            clearOpenAIKey();
            if (elements.apiKeyInput) elements.apiKeyInput.value = '';
            if (elements.useOpenAICheckbox) elements.useOpenAICheckbox.checked = false;
        });
    }

    // Close modal when clicking outside
    if (elements.apiModal) {
        elements.apiModal.addEventListener('click', (event) => {
            if (event.target === elements.apiModal) {
                hideAPIModal();
            }
        });
    }

    console.log('[EVENTS] Event listeners attached');
}

// ==================== BACKGROUND PARTICLES ====================
/**
 * Generate random particles for background animation
 */
function generateParticles() {
    if (!elements.particlesContainer) {
        console.warn('[PARTICLES] Container not found');
        return;
    }

    const particleCount = window.innerWidth < 768 ? 20 : 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const delay = Math.random() * 20;
        const left = Math.random() * 100;
        
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;

        elements.particlesContainer.appendChild(particle);
    }

    console.log('[PARTICLES] Generated ' + particleCount + ' particles');
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Could add toast notifications here if needed
    displayResponse(message);
}

// ==================== DEBUG & TEST FUNCTIONS ====================
/**
 * Full diagnostic check - run this in console to troubleshoot
 */
window.diagnoseJarvis = async function() {
    console.clear();
    console.log('═══════════════════════════════════════');
    console.log('🔧 JARVIS DIAGNOSTIC REPORT');
    console.log('═══════════════════════════════════════');
    
    // Check 1: API Key Configuration
    console.log('\n1️⃣ API KEY CONFIGURATION:');
    console.log('   API Key Set:', !!state.openaiKey);
    console.log('   OpenAI Enabled:', state.useOpenAI);
    if (state.openaiKey) {
        console.log('   Key Length:', state.openaiKey.length);
        console.log('   Key Preview:', state.openaiKey.substring(0, 15) + '...');
    }
    
    // Check 2: OpenAI Account Status
    console.log('\n2️⃣ OPENAI ACCOUNT STATUS:');
    if (!state.openaiKey) {
        console.warn('   ⚠️ No API key configured. Run: setApiKeyTest("your-key-here")');
    } else {
        console.log('   Testing account status...');
        const isValid = await testOpenAIKey(state.openaiKey);
        if (isValid) {
            console.log('   ✓ Account is active and API key is valid');
        } else {
            console.error('   ✗ Account issue detected. Check console for details.');
        }
    }
    
    // Check 3: Browser Capabilities
    console.log('\n3️⃣ BROWSER CAPABILITIES:');
    console.log('   Web Speech API:', !!window.SpeechRecognition);
    console.log('   Speech Synthesis:', !!window.speechSynthesis);
    console.log('   LocalStorage:', !!window.localStorage);
    
    // Check 4: Current State
    console.log('\n4️⃣ CURRENT STATE:');
    console.table({
        'Listening': state.isListening,
        'Speaking': state.isSpeaking,
        'Processing': state.isProcessing,
        'OpenAI Enabled': state.useOpenAI,
    });
    
    console.log('\n═══════════════════════════════════════');
    console.log('💡 NEXT STEPS:');
    if (!state.openaiKey) {
        console.log('   1. Get API key from https://platform.openai.com/api-keys');
        console.log('   2. Run: setApiKeyTest("sk-...")');
    } else if (!state.useOpenAI) {
        console.log('   1. Check OpenAI account at https://platform.openai.com');
        console.log('   2. Verify billing is active');
        console.log('   3. Generate a new API key and try again');
    } else {
        console.log('   ✓ JARVIS is ready! Try asking it a question.');
    }
    console.log('═══════════════════════════════════════\n');
};

/**
 * Test the current OpenAI configuration from console
 */
window.testJarvisAPI = async function() {
    console.log('🧪 Testing JARVIS API Configuration...');
    console.log('-----------------------------------');
    console.log('API Key Set:', !!state.openaiKey);
    console.log('OpenAI Enabled:', state.useOpenAI);
    
    if (!state.openaiKey) {
        console.error('❌ No API key configured');
        console.log('Run: setApiKeyTest("your-api-key-here")');
        return;
    }
    
    console.log('Testing API call...');
    const response = await getOpenAIResponse('Say hello');
    console.log('Response:', response);
};

/**
 * Manually set API key from console for testing
 */
window.setApiKeyTest = function(key) {
    console.log('Setting API key from console...');
    setOpenAIKey(key);
};

/**
 * Check current state from console
 */
window.checkState = function() {
    console.log('Current JARVIS State:');
    console.table({
        'OpenAI Enabled': state.useOpenAI,
        'API Key Set': !!state.openaiKey,
        'Is Listening': state.isListening,
        'Is Speaking': state.isSpeaking,
        'Is Processing': state.isProcessing,
    });
};
/**
 * Initialize application when DOM is ready
 */
function initApp() {
    console.log('========================================');
    console.log('🤖 JARVIS AI Assistant - Initializing');
    console.log('========================================');

    try {
        // Step 1: Initialize DOM elements
        console.log('[INIT] Step 1: Loading DOM elements...');
        initializeElements();

        // Step 2: Generate background
        console.log('[INIT] Step 2: Generating background particles...');
        generateParticles();

        // Step 3: Initialize Web Speech API
        console.log('[INIT] Step 3: Initializing Speech API...');
        if (!initializeSpeechAPI()) {
            console.warn('[INIT] Speech API not available');
            showNotification('⚠️ Voice features disabled - Speech API not supported', 'warning');
        }

        // Step 4: Attach event listeners
        console.log('[INIT] Step 4: Attaching event listeners...');
        attachEventListeners();

        // Step 4.5: Check API Key Configuration
        console.log('[INIT] Step 4.5: Checking OpenAI API Configuration...');
        console.log('[INIT] OpenAI Enabled:', state.useOpenAI);
        console.log('[INIT] API Key Saved:', !!state.openaiKey);
        if (state.openaiKey) {
            console.log('[INIT] API Key (masked):', state.openaiKey.substring(0, 10) + '...');
        }

        // Step 5: Play welcome message
        console.log('[INIT] Step 5: Playing welcome message...');
        setTimeout(() => {
            respond('JARVIS online. Ready to assist you.');
        }, 500);

        console.log('========================================');
        console.log('✅ JARVIS Initialization Complete');
        console.log('Shortcuts: M (mic), H (history), C (clear), Esc (close)');
        console.log('========================================');

    } catch (error) {
        console.error('[INIT] Fatal error:', error);
        showNotification('❌ Failed to initialize JARVIS', 'error');
    }
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    console.log('[DOM] Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    console.log('[DOM] DOM already loaded, initializing...');
    initApp();
}

// Handle window resize for particles
window.addEventListener('resize', () => {
    if (elements.particlesContainer && elements.particlesContainer.children.length < 20) {
        generateParticles();
    }
});
