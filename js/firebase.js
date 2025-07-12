// IMPORTANT: PASTE YOUR FIREBASE CONFIG OBJECT HERE
// 重要：請將您從 Firebase 控制台複製的 firebaseConfig 物件貼在此處

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Checks if the Firebase configuration has been set.
 * @returns {boolean} True if the config is set, false otherwise.
 */
function isFirebaseConfigured() {
    return firebaseConfig && 
           firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== "YOUR_API_KEY" &&
           firebaseConfig.projectId &&
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Global error holder
window.firebaseInitializationError = null;

// Initialize Firebase only if it's configured
let auth, db;
if (isFirebaseConfigured()) {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        window.firebaseInitializationError = error; // Store the error for other scripts to check
    }
} else {
    console.warn("Firebase is not configured. The app will run in preview mode with mock data.");
}