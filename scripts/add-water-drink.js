const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("Initializing Firebase for project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addWaterDrink() {
  try {
    console.log("Adding 'Table Water' to 'foods' collection...");
    const waterData = {
      name: "Table Water",
      description: "Refreshing chilled table water",
      price: 500,
      category: "Drinks",
      imageUrl: "blob:https://gemini.google.com/88aea11f-0fc8-4509-8097-7a1e9fed243e",
      isAvailable: true,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'foods'), waterData);
    console.log("✅ Success! Table Water added with ID:", docRef.id);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding document:", error);
    process.exit(1);
  }
}

addWaterDrink();
