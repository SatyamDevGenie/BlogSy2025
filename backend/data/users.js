import bcrypt from "bcryptjs";

const users = [
  {
    username: "Satyam",
    email: "satyamsawant54@gmail.com",
    password: bcrypt.hashSync("@Satyam#1234", 10),
    isAdmin: true, // ✅ Admin user
    isEmailVerified: true, // ✅ Email verified for development
  },
  {
    username: "Harshal",
    email: "harshal@gmail.com",
    password: bcrypt.hashSync("Harshal@#123", 10),
    isEmailVerified: true, // ✅ Email verified for development
  },
  {
    username: "Karan",
    email: "karan@gmail.com",
    password: bcrypt.hashSync("Karan@#123", 10),
    isEmailVerified: true, // ✅ Email verified for development
  },
  {
    username: "Vivek",
    email: "vivek@gmail.com",
    password: bcrypt.hashSync("Vivek@#123", 10),
    isEmailVerified: true, // ✅ Email verified for development
  },
];

export default users;
