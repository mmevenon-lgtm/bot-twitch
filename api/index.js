const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action;
  const q = req.query.q;

  // 1. COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q || !q.trim()) {
      return res.send("🤖 Hazme una pregunta. Ejemplo: !ia ¿Qué es Valorant?");
    }

    try {
      const response = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(q)}`, {
        params: { system: "Responde en español en menos de 10 palabras." },
        timeout: 2500
      });

      let text = String(response.data).replace(/[\r\n]+/g, " ").trim();
      if (text.length > 120) {
        text = text.substring(0, 117) + "...";
      }

      return res.send(`🤖 ${text}`);
    } catch (err) {
      return res.send("🤖 La IA tardó demasiado en responder.");
    }
  }

  // 2. COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q || !q.trim()) {
      return res.send("🎮 Uso correcto: !rank TuNombre#TuTag");
    }

    let name = "";
    let tag = "";

    if (q.includes("#")) {
      const parts = q.split("#");
      name = parts[0].trim();
      tag = parts[1].trim();
    } else {
      const parts = q.trim().split(" ");
      name = parts[0];
      tag = parts[1];
    }

    if (!name || !tag) {
      return res.send("🎮 Formato correcto: !rank Nombre#TAG");
    }

    try {
      const targetUrl = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      const response = await axios.get(targetUrl, { timeout: 2500 });

      let result = String(response.data).trim();
      if (result.length > 150) {
        result = result.substring(0, 147) + "...";
      }

      return res.send(`🎮 ${name}#${tag} | ${result}`);
    } catch (err) {
      return res.send(`🎮 La API de Valorant no respondió a tiempo.`);
    }
  }

  return res.send("OK");
};
