const z = require("zod");
const { default: errorMap } = require("zod/locales/en.js");
const bcrypt = require("bcrypt");
const { initializeDB, queryDB } = require("./database");
const jwt = require("jsonwebtoken");

let db;

const initializeAPI = async (app) => {
  db = await initializeDB();
  app.post("/api/login", login);
  app.get("/api/posts", getPosts);
};

const inputScheme = z
  .object({
    username: z
      .string()
      .min(1, { message: "Username cannot be empty." })
      .email({ message: "Username needs to be a Email address." }),
    password: z
      .string()
      .min(10, { message: "Password has to be at leas 10 characters." }),
  })
  .strip();

const login = async (req, res) => {
  const input = await inputScheme.safeParse(req.body);
  if (input.success == false) {
    return res.status(400).send(
      input.error.issues.map(({ message }) => {
        return { message };
      })
    );
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `SELECT password FROM users WHERE username = '${username}'`;
  const userPassword = await queryDB(db, query);

  if (userPassword.length === 1) {
    const checkPassword = bcrypt.compareSync(
      password,
      userPassword[0].password
    );
    if (checkPassword === true) {
      const loginToken = jwt.sign(
        {
          username: "123@gmail.com",
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        "Secret"
      );
      res.json(loginToken);
    }
  } else {
    res.json("Your login is incorrect!");
  }
};

const getPosts = (req, res) => {
  const posts = [
    {
      id: 1,
      title: "Introduction to JavaScript",
      content:
        "JavaScript is a dynamic language primarily used for web development...",
    },
    {
      id: 2,
      title: "Functional Programming",
      content:
        "Functional programming is a paradigm where functions take center stage...",
    },
    {
      id: 3,
      title: "Asynchronous Programming in JS",
      content:
        "Asynchronous programming allows operations to run in parallel without blocking the main thread...",
    },
  ];
  res.send(posts);
};

module.exports = { initializeAPI };
