// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Replace with your Firebase project configuration
const firebaseConfig = {
apiKey: "AIzaSyC04pGCcCT8D5hMcRduxW1xmLvJdx_Rn-g",
//   authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "borrow-buddy-f85df",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:1010944662419:android:b7a63c85f9fac1dca2e666",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth};
