// API Base URL - Use relative path for cloud deployment
const API_BASE = '/api';

// DOM Elements
const urlInput = document.getElementById('urlInput');
const startBtn = document.getElementById('startBtn');
const inputSection = document.getElementById('inputSection');
const progressSection = document.getElementById('progressSection');
const resultsSection = document.getElementById('resultsSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const logsContainer = document.getElementById('logsContainer');
const resultsSummary = document.getElementById('resultsSummary');
const screenshotsGrid = document.getElementById('screenshotsGrid');
const filesList = document.getElementById('filesList');
const newScrapeBtn = document.getElementById('newScrapeBtn');

// Options
const clickImagesCheckbox = document.getElementById('clickImages');
const visitContactCheckbox = document.getElementById('visitContact');
const maxImagesInput = document.getElementById('maxImages');
const pageLoadDelayInput = document.getElementById('pageLoadDelay');
const scrollDelayInput = document.getElementById('scrollDelay');

// Current session
let currentSessionId = null;
let statusInterval = null;

// Status messages
const statusMessages = {
    initializing: '⚙️ Initializing...',
    loading_page: '🌐 Loading page...',
    waiting_content: '⏳ Waiting for content...',
    scrolling: '📜 Scrolling page...',
    screenshot_homepage: '📸 Taking screenshots...',
    clicking_images: '🖼️ Clicking images...',
    visiting_contact: '📧 Visiting contact page...',
    saving_results: '💾 Saving results...',
    completed: '✅ Completed!',
    error: '❌ Error occurred'
};

// Start Scraping
startBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }
    
    // Get options
    const options = {
        clickImages: clickImagesCheckbox.checked,
        visitContact: visitContactCheckbox.checked,
        maxImages: parseInt(maxImagesInput.value),
        pageLoadDelay: parseInt(pageLoadDelayInput.value) * 1000,
        afterScrollDelay: parseInt(scrollDelayInput.value) * 1000,
        beforeScreenshotDelay: 3000,
        beforeCloseDelay: 5000,
        betweenActionsDelay: 2000
    };
    
    // Disable button
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="btn-icon spinning">⏳</span> Starting...';
    
    try {
        // Start scraping
        const response = await fetch(`${API_BASE}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, options })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentSessionId = data.sessionId;
            
            // Show progress section
            inputSection.style.display = 'none';
            progressSection.style.display = 'block';
            resultsSection.style.display = 'none';
            
            // Start polling for status
            startStatusPolling();
        } else {
            throw new Error(data.error || 'Failed to start scraping');
        }
    } catch (error) {
        alert('Error: ' + error.message);
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">🚀</span> Start Scraping';
    }
});

// Poll for status updates
function startStatusPolling() {
    statusInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE}/status/${currentSessionId}`);
            const session = await response.json();
            
            // Update progress
            updateProgress(session.progress);
            
            // Update status
            updateStatus(session.status);
            
            // Update logs
            updateLogs(session.logs);
            
            // Check if completed
            if (session.status === 'completed') {
                clearInterval(statusInterval);
                await loadResults();
            } else if (session.status === 'error') {
                clearInterval(statusInterval);
                alert('Error during scraping: ' + (session.error || 'Unknown error'));
                resetToInput();
            }
        } catch (error) {
            console.error('Error polling status:', error);
        }
    }, 1000); // Poll every second
}

// Update progress bar
function updateProgress(progress) {
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
}

// Update status badge
function updateStatus(status) {
    statusBadge.className = 'status-badge ' + status;
    statusText.textContent = statusMessages[status] || status;
}

// Update logs
function updateLogs(logs) {
    logsContainer.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        logsContainer.innerHTML = '<div class="log-entry info"><span class="log-time">--:--:--</span><span class="log-message">No logs yet...</span></div>';
        return;
    }
    
    // Show last 20 logs
    const recentLogs = logs.slice(-20);
    
    recentLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.type}`;
        
        const time = new Date(log.time).toLocaleTimeString();
        
        logEntry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${log.message}</span>
        `;
        
        logsContainer.appendChild(logEntry);
    });
    
    // Scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Load results
async function loadResults() {
    try {
        const response = await fetch(`${API_BASE}/files/${currentSessionId}`);
        const data = await response.json();
        
        if (data.files && data.files.screenshots) {
            // Show results section
            progressSection.style.display = 'none';
            resultsSection.style.display = 'block';
            
            // Display summary
            resultsSummary.innerHTML = `
                <p><strong>✅ Scraping Completed Successfully!</strong></p>
                <p>📸 Screenshots captured: ${data.files.screenshots.length}</p>
                <p>💾 Files generated: JSON, HTML, Report</p>
            `;
            
            // Display screenshots
            screenshotsGrid.innerHTML = '';
            data.files.screenshots.forEach((screenshot, index) => {
                const item = document.createElement('div');
                item.className = 'screenshot-item';
                item.innerHTML = `
                    <img src="${screenshot}" alt="Screenshot ${index + 1}">
                    <div class="screenshot-label">Screenshot ${index + 1}</div>
                `;
                item.onclick = () => window.open(screenshot, '_blank');
                screenshotsGrid.appendChild(item);
            });
            
            // Display files
            filesList.innerHTML = '';
            
            const files = [
                { name: 'Complete Data (JSON)', url: data.files.json, icon: '📊' },
                { name: 'Scraping Report (TXT)', url: data.files.report, icon: '📄' },
                { name: 'Homepage HTML', url: data.files.html, icon: '🌐' }
            ];
            
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = `
                    <div class="file-info">
                        <span class="file-icon">${file.icon}</span>
                        <span class="file-name">${file.name}</span>
                    </div>
                    <a href="${file.url}" download class="file-download">⬇ Download</a>
                `;
                filesList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading results:', error);
        alert('Error loading results');
    }
}

// Reset to input screen
function resetToInput() {
    inputSection.style.display = 'block';
    progressSection.style.display = 'none';
    resultsSection.style.display = 'none';
    
    startBtn.disabled = false;
    startBtn.innerHTML = '<span class="btn-icon">🚀</span> Start Scraping';
    
    currentSessionId = null;
}

// New scrape button
newScrapeBtn.addEventListener('click', () => {
    resetToInput();
    urlInput.value = '';
    urlInput.focus();
});

// Enter key to start
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !startBtn.disabled) {
        startBtn.click();
    }
});

// Auto-focus on URL input
window.addEventListener('load', () => {
    urlInput.focus();
});
