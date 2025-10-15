class SymptomChecker {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadAvailableProviders();
    }

    initializeElements() {
        this.symptomsTextarea = document.getElementById('symptoms');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        this.resultsContent = document.getElementById('results-content');
        this.charCount = document.getElementById('char-count');
        this.loadHistoryBtn = document.getElementById('load-history');
        this.historyContent = document.getElementById('history-content');
    }

    bindEvents() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeSymptoms());
        this.loadHistoryBtn.addEventListener('click', () => this.loadHistory());
        this.symptomsTextarea.addEventListener('input', () => this.updateCharCount());

        this.symptomsTextarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyzeSymptoms();
            }
        });
    }

    updateCharCount() {
        const count = this.symptomsTextarea.value.length;
        this.charCount.textContent = count;

        if (count > 900) {
            this.charCount.style.color = '#dc3545';
        } else if (count > 700) {
            this.charCount.style.color = '#ffc107';
        } else {
            this.charCount.style.color = '#666';
        }
    }

    async loadAvailableProviders() {
        console.log('Using Google Gemini as the AI provider');
    }

    async analyzeSymptoms() {
        const symptoms = this.symptomsTextarea.value.trim();

        if (!symptoms) {
            alert('Please describe your symptoms first.');
            return;
        }

        if (symptoms.length < 10) {
            alert('Please provide more detailed symptoms (at least 10 characters).');
            return;
        }

        this.setLoading(true);
        this.hideResults();

        try {
            const response = await fetch('/api/symptoms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptoms: symptoms,
                    sessionId: this.getSessionId()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.displayResults(data);
        } catch (error) {
            console.error('Analysis error:', error);
            this.displayError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    displayResults(data) {
        const html = `
            <div class="result-card">
                <h3><i class="fas fa-search-plus"></i> Possible Conditions</h3>
                <ul>
                    ${Array.isArray(data.conditions)
                ? data.conditions.map(condition => `<li>${condition}</li>`).join('')
                : `<li>${data.conditions || 'No specific conditions identified'}</li>`
            }
                </ul>
            </div>

            <div class="result-card">
                <h3><i class="fas fa-list-check"></i> Recommended Next Steps</h3>
                <ul>
                    ${Array.isArray(data.nextSteps)
                ? data.nextSteps.map(step => `<li>${step}</li>`).join('')
                : `<li>${data.nextSteps || 'Consult with a healthcare professional'}</li>`
            }
                </ul>
            </div>

            <div class="result-card urgent">
                <h3><i class="fas fa-exclamation-triangle"></i> When to Seek Immediate Care</h3>
                <ul>
                    ${Array.isArray(data.urgentCare)
                ? data.urgentCare.map(care => `<li>${care}</li>`).join('')
                : `<li>${data.urgentCare || 'If symptoms worsen or you feel concerned'}</li>`
            }
                </ul>
            </div>

            <div class="disclaimer-card">
                <p><i class="fas fa-info-circle"></i> <strong>Medical Disclaimer:</strong> ${data.disclaimer || data.safetyNotice}</p>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-lg); font-size: 0.875rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fas fa-robot"></i> <strong>Analysis by:</strong> ${data.provider}</span>
                <span><i class="fas fa-clock"></i> <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</span>
            </div>



            ${data.rawResponse ? `
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; padding: 0.5rem; background: var(--bg-tertiary); border-radius: var(--radius-md); font-weight: 500;">View Raw Response</summary>
                    <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.75rem; overflow-x: auto; margin-top: 0.5rem; border: 1px solid var(--border-color);">${data.rawResponse}</pre>
                </details>
            ` : ''}
        `;

        this.resultsContent.innerHTML = html;
        this.showResults();
    }

    displayError(message) {
        const html = `
            <div class="result-card urgent">
                <h3><i class="fas fa-exclamation-circle"></i> Analysis Error</h3>
                <ul>
                    <li>${message}</li>
                    <li><strong>Please consult a healthcare professional directly.</strong></li>
                </ul>
            </div>
        `;

        this.resultsContent.innerHTML = html;
        this.showResults();
    }

    async loadHistory() {
        try {
            const response = await fetch('/api/history?limit=10');
            const data = await response.json();

            if (data.history.length === 0) {
                this.historyContent.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>No previous analyses found.</p>
                        <p style="font-size: 0.875rem;">Your symptom checks will appear here.</p>
                    </div>
                `;
                return;
            }

            const html = data.history.map(item => `
                <div class="history-item">
                    <div class="history-symptoms">
                        <i class="fas fa-notes-medical" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
                        ${item.symptoms.substring(0, 120)}${item.symptoms.length > 120 ? '...' : ''}
                    </div>
                    <div class="history-meta">
                        <span><i class="fas fa-robot"></i> ${item.llm_provider}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');

            this.historyContent.innerHTML = html;
        } catch (error) {
            console.error('Failed to load history:', error);
            this.historyContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Failed to load history.</p>
                </div>
            `;
        }
    }

    setLoading(loading) {
        if (loading) {
            this.loadingDiv.classList.remove('hidden');
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.classList.add('loading');
        } else {
            this.loadingDiv.classList.add('hidden');
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.classList.remove('loading');
        }
    }

    showResults() {
        this.resultsDiv.classList.remove('hidden');
        this.resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.resultsDiv.classList.add('hidden');
    }

    getSessionId() {
        let sessionId = localStorage.getItem('symptom-checker-session');
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('symptom-checker-session', sessionId);
        }
        return sessionId;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SymptomChecker();
});