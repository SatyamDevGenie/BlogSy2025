import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLatestBlogs, resetBlog } from "../features/blog/blogSlice";
import Navbar from "../components/Navbar";
import BlogCard from "../components/BlogCard";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";

const LatestBlogPage = () => {
  const dispatch = useDispatch();

  const { latestBlogs, isLoading, isError, message } = useSelector(
    (state) => state.blog
  );

  const darkMode = useSelector((state) => state.theme.darkMode); // ✅ access theme

  useEffect(() => {
    dispatch(fetchLatestBlogs());

    return () => {
      dispatch(resetBlog());
    };
  }, [dispatch]);

  return (
    <div className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <Navbar />
            <AnimatedBackground/>


      {/* Header */}
      <section className="text-center py-12 px-4 sm:py-16 sm:px-6 lg:px-8 mt-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight animate-fade-in mt-6">
          🆕 Latest Blogs
        </h1>
        <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in delay-150">
          Discover the newest blogs published by our amazing community.
        </p>
      </section>

      {/* Blog Grid */}
      <div className="container-tight py-10 sm:py-12 min-h-[60vh]">
        {isLoading ? (
          <p className="text-center animate-pulse text-gray-400">
            Loading latest blogs...
          </p>
        ) : isError ? (
          <p className="text-center text-red-500">Error: {message}</p>
        ) : latestBlogs.length === 0 ? (
          <p className="text-center text-gray-400">No latest blogs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {latestBlogs.map((blog, index) => (
              <div
                key={blog._id}
                className="transition duration-300 transform hover:scale-105"
                style={{
                  animation: `fadeInUp 0.5s ease ${index * 100}ms both`,
                }}
              >
                <div className="scale-95 sm:scale-100">
                  <BlogCard blog={blog} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LatestBlogPage;






