const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const { Role } = require('../models/Role');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      const role = await Role.findOne({ name: 'student' });
      user = await User.create({
        email: profile.emails[0].value,
        fullname: profile.displayName,
        nickname: profile.displayName,
        avatar: profile.photos[0]?.value,
        email_verified: true,
        status: 'active',
        role_id: role?._id,
        password: Math.random().toString(36).slice(-8),
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// (Có thể thêm cấu hình FacebookStrategy ở đây nếu cần)

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 