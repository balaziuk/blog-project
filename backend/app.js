const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  db.createTable();
});