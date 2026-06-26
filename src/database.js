const sqlite3 = require("sqlite3").verbose();
const { error } = require("console");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.sqlite");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Erro ao conectar o sqlite: ", error.message);
    return;
  }

  console.log("Conectado ao banco de dados");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      product TEXT NOT NULL CHECK (
        product IN ('conga', 'aria', 'ambos', 'personalizado')
      ),
      status TEXT NOT NULL DEFAULT 'novo' CHECK (
        status IN ('novo', 'em_contato', 'interessado', 'proposta', 'convertido', 'perdido')
      ),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
module.exports = db;
