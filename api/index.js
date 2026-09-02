const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const { action, q } = req.query;

  // COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q) return res.send("🤖 Escribe una pregunta. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      const response = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(q)}`, {
        params: { system: "Responde en español en 1 frase muy corta." },
        timeout: 4000
      });

      let text = String(response.data).replace(/[\r\n]+/g, " ").trim();
      if (text.length > 150) text = text.substring(0, 147) + "...";

      return res.send(`🤖 ${text}`);
    } catch (err) {
      return res.send("🤖 La IA tardó en responder. Intenta de nuevo.");
    }
  }

  // COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q) return res.send("🎮 Uso correcto: !rank TuNombre#TuTag");

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

    if (!name || !tag) return res.send("🎮 Usa el formato: !rank Nombre#TAG");

    try {
      const url = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      const response = await axios.get(url, { timeout: 4000 });

      return res.send(`🎮 ${name}#${tag} | ${String(response.data).trim()}`);
    } catch (err) {
      return res.send(`🎮 No se encontraron datos para ${name}#${tag}.`);
    }
  }

  return res.send("Servidor activo");
};
