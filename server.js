require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

console.log('🚀 Starting server...');
console.log('📝 Environment variables loaded');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('✅ Middleware configured');

// Import models and database connection
let Product, User, Cart, Order, connectDB;

try {
  connectDB = require('./config/database');
  Product = require('./models/Product');
  User = require('./models/User');
  Cart = require('./models/Cart');
  Order = require('./models/Order');
  console.log('✅ Models loaded successfully');
} catch (error) {
  console.error('❌ Error loading models:', error.message);
  process.exit(1);
}

// Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// POST create product
app.post('/products', [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('stock').isInt({ min: 0 })
], handleValidationErrors, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

// POST create user
app.post('/users', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], handleValidationErrors, async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const newUser = new User({ ...req.body, password: `hashed_${req.body.password}` });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
});

// GET cart
app.get('/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
  }
});

// POST add to cart
app.post('/cart', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
    
    await cart.save();
    await cart.populate('items.product');
    res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
  }
});

// POST create order
app.post('/orders', async (req, res) => {
  try {
    const { userId, items } = req.body;
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
      product.stock -= item.quantity;
      await product.save();
    }
    
    const newOrder = new Order({ user: userId, items: orderItems, totalAmount });
    await newOrder.save();
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0 });
    res.status(201).json({ success: true, message: 'Order created successfully', data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
  }
});

// GET all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

console.log('✅ Routes configured');

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
});

console.log('✅ Server setup complete, waiting for MongoDB connection...');