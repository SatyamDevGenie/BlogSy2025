import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { authAPI } from "../utils/api";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        toast.success("Email verified! You can now log in.");
      })
      .catch(() => {
        setStatus("error");
        toast.error("Invalid or expired verification link.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your email has been verified. You can now sign in.</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The link is invalid or has expired.</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
