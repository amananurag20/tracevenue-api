const User = require("../models/User");

async function generateGuestNo() {
  let count = await User.countDocuments({
    userName: { $regex: /^Guest User \d{4}$/ },
  });
  const guestNumber = String(count + 1).padStart(4, "0");
  return `Guest User ${guestNumber}`;
}

module.exports = { generateGuestNo };
