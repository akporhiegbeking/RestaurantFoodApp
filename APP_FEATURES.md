# 🍔 RestaurantFoodApp — User Features Overview

> A comprehensive list of everything users can do on the RestaurantFoodApp. This document is intended for business/brand discussions and partnership presentations.

---

## 1. 🚀 Onboarding & Authentication

### Welcome Screen
- Animated splash/landing screen with a branded hero image and tagline.
- **"Get Started"** button routes new users to sign-up.
- **"Log In"** link for returning users.

### Sign Up
- Create a new account with full name, email address, and password.
- Auto-generated 10-digit numerical **account number** assigned to every new user.
- Secure account creation powered by **Firebase Authentication**.

### Login
- Sign in with registered email and password.
- Persistent session — users stay logged in between app launches.

---

## 2. 🏠 Home Feed

- Personalized **"Welcome back, [Name]"** greeting with profile avatar displayed in the header.
- **Real-time food menu** loaded from the database (Firestore), with offline caching for uninterrupted browsing.
- **Pull-to-refresh** to get the latest menu updates instantly.
- **Category filter bar** — tap any food category (e.g., Burgers, Drinks, Snacks) to instantly filter the menu grid.
- **"All"** category shows the complete menu.
- **2-column food card grid** with images, names, and prices for easy browsing.
- **Live cart badge** on the shopping bag icon — shows how many items are currently in the cart, updating in real time.
- **Quick navigation shortcuts** in the header:
  - 🛍 Cart icon → opens Cart screen.
  - 📄 Orders icon → opens Orders history.
  - 👤 Profile avatar → opens Profile screen.

---

## 3. 🍽️ Food Details

- Full-screen detail view for any selected food item.
- Large food image with name and animated fade-in effect.
- **Live availability badge** — items show "Currently Available" (green) or "Unavailable / Out of stock" (red), updated in real time from the database.
- **Quantity stepper** — increase or decrease the number of items with `+` / `−` buttons. Changes sync to the cart automatically if the item is already added.
- **Price calculator** — displays single item price and running total based on selected quantity.
- **Add to Cart / Remove from Cart** toggle button — one tap to add; tap again to remove. Disabled if the item is out of stock.
- **Save / Wishlist** (heart icon) — tap to save a favourite item for later; tap again to unsave. Persists across sessions.
- Detailed food description.

---

## 4. 🛒 Cart

- Full list of all items added to the cart, with images, names, individual prices, and quantities.
- **Quantity control** per item — increase or decrease quantities directly from the cart; decreasing to zero removes the item automatically.
- **Remove item** button to instantly delete a specific item from the cart.
- **Subtotal summary** — running total displayed at the top, updating live as quantities change.
- **Delivery details panel** showing:
  - Saved home address (with a quick **Edit** link to update it).
  - Contact phone number.
  - Estimated delivery time: **20 – 50 minutes**.
- **Payment method selector** (radio buttons):
  - 💳 **Pay Now** — proceed to online card payment via Paystack.
  - 🚚 **Pay on Delivery** — pay cash when the order arrives.
- **Checkout button** — initiates the selected payment flow.
- Empty cart state with a **"Shop Food Item"** shortcut back to the home feed.

---

## 5. 💳 Checkout — Pay Now (Paystack)

- Secure in-app payment sheet powered by **Paystack** (Nigeria's leading payment gateway).
- **Order Summary card** showing:
  - Total amount (in ₦).
  - Customer name, email, phone number, and delivery address.
- **"Pay ₦[amount]"** button launches the Paystack payment popup.
- On successful payment:
  - Order is saved to the database with a payment reference, timestamp, and status.
  - Cart items are marked as "placed" (not deleted, keeping order history intact).
  - Success modal confirms payment and offers a link to view order details.
- Handles cancellation and error states gracefully with user-facing toast notifications.

---

## 6. 📦 Checkout — Pay on Delivery

- Alternative checkout flow for cash payment.
- Displays order summary (items, quantities, totals, delivery address).
- Confirms and places the order in the database with **"Pay on Delivery"** status.
- Navigates to the Order Success screen upon confirmation.

---

## 7. ✅ Order Success Screen

- Confirmation screen shown after a successful order is placed.
- Displays a success message and order summary.
- Links back to the home screen or order history.

---

## 8. 📋 My Orders

- Complete history of all orders the user has placed.
- Each order card shows:
  - Food item image, name, price, and quantity.
  - Truncated **Order ID** for reference.
  - **Status badge** — colour-coded:
    - 🟠 Pending / Preparing
    - 🟢 Completed / Delivered
- Tap any order to view its full details.
- Empty state message if no orders have been placed yet.

---

## 9. 🔍 Order Details & Live Tracking

### Order Details View
- Full breakdown of the selected order:
  - Food item image, name, price, and quantity.
  - Order ID, payment method, and current status.
- **"Order Arrived Successfully!"** banner displayed when status is **Delivered**.

### Live Order Tracking
- Tap **"Track Order"** to open a live tracking view.
- Visual **step-by-step progress tracker** with three stages:
  1. ✔️ **Confirming order**
  2. 🍳 **Preparing your order**
  3. 🛵 **Order shipped — Rider on the way**
- Active steps are highlighted in green; current step shows an animated indicator.
- **Estimated delivery time** displayed prominently.
- **Delivery code** (full order ID) displayed in individual character boxes — can be shared with the delivery rider for verification.
- **"Hide Tracking"** button to collapse back to the standard order detail view.

---

## 10. ❤️ Saved Items (Wishlist)

- Dedicated screen listing all food items the user has saved/favourited.
- Each saved item shows its image, name, and price.
- **Remove** button to delete any item from the wishlist instantly.
- Empty state when no items are saved.

---

## 11. 👤 Profile

- Personalized profile page showing the user's avatar and first name.
- **Total Orders Transactions** card — displays the cumulative amount spent, with a **show/hide toggle** (eye icon) for privacy.
- Quick-access menu:
  - **Edit My Profile** — update personal details.
  - **My Orders** — jump to order history.
  - **My Saved Items** — view wishlist.
  - **My Cart** — open the cart.
  - **Help Center** — opens an email compose window pre-filled with support details.
  - **Logout** — signs the user out and clears local session data.

---

## 12. ✏️ Edit Profile / Account Details

- Update **full name**, **phone number**, and **home delivery address** at any time.
- **Email address** displayed as read-only (as registered).
- **Update Password** — sends a password-reset link to the registered email via Firebase, allowing secure password changes without in-app credential handling.
- Address is edited through a dedicated **bottom-sheet modal** for a clean, focused input experience.
- Changes are saved instantly to the cloud database with a confirmation toast.

---

## 📊 Technical Highlights (for Business Discussions)

| Feature | Technology |
|---|---|
| Backend & Database | Firebase Firestore (real-time) |
| Authentication | Firebase Auth |
| Payments | Paystack (online card) |
| Offline Support | AsyncStorage caching |
| Real-time Updates | Firestore `onSnapshot` listeners |
| Platform | React Native (iOS & Android) |

---

*Document generated: May 2026*
