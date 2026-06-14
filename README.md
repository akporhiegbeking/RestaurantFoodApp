# 🍽️ LogisticMobileApp

A premium Chowdeck/Glovo-style food delivery marketplace built with React Native and Expo, featuring a sleek modern design, real-time Firestore integration, and seamless payment processing.

![LogisticMobileApp Banner](https://cdn.dribbble.com/userupload/6119574/file/original-5f38617e7b911320d197a5a681c881c9.png?compress=1&resize=2048x1536)

---

## 🚀 Key Features

### 🔐 Authentication & User Profile
- **Secure Sign Up & Login**: Powered by Firebase Authentication (Email/Password).
- **Smart Onboarding**: Automatically fetches user location during signup via IP detection.
- **Device Tracking**: Logs device specifications (Model, OS, Brand) for personalized support.
- **Profile Management**: Users can update their full name, phone number, and delivery address.
- **Dynamic Avatars**: Automated avatar generation using DiceBear or BlueSky APIs based on user count.

### 🍱 Food Exploration
- **Categorized Browsing**: Quickly find meals under categories like Rice, Swallow, Burger, Drinks, and Snacks.
- **Real-time Availability**: Live stock status (Available vs Out of Stock) reflected instantly from Firestore.
- **Advanced Search**: Instant filtering of food items by name.
- **Detailed View**: View calories, estimated prep time, weight, and detailed descriptions for every meal.
- **Favorites System**: Save items for later with the "Saved Items" feature.

### 🛒 Cart & Order Management
- **Persistent Cart**: Items added to the cart are synced across devices via Firestore.
- **Real-time Badges**: Visual cart count updates instantly as items are added.
- **Interactive Cart**: Adjust quantities or remove items with a single tap.
- **Multiple Payment Options**:
  - **PayStack Integration**: Secure online payments via card or transfer.
  - **Payment on Delivery**: Support for POS or Bank Transfer upon arrival.
- **Order Tracking**: View full history of placed orders with status updates (Pending, Delivered, etc.).

---

## 🏗️ Firestore Database Structure

The application utilizes a highly organized NoSQL structure in Firebase Firestore to manage data flow.

### 1. `users` Collection
Stores user profile information and device metadata.
```json
{
  "uid": "unique_auth_id",
  "fullName": "David Johnson",
  "email": "david@example.com",
  "imageUrl": "https://avatar_url.com",
  "phoneNumber": "+234...",
  "home_address": "City, Region, Country",
  "deviceInfo": {
    "brand": "Apple",
    "modelName": "iPhone 15 Pro",
    "osName": "iOS",
    "osVersion": "17.0"
  },
  "createdAt": "2024-04-24T..."
}
```

### 2. `foods` Collection
Contains the menu items offered by the restaurant.
```json
{
  "name": "Double Cheese Burger",
  "price": 4500,
  "imageUrl": "https://image_url.com",
  "category": "Rice",
  "description": "Double patty with extra cheese...",
  "isAvailable": true,
  "rating": 4.8
}
```

### 3. `cart` Collection
Manages temporary items before they are converted into orders.
```json
{
  "uid": "user_id",
  "food_id": "food_doc_id",
  "name": "Double Cheese Burger",
  "price": 4500,
  "quantity": 2,
  "orderStatus": "placed" // Set to 'placed' once order is confirmed
}
```

### 4. `orders` Collection
Permanent record of all transactions and delivery requests.
```json
{
  "user": { "fullName": "...", "phoneNumber": "...", "home_address": "..." },
  "foodItems": [ { "name": "...", "quantity": 1, "price": 4500 } ],
  "totalPrice": 4500,
  "paymentMethod": "POS on Delivery",
  "paymentStatus": "pending",
  "status": "pending",
  "createdAt": "ServerTimestamp"
}
```

### 5. `saved_items` Collection
Stores user's favorite meals.
```json
{
  "uid": "user_id",
  "food_id": "food_doc_id",
  "name": "...",
  "price": 1200
}
```

---

## 🛠️ Technology Stack

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS (NativeWind), Linear Gradients
- **Animations**: Lottie, React Native Animatable
- **Payments**: PayStack WebView
- **Icons**: HeroIcons, Vector Icons

---

## 🏁 Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your mobile device (or iOS/Android Emulator)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

*Built with ❤️ for a premium dining experience.*