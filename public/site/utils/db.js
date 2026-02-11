/**
 * VEXURA Database Adapter
 * Handles data persistence with automatic fallback.
 * 
 * Strategy:
 * 1. Check if Trickle DB API is available (window.trickleCreateObject).
 * 2. If yes, use it (Development/Preview Mode).
 * 3. If no, fall back to LocalStorage (Production Demo Mode).
 * 
 * Note: For a real production app, you would replace the LocalStorage fallback 
 * with your own backend calls (Supabase/Firebase/Postgres).
 */

const DB_CONFIG = {
    IS_TRICKLE_AVAILABLE: typeof window.trickleCreateObject === 'function'
};

// --- API Implementation ---

/**
 * Saves a creation (logo/icon)
 */
window.apiSaveCreation = async function(userId, prompt, styleConfig, svgCode, vectorJson) {
    const data = {
        user_id: userId,
        prompt: prompt,
        style_config: typeof styleConfig === 'string' ? styleConfig : JSON.stringify(styleConfig),
        svg_code: svgCode,
        vector_data: typeof vectorJson === 'string' ? vectorJson : JSON.stringify(vectorJson),
        created_at: new Date().toISOString()
    };

    if (DB_CONFIG.IS_TRICKLE_AVAILABLE) {
        try {
            return await window.trickleCreateObject('vector_creations', data);
        } catch (e) {
            console.error("Trickle DB Save Failed:", e);
            throw e;
        }
    } else {
        // Fallback: LocalStorage
        console.warn("Trickle DB unavailable. Saving to LocalStorage.");
        const key = `vexura_creations_${userId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const newItem = { objectId: `local_${Date.now()}`, ...data };
        existing.unshift(newItem);
        localStorage.setItem(key, JSON.stringify(existing));
        return newItem;
    }
};

/**
 * Lists user creations
 */
window.apiListUserCreations = async function(userId) {
    if (DB_CONFIG.IS_TRICKLE_AVAILABLE) {
        try {
            // Note: Trickle DB listing usually requires filtering by a specific field if supported,
            // or we might be listing all 'vector_creations' and filtering client-side if the API limits us.
            // For this specific API (trickleListObjects), it gets *all* of a type.
            // In a real scenario, we'd use a specific relation type like `user:${userId}:creations` 
            // but the current schema uses a flat 'vector_creations' table. 
            // We will fetch and filter.
            const response = await window.trickleListObjects('vector_creations', 100, true);
            return response.items.filter(item => item.objectData.user_id === userId);
        } catch (e) {
            console.error("Trickle DB List Failed:", e);
            return [];
        }
    } else {
        // Fallback: LocalStorage
        const key = `vexura_creations_${userId}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        // Map to mimic Trickle Object structure
        return items.map(item => ({
            objectId: item.objectId,
            objectData: item
        }));
    }
};

/**
 * Gets or Creates a User
 */
window.apiGetUser = async function(email) {
    // This is a simplified mock of "Get User by Email". 
    // Trickle DB doesn't support query-by-field natively in the basic API exposed here easily
    // without scanning. 
    
    if (DB_CONFIG.IS_TRICKLE_AVAILABLE) {
        try {
            const response = await window.trickleListObjects('vector_users', 100, true);
            const user = response.items.find(u => u.objectData.email === email);
            return user || null;
        } catch (e) {
            console.error("Trickle DB User Get Failed:", e);
            return null;
        }
    } else {
        // Fallback
        const users = JSON.parse(localStorage.getItem('vexura_users') || '[]');
        const user = users.find(u => u.email === email);
        return user ? { objectId: user.id, objectData: user } : null;
    }
};

window.apiCreateUser = async function(userData) {
    if (DB_CONFIG.IS_TRICKLE_AVAILABLE) {
        return await window.trickleCreateObject('vector_users', userData);
    } else {
        const users = JSON.parse(localStorage.getItem('vexura_users') || '[]');
        const newUser = { id: `local_user_${Date.now()}`, ...userData };
        users.push(newUser);
        localStorage.setItem('vexura_users', JSON.stringify(users));
        return { objectId: newUser.id, objectData: newUser };
    }
};

// Export config status for UI debugging
window.getDBStatus = () => DB_CONFIG.IS_TRICKLE_AVAILABLE ? 'TRICKLE_CLOUD' : 'LOCAL_STORAGE';