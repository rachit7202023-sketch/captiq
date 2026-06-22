// DOM Elements
const form = document.getElementById('content-form');
const descriptionInput = document.getElementById('description');
const nicheInput = document.getElementById('niche');
const toneInput = document.getElementById('tone');
const generateBtn = document.getElementById('generate-btn');
const errorMessage = document.getElementById('error-message');

const emptyState = document.getElementById('empty-state');
const loader = document.getElementById('loader');
const captionsContent = document.getElementById('captions-content');
const hooksContent = document.getElementById('hooks-content');
const hashtagsContent = document.getElementById('hashtags-content');

const tabBtns = document.querySelectorAll('.tab-btn');
const hashtagsGrid = document.getElementById('hashtags-grid');
const copyAllHashtagsBtn = document.getElementById('copy-all-hashtags');

// State
let generatedHashtags = [];

// Tab Switching Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Hide all content views
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show the corresponding content view
        const tabId = btn.getAttribute('data-tab');
        const activeView = document.getElementById(`${tabId}-content`);
        if (activeView && !loader.classList.contains('hidden') === false && !emptyState.classList.contains('hidden') === false) {
            activeView.classList.remove('hidden');
        }
    });
});

// Helper: Copy to Clipboard
const copyToClipboard = async (text, buttonElement) => {
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const icon = buttonElement.querySelector('i');
        icon.className = 'ph-bold ph-check';
        buttonElement.classList.add('copied');
        
        setTimeout(() => {
            icon.className = 'ph ph-copy';
            buttonElement.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy!', err);
    }
};

// Helper: Create Result Card
const createResultCard = (text) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const textNode = document.createElement('div');
    textNode.className = 'result-text';
    textNode.textContent = text;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="ph ph-copy"></i>';
    copyBtn.title = 'Copy';
    copyBtn.onclick = () => copyToClipboard(text, copyBtn);
    
    card.appendChild(textNode);
    card.appendChild(copyBtn);
    
    return card;
};

// Form Submission handling
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear errors
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    
    // Get values
    const description = descriptionInput.value.trim();
    const niche = nicheInput.value;
    const tone = toneInput.value;
    
    // UI Loading State
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Generating...';
    
    emptyState.classList.add('hidden');
    captionsContent.classList.add('hidden');
    hooksContent.classList.add('hidden');
    hashtagsContent.classList.add('hidden');
    loader.classList.remove('hidden');
    
    try {
        // Fetch from Vercel Serverless Function
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, niche, tone })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate content');
        }
        
        // Populate Captions
        captionsContent.innerHTML = '';
        if (data.captions) {
            data.captions.forEach(caption => {
                captionsContent.appendChild(createResultCard(caption));
            });
        }
        
        // Populate Hooks
        hooksContent.innerHTML = '';
        if (data.hooks) {
            data.hooks.forEach(hook => {
                hooksContent.appendChild(createResultCard(hook));
            });
        }
        
        // Populate Hashtags
        hashtagsGrid.innerHTML = '';
        if (data.hashtags) {
            generatedHashtags = data.hashtags.map(h => '#' + h.replace(/^#/, ''));
            generatedHashtags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'hashtag-chip';
                span.textContent = tag;
                hashtagsGrid.appendChild(span);
            });
        }
        
        // Show correct tab based on active tab button
        loader.classList.add('hidden');
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        document.getElementById(`${activeTab}-content`).classList.remove('hidden');
        
    } catch (error) {
        console.error('Generation error:', error);
        errorMessage.textContent = error.message || 'Error generating content. Please try again.';
        errorMessage.classList.remove('hidden');
        emptyState.classList.remove('hidden');
        loader.classList.add('hidden');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-text">Generate Content</span><i class="ph-bold ph-magic-wand"></i>';
    }
});

// Copy all hashtags logic
copyAllHashtagsBtn.addEventListener('click', () => {
    if (generatedHashtags.length > 0) {
        const textToCopy = generatedHashtags.join(' ');
        copyToClipboard(textToCopy, copyAllHashtagsBtn);
    }
});
