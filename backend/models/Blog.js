// // 📦 Import mongoose
import mongoose from "mongoose";


const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },

        // Emoji reactions on top-level comment
        emojis: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            emoji: { type: String }, // e.g. "👍", "❤️"
          },
        ],

        // 🧵 Nested replies
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },

            // Emoji reactions on replies too
            emojis: [
              {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                emoji: { type: String },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);


const Blog = mongoose.model("Blog", blogSchema);
export default Blog;





// // 📦 Import mongoose
// import mongoose from "mongoose";

// // 📝 Define Blog schema
// const blogSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true }, // 🏷️ Blog title
//     content: { type: String, required: true }, // ✍️ Blog content
//     image: { type: String, default: "" }, // 🖼️ Blog image URL
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true, // 🧑‍💻 Reference to blog author
//     },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ❤️ Users who liked
//     views: { type: Number, default: 0 }, // 👈 For trending
//     viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 👁️ Add this line
//     comments: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 💬 Commenting user
//         comment: { type: String }, // 💭 Comment text
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true } // ⏰ Created and updated times
// );

// // 📤 Export the model
// const Blog = mongoose.model("Blog", blogSchema);
// export default Blog;
