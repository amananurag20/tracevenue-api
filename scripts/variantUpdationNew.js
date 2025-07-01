// Script to update variants with menu items, free services, and paid services

const mongoose = require("mongoose");
const Variant = require("../modules/venue/models/variant.model");
require("dotenv").config(); // Assuming you have a .env file with your MongoDB connection string
// --- Configuration ---
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging";
// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Import the Variant model

// Mock data for prices and menu item counts
const priceData = [
  {
    amount: 400,
    maxMenuItemsCount: 6,
  },
  {
    amount: 450,
    newAmount: 4500,
    maxMenuItemsCount: 7,
  },
  {
    amount: 750,
    newAmount: 7500,
    maxMenuItemsCount: 8,
  },
  {
    amount: 950,
    newAmount: 9500,
    maxMenuItemsCount: 9,
  },
  {
    amount: 1100,
    newAmount: 11000,
    maxMenuItemsCount: 11,
  },
  {
    amount: 1400,
    newAmount: 14000,
    maxMenuItemsCount: 13,
  },
  {
    amount: 1500,
    newAmount: 15000,
    maxMenuItemsCount: 14,
  },
  {
    amount: 1600,
    newAmount: 16000,
    maxMenuItemsCount: 16,
  },
  {
    amount: 2000,
    newAmount: 20000,
    maxMenuItemsCount: 18,
  },
  {
    amount: 2500,
    newAmount: 25000,
    maxMenuItemsCount: 22,
  },
  {
    amount: 4000,
    newAmount: 6000,
    maxMenuItemsCount: 8,
  },
  {
    amount: 4999,
    newAmount: 8000,
    maxMenuItemsCount: 10,
  },
  {
    amount: 5000,
    newAmount: 9000,
    maxMenuItemsCount: 10,
  },
  {
    amount: 6000,
    newAmount: 11000,
    maxMenuItemsCount: 10,
  },
  {
    amount: 6500,
    maxMenuItemsCount: 5,
  },
  {
    amount: 7400,
    maxMenuItemsCount: 6,
  },
  {
    amount: 7500,
    maxMenuItemsCount: 7,
  },
  {
    amount: 8000,
    maxMenuItemsCount: 8,
  },
  {
    amount: 9000,
    maxMenuItemsCount: 8,
  },
  {
    amount: 9500,
    maxMenuItemsCount: 10,
  },
  {
    amount: 10000,
    maxMenuItemsCount: 12,
  },
  {
    amount: 12000,
    maxMenuItemsCount: 14,
  },
  {
    amount: 12500,
    maxMenuItemsCount: 14,
  },
  {
    amount: 15000,
    maxMenuItemsCount: 18,
  },
  {
    amount: 18000,
    maxMenuItemsCount: 20,
  },
  {
    amount: 18500,
    maxMenuItemsCount: 22,
  },
  {
    amount: 19000,
    maxMenuItemsCount: 24,
  },
  {
    amount: 20000,
    maxMenuItemsCount: 26,
  },
  {
    amount: 24000,
    maxMenuItemsCount: 28,
  },
  {
    amount: 25000,
    maxMenuItemsCount: 30,
  },
  {
    amount: 26999,
    maxMenuItemsCount: 32,
  },
  {
    amount: 30000,
    maxMenuItemsCount: 38,
  },
  {
    amount: 35000,
    maxMenuItemsCount: 42,
  },
  {
    amount: 36000,
    maxMenuItemsCount: 44,
  },
  {
    amount: 38000,
    maxMenuItemsCount: 46,
  },
  {
    amount: 40000,
    maxMenuItemsCount: 48,
  },
  {
    amount: 50000,
    maxMenuItemsCount: 55,
  },
  {
    amount: 60000,
    maxMenuItemsCount: 62,
  },
  {
    amount: 70000,
    maxMenuItemsCount: 68,
  },
  {
    amount: 80000,
    maxMenuItemsCount: 74,
  },
  {
    amount: 100000,
    maxMenuItemsCount: 80,
  },
  {
    amount: 120000,
    maxMenuItemsCount: 90,
  },
  {
    amount: 150000,
    maxMenuItemsCount: 120,
  },
  {
    amount: 180000,
    maxMenuItemsCount: 140,
  },
  {
    amount: 200000,
    maxMenuItemsCount: 150,
  },
  {
    amount: 250000,
    maxMenuItemsCount: 160,
  },
];

