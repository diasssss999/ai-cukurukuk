document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Load chat history from localStorage
    let chatSessions = JSON.parse(localStorage.getItem('ai_cukurukuk_chat_sessions')) || [];
    let currentSessionId = null;
    
    // Initialize first session if none exists
    if (chatSessions.length === 0) {
        createNewSession();
    } else {
        loadSession(chatSessions[0].id);
    }
    
    // Render chat history sidebar
    renderHistorySidebar();
    
    // Mobile sidebar toggle
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
    });
    
    // Quick options
    document.querySelectorAll('.quick-option').forEach(option => {
        option.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            sendMessage();
        });
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });
    
    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // New chat button
    newChatBtn.addEventListener('click', function() {
        createNewSession();
        renderHistorySidebar();
        // Hide sidebar on mobile after creating new chat
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        }
    });
    
    function createNewSession() {
        const sessionId = 'session_' + Date.now();
        const newSession = {
            id: sessionId,
            title: 'Percakapan Baru',
            messages: [
                {
                    role: 'system',
                    content: `Kamu adalah AI Cukurukuk, AI model buatan Owner Abiq.

PERSONALITY:
- Gaul banget, kayak temen deket
- Bahasa santai kekinian, ga pake kapital (kecuali nama)
- Bisa diajak serius bisa bercanda
- Responsif sama permintaan user
- Kata-kata: gas, wlee, anjay, mantap, oke sip, yuk, let's go, wkwk, haha, etc

TENTANG OWNER ABIQ:
- Nama: Abiq
- Instagram: @ab.iqqq
- Hobi: Main alat musik (gitar, bass), musisi
- Sifat: Pendiem, kreatif, random, low profile
- Keahlian: Programming, musik, bikin AI

ATURAN:
- Jangan pake kata: contoh, kamu ini, spill, dong (kecuali user minta)
- Ikuti gaya bahasa yang user minta
- Context 2 juta tokens
- Format: **bold**, *italic*, code blocks

RESPONS GAUL:
iyaa bro, oke gas, yuk, waduh, anjay, mantul, let's goo, siap gan, yoi, bet, gw ngerti, oke deh, sounds good, ayo, yuk mulai, gue siap, ready, yuk gas, mantap, keren, oke bang, sip, yuk lanjut, gue denger, okay, yup, betul, bener, iyess, oke mantap, siap bro, yukkk, gaskeun, let's goo, okee deh, yoi bro, sip gan, oke gas, yuk kita, gue tunggu, ready bro, ayok, yuk yuk, oke let's go`
                }
            ],
            timestamp: Date.now(),
            preview: 'percakapan baru dimulai...'
        };
        
        chatSessions.unshift(newSession);
        currentSessionId = sessionId;
        saveSessions();
        renderChat();
        
        // Hide quick options after first message
        const quickOptions = document.getElementById('quick-options');
        if (quickOptions) quickOptions.style.display = 'none';
    }
    
    function loadSession(sessionId) {
        currentSessionId = sessionId;
        renderChat();
        // Hide quick options when loading existing session
        const quickOptions = document.getElementById('quick-options');
        if (quickOptions) quickOptions.style.display = 'none';
        
        // Hide sidebar on mobile after loading session
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        }
    }
    
    function getCurrentSession() {
        return chatSessions.find(session => session.id === currentSessionId);
    }
    
    function saveSessions() {
        localStorage.setItem('ai_cukurukuk_chat_sessions', JSON.stringify(chatSessions));
    }
    
    function renderHistorySidebar() {
        historyList.innerHTML = '';
        
        chatSessions.forEach(session => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
            historyItem.innerHTML = `
                <div class="history-title">${session.title}</div>
                <div class="history-preview">${session.preview}</div>
            `;
            
            historyItem.addEventListener('click', function() {
                loadSession(session.id);
                renderHistorySidebar();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function renderChat() {
        chatContainer.innerHTML = '';
        
        // Add welcome section for new sessions
        if (getCurrentSession().messages.length === 1) {
            const welcomeSection = document.createElement('div');
            welcomeSection.className = 'welcome-section';
            welcomeSection.innerHTML = `
                <h2>Halo Bro! 👋</h2>
                <p>gue AI Cukurukuk, temen ngobrol virtual lo yang asik dan gaul banget!</p>
                <div class="quick-options" id="quick-options">
                    <div class="quick-option" data-prompt="yuk ngobrol santai aja">
                        💬 Ngobrol Santai
                    </div>
                    <div class="quick-option" data-prompt="cerita dong tentang si abiq">
                        👨‍💻 Tentang Abiq
                    </div>
                    <div class="quick-option" data-prompt="butuh bantuan serius nih">
                        🎯 Mode Serius
                    </div>
                </div>
            `;
            chatContainer.appendChild(welcomeSection);
            
            // Re-attach event listeners to new quick options
            document.querySelectorAll('.quick-option').forEach(option => {
                option.addEventListener('click', function() {
                    const prompt = this.getAttribute('data-prompt');
                    userInput.value = prompt;
                    sendMessage();
                });
            });
        }
        
        const session = getCurrentSession();
        
        if (session) {
            session.messages.forEach(msg => {
                if (msg.role === 'user') {
                    addMessageToChat(msg.content, 'user');
                } else if (msg.role === 'assistant') {
                    addMessageToChat(msg.content, 'ai');
                }
            });
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat(message, 'user');
        
        // Add to current session
        const session = getCurrentSession();
        if (session) {
            session.messages.push({
                role: 'user',
                content: message
            });
            
            // Update session preview
            session.preview = message.length > 40 ? message.substring(0, 40) + '...' : message;
            session.timestamp = Date.now();
            
            saveSessions();
            renderHistorySidebar();
        }
        
        // Clear input and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        typingIndicator.style.display = 'block';
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Disable send button
        sendButton.disabled = true;
        
        // Send message to API
        fetchAIResponse();
    }
    
    function addMessageToChat(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'user') {
            headerDiv.innerHTML = '<strong>You</strong>';
            contentDiv.textContent = content;
        } else {
            headerDiv.innerHTML = '<strong>AI Cukurukuk</strong><span>• Baru aja</span>';
            
            // Format AI response
            const formattedContent = formatMessage(content);
            contentDiv.innerHTML = formattedContent;
            
            // Add copy buttons to code blocks
            contentDiv.querySelectorAll('pre').forEach(pre => {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'Salin';
                copyBtn.addEventListener('click', function() {
                    const code = pre.querySelector('code')?.textContent || pre.textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        copyBtn.textContent = 'Tersalin!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.textContent = 'Salin';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });
                pre.appendChild(copyBtn);
            });
        }
        
        messageDiv.appendChild(headerDiv);
        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function addMessage(content, sender) {
        addMessageToChat(content, sender);
        
        // Also add to session
        const session = getCurrentSession();
        if (session) {
            session.messages.push({
                role: sender === 'ai' ? 'assistant' : 'user',
                content: content
            });
            saveSessions();
        }
    }
    
    function formatMessage(content) {
        // Format bold text with ** **
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text with * *
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Format code blocks with triple backticks
        formatted = formatted.replace(/```(\w+)?\s*([^`]+)```/gs, function(match, lang, code) {
            return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert URLs to links
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async function fetchAIResponse() {
        try {
            const session = getCurrentSession();
            if (!session) return;
            
            // Check if API_KEY is available
            if (typeof API_KEY === 'undefined') {
                throw new Error('API key tidak ditemukan. Pastikan file config.js sudah diatur dengan benar.');
            }
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Cukurukuk Chat'
                },
                body: JSON.stringify({
                    model: 'x-ai/grok-4.1-fast:free',
                    messages: session.messages,
                    temperature: 0.8,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            
            // Add AI response to chat and session
            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;
                addMessage(aiMessage, 'ai');
            } else {
                throw new Error('No response from AI');
            }
            
        } catch (error) {
            console.error('Error fetching AI response:', error);
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            
            // Show error message
            const errorMsg = 'waduh, error nih! ' + error.message;
            addMessage(errorMsg, 'ai');
        } finally {
            // Re-enable send button
            sendButton.disabled = false;
            userInput.focus();
        }
    }
    
    // Focus on input when page loads
    userInput.focus();
});
