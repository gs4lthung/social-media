const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const getLogger = require("./utils/logger");
const swaggerDoc = require("./utils/swagger");
const cors = require("cors");
const categoryRoutes = require("./routes/CategoryRoute");
const myPlaylistRoutes = require("./routes/MyPlaylistRoute");
const authRoutes = require("./routes/AuthRoute");
const messageRoutes = require("./routes/MessageRoute");
const videoRoutes = require("./routes/VideoRoute");
const userRoute = require("./routes/UserRoute");
const roomRoutes = require("./routes/RoomRoute");
const commentRoutes = require("./routes/CommentRoute");
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Vimeo = require("vimeo").Vimeo;

const vimeoClient = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL:
        "https://social-media-ofm3.onrender.com/api/auth/apple/callback",
      keyID: process.env.APPLE_KEY_ID,
      // privateKeyLocation: `./config/AuthKey_${process.env.APPLE_KEY_ID}.p8`,
      privateKeyString: process.env.APPLE_PRIVATE_KEY,
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, idToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
app.get("/", (req, res) => {
  res.send(
    "<a href='/api/auth/google'>Login with Google</a><br>" +
      "<a href='/api/auth/apple'>Login with Apple</a>"
  );
});

// Log API requests
app.use((req, res, next) => {
  const logger = getLogger("API");
  logger.info(req.path, req.method);
  next();
});

// routers
app.use("/api/auth", authRoutes);
app.use("/api/my-playlists", myPlaylistRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/comments", commentRoutes);
// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;

app.listen(port, (err) => {
  const logger = getLogger("APP");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at: http://localhost:${port}`);
    swaggerDoc(app, port);
  }
});
