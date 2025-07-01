const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ message: "Please fill the required fields." });

  const user = await User.findOne({ email });

  if (!user.isVerified) return res.json({ message: "User is not verified." });
  if (!user || !user?.password)
    return res.json({ message: "Invalid Credentials", user });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.json({ message: "Invalid Credentials", user });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.KEY,
    {
      expiresIn: "7d",
    }
  );

  let userObject = user.toObject();
  delete userObject.password;

  return res.json({
    message: "login successfully",
    user: userObject,
    token,
  });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Please fill the required fields." });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Password and Confirm Password should match." });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
      isVerified: false,
    });

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.KEY,
      {
        expiresIn: "7d",
      }
    );
    let userObject = user.toObject();
    delete userObject.password;
    return res.json({
      message: "User created successfully",
      user: userObject,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.logOut = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).send({ message: "no token" });
  }
  // Clear the 'token' cookie
  res.clearCookie("token");
  return res.status(201).send({ message: "user logged out" });
};
