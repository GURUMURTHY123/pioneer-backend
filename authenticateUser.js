const jwt = require("jsonwebtoken");
const secretKey = require("./secretKey");

const authenticateUser = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).send("Invalid JWT Token");
  } else {
    jwtToken = authHeader.split(" ")[1];
    if (jwtToken === undefined) {
      res.status(401).send("Invalid JWT Token");
    } else {
      const isValidJwt = jwt.verify(jwtToken, secretKey, (err, payload) => {
        if (err) {
          res.status(401).send("Invalid jwt token");
        } else {
          req.username = payload.username;
          next();
        }
      });
    }
  }
};

module.exports = authenticateUser;
