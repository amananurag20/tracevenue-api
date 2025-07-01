const mongoose = require("mongoose");

// --- Model Imports ---
// Adjust paths if necessary
const MasterMenu = require("../modules/venue/models/masterMenu.model.js");
const ItemType = require("../modules/venue/models/itemType.model.js");
const Category = require("../modules/venue/models/categories.model.js");
const Cuisine = require("../modules/venue/models/cuisine.model.js");

// --- Configuration ---
const uri =
  "mongodb+srv://MenuApp:0307Qj2KPqPo@atlascluster.djsdkxh.mongodb.net/staging"; // change if hosted remotely
const dbName = "staging";

// --- Master Menu Items to Seed ---
// const menuItemsToSeed = [
//   {
//     name: "Paneer Tikka",
//     description: "Cubes of paneer marinated in spices and grilled in a tandoor.",
//     itemTypeNames: ["Vegetarian"], // Refers to ItemType names
//     categoryNames: ["Starters", "Vegetarian Starters"], // Refers to Category names
//     cuisineNames: ["North Indian"], // Refers to Cuisine names
//     isAvailable: true
//   },
//   {
//     name: "Butter Chicken",
//     description: "Grilled chicken cooked in a smooth buttery & creamy tomato based gravy.",
//     itemTypeNames: ["Non-Vegetarian"],
//     categoryNames: ["Main Course", "Non-Vegetarian Main Course"],
//     cuisineNames: ["North Indian", "Mughlai"], // Example multiple cuisines
//     isAvailable: true
//   },
//   {
//     name: "Dal Makhani",
//     description: "Black lentils simmered in a creamy gravy with tomatoes and spices.",
//     itemTypeNames: ["Vegetarian"],
//     categoryNames: ["Main Course", "Vegetarian Main Course"],
//     cuisineNames: ["North Indian"],
//     isAvailable: true
//   },
//   {
//     name: "Tandoori Roti",
//     description: "Whole wheat flatbread cooked in a tandoor (clay oven).",
//     itemTypeNames: ["Vegetarian"],
//     categoryNames: ["Indian Breads", "Tandoori Breads"],
//     cuisineNames: ["North Indian"],
//     isAvailable: true
//   },
//   {
//     name: "Veg Hakka Noodles",
//     description: "Stir-fried noodles with mixed vegetables in a Hakka style.",
//     itemTypeNames: ["Vegetarian"],
//     categoryNames: ["Noodles & Pasta"],
//     cuisineNames: ["Chinese"],
//     isAvailable: true
//   },
//   {
//     name: "Veg Biryani",
//     description: "Aromatic basmati rice cooked with mixed vegetables and spices.",
//     itemTypeNames: ["Vegetarian"],
//     categoryNames: ["Rice & Biryani"],
//     cuisineNames: ["North Indian"],
//     isAvailable: true
//   },
//   {
//     name: "Margherita Pizza",
//     description: "Classic pizza with tomato sauce, mozzarella cheese, and basil.",
//     itemTypeNames: ["Vegetarian"],
//     categoryNames: ["Pizza"],
//     cuisineNames: ["Continental", "Italian"], // Example
//     isAvailable: true
//   },
//   {
//     name: "Gulab Jamun",
//     description: "Soft berry-sized balls made of milk solids, deep-fried and soaked in rose-flavored sugar syrup.",
//     itemTypeNames: ["Vegetarian"], // No hot/cold applicable usually
//     categoryNames: ["Desserts"],
//     cuisineNames: ["North Indian"],
//     isAvailable: true
//   },
//   {
//     name: "Coca-Cola",
//     description: "Standard carbonated soft drink.",
//     itemTypeNames: ["Cold"],
//     categoryNames: ["Beverages", "Cold Beverages"],
//     cuisineNames: ["Beverage"], // Specific cuisine for drinks
//     isAvailable: true
//   },
//   {
//     name: "Masala Chai",
//     description: "Indian spiced tea brewed with milk.",
//     itemTypeNames: ["Hot"],
//     categoryNames: ["Beverages", "Hot Beverages"],
//     cuisineNames: ["Beverage"],
//     isAvailable: true
//   }
// ];

