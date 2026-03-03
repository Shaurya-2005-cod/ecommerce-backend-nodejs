E-commerce Backend API

A fully functional REST API for an E-commerce application built using Node.js, Express.js, MongoDB, and Mongoose.

This project supports user management, product management, and cart functionality with proper database relationships.

📌 Features

👤 User Creation

📦 Product CRUD Operations

🛒 Add to Cart

🛒 Get User Cart

🔄 Update Cart Quantity

❌ Remove From Cart

🗄 MongoDB Integration

⚡ Error Handling & Validation

🛠 Tech Stack

Node.js

Express.js

MongoDB

Mongoose

Thunder Client / Postman (for testing)

📂 Project Structure
ecommerce-backend-nodejs/
│
├── config/
│   └── database.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
│
├── server.js
├── package.json
└── .gitignore
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/Shaurya-2005-cod/ecommerce-backend-nodejs.git
cd ecommerce-backend-nodejs
2️⃣ Install Dependencies
npm install
3️⃣ Create .env File

Create a .env file in root folder:

PORT=3000
MONGO_URI=your_mongodb_connection_string
4️⃣ Start Server
npm start

Server will run on:

http://localhost:3000
📡 API Endpoints
👤 User
Method	Endpoint	Description
POST	/users	Create a user
📦 Products
Method	Endpoint	Description
POST	/products	Create product
GET	/products	Get all products
🛒 Cart
Method	Endpoint	Description
POST	/cart	Add product to cart
GET	/cart/:userId	Get user cart
PUT	/cart	Update cart quantity
DELETE	/cart	Remove item from cart
🧠 Database Relationships

A User can have multiple Cart items

Cart references:

userId (ObjectId)

productId (ObjectId)

Proper use of Mongoose population for fetching product details

🚀 Future Improvements

JWT Authentication

Order & Payment Integration

Admin Panel

Deployment (Render / Railway)

Swagger API Documentation

👨‍💻 Author

Shaurya Agarwal
B.Tech CSE (AIML)
Karnavati University
