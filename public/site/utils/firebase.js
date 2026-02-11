// Firebase Integration (Compat Mode for Browser)

const firebaseConfig = {
  apiKey: "AIzaSyAvdRALmMPYVBq4Q3w_VNV4FBOjtguHevU",
  authDomain: "vexura-d7b66.firebaseapp.com",
  projectId: "vexura-d7b66",
  storageBucket: "vexura-d7b66.firebasestorage.app",
  messagingSenderId: "775207161440",
  appId: "1:775207161440:web:2844ea32e652d82618fd05",
  measurementId: "G-JLS4VMMCMQ"
};

// Initialize Firebase (Check if already initialized to avoid errors)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized");
}

// Auth Helper
window.fireAuth = {
    // 1. Popup Method (Preferred)
    signInWithGoogle: async () => {
        if (typeof firebase === 'undefined') {
            throw new Error("Firebase SDK not loaded");
        }
        
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        // Force account selection to avoid auto-login loops if user has multiple accounts
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            const result = await auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("Firebase Popup Auth Error:", error);
            throw error;
        }
    },
    
    // 2. Redirect Method (Fallback for blocked popups)
    signInWithGoogleRedirect: async () => {
        if (typeof firebase === 'undefined') return;
        
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            await auth.signInWithRedirect(provider);
        } catch (error) {
            console.error("Firebase Redirect Auth Error:", error);
            throw error;
        }
    },

    // 3. Check for Redirect Result (Call on page load)
    checkRedirectResult: async () => {
        if (typeof firebase === 'undefined') return null;
        
        try {
            const result = await firebase.auth().getRedirectResult();
            if (result.user) {
                console.log("Recovered user from redirect:", result.user);
                return result.user;
            }
        } catch (error) {
            console.error("Redirect Result Error:", error);
            // Don't throw, just return null
        }
        return null;
    },

    signOut: async () => {
        if (typeof firebase !== 'undefined') {
            return firebase.auth().signOut();
        }
    },
    
    getCurrentUser: () => {
        if (typeof firebase !== 'undefined') {
            return firebase.auth().currentUser;
        }
        return null;
    }
};