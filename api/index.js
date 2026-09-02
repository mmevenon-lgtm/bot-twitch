const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const { action, q } = req.query;

  // COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q) return res.send("🤖 Hazme una pregunta. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      // API ligera y sin timeouts de generación
      const url = `https://api.simsimi.vn/v1/simtalk`;
      const bodyParams = new URLSearchParams();
      bodyParams.append("text", q);
      bodyParams.append("lc", "es");

      const response = await axios.post(url, bodyParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 5000
      });

      let reply = response.data?.message || "Sin respuesta.";
      
      // Limpieza de caracteres y recorte estricto
      reply = reply.replace(/[\r\n]+/g, " ").trim();
      if (reply.length > 150) {
        reply = reply.substring(0, 147) + "...";
      }

      return res.send(`🤖 ${reply}`);
    } catch (err) {
      return res.send("🤖 La IA no pudo responder en este momento.");
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
      const response = await axios.get(url, { timeout: 5000 });

      return res.send(`🎮 ${name}#${tag} | ${String(response.data).trim()}`);
    } catch (err) {
      return res.send(`🎮 No se encontraron datos para ${name}#${tag}.`);
    }
  }

  return res.send("Servidor activo");
};
