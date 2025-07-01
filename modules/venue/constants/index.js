const VENUE_TYPE = {
  HALL: "Hall",
  RESTAURANT: "Restaurant",
  OPEN_GARDEN: "Open Garden",
  BANQUET_HALL: "Banquet Hall",
  LUXURY_HALL: "Luxury Hall",
  OPEN_LAWN: "Open Lawn",
  BARN: "Barn",
  URBAN_HALL: "Urban Hall",
  COMMUNITY_HALL: "Community Hall",
  OUTDOOR_GARDEN: "Outdoor Garden",
  ROOFTOP: "Rooftop",
  BEACH_RESORT: "Beach Resort",
  LAKE_SIDE: "Lakeside",
  CASTLE: "Castle",
  YACHT: "Yacht",
  FOREST_LODGE: "Forest Lodge",
};

const VENUE_FIELDS = [
  "name",
  "contact",
  "address",
  "venueType",
  "features",
  "packageId",
  "updatedAt",
  "createdAt",
];
const EVENT_FIELDS = [
  "eventName",
  "description",
  "keywords",
  "updatedAt",
  "createdAt",
];
const ITEM_CATEGORY_FIELDS = [
  "name",
  "parentId",
  "subcategories",
  "updatedAt",
  "createdAt",
];
const PACKAGE_FIELDS = [
  "name",
  "items",
  "description",
  "cuisine",
  "minPersons",
  "maxPersons",
  "eventType",
  "additionalItems",
  "updatedAt",
  "createdAt",
];
const SERVICE_FIELDS = [
  "serviceName",
  "description",
  "serviceCategory",
  "serviceIcon",
  "archive",
  "options",
  "updatedAt",
  "createdAt",
];
const PACKAGE_ITEMS_FIELDS = ["name", "type", "updatedAt", "createdAt"];

const MENU_TYPE = {
  A_LA_CARTE: "À la carte",
  BUFFET: "Buffet",
  PER_PLATE: "Per Plate",
  BULK_ORDER: "Bulk Order",
};

const FOOD_TYPE = {
  VEG: "Veg",
  NON_VEG: "Non-Veg",
};

const MENU_TYPES = {
  A_LA_CARTE: "À la carte",
  BUFFET: "Buffet",
  PER_PLATE: "Per Plate",
  BULK_ORDER: "Bulk Order",
  NA: "N/A",
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  SNACKS: "SNACKS",
  ALL_DAY: "ALL_DAY",
};

const FOOD_TYPES = {
  VEG: "VEG",
  NON_VEG: "NON_VEG",
  PANEER: "PANEER",
  RICE: "RICE",
  ROTI: "ROTI",
  DESSERT: "DESSERT",
  STARTER: "STARTER",
  SALAD: "SALAD",
  BEVERAGE: "BEVERAGE",
  EGG: "EGG",
};

const DRINK_TYPE = {
  NON_ALCOHOLIC: "Non-Alcoholic",
  ALCOHOLIC: "Alcoholic",
  NA: "N/A",
};

const CUISINES = {
  INDIAN: "Indian",
  ITALIAN: "Italian",
  CHINESE: "Chinese",
  MEXICAN: "Mexican",
  THAI: "Thai",
  JAPANESE: "Japanese",
  MEDITERRANEAN: "Mediterranean",
  CONTINENTAL: "Continental",
  MIDDLE_EASTERN: "Middle Eastern",
  FUSION: "Fusion",
};

const MENU_SECTIONS = {
  SOUP: "Soup",
  STARTERS: "Starters",
  MAIN_COURSE: "Main Course",
  DESSERTS: "Desserts",
  BEVERAGES: "Beverages",
  SALADS: "Salads",
  BREAD: "Bread",
  RICE: "Rice",
};

module.exports = {
  VENUE_TYPE,
  VENUE_FIELDS,
  EVENT_FIELDS,
  PACKAGE_FIELDS,
  PACKAGE_ITEMS_FIELDS,
  ITEM_CATEGORY_FIELDS,
  SERVICE_FIELDS,
  MENU_TYPES,
  FOOD_TYPES,
  DRINK_TYPE,
  CUISINES,
  MENU_SECTIONS,
};