// Mock data for menu items
const menuItemsData = [
  {
    id: "68257600c0ea8c3e8c95a6d6",
    itemName: "Creamy Sandwich Delight",
    cuisine: [
      {
        _id: "67dba24c024b2035f1d88ec0",
        name: "North Indian / Punjabi",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6d7",
    itemName: "Spicy Chicken Biryani",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6d8",
    itemName: "Tandoori Paneer Tikka",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6d9",
    itemName: "Chicken Alfredo Pasta",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6da",
    itemName: "Veg Manchurian Gravy",
    cuisine: [
      {
        _id: "67aeda63d3af1523c01ef462",
        name: "Chinese",
      },
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6db",
    itemName: "Mint Mojito Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6dc",
    itemName: "Butter Naan",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6dd",
    itemName: "Chicken Tikka Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6de",
    itemName: "Cold Coffee Shake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257600c0ea8c3e8c95a6df",
    itemName: "Hot & Sour Soup",
    cuisine: [
      {
        _id: "67aeda63d3af1523c01ef462",
        name: "Chinese",
      },
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e0",
    itemName: "Paneer Butter Masala",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e1",
    itemName: "Chicken Seekh Kebab",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e2",
    itemName: "Veg Hakka Noodles",
    cuisine: [
      {
        _id: "67aeda63d3af1523c01ef462",
        name: "Chinese",
      },
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e3",
    itemName: "Margherita Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e4",
    itemName: "Chicken Club Sandwich",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e5",
    itemName: "Fresh Garden Salad",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e6",
    itemName: "Chilli Paneer Dry",
    cuisine: [
      {
        _id: "67aeda63d3af1523c01ef462",
        name: "Chinese",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e7",
    itemName: "Masala Chai",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e8",
    itemName: "Chocolate Brownie Sundae",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6e9",
    itemName: "Lassi with Rose Flavor",
    cuisine: [
      {
        _id: "67dba33c024b2035f1d88f32",
        name: "Maharashtrian / South India",
      },
      {
        _id: "67dba24c024b2035f1d88ec0",
        name: "North Indian / Punjabi",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6ea",
    itemName: "Hyderabadi Mutton Biryani",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6eb",
    itemName: "Tomato Basil Soup",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257601c0ea8c3e8c95a6ec",
    itemName: "Tandoori Roti",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6ed",
    itemName: "Veg Grilled Sandwich",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6ee",
    itemName: "Prawn Tempura",
    cuisine: [
      {
        _id: "67dba51f024b2035f1d89005",
        name: "Japanese / Fusion",
      },
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6ef",
    itemName: "Chocolate Milkshake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f0",
    itemName: "Stuffed Kulcha",
    cuisine: [
      {
        _id: "67dba24c024b2035f1d88ec0",
        name: "North Indian / Punjabi",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f1",
    itemName: "Peri Peri Fries",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f2",
    itemName: "Virgin Pina Colada",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f3",
    itemName: "Fish Curry with Steamed Rice",
    cuisine: [
      {
        _id: "67dba33c024b2035f1d88f32",
        name: "Maharashtrian / South India",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f4",
    itemName: "Mushroom Risotto",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f5",
    itemName: "Classic Caesar Salad",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f6",
    itemName: "Butter Chicken",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f7",
    itemName: "Sizzling Brownie with Ice Cream",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f8",
    itemName: "Thai Green Curry with Jasmine Rice",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257602c0ea8c3e8c95a6f9",
    itemName: "Hot Chocolate",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6fa",
    itemName: "BBQ Chicken Wings",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6fb",
    itemName: "Aloo Tikki Chaat",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6fc",
    itemName: "Iced Lemon Tea",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6fd",
    itemName: "Veg Lasagna",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6fe",
    itemName: "Veg Spring Rolls",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a6ff",
    itemName: "Masala Dosa",
    cuisine: [
      {
        _id: "67dba33c024b2035f1d88f32",
        name: "Maharashtrian / South India",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a700",
    itemName: "Mutton Rogan Josh",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a701",
    itemName: "Garlic Bread with Cheese",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a702",
    itemName: "Mint Cucumber Cooler",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a703",
    itemName: "Chicken Kathi Roll",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a704",
    itemName: "Veg Fried Rice",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a705",
    itemName: "Espresso Shot",
    cuisine: [
      {
        _id: "67dba648024b2035f1d89134",
        name: "Continental / European",
      },
    ],
  },
  {
    id: "68257603c0ea8c3e8c95a706",
    itemName: "Classic Mojito",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a707",
    itemName: "Blueberry Smoothie",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a708",
    itemName: "Cheesy Garlic Pasta",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a709",
    itemName: "Chicken Manchurian",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70a",
    itemName: "Baked Nachos with Salsa",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70b",
    itemName: "Peach Iced Tea",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70c",
    itemName: "Egg Fried Rice",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70d",
    itemName: "Spicy Corn Chaat",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70e",
    itemName: "Virgin Mary",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a70f",
    itemName: "Paneer Tikka Masala",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257604c0ea8c3e8c95a710",
    itemName: "Fish Tikka",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257605c0ea8c3e8c95a711",
    itemName: "Cold Coffee",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257605c0ea8c3e8c95a712",
    itemName: "Aloo Paratha",
    cuisine: [
      {
        _id: "67dba24c024b2035f1d88ec0",
        name: "North Indian / Punjabi",
      },
    ],
  },
  {
    id: "68257605c0ea8c3e8c95a713",
    itemName: "Chocolate Fondue",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257605c0ea8c3e8c95a714",
    itemName: "Crispy Chicken Burger",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257605c0ea8c3e8c95a715",
    itemName: "Mint Lemonade",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257606c0ea8c3e8c95a716",
    itemName: "Mango Lassi",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257606c0ea8c3e8c95a717",
    itemName: "Penne Arrabiata",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257607c0ea8c3e8c95a718",
    itemName: "Classic Margarita Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257607c0ea8c3e8c95a719",
    itemName: "Mutton Seekh Kebab",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257607c0ea8c3e8c95a71a",
    itemName: "Chocolate Brownie",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257607c0ea8c3e8c95a71b",
    itemName: "Virgin Strawberry Daiquiri",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a71c",
    itemName: "Hot Ginger Tea",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a71d",
    itemName: "Tandoori Chicken",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a71e",
    itemName: "Veggie Burger",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a71f",
    itemName: "Paneer Tikka Salad",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a720",
    itemName: "Mango Cheesecake",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a721",
    itemName: "Cold Brew Coffee",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a722",
    itemName: "Masala Papad",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a723",
    itemName: "Chicken Biryani",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257608c0ea8c3e8c95a724",
    itemName: "Spring Veg Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a725",
    itemName: "Vegetable Spring Rolls",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a726",
    itemName: "Italian Herb Breadsticks",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a727",
    itemName: "Mango Sorbet",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a728",
    itemName: "Egg Curry",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a729",
    itemName: "Vanilla Milkshake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ac0ea8c3e8c95a72a",
    itemName: "Veggie Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a72b",
    itemName: "Cucumber Mint Cooler",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a72c",
    itemName: "Chicken Caesar Salad",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a72d",
    itemName: "Prawn Curry",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a72e",
    itemName: "Corn & Cheese Sandwich",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a72f",
    itemName: "Mixed Fruit Salad",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760bc0ea8c3e8c95a730",
    itemName: "Lemonade with Basil",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a731",
    itemName: "Paneer Lababdar",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a732",
    itemName: "Chicken Tikka Wrap",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a733",
    itemName: "Chocolate Ice Cream Sundae",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a734",
    itemName: "Vegetable Biryani",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
      {
        _id: "67dba33c024b2035f1d88f32",
        name: "Maharashtrian / South India",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a735",
    itemName: "Lemon Garlic Chicken",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a736",
    itemName: "Strawberry Smoothie",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a737",
    itemName: "Chili Paneer",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a738",
    itemName: "Vanilla Latte",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a739",
    itemName: "Mango Mojito Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760cc0ea8c3e8c95a73a",
    itemName: "Chicken Noodles",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760dc0ea8c3e8c95a73b",
    itemName: "Cold Coffee Frappe",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825760dc0ea8c3e8c95a73c",
    itemName: "Aloo Tikki",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825760dc0ea8c3e8c95a73d",
    itemName: "Chocolate Shake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825760dc0ea8c3e8c95a73e",
    itemName: "Veg Manchurian",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "6825760dc0ea8c3e8c95a73f",
    itemName: "Cold Lime Soda",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825760ec0ea8c3e8c95a740",
    itemName: "Chicken Caesar Wrap",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257610c0ea8c3e8c95a741",
    itemName: "Hot Masala Chai",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257611c0ea8c3e8c95a742",
    itemName: "Veggie Pasta Primavera",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257611c0ea8c3e8c95a743",
    itemName: "Virgin Mojito",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257611c0ea8c3e8c95a744",
    itemName: "Chicken Tandoori Pizza",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257613c0ea8c3e8c95a745",
    itemName: "Vegetable Fried Rice",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257613c0ea8c3e8c95a746",
    itemName: "Chicken Korma",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257613c0ea8c3e8c95a747",
    itemName: "Chicken Wings",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257614c0ea8c3e8c95a748",
    itemName: "Vegetable Hakka Noodles",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a749",
    itemName: "Masala Chaas",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74a",
    itemName: "Paneer Pakora",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74b",
    itemName: "Chocolate Chip Cookies",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74c",
    itemName: "Mixed Veg Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74d",
    itemName: "Veg Hakka Manchurian",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74e",
    itemName: "Cheese Garlic Bread",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a74f",
    itemName: "Veg Pulao",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257615c0ea8c3e8c95a750",
    itemName: "Blue Lagoon Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257616c0ea8c3e8c95a751",
    itemName: "Mango Margarita Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257616c0ea8c3e8c95a752",
    itemName: "Cheeseburger",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257616c0ea8c3e8c95a753",
    itemName: "Lemon Iced Tea",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257616c0ea8c3e8c95a754",
    itemName: "Gulab Jamun",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257616c0ea8c3e8c95a755",
    itemName: "Vegetable Manchow Soup",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a756",
    itemName: "Strawberry Milkshake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a757",
    itemName: "Hot Lemon Ginger Tea",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a758",
    itemName: "Veg Cheese Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a759",
    itemName: "Mango Smoothie",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a75a",
    itemName: "Tomato Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a75b",
    itemName: "Chicken Nuggets",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a75c",
    itemName: "Masala Lemonade",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257617c0ea8c3e8c95a75d",
    itemName: "Chocolate Fudge Cake",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257618c0ea8c3e8c95a75e",
    itemName: "Veg Sandwich",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257618c0ea8c3e8c95a75f",
    itemName: "Mojito Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257618c0ea8c3e8c95a760",
    itemName: "Cold Lemon Tea",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257619c0ea8c3e8c95a761",
    itemName: "Veg Spring Roll",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257619c0ea8c3e8c95a762",
    itemName: "Naan",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257619c0ea8c3e8c95a763",
    itemName: "Chicken Burger",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257619c0ea8c3e8c95a764",
    itemName: "Cold Mojito",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761ac0ea8c3e8c95a765",
    itemName: "Veg Burger",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761ac0ea8c3e8c95a766",
    itemName: "Pineapple Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761bc0ea8c3e8c95a767",
    itemName: "Minestrone Soup",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a768",
    itemName: "Fresh Lime Soda",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a769",
    itemName: "Vegetable Pulao",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a76a",
    itemName: "Tiramisu",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a76b",
    itemName: "Iced Mocha",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a76c",
    itemName: "Lamb Rogan Josh",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a76d",
    itemName: "Banana Milkshake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825761cc0ea8c3e8c95a76e",
    itemName: "Prawn Cocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a76f",
    itemName: "Garlic Naan",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a770",
    itemName: "Cold Watermelon Juice",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a771",
    itemName: "Rasgulla",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a772",
    itemName: "Mutton Biryani",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a773",
    itemName: "Vegetable Pasta Alfredo",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761dc0ea8c3e8c95a774",
    itemName: "Chocolate Lava Cake",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825761ec0ea8c3e8c95a775",
    itemName: "Mushroom Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761ec0ea8c3e8c95a776",
    itemName: "Pasta Primavera",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761fc0ea8c3e8c95a777",
    itemName: "Chicken Sandwich",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825761fc0ea8c3e8c95a778",
    itemName: "Prawn Biryani",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825761fc0ea8c3e8c95a779",
    itemName: "Cold Mint Lemonade",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825761fc0ea8c3e8c95a77a",
    itemName: "Caesar Salad",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825761fc0ea8c3e8c95a77b",
    itemName: "Hot Masala Tea",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a77c",
    itemName: "Virgin Mango Margarita",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a77d",
    itemName: "Jeera Rice",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a77e",
    itemName: "Vegetable Lasagna",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a77f",
    itemName: "Vanilla Ice Cream Sundae",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a780",
    itemName: "Hot Buttered Rum",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a781",
    itemName: "Caprese Salad",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a782",
    itemName: "Chicken Noodle Soup",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257620c0ea8c3e8c95a783",
    itemName: "Virgin Blue Lagoon",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257621c0ea8c3e8c95a784",
    itemName: "Jeera Aloo",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257621c0ea8c3e8c95a785",
    itemName: "Cold Peach Iced Tea",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257621c0ea8c3e8c95a786",
    itemName: "Penne Arrabbiata",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257621c0ea8c3e8c95a787",
    itemName: "Margarita Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257621c0ea8c3e8c95a788",
    itemName: "Banana Smoothie",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257622c0ea8c3e8c95a789",
    itemName: "Hot Chai Latte",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257622c0ea8c3e8c95a78a",
    itemName: "Veggie Wrap",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257622c0ea8c3e8c95a78b",
    itemName: "Ras Malai",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "68257622c0ea8c3e8c95a78c",
    itemName: "Corn and Cheese Balls",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257622c0ea8c3e8c95a78d",
    itemName: "Iced Matcha Latte",
    cuisine: [
      {
        _id: "67dba51f024b2035f1d89005",
        name: "Japanese / Fusion",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a78e",
    itemName: "Strawberry Banana Smoothie",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a78f",
    itemName: "Cauliflower Manchurian",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a790",
    itemName: "Hot Apple Cider",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a791",
    itemName: "Pepperoni Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a792",
    itemName: "Mutton Keema",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257623c0ea8c3e8c95a793",
    itemName: "Vegetable Manchurian",
    cuisine: [
      {
        _id: "67dba444024b2035f1d88f95",
        name: "Asian / Chinese",
      },
    ],
  },
  {
    id: "68257624c0ea8c3e8c95a794",
    itemName: "Cold Coffee Float",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257627c0ea8c3e8c95a795",
    itemName: "Spaghetti Aglio e Olio",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "68257628c0ea8c3e8c95a796",
    itemName: "Cold Brew Iced Tea",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "68257629c0ea8c3e8c95a797",
    itemName: "Vegetable Korma",
    cuisine: [
      {
        _id: "6818bdb62ff85254568198a5",
        name: "Mughlai",
      },
      {
        _id: "6818bdb62ff85254568198a4",
        name: "North Indian",
      },
    ],
  },
  {
    id: "68257629c0ea8c3e8c95a798",
    itemName: "Choco Banana Shake",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "68257629c0ea8c3e8c95a799",
    itemName: "Cold Lemon Iced Tea",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762ac0ea8c3e8c95a79a",
    itemName: "Cold Strawberry Smoothie",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825762ac0ea8c3e8c95a79b",
    itemName: "Vegetable Pasta Primavera",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762ac0ea8c3e8c95a79c",
    itemName: "Mango Lassi Smoothie",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
    ],
  },
  {
    id: "6825762bc0ea8c3e8c95a79d",
    itemName: "Creamy Tomato Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "6825762bc0ea8c3e8c95a79e",
    itemName: "Cold Lychee Mocktail",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762bc0ea8c3e8c95a79f",
    itemName: "Cold Coffee with Ice Cream",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762cc0ea8c3e8c95a7a0",
    itemName: "Chicken Alfredo Pizza",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762cc0ea8c3e8c95a7a1",
    itemName: "Vegetable Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762cc0ea8c3e8c95a7a2",
    itemName: "Grilled Veg Sandwich",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825762cc0ea8c3e8c95a7a3",
    itemName: "Cold Mango Smoothie",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762cc0ea8c3e8c95a7a4",
    itemName: "Garlic Bread",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7a5",
    itemName: "Pasta Arrabbiata",
    cuisine: [
      {
        _id: "67ac7d292ee4b070bd485696",
        name: "Italian",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7a6",
    itemName: "Virgin Strawberry Mojito",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7a7",
    itemName: "Spinach Corn Soup",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7a8",
    itemName: "Keema Pav",
    cuisine: [
      {
        _id: "67ac7d222ee4b070bd485694",
        name: "Indian",
      },
      {
        _id: "67dba33c024b2035f1d88f32",
        name: "Maharashtrian / South India",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7a9",
    itemName: "Peach Yogurt Smoothie",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
  {
    id: "6825762dc0ea8c3e8c95a7aa",
    itemName: "Iced Americano",
    cuisine: [
      {
        _id: "67e6853b4fc3da47168b4845",
        name: "American",
      },
    ],
  },
  {
    id: "6825762ec0ea8c3e8c95a7ab",
    itemName: "Kiwi Mint Cooler",
    cuisine: [
      {
        _id: "67ad9f22af8c34b3272d8cb2",
        name: "Continental",
      },
    ],
  },
];

// Mock data for services
const servicesData = [
  {
    _id: "67c139b6f3153eaf4093baed",
    serviceName: "parking",
    description: "this is parking",
    serviceCategory: "Transportation",
    serviceIcon: "Car",
    archive: false,
    options: [
      {
        name: "private",
        type: "100-200 vehicle",
        _id: "67c139b6f3153eaf4093baee",
      },
      {
        name: "public",
        type: "200-300 vehicle",
        _id: "67c139b6f3153eaf4093baef",
      },
      {
        name: "private 2.0",
        type: "300-400 vehicles with wash",
        _id: "67c139b6f3153eaf4093baf0",
      },
      {
        name: "public 2.0",
        type: "400-600 vehicles",
        _id: "67c139b6f3153eaf4093baf1",
      },
    ],
    createdAt: "2025-02-28T04:21:10.821Z",
    updatedAt: "2025-03-28T09:55:15.134Z",
    __v: 0,
    Variant: "public",
    VariantType: "100-200 vehicle",
    validPrices: [2000, 4000, 6000, 10000],
  },
  {
    _id: "67c051d61ff8ac4765128bfb",
    serviceName: "cake",
    description: "this is cake",
    serviceCategory: "Food & Catering",
    serviceIcon: "Cake",
    archive: false,
    options: [
      {
        name: "Wedding cake",
        type: "2kg",
        _id: "67c051d61ff8ac4765128bfc",
      },
      {
        name: "Birthday cake",
        type: "5kg",
        _id: "67c051d61ff8ac4765128bfd",
      },
      {
        name: "Corporate cake",
        type: "10kg",
        _id: "67c05eb81ff8ac4765128d2d",
      },
      {
        name: "Cake",
        type: "6kg",
        _id: "67e679284fc3da47168b178c",
      },
    ],
    createdAt: "2025-02-27T11:51:50.625Z",
    updatedAt: "2025-03-28T10:25:44.095Z",
    __v: 0,
    Variant: "Cake",
    VariantType: "5kg",
    validPrices: [400, 500, 800, 1000, 2000],
  },
  {
    _id: "67e3d5830e833c733bd98a5b",
    serviceName: "premium DJ",
    description: "premium dj with extra lightening and better sound quality",
    serviceCategory: "Entertainment",
    serviceIcon: "Music",
    archive: false,
    options: [
      {
        name: "Birthday",
        type: "10 floor",
        _id: "67e3d5830e833c733bd98a5c",
      },
      {
        name: "wedding",
        type: "10 floor",
        _id: "67e3d5830e833c733bd98a5d",
      },
      {
        name: "corporate",
        type: "10 floor",
        _id: "67e3d5830e833c733bd98a5e",
      },
    ],
    createdAt: "2025-03-26T10:22:59.979Z",
    updatedAt: "2025-03-26T10:22:59.979Z",
    __v: 0,
    Variant: "corporate",
    VariantType: "10 floor",
    validPrices: [4000, 8000, 12000],
  },
];

// Helper function to get a random element from an array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get a random number between min and max (inclusive)
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get a random subset of array elements
const getRandomSubset = (array, size) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};

// Helper function to get menu items ensuring at least one from each cuisine
// const getMenuItems = (menuItemsData, maxCount) => {
//   // Group menu items by cuisine
//   const cuisineGroups = {};

//   menuItemsData.forEach((item) => {
//     // Skip if cuisine is undefined or empty array
//     if (!item.cuisine || item.cuisine.length === 0) return;

//     // Handle all cuisines for each menu item
//     item.cuisine.forEach((cuisineObj) => {
//       const cuisineName = cuisineObj.name;
//       if (!cuisineGroups[cuisineName]) {
//         cuisineGroups[cuisineName] = [];
//       }
//       cuisineGroups[cuisineName].push(item);
//     });
//   });

//   // Get one item from each cuisine first
//   const selectedItems = [];
//   const selectedIds = new Set();

//   // First select one from each cuisine
//   Object.values(cuisineGroups).forEach((cuisineItems) => {
//     if (selectedItems.length < maxCount) {
//       // Assuming getRandomElement is defined elsewhere
//       const randomItem = getRandomElement(cuisineItems);
//       if (!selectedIds.has(randomItem.id)) {
//         selectedItems.push(randomItem);
//         selectedIds.add(randomItem.id);
//       }
//     }
//   });

//   // Then fill remaining slots randomly
//   const remainingItems = menuItemsData.filter(
//     (item) => !selectedIds.has(item.id)
//   );
//   const shuffledRemaining = [...remainingItems].sort(() => 0.5 - Math.random());

//   for (
//     let i = 0;
//     i < shuffledRemaining.length && selectedItems.length < maxCount;
//     i++
//   ) {
//     selectedItems.push(shuffledRemaining[i]);
//     selectedIds.add(shuffledRemaining[i].id);
//   }

//   // Return just the IDs for the menu items array
//   return Array.from(selectedIds);
// };
const getMenuItems = (menuItemsData, maxCount) => {
  const selectedItems = [];
  const selectedIds = new Set();
  menuItemsData = menuItemsData.slice(0, 40);
  // Shuffle the entire list randomly
  const randomness = 0.7; // 0 = no shuffle, 1 = full shuffle
  const shuffledItems = [...menuItemsData].sort(() => {
    return Math.random() - randomness;
  });

  // Pick up to maxCount unique items
  for (
    let i = 0;
    i < shuffledItems.length && selectedItems.length < maxCount;
    i++
  ) {
    const item = shuffledItems[i];
    if (!selectedIds.has(item.id)) {
      selectedItems.push(item);
      selectedIds.add(item.id);
    }
  }

  // Return just the IDs of the selected items
  return Array.from(selectedIds);
};

// Helper function to create service objects
const createServiceObject = (service, isPaid) => {
  // Deep clone the service object
  const serviceObj = JSON.parse(JSON.stringify(service));

  // For paid services, set a random price from valid prices
  if (isPaid) {
    const randomPrice = getRandomElement(service.validPrices);
    serviceObj.Price = randomPrice;
  } else {
    serviceObj.Price = "free";
  }

  // Pick a random option
  const randomOption = getRandomElement(service.options);
  serviceObj.Variant = randomOption.name;
  serviceObj.VariantType = randomOption.type;

  // Remove fields we don't want in the final object
  delete serviceObj.options;
  delete serviceObj.validPrices;
  delete serviceObj.__v;
  delete serviceObj.archive;
  delete serviceObj.createdAt;
  delete serviceObj.updatedAt;

  return serviceObj;
};

// Helper function to create services
const createServices = (
  servicesData,
  randomness = {
    extraFreeChance: 0.2, // Likelihood of additional free services
    paidChance: 0.6, // Likelihood to add paid services
  }
) => {
  const servicesToUse = [...servicesData];
  const freeServices = [];
  const paidServices = [];

  // ✅ Always add one free service
  const freeServiceIndex = Math.floor(Math.random() * servicesToUse.length);
  const freeService = servicesToUse[freeServiceIndex];
  freeServices.push(createServiceObject(freeService, false));
  servicesToUse.splice(freeServiceIndex, 1);

  // ✅ Possibly add more free services (based on randomness.extraFreeChance)
  if (servicesToUse.length > 0 && Math.random() < randomness.extraFreeChance) {
    const additionalFreeCount = Math.floor(
      Math.random() * servicesToUse.length
    );
    if (additionalFreeCount > 0) {
      const additionalFreeServices = getRandomSubset(
        servicesToUse,
        additionalFreeCount
      );
      additionalFreeServices.forEach((service) => {
        freeServices.push(createServiceObject(service, false));
        const index = servicesToUse.findIndex((s) => s._id === service._id);
        if (index !== -1) servicesToUse.splice(index, 1);
      });
    }
  }

  // ✅ Possibly add paid services (based on randomness.paidChance)
  if (servicesToUse.length > 0 && Math.random() < randomness.paidChance) {
    const paidCount = Math.floor(Math.random() * servicesToUse.length) + 1;
    const servicesToPay = getRandomSubset(servicesToUse, paidCount);
    servicesToPay.forEach((service) => {
      paidServices.push(createServiceObject(service, true));
    });
  }

  return { freeServices, paidServices };
};

// Main function to update variants
async function updateVariants() {
  try {
    // Get all variants
    const variants = await Variant.find({});
    console.log(`Found ${variants.length} variants to update`);

    // Update each variant
    for (const variant of variants) {
      console.log(`Updating variant: ${variant.name}`);

      // Clear existing arrays
      variant.menuItems = [];
      variant.freeServices = [];
      variant.paidServices = [];

      // Pick a random price configuration
      const priceConfig = getRandomElement(priceData);

      // Keep the existing cost
      // We'll use the existing cost to determine maxMenuItemsCount
      // No changes to variant.cost here

      // Determine maxMenuItemsCount based on cost range
      let maxMenuItemsCount;
      const cost = variant.cost || 0;

      if (cost >= 0 && cost <= 10000) {
        maxMenuItemsCount = 8;
      } else if (cost > 10000 && cost <= 20000) {
        maxMenuItemsCount = 10;
      } else if (cost > 20000 && cost <= 40000) {
        maxMenuItemsCount = 14;
      } else if (cost > 40000 && cost <= 70000) {
        maxMenuItemsCount = 17;
      } else if (cost > 70000 && cost <= 100000) {
        maxMenuItemsCount = 22;
      } else if (cost > 100000 && cost <= 130000) {
        maxMenuItemsCount = 27;
      } else if (cost > 130000 && cost <= 170000) {
        maxMenuItemsCount = 31;
      } else {
        // Default value for any costs above 300000
        maxMenuItemsCount = 33;
      }

      // Add menu items based on the determined maxMenuItemsCount
      const menuItemIds = getMenuItems(menuItemsData, maxMenuItemsCount);
      variant.menuItems = menuItemIds;

      // Add free and paid services
      const { freeServices, paidServices } = createServices(servicesData);
      variant.freeServices = freeServices;
      variant.paidServices = paidServices;

      // Save the updated variant
      await variant.save();
      console.log(
        `Updated variant: ${variant.name} with maxMenuItemsCount: ${maxMenuItemsCount}`
      );
    }

    console.log("All variants updated successfully!");
  } catch (error) {
    console.error("Error updating variants:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the update function
updateVariants();
