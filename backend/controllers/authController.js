// 📦 Import dependencies
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 🔐 Helper: Generate JWT tokens
const generateTokens = (id) => {
  // Use longer expiration in development for easier testing
  const accessTokenExpiry = process.env.NODE_ENV === 'development' ? "24h" : "15m";
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: accessTokenExpiry });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "900d" });
  return { accessToken, refreshToken };
};

// 📧 Email transporter – Gmail SMTP (uses ADMIN_EMAIL + ADMIN_EMAIL_APP_PASSWORD from .env)
const getEmailTransporter = () => {
  const user = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const pass = process.env.ADMIN_EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  if (!user || !pass) {
    console.warn("⚠️ Email not configured: set ADMIN_EMAIL and ADMIN_EMAIL_APP_PASSWORD in .env to send welcome emails.");
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
};

const transporter = getEmailTransporter();

// 📬 Send welcome email to new user (from ADMIN_EMAIL)
const sendWelcomeEmail = async (user) => {
  const fromEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!transporter || !fromEmail) {
    console.warn("⚠️ Welcome email skipped: email not configured.");
    return;
  }
  try {
    await transporter.sendMail({
      from: `"BlogSy" <${fromEmail}>`,
      to: user.email,
      subject: "Welcome to BlogSy – Start writing! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to BlogSy, ${user.username}!</h2>
          <p>Thanks for creating your account. You're all set to write and share your stories.</p>
          <ul style="color: #374151;">
            <li>Create and publish blogs</li>
            <li>Engage with comments and reactions</li>
            <li>Follow other writers and get inspired</li>
          </ul>
          <p>Head over to BlogSy and create your first post when you're ready.</p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">– The BlogSy Team</p>
        </div>
      `,
      text: `Welcome to BlogSy, ${user.username}! Thanks for signing up. Create and share your blogs at BlogSy. – The BlogSy Team`,
    });
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (err) {
    console.error("❌ Welcome email failed:", err.message);
    if (err.response) console.error("   SMTP response:", err.response);
    if (err.code) console.error("   Code:", err.code);
  }
};

// 📝 Register new user with email verification
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email ? "Email already exists" : "Username already taken" 
      });
    }

    // For development, skip email verification
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: true // Set to true for development
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email (from ADMIN_EMAIL); don't block response if it fails
    await sendWelcomeEmail(user);

    res.status(201).json({
      message: "Registration successful!",
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: accessToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// 🔑 Login existing user with enhanced security
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        message: "Account temporarily locked due to too many failed login attempts. Try again later." 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 🚪 Enhanced logout with token cleanup
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Remove refresh token from database
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// ✅ Verify email address
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: "Server error during email verification" });
  }
};

// 🔄 Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ 
      accessToken,
      message: "Token refreshed successfully" 
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// 🔐 Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpires;
    await user.save();

    res.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Server error during password reset request" });
  }
};

// 🔄 Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in with your new password." });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

// 📊 Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .populate('following', 'username email')
      .populate('followers', 'username email')
      .populate('favourites', 'title author createdAt');

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser
};