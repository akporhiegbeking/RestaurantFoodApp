# Database Structure

## Collections

### foods
Auto-generated document ID by Firebase Firestore.

| Field | Type | Description |
| :--- | :--- | :--- |
| `merchantId` | String | ID of the merchant/restaurant |
| `name` | String | Name of the food item |
| `description` | String | Description of the food item |
| `category` | String | Category of the food item |
| `imageUrl` | String | URL to the food item image |
| `price` | Number | Price of the food item |
| `isAvailable` | Boolean | Whether the food item is available |
| `createdAt` | Timestamp | Time when created |
| `updatedAt` | Timestamp | Time when last updated |

---

### carts
Auto-generated document ID by Firebase Firestore.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | String | UID of the user |
| `updatedAt` | Timestamp | Time when last updated |
| `items` | Array | List of items in the cart |

#### Item Object in `items` Array
| Field | Type | Description |
| :--- | :--- | :--- |
| `foodId` | String | ID of the food item |
| `merchantId` | String | ID of the merchant/restaurant |
| `merchantName` | String | Name of the merchant/restaurant |
| `name` | String | Name of the food item |
| `imageUrl` | String | URL to the food item image |
| `price` | Number | Price of the food item |
| `quantity` | Number | Quantity of the item in cart |
