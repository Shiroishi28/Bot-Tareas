import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "Token1"; // pon lo que quieras
const PAGE_ACCESS_TOKEN = "EAAT4ta8nMUcBPZBkHtF76DdQloCkvg5ZAVizyxpUxdN9dOJeDbXU9OZASb7vfnZCvSdeLetf11aZAmBE6iRjG1HeOSiG3vAj8qUm8yIPu8qM6zZAaIVNQkPfuyACTUHQbZBc1ksZBBflJXb9WXPzEDmgTZBjZAKIljfIRt4mUpefchCSSZBOMRNocoKSy25MED4JcQsLCnopXOXKutvQxIyAt1u9aoO7p1sYZB5dekby8MisXeoIU3XGviO9NrW2137E70vHWuGHNGP4q2bWmQovyibYPiJOrSc4G39gXdEDrimMWgZDZD"; // cámbialo por tu token real

// Definimos las tareas y sus puntos
const tareas = {
  "lavar platos": 10,
  "barrer": 5,
  "limpiar baño": 15,
  "sacar basura": 8
};

// Aquí guardaremos los puntos de cada persona
let usuarios = {};

app.get("/webhook", (req, res) => {
  const verify_token = VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === verify_token) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (message && message.text) {
    const numero = message.from;
    const texto = message.text.body.toLowerCase();

    let puntos = 0;
    for (const [tarea, valor] of Object.entries(tareas)) {
      if (texto.includes(tarea)) {
        puntos = valor;
        break;
      }
    }

    if (puntos > 0) {
      usuarios[numero] = (usuarios[numero] || 0) + puntos;
      await enviarMensaje(numero, `✅ Has ganado ${puntos} puntos. Tu total: ${usuarios[numero]}.`);
    } else {
      await enviarMensaje(numero, "No reconocí la tarea. Prueba con 'lavar platos', 'barrer', etc.");
    }
  }

  res.sendStatus(200);
});

async function enviarMensaje(to, text) {
  await fetch("https://graph.facebook.com/v17.0/ID_DE_TU_NUMERO_DE_WHATSAPP/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAGE_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    })
  });
}

app.listen(3000, () => console.log("🚀 Bot de tareas activo en puerto 3000"));
