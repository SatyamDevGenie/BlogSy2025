import colors from "colors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import users from "./data/users.js";
import User from "./models/User.js";
import Blog from "./models/Blog.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Blog.deleteMany(); // remove any previously seeded blogs so only user data is from seeder
    await User.insertMany(users);
    console.log("✅ 👥 Users Imported!".green.inverse);
    process.exit();
  } catch (err) {
    console.error(`❌ 🔴 ${err}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log("🧨 🔴 Users Destroyed!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`❌ 🔴 ${err}`.red.inverse);
    process.exit(1);
  }
};

// 🛠️ Usage
// node seeder.js       → import users only
// node seeder.js -d    → delete all users only
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
