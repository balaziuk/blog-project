const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

const getUserIp = (req) => {
  return req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.ip;
};

app.post("/posts", async (req, res) => {
  const { title, description, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  try {
    const queryText =
      "INSERT INTO posts (title, description, author) VALUES ($1, $2, $3) RETURNING *";
    const result = await db.query(queryText, [title, description, author]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error during post creation" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const queryText = "SELECT * FROM posts ORDER BY created_at DESC";
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error while fetching posts" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postQuery = "SELECT * FROM posts WHERE id = $1";
    const postResult = await db.query(postQuery, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const commentsQuery =
      "SELECT id, author_ip, content, created_at FROM comments WHERE post_id = $1 ORDER BY created_at ASC";
    const commentsResult = await db.query(commentsQuery, [id]);

    res.json({
      post: postResult.rows[0],
      comments: commentsResult.rows,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error while fetching post details" });
  }
});

app.post("/posts/:id/comments", async (req, res) => {
  const post_id = req.params.id;
  const { content } = req.body;
  const author_ip = getUserIp(req);

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const queryText =
      "INSERT INTO comments (post_id, author_ip, content) VALUES ($1, $2, $3) RETURNING *";
    const result = await db.query(queryText, [post_id, author_ip, content]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error during comment creation" });
  }
});

app.post("/posts/:id/like", async (req, res) => {
  const post_id = req.params.id;
  const ip_address = getUserIp(req);

  try {
    await db.query("BEGIN");

    const checkQuery =
      "SELECT * FROM likes_log WHERE post_id = $1 AND ip_address = $2";
    const checkResult = await db.query(checkQuery, [post_id, ip_address]);

    if (checkResult.rows.length > 0) {
      await db.query(
        "DELETE FROM likes_log WHERE post_id = $1 AND ip_address = $2",
        [post_id, ip_address]
      );
      await db.query("UPDATE posts SET likes = likes - 1 WHERE id = $1", [
        post_id,
      ]);
      await db.query("COMMIT");
      res.json({ message: "Post unliked", liked: false });
    } else {
      await db.query(
        "INSERT INTO likes_log (post_id, ip_address) VALUES ($1, $2)",
        [post_id, ip_address]
      );
      await db.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [
        post_id,
      ]);
      await db.query("COMMIT");
      res.json({ message: "Post liked", liked: true });
    }
  } catch (err) {
    await db.query("ROLLBACK");
    res
      .status(500)
      .json({ error: "Internal server error during like/unlike operation" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "Server is running", database: "Ready" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  db.createTable();
});
