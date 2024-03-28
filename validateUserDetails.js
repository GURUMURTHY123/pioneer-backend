const validateUserDetails = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: "All fields are required" });
  }

  const userRegExpr = /^[a-zA-Z\s]+$/;
  const emailRegExpr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!userRegExpr.test(username)) {
    res
      .status(400)
      .json({ error: "username must be string without any special character" });
  }

  if (!emailRegExpr.test(email)) {
    res.status(400).json({ error: "Invalid Email Address" });
  }

  next();
};

module.exports = validateUserDetails;
