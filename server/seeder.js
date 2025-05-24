const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Product = require('./models/Product');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample products data
const getSampleProducts = (adminUserId) => [
  {
    name: "Organic Tomatoes",
    description: "Fresh organic cherry tomatoes grown without pesticides. Perfect for salads, cooking, or snacking.",
    price: 4.99,
    originalPrice: 6.99,
    category: "organic-vegetables",
    type: "organic-vegetables",
    images: [
      {
        public_id: "tomatoes_1",
        url: "https://images.unsplash.com/photo-1546470427-e26264be0b5d?w=400"
      },
      {
        public_id: "tomatoes_2", 
        url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
      }
    ],
    stock: 50,
    isOrganic: true,
    isFeatured: true,
    ratings: { average: 4.8, count: 24 },
    tags: ["organic", "fresh", "local", "healthy"],
    seller: adminUserId,
    createdBy: adminUserId,    careInstructions: "Store in cool, dry place. Refrigerate for longer freshness.",
    weight: 500,
    seo: {
      metaTitle: "Organic Tomatoes - Fresh & Healthy",
      metaDescription: "Fresh organic cherry tomatoes grown without pesticides",
      slug: "organic-tomatoes"
    }
  },
  {
    name: "Fresh Basil",
    description: "Aromatic fresh basil leaves perfect for cooking, making pesto, or garnishing dishes.",
    price: 2.99,
    originalPrice: 3.99,
    category: "plants",
    type: "herbs",
    images: [
      {
        public_id: "basil_1",
        url: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400"
      }
    ],
    stock: 30,
    isOrganic: true,
    isFeatured: false,
    ratings: { average: 4.9, count: 18 },
    tags: ["herbs", "organic", "aromatic", "cooking"],
    seller: adminUserId,
    createdBy: adminUserId,
    careInstructions: "Keep in bright, indirect light. Water when soil feels dry.",
    sunlightRequirement: "partial-sun",
    wateringFrequency: "alternate-days",
    weight: 50
  },
  {
    name: "Organic Spinach",
    description: "Fresh organic baby spinach leaves rich in iron and vitamins. Great for salads and smoothies.",
    price: 3.49,
    originalPrice: 4.49,
    category: "organic-vegetables",
    type: "organic-vegetables",
    images: [
      {
        public_id: "spinach_1",
        url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"
      }
    ],
    stock: 40,
    isOrganic: true,
    isFeatured: true,
    ratings: { average: 4.7, count: 32 },
    tags: ["organic", "healthy", "iron-rich", "salad"],
    seller: adminUserId,
    createdBy: adminUserId,
    weight: 200
  },
  {
    name: "Garden Tool Set",
    description: "Complete 5-piece garden tool set with ergonomic handles. Perfect for all your gardening needs.",
    price: 24.99,
    originalPrice: 34.99,
    category: "tools",
    type: "gardening-tools",
    images: [
      {
        public_id: "tools_1",
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
      }
    ],
    stock: 15,
    isOrganic: false,
    isFeatured: true,
    ratings: { average: 4.6, count: 89 },
    tags: ["tools", "garden", "complete-set", "durable"],
    seller: adminUserId,
    createdBy: adminUserId,
    weight: 1200
  },
  {
    name: "Strawberry Plants",
    description: "Healthy strawberry plants ready for planting. Will produce sweet, juicy strawberries in season.",
    price: 8.99,
    originalPrice: 11.99,
    category: "plants",
    type: "fruit-plants",
    images: [
      {
        public_id: "strawberry_1",
        url: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=400"
      }
    ],
    stock: 20,
    isOrganic: false,
    isFeatured: true,
    ratings: { average: 4.7, count: 22 },
    tags: ["plants", "fruits", "strawberry", "garden"],
    seller: adminUserId,
    createdBy: adminUserId,
    careInstructions: "Plant in well-draining soil. Water regularly during growing season.",
    sunlightRequirement: "full-sun",
    wateringFrequency: "daily",
    plantingSeasons: ["spring", "summer"],
    weight: 300
  },
  {
    name: "Organic Fertilizer Mix",
    description: "Premium organic fertilizer blend perfect for all types of plants. Rich in nutrients and eco-friendly.",
    price: 12.99,
    originalPrice: 15.99,
    category: "organic-supplies",
    type: "fertilizers",
    images: [
      {
        public_id: "fertilizer_1",
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
      }
    ],
    stock: 25,
    isOrganic: true,
    isFeatured: true,
    ratings: { average: 4.8, count: 45 },
    tags: ["organic", "fertilizer", "eco-friendly", "nutrients"],
    seller: adminUserId,
    createdBy: adminUserId,
    weight: 2000
  }
];

// Seed database
const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany();
    console.log('Existing products cleared'.red);
    
    // Create or find admin user
    let adminUser = await User.findOne({ email: 'admin@plantpap.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'PlantPAP Admin',
        email: 'admin@plantpap.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created'.green);
    }
    
    // Get sample products with admin user ID
    const sampleProducts = getSampleProducts(adminUser._id);
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`${products.length} products added to database`.green.bold);
    
    console.log('\nSeeded products:'.cyan.bold);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price}`.white);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  if (process.argv[2] === '-d') {
    // Delete all products
    (async () => {
      try {
        await connectDB();
        await Product.deleteMany();
        console.log('All products deleted'.red.bold);
        process.exit(0);
      } catch (error) {
        console.error('Error deleting products:', error);
        process.exit(1);
      }
    })();
  } else {
    seedDB();
  }
}

module.exports = { seedDB, getSampleProducts };
