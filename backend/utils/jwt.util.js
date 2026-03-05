const jwt = require("jsonwebtoken");

const generateToken = (payload,validity) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: validity,
  });
};


module.exports = generateToken;


