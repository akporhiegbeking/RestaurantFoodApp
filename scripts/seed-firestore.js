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

async function seed() {
  try {
    console.log("Seeding 'foods' collection...");
    const foodData = {
      name: "Jollof Rice & Chicken",
      description: "Delicious smoky jollof with grilled chicken",
      price: 3500,
      category: "Rice",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAEYZoAXFTrvMnKNDO3OlMbJo0jBs12lyx3A&s",
      isAvailable: true,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'foods'), foodData);
    console.log("✅ Success! Food item added with ID:", docRef.id);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
    process.exit(1);
  }
}

seed();
