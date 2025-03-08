require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username);
  try {
    const existingUser = await prisma.userid_table.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existingEmail = await prisma.userid_table.findUnique({
      where: { email: email },
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.userid_table.create({
      data: {
        username: username,
        email: email,
        password_hash: hashedPassword,
      },
    });
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Error during signup", error });
  }
};

module.exports = { signup };