const menuItemsToSeed = [
  {
    name: "Creamy Sandwich Delight",
    description:
      "A creamy dish made with sandwich, perfect for a gourmet experience.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["North Indian / Punjabi", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Spicy Chicken Biryani",
    description:
      "Aromatic basmati rice cooked with tender chicken and traditional spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Mughlai", "Indian"],
    isAvailable: true,
  },
  {
    name: "Tandoori Paneer Tikka",
    description:
      "Grilled paneer cubes marinated in tandoori spices, served hot.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pasta",
    description:
      "Rich and creamy Alfredo pasta topped with juicy chicken slices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Veg Manchurian Gravy",
    description: "Deep-fried vegetable balls in spicy Chinese-style gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Mint Mojito Mocktail",
    description: "A refreshing cold mocktail with mint leaves, lime, and soda.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Butter Naan",
    description:
      "Soft Indian flatbread glazed with butter, perfect with curries.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Tandoori Breads", "Indian Breads"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Tikka Pizza",
    description: "Fusion of Italian pizza with spicy chicken tikka topping.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian", "Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Shake",
    description:
      "Chilled coffee blended with milk and ice cream for a creamy shake.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Hot & Sour Soup",
    description: "Classic Indo-Chinese soup with bold flavors and vegetables.",
    itemTypeNames: ["Hot", "Vegetarian"],
    categoryNames: ["Soups"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },

  {
    name: "Paneer Butter Masala",
    description:
      "Cottage cheese cubes simmered in a rich and creamy tomato-based gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chicken Seekh Kebab",
    description:
      "Minced chicken skewers cooked with aromatic spices over charcoal.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Noodles",
    description:
      "Stir-fried noodles tossed with vegetables and Indo-Chinese sauces.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Margherita Pizza",
    description:
      "Classic Italian pizza with fresh tomatoes, mozzarella, and basil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Chicken Club Sandwich",
    description:
      "Triple-layered sandwich with grilled chicken, lettuce, and mayo.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Fresh Garden Salad",
    description:
      "A refreshing salad with lettuce, cucumber, tomatoes, and a light dressing.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chilli Paneer Dry",
    description:
      "Paneer cubes tossed with bell peppers and spicy sauces in a dry Indo-Chinese style.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Chinese", "Indian"],
    isAvailable: true,
  },
  {
    name: "Masala Chai",
    description: "Aromatic Indian spiced tea brewed with milk and herbs.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie Sundae",
    description:
      "Warm chocolate brownie topped with vanilla ice cream and chocolate sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Lassi with Rose Flavor",
    description:
      "A cool and creamy yogurt-based drink with a hint of rose essence.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Beverages", "Cold Beverages"],
    cuisineNames: ["Maharashtrian / South India", "North Indian / Punjabi"],
    isAvailable: true,
  },
  {
    name: "Hyderabadi Mutton Biryani",
    description:
      "Authentic biryani with layers of mutton and fragrant rice cooked in dum style.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Mughlai", "Indian"],
    isAvailable: true,
  },
  {
    name: "Tomato Basil Soup",
    description: "Smooth and flavorful tomato soup infused with fresh basil.",
    itemTypeNames: ["Hot", "Vegetarian"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental / European"],
    isAvailable: true,
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat flatbread cooked in a traditional clay oven.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Tandoori Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Veg Grilled Sandwich",
    description: "Toasted sandwich with fresh vegetables and cheese filling.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Prawn Tempura",
    description:
      "Lightly battered and deep-fried prawns served with dipping sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Japanese / Fusion"],
    isAvailable: true,
  },
  {
    name: "Chocolate Milkshake",
    description: "Thick and creamy milkshake with rich chocolate flavor.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Stuffed Kulcha",
    description: "Soft, leavened Indian bread stuffed with spiced potatoes.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads"],
    cuisineNames: ["North Indian / Punjabi"],
    isAvailable: true,
  },
  {
    name: "Peri Peri Fries",
    description: "Crispy fries tossed with spicy peri peri seasoning.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Virgin Pina Colada",
    description:
      "A tropical mocktail blend of pineapple juice and coconut milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Fish Curry with Steamed Rice",
    description:
      "Spicy fish curry served with plain steamed rice for a wholesome meal.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Main Course", "Rice & Biryani"],
    cuisineNames: ["Maharashtrian / South India", "Indian"],
    isAvailable: true,
  },
  {
    name: "Mushroom Risotto",
    description:
      "Creamy Italian rice dish cooked with mushrooms and parmesan cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Classic Caesar Salad",
    description:
      "Crisp romaine lettuce with Caesar dressing, croutons, and cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental / European"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description:
      "Tender chicken pieces simmered in a creamy tomato-based gravy.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Sizzling Brownie with Ice Cream",
    description:
      "Hot sizzling brownie served with vanilla ice cream and chocolate sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Thai Green Curry with Jasmine Rice",
    description: "Mildly spiced green curry served with aromatic jasmine rice.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "Rice & Biryani"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Warm and rich cocoa beverage perfect for chilly evenings.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "BBQ Chicken Wings",
    description:
      "Juicy chicken wings coated in smoky BBQ sauce, grilled to perfection.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Aloo Tikki Chaat",
    description:
      "Crispy potato patties topped with chutneys, yogurt, and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Iced Lemon Tea",
    description: "Refreshing cold tea infused with lemon, served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Veg Lasagna",
    description:
      "Layered Italian dish with pasta, veggies, tomato sauce, and cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Veg Spring Rolls",
    description:
      "Crispy rolls filled with seasoned vegetables, served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Masala Dosa",
    description:
      "Crispy rice crepe stuffed with spicy potato filling, served with chutneys and sambar.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course"],
    cuisineNames: ["Maharashtrian / South India", "Indian"],
    isAvailable: true,
  },
  {
    name: "Mutton Rogan Josh",
    description:
      "A rich and aromatic Kashmiri mutton curry cooked with traditional spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Garlic Bread with Cheese",
    description: "Toasted bread with garlic butter and melted cheese topping.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Mint Cucumber Cooler",
    description: "A cool blend of cucumber and mint with a splash of lime.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Kathi Roll",
    description: "Soft paratha rolled with spicy chicken filling and chutney.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Veg Fried Rice",
    description:
      "Basmati rice stir-fried with fresh vegetables and soy-based seasoning.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Chinese"],
    isAvailable: true,
  },
  {
    name: "Espresso Shot",
    description: "A concentrated hot shot of freshly brewed espresso.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Continental / European"],
    isAvailable: true,
  },
  {
    name: "Classic Mojito",
    description:
      "A fizzy mocktail with mint, lime, and soda – served ice cold.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Blueberry Smoothie",
    description: "A chilled and creamy blend of blueberries and yogurt.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Tandoori Paneer Tikka",
    description:
      "Cubes of paneer marinated in spiced yogurt and grilled to perfection.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Cheesy Garlic Pasta",
    description:
      "Creamy garlic pasta tossed with melted cheese and Italian herbs.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Manchurian",
    description:
      "Crispy chicken in a tangy Indo-Chinese sauce served with spring onions.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Baked Nachos with Salsa",
    description: "Crispy nachos baked with cheese and served with tangy salsa.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Butter Naan",
    description:
      "Soft, fluffy Indian bread brushed with butter, perfect with curries.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian / Punjabi"],
    isAvailable: true,
  },
  {
    name: "Peach Iced Tea",
    description:
      "Chilled black tea flavored with sweet peach essence and served with ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Egg Fried Rice",
    description:
      "Fried rice tossed with scrambled eggs and spring onions in soy seasoning.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Chinese"],
    isAvailable: true,
  },
  {
    name: "Caramel Custard",
    description: "Smooth and creamy dessert topped with golden caramel sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "European"],
    isAvailable: true,
  },
  {
    name: "Spicy Corn Chaat",
    description: "Sweet corn tossed with butter, spices, lemon, and herbs.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Virgin Mary",
    description:
      "A tangy mocktail with tomato juice, lemon, and savory seasonings.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka Masala",
    description:
      "Grilled paneer cubes cooked in a rich and spicy tomato gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Fish Tikka",
    description:
      "Marinated fish chunks grilled with spices and served with mint chutney.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Veg Manchurian Gravy",
    description:
      "Vegetable dumplings cooked in a flavorful Indo-Chinese gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pasta",
    description:
      "Creamy white sauce pasta tossed with grilled chicken and parmesan.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee",
    description:
      "Chilled coffee blended with ice cream and topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Aloo Paratha",
    description:
      "Indian flatbread stuffed with spicy mashed potatoes and cooked on a tawa.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads"],
    cuisineNames: ["North Indian / Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chocolate Fondue",
    description:
      "Melted chocolate served with fresh fruits and marshmallows for dipping.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Crispy Chicken Burger",
    description:
      "Breaded chicken patty with lettuce, tomato, and mayo in a toasted bun.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Mint Lemonade",
    description:
      "Refreshing lemonade infused with fresh mint leaves and a hint of sweetness.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Lassi",
    description: "A chilled yogurt-based mango drink, sweet and creamy.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Beverages", "Cold Beverages"],
    cuisineNames: ["North Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Penne Arrabiata",
    description: "Penne pasta tossed in a spicy tomato and garlic sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma Wrap",
    description:
      "Spiced grilled chicken wrapped in flatbread with garlic sauce and veggies.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental", "Middle Eastern"],
    isAvailable: true,
  },
  {
    name: "Masala Chai",
    description:
      "Traditional Indian spiced tea brewed with milk and aromatic spices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes cooked in rich buttery tomato gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Noodles",
    description: "Stir-fried noodles with mixed vegetables in soy-based sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Classic Margarita Pizza",
    description:
      "Thin crust pizza topped with tomato sauce, mozzarella, and fresh basil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Mutton Seekh Kebab",
    description:
      "Minced spiced mutton skewered and grilled in traditional tandoor.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie",
    description: "Rich and fudgy chocolate brownie served warm with ice cream.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Virgin Strawberry Daiquiri",
    description:
      "A refreshing mocktail with fresh strawberries and lime juice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Ginger Tea",
    description:
      "Strong black tea brewed with fresh ginger and aromatic spices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Tandoori Chicken",
    description:
      "Chicken marinated in yogurt and spices, grilled in a traditional tandoor.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Veggie Burger",
    description:
      "A juicy patty made from mixed vegetables and spices, served with fresh lettuce and tomato.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka Salad",
    description:
      "Grilled paneer cubes served on a bed of fresh greens with a tangy dressing.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["North Indian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Cheesecake",
    description:
      "Creamy cheesecake infused with fresh mango puree and topped with mango slices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Cold Brew Coffee",
    description:
      "Smooth cold brewed coffee served over ice with a hint of sweetness.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Masala Papad",
    description:
      "Crispy papad topped with chopped onions, tomatoes, and spicy chutney.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with spiced chicken and herbs.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Milkshake",
    description:
      "Rich and creamy chocolate milkshake topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Spring Veg Soup",
    description: "Light vegetable broth with fresh seasonal vegetables.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Pina Colada",
    description: "A tropical mocktail with pineapple and coconut flavors.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description:
      "Tender chicken pieces cooked in a creamy tomato and butter sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Vegetable Spring Rolls",
    description:
      "Crispy rolls stuffed with mixed vegetables served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters", "Vegetarian Starters"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Italian Herb Breadsticks",
    description:
      "Freshly baked breadsticks flavored with Italian herbs and garlic.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Starters"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Sorbet",
    description: "A refreshing frozen dessert made from ripe mangoes.",
    itemTypeNames: ["Vegetarian", "Cold"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Egg Curry",
    description: "Boiled eggs cooked in a spicy tomato and onion gravy.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Vanilla Milkshake",
    description: "Classic creamy vanilla milkshake topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Tomato Basil Soup",
    description: "Smooth tomato soup garnished with fresh basil leaves.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental", "Italian"],
    isAvailable: true,
  },
  {
    name: "Veggie Pizza",
    description:
      "Pizza topped with assorted fresh vegetables and mozzarella cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Cucumber Mint Cooler",
    description: "A chilled refreshing drink with cucumber and mint flavors.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Grilled chicken served over fresh romaine lettuce with Caesar dressing.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Mushroom Stroganoff",
    description:
      "Sautéed mushrooms in a creamy sauce served over noodles or rice.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Main Course", "Continental"],
    cuisineNames: ["Continental", "European"],
    isAvailable: true,
  },
  {
    name: "Prawn Curry",
    description: "Succulent prawns cooked in a spicy coconut-based curry.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "Indian"],
    isAvailable: true,
  },
  {
    name: "Corn & Cheese Sandwich",
    description: "Grilled sandwich filled with sweet corn and melted cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Rich and creamy hot chocolate topped with whipped cream.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mixed Fruit Salad",
    description:
      "Fresh assortment of seasonal fruits tossed in a light honey dressing.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Lemonade with Basil",
    description: "Refreshing lemonade infused with fresh basil leaves.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Lababdar",
    description:
      "Soft paneer cubes cooked in rich tomato-based gravy with cream and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chicken Tikka Wrap",
    description:
      "Spiced grilled chicken wrapped in flatbread with fresh veggies and chutney.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["North Indian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Ice Cream Sundae",
    description:
      "Vanilla ice cream topped with chocolate sauce, nuts, and cherries.",
    itemTypeNames: ["Vegetarian", "Cold"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Biryani",
    description:
      "Aromatic basmati rice cooked with mixed vegetables and fragrant spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Garlic Naan",
    description:
      "Soft Indian bread topped with garlic and butter, baked in a tandoor.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Lemon Garlic Chicken",
    description: "Grilled chicken marinated in lemon juice, garlic, and herbs.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Fresh Garden Salad",
    description:
      "Mixed greens with cucumbers, tomatoes, and a light vinaigrette.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Strawberry Smoothie",
    description: "Creamy smoothie made with fresh strawberries and yogurt.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chili Paneer",
    description:
      "Spicy Indo-Chinese dish with fried paneer cubes tossed in chili sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese", "Indian"],
    isAvailable: true,
  },
  {
    name: "Egg Fried Rice",
    description:
      "Stir-fried rice with eggs and vegetables seasoned with soy sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Vanilla Latte",
    description: "Espresso mixed with steamed milk and vanilla syrup.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Veg Spring Rolls",
    description:
      "Crispy rolls stuffed with fresh vegetables served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Mango Mojito Mocktail",
    description: "Refreshing mocktail with mango pulp, mint, and lime.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Noodles",
    description: "Stir-fried noodles with chicken and vegetables in soy sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Lasagna",
    description:
      "Layers of pasta, vegetables, cheese, and tomato sauce baked to perfection.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "Italian"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pasta",
    description:
      "Creamy Alfredo sauce tossed with pasta and grilled chicken strips.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Frappe",
    description: "Blended cold coffee with milk, ice, and a touch of sugar.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Aloo Tikki",
    description: "Spiced potato patties shallow fried and served with chutney.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters", "Vegetarian Starters"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Fish Tikka",
    description:
      "Marinated fish cubes grilled to perfection with aromatic spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chocolate Shake",
    description:
      "Classic chocolate milkshake made with rich cocoa and chilled milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat flatbread cooked in a clay oven.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veg Manchurian",
    description:
      "Deep-fried vegetable balls cooked in spicy Indo-Chinese sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese", "Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Lime Soda",
    description: "Refreshing sparkling lime soda with a hint of salt and mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Wrap",
    description:
      "Grilled chicken, lettuce, and Caesar dressing wrapped in a tortilla.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes simmered in rich tomato and butter gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma",
    description:
      "Marinated chicken wrapped in pita bread with garlic sauce and veggies.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Middle Eastern", "Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Masala Chai",
    description: "Spiced Indian tea brewed with milk and aromatic spices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Greek Salad",
    description:
      "Fresh cucumber, tomato, olives, and feta cheese tossed in olive oil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental", "Mediterranean"],
    isAvailable: true,
  },
  {
    name: "Veggie Pasta Primavera",
    description:
      "Pasta tossed with fresh seasonal vegetables and light garlic sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Mojito",
    description: "Refreshing mocktail with lime, mint, and soda water.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Tandoori Pizza",
    description:
      "Pizza topped with tandoori chicken, onions, and bell peppers.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Indian", "Italian"],
    isAvailable: true,
  },
  {
    name: "Mango Lassi",
    description: "Sweet yogurt drink blended with fresh mango pulp.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie",
    description: "Rich and fudgy chocolate brownie served warm.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Fried Rice",
    description: "Stir-fried rice with assorted vegetables and soy sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Korma",
    description:
      "Tender chicken cooked in a creamy, nut-based gravy with aromatic spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka",
    description: "Grilled marinated paneer cubes with spices and bell peppers.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Masala Dosa",
    description:
      "Crispy fermented rice pancake filled with spiced potato mixture.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "South Indian"],
    cuisineNames: ["Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Blueberry Smoothie",
    description: "Healthy smoothie made with fresh blueberries and yogurt.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Wings",
    description: "Spicy grilled chicken wings served with tangy dip.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Ginger Tea",
    description: "Warm tea infused with fresh ginger and spices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Penne Arrabiata",
    description: "Penne pasta tossed in spicy tomato and garlic sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Virgin Pina Colada",
    description:
      "Mocktail with pineapple juice, coconut milk, and crushed ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Mousse",
    description:
      "Light and creamy chocolate dessert topped with whipped cream.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["French", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Hakka Noodles",
    description: "Stir-fried noodles with mixed vegetables and soy sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description:
      "Classic North Indian dish with chicken cooked in creamy tomato gravy.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veggie Burger",
    description:
      "Grilled vegetable patty served in a bun with lettuce and sauces.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Masala Chaas",
    description: "Spiced buttermilk drink with roasted cumin and mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Paneer Pakora",
    description:
      "Deep-fried paneer fritters coated with spiced gram flour batter.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Biryani",
    description:
      "Fragrant basmati rice cooked with marinated chicken and spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee",
    description: "Chilled coffee blended with milk and sugar.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Crispy cookies loaded with chocolate chips.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Mixed Veg Soup",
    description: "Warm and hearty soup made with assorted vegetables.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Manchurian",
    description: "Fried vegetable balls in spicy Manchurian sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese", "Indian"],
    isAvailable: true,
  },
  {
    name: "Mint Lemonade",
    description: "Fresh lemonade with a twist of mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Tandoori Chicken",
    description:
      "Juicy chicken marinated in yogurt and spices, cooked in a tandoor.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Cheese Garlic Bread",
    description: "Toasted bread topped with garlic butter and melted cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Continental", "Italian"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Rich and creamy hot chocolate topped with whipped cream.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Veg Pulao",
    description:
      "Aromatic basmati rice cooked with mixed vegetables and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Romaine lettuce with grilled chicken, croutons, and Caesar dressing.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Blue Lagoon Mocktail",
    description:
      "Vibrant blue mocktail made with blue curacao syrup and lemonade.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Naan",
    description: "Soft naan stuffed with spiced paneer and baked in a tandoor.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veg Spring Rolls",
    description:
      "Crispy rolls stuffed with fresh vegetables served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Mango Margarita Mocktail",
    description: "Fruity mango mocktail with a tangy twist of lime.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Cheeseburger",
    description:
      "Juicy beef patty topped with cheese, lettuce, and tomato in a bun.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Dal Makhani",
    description: "Creamy black lentils cooked with butter and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "North Indian"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chicken 65",
    description: "Spicy deep-fried chicken bites with tangy flavors.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["South Indian", "Indian"],
    isAvailable: true,
  },
  {
    name: "Lemon Iced Tea",
    description: "Chilled tea infused with fresh lemon and mint leaves.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Gulab Jamun",
    description: "Soft deep-fried dough balls soaked in sugar syrup.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Manchow Soup",
    description:
      "Spicy and tangy soup loaded with vegetables and crispy noodles.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Paneer Lababdar",
    description: "Paneer cubes cooked in rich tomato and cashew gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma Wrap",
    description:
      "Grilled chicken wrapped with veggies and garlic sauce in flatbread.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Middle Eastern", "Continental"],
    isAvailable: true,
  },
  {
    name: "Strawberry Milkshake",
    description: "Creamy milkshake blended with fresh strawberries.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Hot Lemon Ginger Tea",
    description: "Soothing hot tea infused with lemon and ginger.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Veg Cheese Pizza",
    description: "Classic pizza topped with cheese and assorted vegetables.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Aloo Tikki",
    description: "Spiced potato patties shallow-fried to golden perfection.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters", "Vegetarian Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Prawn Curry",
    description: "Fresh prawns cooked in a spicy coconut-based curry.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["South Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Mango Smoothie",
    description: "Refreshing smoothie made with ripe mangoes and yogurt.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Tomato Soup",
    description: "Classic creamy tomato soup garnished with fresh basil.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Nuggets",
    description: "Crispy fried chicken bites served with ketchup.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Masala Lemonade",
    description: "Tangy lemonade with a hint of Indian spices.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Biryani",
    description:
      "Fragrant basmati rice cooked with mixed vegetables and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Fudge Cake",
    description: "Rich and moist chocolate cake layered with fudge frosting.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Frappe",
    description: "Iced blended coffee topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Manchurian",
    description: "Fried chicken balls tossed in a spicy Manchurian sauce.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese", "Indian"],
    isAvailable: true,
  },
  {
    name: "Palak Paneer",
    description:
      "Soft paneer cubes cooked in a smooth spinach gravy with mild spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Fish Tikka",
    description:
      "Marinated fish pieces grilled with aromatic spices and herbs.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Vanilla Milkshake",
    description:
      "Classic milkshake made with vanilla ice cream and chilled milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Tom Yum Soup",
    description: "Hot and sour Thai soup with herbs, spices, and shrimp.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Asian / Chinese", "Thai"],
    isAvailable: true,
  },
  {
    name: "Veg Sandwich",
    description:
      "Fresh vegetables layered between slices of bread with sauces.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Mojito Mocktail",
    description: "Refreshing mint and lime mocktail with soda and crushed ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Tandoori Roti",
    description: "Traditional Indian flatbread baked in a tandoor.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Veg Fried Rice",
    description: "Stir-fried rice with assorted vegetables and soy sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Lemon Tea",
    description: "Chilled black tea infused with lemon and served with ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie with a gooey center and crisp edges.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka",
    description: "Marinated paneer cubes grilled to perfection with spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Egg Fried Rice",
    description: "Fried rice tossed with scrambled eggs and vegetables.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Mango Lassi",
    description: "Sweet mango yogurt drink with a hint of cardamom.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Tikka Masala",
    description:
      "Chunks of grilled chicken cooked in a creamy spiced tomato sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veg Spring Roll",
    description:
      "Crispy rolls filled with seasoned vegetables served with dip.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Peach Iced Tea",
    description: "Chilled black tea flavored with fresh peach syrup.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Naan",
    description: "Soft Indian flatbread baked in a tandoor.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Burger",
    description:
      "Grilled chicken patty with lettuce, tomato, and mayo in a bun.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Cold Mojito",
    description: "Classic mojito mocktail with mint, lime, and soda.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Milkshake",
    description: "Creamy milkshake blended with rich chocolate syrup.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken cooked in a creamy tomato and butter sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Noodles",
    description:
      "Stir-fried noodles tossed with fresh vegetables and soy sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Masala Chai",
    description:
      "Traditional Indian spiced tea brewed with milk and aromatic spices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pasta",
    description: "Creamy pasta tossed with grilled chicken and Alfredo sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Cheesecake",
    description: "Smooth and creamy cheesecake topped with fresh mango puree.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee",
    description: "Iced coffee blended with milk and sugar.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma",
    description:
      "Spiced grilled chicken wrapped in flatbread with garlic sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Middle Eastern"],
    isAvailable: true,
  },
  {
    name: "Veg Burger",
    description:
      "Patty made with mixed vegetables served with lettuce and tomato in a bun.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Pineapple Mocktail",
    description:
      "Refreshing pineapple juice mixed with soda and a hint of mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Chip Cookies",
    description:
      "Classic cookies loaded with chocolate chips, crispy on the edges and soft inside.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes cooked in a rich and creamy tomato gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Fish Curry",
    description: "Spicy fish cooked in a tangy and flavorful curry sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["South Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Strawberry Smoothie",
    description:
      "Fresh strawberries blended with yogurt and honey for a refreshing smoothie.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Minestrone Soup",
    description:
      "Hearty Italian vegetable soup with beans, pasta, and fresh herbs.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Wings",
    description: "Spicy and crispy chicken wings served with a tangy dip.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Fresh Lime Soda",
    description: "Refreshing lime soda with a hint of mint and sugar.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Pulao",
    description:
      "Aromatic basmati rice cooked with mixed vegetables and spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Tiramisu",
    description:
      "Classic Italian dessert layered with coffee-soaked ladyfingers and mascarpone cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Iced Mocha",
    description:
      "Cold coffee blended with chocolate syrup and topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Momos",
    description: "Steamed dumplings filled with minced chicken and spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Asian / Chinese", "Tibetan"],
    isAvailable: true,
  },
  {
    name: "Chole Bhature",
    description: "Spicy chickpea curry served with deep-fried fluffy bread.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["North Indian", "Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Lamb Rogan Josh",
    description: "Tender lamb pieces cooked in a rich and aromatic curry.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Banana Milkshake",
    description: "Creamy milkshake made with ripe bananas and chilled milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "French Onion Soup",
    description:
      "Classic French soup topped with melted cheese and toasted bread.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental", "French"],
    isAvailable: true,
  },
  {
    name: "Prawn Cocktail",
    description: "Chilled prawns served with tangy cocktail sauce.",
    itemTypeNames: ["Non-Vegetarian", "Cold"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Pina Colada",
    description:
      "Non-alcoholic pineapple and coconut mocktail with crushed ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Garlic Naan",
    description: "Soft naan bread topped with garlic butter and fresh herbs.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Veg Manchurian",
    description: "Deep-fried vegetable balls tossed in spicy Manchurian sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Watermelon Juice",
    description: "Freshly squeezed watermelon juice served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Rasgulla",
    description: "Soft, spongy cheese balls soaked in sugar syrup.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Aloo Tikki",
    description: "Spiced potato patties shallow fried until crispy and golden.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Butter Naan",
    description: "Soft naan bread brushed with melted butter.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Mutton Biryani",
    description: "Aromatic basmati rice cooked with tender mutton and spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Frappe",
    description: "Blended iced coffee with milk, sugar, and a frothy top.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Vegetable Pasta Alfredo",
    description: "Creamy Alfredo pasta tossed with mixed vegetables.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Fresh romaine lettuce with grilled chicken, croutons, and Caesar dressing.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Mojito",
    description: "Refreshing lime and mint mocktail with soda and crushed ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Ginger Tea",
    description: "Spiced black tea brewed with fresh ginger and milk.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Veggie Pizza",
    description:
      "Classic pizza topped with assorted fresh vegetables and cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Chicken Tandoori",
    description:
      "Spiced chicken marinated and roasted in a traditional tandoor oven.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Mushroom Soup",
    description: "Creamy soup made with fresh mushrooms and herbs.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Pasta Primavera",
    description: "Pasta tossed with fresh seasonal vegetables and light sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Strawberry Daiquiri",
    description: "Non-alcoholic strawberry mocktail with lime and crushed ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Lemon Rice",
    description:
      "Fragrant rice tossed with lemon juice, mustard seeds, and curry leaves.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["South Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Chocolate Shake",
    description: "Rich and creamy milkshake blended with chocolate syrup.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Sandwich",
    description:
      "Grilled chicken with lettuce and mayo served in fresh sandwich bread.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Masala Dosa",
    description: "Crispy rice crepe stuffed with spiced potato filling.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["South Indian", "Main Course"],
    cuisineNames: ["South Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Warm chocolate drink topped with whipped cream.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Margherita Pizza",
    description:
      "Classic pizza topped with tomato sauce, fresh mozzarella, and basil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Prawn Biryani",
    description:
      "Fragrant basmati rice layered with spicy prawns and aromatic spices.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Mughlai", "Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Spring Rolls",
    description:
      "Crispy rolls stuffed with mixed vegetables and served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian", "Cold"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Mint Lemonade",
    description:
      "Refreshing lemonade infused with fresh mint leaves and served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Egg Fried Rice",
    description:
      "Stir-fried rice with scrambled eggs, vegetables, and soy sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Vanilla Milkshake",
    description: "Classic vanilla flavored creamy milkshake.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka",
    description:
      "Chunks of marinated paneer grilled to perfection with spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce tossed with Caesar dressing, croutons, and parmesan cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Masala Tea",
    description:
      "Spiced black tea brewed with milk and traditional Indian masalas.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Veggie Burger",
    description:
      "Grilled vegetable patty served with lettuce and tomato in a soft bun.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie",
    description: "Rich and fudgy chocolate brownie with a gooey center.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma",
    description:
      "Spiced grilled chicken wrapped in flatbread with garlic sauce and veggies.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Burgers & Sandwiches"],
    cuisineNames: ["Middle Eastern", "Continental"],
    isAvailable: true,
  },
  {
    name: "Tomato Basil Soup",
    description: "Creamy tomato soup infused with fresh basil leaves.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Mango Margarita",
    description:
      "Tropical mango mocktail with lime and a hint of chili salt rim.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Jeera Rice",
    description: "Basmati rice cooked with cumin seeds and mild spices.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Rice & Biryani"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Brew Coffee",
    description: "Slow steeped cold coffee served over ice with milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Vegetable Lasagna",
    description:
      "Layers of pasta, cheese, and mixed vegetables baked to perfection.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Tikka Masala",
    description:
      "Grilled chicken pieces simmered in a creamy tomato-based sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Vanilla Ice Cream Sundae",
    description:
      "Classic vanilla ice cream topped with chocolate syrup and nuts.",
    itemTypeNames: ["Vegetarian", "Cold"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Buttered Rum",
    description: "Warm cocktail with butter, rum, spices, and hot water.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Cocktails"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Caprese Salad",
    description:
      "Fresh tomatoes, mozzarella cheese, and basil drizzled with olive oil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Tandoori Paneer Tikka",
    description:
      "Chunks of paneer marinated in spices and grilled in a tandoor.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chicken Noodle Soup",
    description:
      "Comforting soup with chicken, noodles, and vegetables in a flavorful broth.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Virgin Blue Lagoon",
    description:
      "Refreshing blue-colored mocktail with citrus flavors and soda.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Jeera Aloo",
    description: "Spiced potatoes sautéed with cumin seeds and herbs.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "Indian Breads"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Peach Iced Tea",
    description: "Iced tea infused with sweet peach flavor served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Penne Arrabbiata",
    description: "Pasta tossed in a spicy tomato and garlic sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken cooked in a creamy tomato and butter gravy.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chocolate Fudge Cake",
    description: "Moist chocolate cake layered with rich chocolate fudge.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Lemon Ginger Tea",
    description: "Soothing hot tea made with fresh lemon and ginger slices.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Margarita Pizza",
    description: "Thin crust pizza topped with tomato, mozzarella, and basil.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Fish Curry",
    description:
      "Spicy and tangy curry made with fresh fish and traditional Indian spices.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "South Indian"],
    isAvailable: true,
  },
  {
    name: "Hara Bhara Kabab",
    description:
      "Spinach and green pea patties seasoned with herbs and spices, pan-fried to perfection.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Cold Watermelon Juice",
    description: "Freshly blended watermelon juice served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Manchurian",
    description:
      "Crispy fried chicken tossed in a spicy, tangy Indo-Chinese sauce.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Banana Smoothie",
    description:
      "Creamy banana blended with milk and honey for a refreshing drink.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Palak Paneer",
    description:
      "Fresh spinach cooked with cubes of paneer in mildly spiced gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Greek Salad",
    description:
      "A refreshing salad with cucumbers, tomatoes, olives, feta cheese, and herbs.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental", "European"],
    isAvailable: true,
  },
  {
    name: "Hot Chai Latte",
    description: "Steamed milk with black tea and aromatic spices served hot.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Continental", "Indian"],
    isAvailable: true,
  },
  {
    name: "Veggie Wrap",
    description:
      "Fresh vegetables wrapped in a soft flatbread with tangy sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Ras Malai",
    description:
      "Soft cheese dumplings soaked in sweetened milk flavored with cardamom.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Lamb Rogan Josh",
    description:
      "Tender lamb pieces cooked in a rich, aromatic curry with Kashmiri spices.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Corn and Cheese Balls",
    description:
      "Crispy fried balls stuffed with sweet corn and melted cheese.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Starters", "Vegetarian Starters"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Iced Matcha Latte",
    description: "Cold green tea latte made with matcha powder and milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Hot Beverages"],
    cuisineNames: ["Japanese / Fusion", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chole Bhature",
    description: "Spicy chickpea curry served with deep-fried fluffy bread.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Main Course", "Indian Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Strawberry Banana Smoothie",
    description:
      "Blended smoothie of fresh strawberries and bananas with yogurt.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Paneer cubes simmered in a rich buttery tomato gravy.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Cauliflower Manchurian",
    description:
      "Fried cauliflower florets tossed in a spicy Indo-Chinese sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Hot Apple Cider",
    description: "Warm spiced apple cider perfect for cold evenings.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Cheese Garlic Bread",
    description: "Toasted bread topped with garlic butter and melted cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Starters"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Pepperoni Pizza",
    description:
      "Classic pizza topped with pepperoni slices and mozzarella cheese.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian", "American"],
    isAvailable: true,
  },
  {
    name: "Mutton Keema",
    description: "Minced mutton cooked with aromatic spices and herbs.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Manchurian",
    description: "Fried vegetable balls tossed in a spicy Indo-Chinese sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Float",
    description:
      "Chilled coffee topped with vanilla ice cream and chocolate syrup.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Desserts"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Masala Dosa",
    description:
      "Crispy rice crepe stuffed with spicy potato filling served with chutneys.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Main Course"],
    cuisineNames: ["South Indian"],
    isAvailable: true,
  },
  {
    name: "Blueberry Smoothie",
    description:
      "Fresh blueberries blended with yogurt and honey for a healthy drink.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Paneer Pakora",
    description: "Deep-fried paneer cubes dipped in spiced chickpea batter.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["North Indian"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Rich and creamy hot chocolate topped with whipped cream.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages", "Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Garlic Naan",
    description: "Soft Indian bread topped with garlic and butter.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veggie Pizza",
    description: "Pizza topped with assorted vegetables and mozzarella cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Grilled chicken tossed with romaine lettuce, Caesar dressing, and croutons.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in a creamy, buttery tomato sauce.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Prawn Tempura",
    description:
      "Lightly battered and deep-fried prawns served with dipping sauce.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Non-Vegetarian Starters", "Starters"],
    cuisineNames: ["Japanese / Fusion", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Mint Lemonade",
    description:
      "Refreshing lemonade infused with fresh mint leaves and served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Mocktails"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Noodles",
    description: "Stir-fried noodles with mixed vegetables and soy sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Mango Lassi",
    description: "Sweet mango yogurt drink with a hint of cardamom.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Milkshakes & Smoothies"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Egg Fried Rice",
    description:
      "Fried rice tossed with scrambled eggs, vegetables, and soy sauce.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Vegetable Spring Rolls",
    description:
      "Crispy rolls filled with mixed vegetables and served with sweet chili sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Starters"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Hot Ginger Tea",
    description: "Spiced hot tea brewed with fresh ginger and honey.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Mushroom Risotto",
    description:
      "Creamy Italian rice dish cooked with mushrooms and Parmesan cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "Continental"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Milkshake",
    description:
      "Rich and creamy milkshake made with chocolate ice cream and milk.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Butter Naan",
    description: "Soft, fluffy Indian bread brushed with melted butter.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Indian Breads", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma Wrap",
    description:
      "Grilled chicken slices wrapped with fresh veggies and sauces in a flatbread.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Middle Eastern", "Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Brew Coffee",
    description: "Smooth and strong coffee brewed cold over several hours.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Biryani",
    description:
      "Aromatic basmati rice cooked with mixed vegetables and spices.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Mojito Mocktail",
    description: "Refreshing lime and mint drink without alcohol.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Eggplant Parmesan",
    description: "Breaded eggplant slices baked with tomato sauce and cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Main Course", "Italian"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Hot Masala Chai",
    description: "Traditional Indian tea brewed with spices and milk.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Tikka Sandwich",
    description:
      "Spiced grilled chicken pieces served in sandwich bread with salad.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Vanilla Milkshake",
    description: "Classic vanilla-flavored milkshake with creamy texture.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mixed Fruit Salad",
    description: "Fresh seasonal fruits mixed and served chilled.",
    itemTypeNames: ["Vegetarian", "Cold"],
    categoryNames: ["Salads", "Desserts"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Tandoori Chicken",
    description:
      "Chicken marinated in yogurt and spices, grilled in a tandoor oven.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka",
    description: "Grilled chunks of marinated paneer served with mint chutney.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Minestrone Soup",
    description: "Hearty Italian vegetable soup with beans and pasta.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups", "Continental"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Spaghetti Aglio e Olio",
    description:
      "Simple Italian pasta tossed with garlic, olive oil, and chili flakes.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Virgin Pina Colada",
    description:
      "Non-alcoholic tropical drink with pineapple, coconut, and cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails", "Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Veg Spring Roll",
    description:
      "Crispy rolls filled with julienned vegetables and served with sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Starters"],
    cuisineNames: ["Asian / Chinese", "Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Brew Iced Tea",
    description: "Cold brewed black tea served over ice with lemon slices.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description: "Creamy tomato-based chicken curry with aromatic spices.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Classic Caesar Salad",
    description:
      "Romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Korma",
    description:
      "Mixed vegetables cooked in a creamy, spiced yogurt-based sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pasta",
    description:
      "Pasta tossed in creamy Alfredo sauce with grilled chicken pieces.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Margarita Mocktail",
    description: "Refreshing mango-flavored mocktail with a tangy twist.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Tomato Basil Soup",
    description: "Smooth tomato soup flavored with fresh basil leaves.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Choco Banana Shake",
    description: "Creamy milkshake made with ripe bananas and chocolate syrup.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Fish Tandoori",
    description: "Spiced fish marinated and grilled in tandoor oven.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Veggie Burger",
    description:
      "Grilled vegetable patty served in a bun with fresh lettuce and sauces.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Cold Lemon Iced Tea",
    description: "Iced black tea flavored with fresh lemon juice and mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes cooked in a rich buttery tomato gravy.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Cold Strawberry Smoothie",
    description:
      "Fresh strawberries blended with yogurt and honey, served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Chicken Biryani",
    description:
      "Fragrant basmati rice cooked with marinated chicken and spices.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Rice & Biryani", "Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Vegetable Pasta Primavera",
    description: "Pasta tossed with fresh seasonal vegetables and light sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Mango Lassi Smoothie",
    description:
      "Smooth and creamy mango yogurt smoothie with a hint of cardamom.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Hot Chocolate",
    description: "Warm rich chocolate drink topped with whipped cream.",
    itemTypeNames: ["Hot"],
    categoryNames: ["Hot Beverages"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Veg Manchurian",
    description:
      "Deep-fried vegetable balls tossed in a spicy and tangy sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Starters"],
    cuisineNames: ["Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee Frappe",
    description:
      "Iced coffee blended with ice cream and topped with whipped cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Milkshakes & Smoothies"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Chicken Caesar Wrap",
    description:
      "Grilled chicken, romaine lettuce, and Caesar dressing wrapped in a tortilla.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Creamy Tomato Soup",
    description: "Rich tomato soup made with cream and herbs.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental", "Italian"],
    isAvailable: true,
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Classic cookies loaded with chocolate chips.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Virgin Mojito",
    description: "Non-alcoholic mojito with fresh lime, mint, and soda water.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Pav Bhaji",
    description:
      "Spiced mixed vegetable mash served with buttered bread rolls.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Main Course", "Indian"],
    cuisineNames: ["Maharashtrian / South India", "Indian"],
    isAvailable: true,
  },
  {
    name: "Chicken Shawarma Platter",
    description: "Grilled chicken served with pita bread, salad, and sauces.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters"],
    cuisineNames: ["Middle Eastern", "Continental"],
    isAvailable: true,
  },
  {
    name: "Masala Dosa",
    description: "Crispy fermented rice crepe filled with spicy potato masala.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Main Course", "Indian Breads"],
    cuisineNames: ["South Indian", "Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Lychee Mocktail",
    description: "Sweet and refreshing lychee-flavored non-alcoholic drink.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails", "Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chocolate Brownie",
    description: "Rich and fudgy chocolate dessert with a crispy crust.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Desserts"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Paneer Tikka Masala",
    description: "Grilled paneer cubes cooked in a spicy tomato-based gravy.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Cold Coffee with Ice Cream",
    description: "Chilled coffee topped with a scoop of vanilla ice cream.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Milkshakes & Smoothies"],
    cuisineNames: ["American", "Continental"],
    isAvailable: true,
  },
  {
    name: "Chicken Alfredo Pizza",
    description:
      "Pizza topped with creamy Alfredo sauce, grilled chicken, and cheese.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Pizza"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Vegetable Soup",
    description: "Light and healthy soup with fresh mixed vegetables.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Mint Lemonade",
    description: "Refreshing lemonade flavored with fresh mint leaves.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Chole Bhature",
    description: "Spiced chickpea curry served with deep-fried bread.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Indian Breads", "Main Course"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Grilled Veg Sandwich",
    description: "Grilled sandwich loaded with fresh vegetables and cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["Continental", "American"],
    isAvailable: true,
  },
  {
    name: "Mutton Rogan Josh",
    description: "Slow-cooked mutton curry in rich and spicy gravy.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Main Course"],
    cuisineNames: ["Mughlai", "North Indian"],
    isAvailable: true,
  },
  {
    name: "Cold Mango Smoothie",
    description: "Blended fresh mangoes with yogurt and honey, served chilled.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Garlic Bread",
    description: "Toasted bread topped with garlic butter and herbs.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Indian Breads", "Starters"],
    cuisineNames: ["Italian", "Continental"],
    isAvailable: true,
  },
  {
    name: "Pasta Arrabbiata",
    description: "Spicy Italian pasta with tomato and chili sauce.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta", "Main Course"],
    cuisineNames: ["Italian"],
    isAvailable: true,
  },
  {
    name: "Cold Peach Iced Tea",
    description: "Iced black tea infused with fresh peach flavor.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Tandoori Prawns",
    description: "Marinated prawns grilled in tandoor oven.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Greek Salad",
    description:
      "Fresh salad with cucumber, tomatoes, olives, and feta cheese.",
    itemTypeNames: ["Vegetarian"],
    categoryNames: ["Salads"],
    cuisineNames: ["Continental", "Mediterranean"],
    isAvailable: true,
  },
  {
    name: "Virgin Strawberry Mojito",
    description:
      "Refreshing non-alcoholic mojito with fresh strawberries and mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Butter Naan",
    description: "Soft and fluffy Indian flatbread brushed with butter.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Tandoori Breads", "Indian Breads"],
    cuisineNames: ["North Indian", "Mughlai"],
    isAvailable: true,
  },
  {
    name: "Chicken Club Sandwich",
    description:
      "Triple-layered sandwich with grilled chicken, veggies, and sauces.",
    itemTypeNames: ["Non-Vegetarian"],
    categoryNames: ["Burgers & Sandwiches"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Spinach Corn Soup",
    description: "Creamy soup made with spinach, corn, and mild spices.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Soups"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Keema Pav",
    description: "Spicy minced meat served with buttered buns.",
    itemTypeNames: ["Non-Vegetarian", "Hot"],
    categoryNames: ["Non-Vegetarian Starters", "Main Course"],
    cuisineNames: ["Indian", "Maharashtrian / South India"],
    isAvailable: true,
  },
  {
    name: "Peach Yogurt Smoothie",
    description: "A smooth blend of peach and yogurt for a refreshing drink.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Milkshakes & Smoothies"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
  {
    name: "Tandoori Paneer Tikka",
    description: "Cubes of paneer marinated in spices and grilled in tandoor.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Vegetarian Starters", "Tandoori Breads"],
    cuisineNames: ["North Indian", "Punjabi"],
    isAvailable: true,
  },
  {
    name: "Iced Americano",
    description: "Chilled espresso mixed with cold water and ice.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Cold Beverages", "Hot Beverages"],
    cuisineNames: ["American"],
    isAvailable: true,
  },
  {
    name: "Veg Hakka Noodles",
    description: "Stir-fried noodles with vegetables and sauces.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Noodles & Pasta"],
    cuisineNames: ["Chinese", "Asian / Chinese"],
    isAvailable: true,
  },
  {
    name: "Gulab Jamun",
    description: "Soft fried dough balls soaked in sugar syrup.",
    itemTypeNames: ["Vegetarian", "Hot"],
    categoryNames: ["Desserts"],
    cuisineNames: ["Indian"],
    isAvailable: true,
  },
  {
    name: "Kiwi Mint Cooler",
    description: "Cool and tangy kiwi drink with a splash of mint.",
    itemTypeNames: ["Cold"],
    categoryNames: ["Mocktails", "Cold Beverages"],
    cuisineNames: ["Continental"],
    isAvailable: true,
  },
];

