const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedImages = /jpeg|jpg|png|gif|webp/;
    const allowedVideos = /mp4|webm|mov/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage =
      allowedImages.test(file.mimetype) && allowedImages.test(ext);
    const isVideo =
      allowedVideos.test(file.mimetype) && allowedVideos.test(ext);
    if (isImage || isVideo) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

app.use("/uploads", express.static(uploadDir));

const getUserIp = (req) => {
  return req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.ip;
};

app.post("/posts", upload.single("media"), async (req, res) => {
  const { title, description, author = "Anonymous" } = req.body;
  const author_ip = getUserIp(req);
  if (!title?.trim()) return res.status(400).json({ error: "Title required" });

  const media_url = req.file ? `/uploads/${req.file.filename}` : null;
  const media_type = req.file
    ? req.file.mimetype.startsWith("video/")
      ? "video"
      : "image"
    : null;

  try {
    const q = `
      INSERT INTO posts (title, description, author, author_ip, media_url, media_type)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const result = await db.query(q, [
      title.trim(),
  description?.trim() || null,
  author.trim(),
  author_ip,
  media_url,
  media_type,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
});

app.get("/posts", async (req, res) => {
  const userIp = getUserIp(req);
  try {
    const result = await db.query(
      `
      SELECT p.*, 
        COUNT(DISTINCT c.id) as comments_count,
        EXISTS(SELECT 1 FROM likes_log WHERE post_id = p.id AND ip_address = $1) as has_liked
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
      [userIp]
    );

    const posts = result.rows.map((post) => ({
      ...post,
      comments_count: Number(post.comments_count),
      is_mine: post.author_ip === userIp,
    }));

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const userIp = getUserIp(req);

  try {
    const postRes = await db.query(
      `SELECT p.*, COUNT(c.id) as comments_count
       FROM posts p
       LEFT JOIN comments c ON p.id = c.post_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    if (!postRes.rows[0]) return res.status(404).json({ error: "Not found" });

    const post = postRes.rows[0];
    const commentsRes = await db.query(
      "SELECT id, author_ip, content, created_at FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
      [id]
    );

    const likeCheck = await db.query(
      "SELECT 1 FROM likes_log WHERE post_id = $1 AND ip_address = $2",
      [id, userIp]
    );

    res.json({
      post: {
        ...post,
        comments_count: Number(post.comments_count),
        is_mine: post.author_ip === userIp,
        has_liked: likeCheck.rowCount > 0,
      },
      comments: commentsRes.rows.map((c) => ({
        ...c,
        is_mine: c.author_ip === userIp,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const author_ip = getUserIp(req);
  if (!content?.trim())
    return res.status(400).json({ error: "Content required" });

  try {
    const q = `INSERT INTO comments (post_id, author_ip, content) VALUES ($1, $2, $3) RETURNING *`;
    const result = await db.query(q, [id, author_ip, content.trim()]);
    result.rows[0].is_mine = true;
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment failed" });
  }
});

app.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;
  const userIp = getUserIp(req);

  try {
    const totalRes = await db.query(
      "SELECT COUNT(*) FROM comments WHERE post_id = $1",
      [id]
    );
    const total = Number(totalRes.rows[0].count);

    const commentsRes = await db.query(
      `SELECT id, author_ip, content, created_at 
       FROM comments 
       WHERE post_id = $1 
       ORDER BY created_at ASC 
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const comments = commentsRes.rows.map((c) => ({
      ...c,
      is_mine: c.author_ip === userIp,
    }));

    res.json({
      comments,
      pagination: { page, limit, total, hasMore: page * limit < total },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

app.post("/posts/:id/like", async (req, res) => {
  const { id } = req.params;
  const ip = getUserIp(req);

  try {
    await db.query("BEGIN");
    const check = await db.query(
      "SELECT 1 FROM likes_log WHERE post_id = $1 AND ip_address = $2",
      [id, ip]
    );

    if (check.rowCount > 0) {
      await db.query(
        "DELETE FROM likes_log WHERE post_id = $1 AND ip_address = $2",
        [id, ip]
      );
      await db.query("UPDATE posts SET likes = likes - 1 WHERE id = $1", [id]);
      await db.query("COMMIT");
      res.json({ liked: false });
    } else {
      await db.query(
        "INSERT INTO likes_log (post_id, ip_address) VALUES ($1, $2)",
        [id, ip]
      );
      await db.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [id]);
      await db.query("COMMIT");
      res.json({ liked: true });
    }
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Like failed" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const ip = getUserIp(req);

  try {
    const check = await db.query(
      "SELECT author_ip, media_url FROM posts WHERE id = $1",
      [id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: "Not found" });
    if (check.rows[0].author_ip !== ip)
      return res.status(403).json({ error: "Forbidden" });

    if (check.rows[0].media_url) {
      const filePath = path.join(__dirname, check.rows[0].media_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.delete("/comments/:id", async (req, res) => {
  const { id } = req.params;
  const ip = getUserIp(req);

  try {
    const check = await db.query(
      "SELECT author_ip FROM comments WHERE id = $1",
      [id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: "Not found" });
    if (check.rows[0].author_ip !== ip)
      return res.status(403).json({ error: "Forbidden" });

    await db.query("DELETE FROM comments WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.put("/posts/:id", upload.single("media"), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const ip = getUserIp(req);
  if (!title?.trim()) return res.status(400).json({ error: "Title required" });

  try {
    const check = await db.query(
      "SELECT author_ip, media_url FROM posts WHERE id = $1",
      [id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: "Not found" });
    if (check.rows[0].author_ip !== ip)
      return res.status(403).json({ error: "Forbidden" });

    if (req.file && check.rows[0].media_url) {
      const oldPath = path.join(__dirname, check.rows[0].media_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const media_url = req.file ? `/uploads/${req.file.filename}` : null;
    const media_type = req.file
      ? req.file.mimetype.startsWith("video/")
        ? "video"
        : "image"
      : null;

    const q = `
      UPDATE posts 
      SET title = $1, description = $2,
          media_url = COALESCE($3, media_url),
          media_type = COALESCE($4, media_type)
      WHERE id = $5 
      RETURNING *
    `;
    const result = await db.query(q, [
      title.trim(),
      description?.trim() || null,
      media_url,
      media_type,
      id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.put("/comments/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const ip = getUserIp(req);
  if (!content?.trim())
    return res.status(400).json({ error: "Content required" });

  try {
    const check = await db.query(
      "SELECT author_ip FROM comments WHERE id = $1",
      [id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: "Not found" });
    if (check.rows[0].author_ip !== ip)
      return res.status(403).json({ error: "Forbidden" });

    await db.query("UPDATE comments SET content = $1 WHERE id = $2", [
      content.trim(),
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  db.createTable();
});
