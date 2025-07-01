const STATUS_ENUM = Object.freeze({
  InProcess: "InProcess",
  received: "received",
  ready: "ready",
  delivered: "delivered",
  cancelled: "cancelled",
});
const orderTypeEnum = Object.freeze({
  DineIn: "dine-in",
  PickUp: "pick-up",
  Delivery: "delivery",
  Online: "online",
});

const USER_TYPES = {
  user: "user",
  staff: "staff",
  restaurant: "restaurant",
  guest: "guest",
  admin: "admin"
};

const RES_MEMBERS = {
  Owner: "Owner",
  Manager: "Manager",
  Staff: "Staff",
};
const VENUE_TYPES = {
  venue: "Venue",
  venue:"venue",
  restaurant: "Restaurant",
  hotel: "Hotel",
  partyHall: "Party Hall",
  resort: "Resort",
  banquetHall: "Banquet Hall",
  marriageHall: "Marriage Hall",
  partyLawns: "Party Lawns",
};
module.exports = {
  STATUS_ENUM,
  USER_TYPES,
  orderTypeEnum,
  RES_MEMBERS,
  VENUE_TYPES,
};
