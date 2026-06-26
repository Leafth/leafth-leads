const express = require("express");
const db = require("./database");

const app = express();
const port = 3000;

const VALID_PRODUCTS = ["conga", "aria", "ambos", "personalizado"];

const VALID_STATUSES = [
  "novo",
  "em_contato",
  "interessado",
  "proposta",
  "convertido",
  "perdido",
];

app.use(express.json());

app.get("/api/leads", (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      email,
      phone,
      product,
      status,
      created_at
    FROM leads
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Erro ao listar leads.",
      });
    }

    return res.json(rows);
  });
});

app.get("/api/leads/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id,
      name,
      email,
      phone,
      product,
      status,
      created_at
    FROM leads
    WHERE id = ?
  `;

  db.get(sql, [id], (error, row) => {
    if (error) {
      return res.status(500).json({
        message: "Erro ao buscar lead.",
      });
    }

    if (!row) {
      return res.status(404).json({
        message: "Lead não encontrado.",
      });
    }

    return res.json(row);
  });
});

app.post("/api/leads", (req, res) => {
  const { name, email, phone, product } = req.body;

  if (!name || !email || !phone || !product) {
    return res.status(400).json({
      message: "Nome, email, telefone e produto são obrigatórios.",
    });
  }

  if (!VALID_PRODUCTS.includes(product)) {
    return res.status(400).json({
      message: "Produto inválido.",
    });
  }

  const sql = `
    INSERT INTO leads (name, email, phone, product)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, email, phone, product], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Erro ao criar lead.",
      });
    }

    return res.status(201).json({
      id: this.lastID,
      name,
      email,
      phone,
      product,
      status: "novo",
    });
  });
});

app.patch("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status é obrigatório.",
    });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: "Status inválido.",
    });
  }

  const sql = `
    UPDATE leads
    SET status = ?
    WHERE id = ?
  `;

  db.run(sql, [status, id], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Erro ao atualizar lead.",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Lead não encontrado.",
      });
    }

    return res.json({
      id,
      status: status,
    });
  });
});

app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM leads
    WHERE id = ?
  `;

  db.run(sql, [id], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Erro ao deletar lead.",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Lead não encontrado.",
      });
    }

    return res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Aplicação rodando na porta ${port}`);
});
