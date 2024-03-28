const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dbPath = path.join(__dirname, "userData.db");
const { serve, setup } = require("./swagger");

const validateUserDetails = require("./validateUserDetails");
const authenticateUser = require("./authenticateUser");
const getData = require("./getData");

const secretKey = require("./secretKey");

let db = null;

const app = express();

app.use(bodyParser.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

initializeDbAndServer();

/**
 * Register a new user
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registration
 *       400:
 *         description: Invalid request body
 */

app.post("/register", validateUserDetails, async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const addDataQuery = `Insert into user(username, email, password) values('${username}', '${email}', '${hashedPassword}')`;
  await db.run(addDataQuery);
});

/**
 * Log in a user
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const searchQuery = `select * from user where username='${username}'`;
  const response = await db.get(searchQuery);
  if (!response) {
    res.status(401).send("Invalid Details");
  } else {
    const isValidPassword = bcrypt.compare(password, response.password);
    if (!isValidPassword) {
      res.status(401).send("Invalid Details");
    } else {
      const payload = {
        username,
      };
      const token = await jwt.sign(payload, secretKey);
      res.send({
        token,
      });
    }
  }
});

/**
 * Retrieving data
 * @swagger
 * /data-entries:
 *   get:
 *     summary: Get data by query parameters
 *     description: Retrieve data from the server based on query parameters
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         description: Filter data by category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Limit the number of results
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1427
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           format: JWT
 *     responses:
 *       '200':
 *         description: Successful response
 */

app.get("/data-entries", authenticateUser, async (req, res) => {
  const { category = "", limit = "" } = req.query;
  const data = await getData();
  const { entries } = data;
  const filteredData = entries.filter(
    (eachData) => eachData.Category === category
  );
  const slicedData = filteredData.slice(0, parseInt(limit));
  res.status(200).send({ data: slicedData });
});

app.use("/api-docs", serve, setup);
