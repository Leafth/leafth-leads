const express = require("express");
const db = require("./database");

const app = express();
const port = 3000;

const VALID_PRODUCTS = ["conga", "aria", "ambos", "personalizado"];

const VALID_STATUSES = [
  "novo",
  "em_contato",
  "interessado",
  "convertido",
  "perdido",
];

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Aplicação rodando na porta ${port}`);
});
