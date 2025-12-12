const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes
const userRouter = require("./routes/userRouters");
const streamRouter = require("./routes/streamRoutes");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/stream", streamRouter);

// Catch unknown routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;