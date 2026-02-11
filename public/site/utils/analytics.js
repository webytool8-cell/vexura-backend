/**
 * Signal Collector (Analytics)
 * Captures implicit user behavior to improve system quality downstream.
 * Stores locally first.
 */

const SIGNAL_STORE_KEY = 'vexura_signals_v1';

window.SignalCollector = {
    sessionStart: Date.now(),
    currentGenerationStart: null,
    
    // In-memory buffer
    buffer: [],

    /**
     * Start tracking a generation cycle
     */
    startGeneration: function() {
        this.currentGenerationStart = Date.now();
    },

    /**
     * Track an event
     * @param {string} type - 'regenerate', 'copy', 'download', 'edit', 'abandon'
     * @param {object} context - Extra data (prompt, previous_prompt, etc.)
     */
    track: function(type, context = {}) {
        const signal = {
            type,
            timestamp: Date.now(),
            session_id: this.sessionStart,
            time_since_gen: this.currentGenerationStart ? Date.now() - this.currentGenerationStart : null,
            ...context
        };

        // Add to buffer
        this.buffer.push(signal);
        
        // Persist to local storage (Simple FIFO for now)
        this._persist();

        console.log(`[Signal] ${type}`, signal);
    },

    _persist: function() {
        try {
            // Keep last 50 signals
            const existing = JSON.parse(localStorage.getItem(SIGNAL_STORE_KEY) || '[]');
            const updated = [...existing, ...this.buffer].slice(-50);
            localStorage.setItem(SIGNAL_STORE_KEY, JSON.stringify(updated));
            this.buffer = []; // Clear buffer
        } catch (e) {
            console.warn("Signal storage failed", e);
        }
    },

    /**
     * Retrieve all stored signals (e.g., for sending to backend later)
     */
    getAll: function() {
        return JSON.parse(localStorage.getItem(SIGNAL_STORE_KEY) || '[]');
    }
};