import colors from "colors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import users from "./data/users.js";
import blogs from "./data/blogs.js";

import User from "./models/User.js";
import Blog from "./models/Blog.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 🔄 Clear existing data
    await User.deleteMany();
    await Blog.deleteMany();

    // 👥 Insert users
    const createdUsers = await User.insertMany(users);

    // ✅ Option: Make first user admin
    const adminUserId = createdUsers[0]._id;

    // 📝 Attach different authors for each blog
    const sampleBlogs = blogs.map((blog, index) => ({
      ...blog,
      author: createdUsers[index % createdUsers.length]._id, // Assign users in order
      // OR use random user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id
    }));

    // ➕ Insert blogs
    await Blog.insertMany(sampleBlogs);

    console.log("✅ 👥 Users & 📝 Blogs Imported!".green.inverse);
    process.exit();
  } catch (err) {
    console.error(`❌ 🔴 ${err}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Blog.deleteMany();

    console.log("🧨 🔴 Users & Blogs Destroyed!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`❌ 🔴 ${err}`.red.inverse);
    process.exit(1);
  }
};

// 🛠️ Usage
// node seeder.js       → import users + blogs
// node seeder.js -d    → delete all users + blogs
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
