const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTable = async () => {
  const postsTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      author VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      likes INT DEFAULT 0
    );
  `;

  const commentsTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, 
      author_ip VARCHAR(45) NOT NULL, // IP-адреса коментатора
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const likesLogTableQuery = `
    CREATE TABLE IF NOT EXISTS likes_log (
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      ip_address VARCHAR(45) NOT NULL,
      liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, ip_address) // Композитний ключ: один IP може лайкнути один пост лише раз
    );
  `;

  try {
    await pool.query(postsTableQuery);
    await pool.query(
      "ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0"
    );

    await pool.query(commentsTableQuery);
    await pool.query(likesLogTableQuery);

    console.log(
      "successfully created tables 'posts', 'comments', and 'likes_log'"
    );
  } catch (err) {
    console.error("err during creating table", err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  createTable,
};