// --- Helper Function to Get IDs ---
async function getIdsFromNames(model, names, cacheMap) {
  const ids = [];
  for (const name of names) {
    let id = cacheMap.get(name);
    if (!id) {
      const doc = await model.findOne({ name: name });
      if (doc) {
        id = doc._id;
        cacheMap.set(name, id); // Cache it
      } else {
        console.warn(
          `Warning: Could not find document with name="${name}" in ${model.modelName} collection.`
        );
      }
    }
    if (id) {
      ids.push(id);
    }
  }
  return ids;
}

// --- Main Seeding Function ---
async function seedMasterMenu() {
  const itemTypeIds = new Map();
  const categoryIds = new Map();
  const cuisineIds = new Map();

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: dbName });
    console.log("Connected successfully to MongoDB.");

    // --- Step 1: Ensure Cuisines Exist (Upsert) ---
    console.log("Ensuring base cuisines exist...");
    const baseCuisines = [
      "Indian",
      "Italian",
      "Continental",
      "Chinese",
      "North Indian / Punjabi",
      "Mughlai / North Indian",
      "Maharashtrian / South India",
      "Asian / Chinese",
      "Japanese / Fusion",
      "Continental / European",
      "American",
      "North Indian",
      "Mughlai",
    ]; // Extract from seed data + common
    for (const cuisineName of baseCuisines) {
      const filter = { name: cuisineName };
      const update = { $setOnInsert: { name: cuisineName } }; // Create if not exists
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const result = await Cuisine.findOneAndUpdate(filter, update, options);
      if (result) {
        console.log(`Ensured Cuisine exists: Name='${result.name}'`);
        cuisineIds.set(result.name, result._id); // Cache ID
      } else {
        console.warn(`Could not verify Cuisine upsert: Name='${cuisineName}'`);
      }
    }
    console.log("Base cuisine check complete.");

    // --- Step 2: Pre-fetch all existing ItemTypes and Categories for efficiency ---
    console.log("Fetching existing ItemTypes and Categories...");
    const allItemTypes = await ItemType.find({}, "name _id");
    allItemTypes.forEach((it) => itemTypeIds.set(it.name, it._id));
    console.log(`Fetched ${itemTypeIds.size} ItemTypes.`);

    const allCategories = await Category.find({}, "name _id");
    allCategories.forEach((cat) => categoryIds.set(cat.name, cat._id));
    console.log(`Fetched ${categoryIds.size} Categories.`);
    // Cuisines were already fetched/cached during upsert

    // --- Step 3: Seed Master Menu Items ---
    console.log("Seeding Master Menu Items...");
    let createdCount = 0;
    let updatedCount = 0;

    for (const itemData of menuItemsToSeed) {
      // Resolve ObjectIds using cached/fetched data
      const resolvedItemTypeIds = await getIdsFromNames(
        ItemType,
        itemData.itemTypeNames,
        itemTypeIds
      );
      const resolvedCategoryIds = await getIdsFromNames(
        Category,
        itemData.categoryNames,
        categoryIds
      );
      const resolvedCuisineIds = await getIdsFromNames(
        Cuisine,
        itemData.cuisineNames,
        cuisineIds
      );

      if (itemData.itemTypeNames.length !== resolvedItemTypeIds.length) {
        console.warn(
          `Skipping "${itemData.name}" due to missing ItemType references.`
        );
        continue;
      }
      if (itemData.categoryNames.length !== resolvedCategoryIds.length) {
        console.warn(
          `Skipping "${itemData.name}" due to missing Category references.`
        );
        continue;
      }
      if (itemData.cuisineNames.length !== resolvedCuisineIds.length) {
        console.warn(
          `Skipping "${itemData.name}" due to missing Cuisine references.`
        );
        continue;
      }

      // Upsert the master menu item
      const filter = { name: itemData.name };
      const update = {
        $set: {
          // Update fields if found
          description: itemData.description,
          itemTypes: resolvedItemTypeIds,
          category: resolvedCategoryIds,
          cuisine: resolvedCuisineIds,
          isAvailable: itemData.isAvailable,
        },
        $setOnInsert: {
          // Set name only on insert
          name: itemData.name,
        },
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };

      try {
        const result = await MasterMenu.findOneAndUpdate(
          filter,
          update,
          options
        );

        // Check if it was an insert or update using timestamps (or other logic)
        // For simplicity, just log success here.
        if (result) {
          // A more robust check could compare result.createdAt and result.updatedAt
          console.log(`Upserted Master Menu item: Name='${result.name}'`);
          // Simple check if it might be new (created = updated within a small threshold)
          if (
            Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) <
            1000
          ) {
            createdCount++;
          } else {
            updatedCount++;
          }
        } else {
          console.warn(
            `Could not verify Master Menu upsert: Name='${itemData.name}'`
          );
        }
      } catch (err) {
        if (err.code === 11000) {
          console.warn(
            `Master Menu item "${itemData.name}" likely already exists (duplicate key error). Skipping.`
          );
        } else {
          console.error(
            `Error upserting master menu item "${itemData.name}":`,
            err
          );
        }
      }
    }

    console.log(
      `Finished seeding Master Menu. Created: ${createdCount}, Updated: ${updatedCount}.`
    );
  } catch (err) {
    console.error(
      "An error occurred during the Master Menu seeding process:",
      err
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

// --- Run the script ---
seedMasterMenu();
