import "dotenv/config";
import express from "express";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auth } from "./middleware/auth.js";
import { logger } from "./middleware/logger.js";
import { posts } from "./posts.js";

const app = express();
const clientDist = resolve(dirname(fileURLToPath(import.meta.url)), "../../client/dist");

app.use(logger);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:slug", auth, (req, res) => {
  const post = posts.find((item) => item.slug === req.params.slug);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  res.json(post);
});

app.use("/posts", (req, res) => {
  res.status(404).json({ error: "Route not found." });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist, { index: false }));

  app.get("*", (req, res, next) => {
    if (extname(req.path)) {
      return next();
    }

    res.sendFile(resolve(clientDist, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

export default app;
