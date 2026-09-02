module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action || "";
  const q = req.query.q || "";

  // 1. COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q.trim()) return res.send("🤖 Escribe una pregunta. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?system=Responde+en+espanol+muy+corto`);
      if (!response.ok) return res.send("🤖 La IA no está disponible.");

      let text = await response.text();
      text = text.replace(/[\r\n]+/g, " ").trim();
      if (text.length > 150) text = text.substring(0, 147) + "...";

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("🤖 La IA tardó demasiado en responder.");
    }
  }

  // 2. COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q.trim()) return res.send("🎮 Uso correcto: !rank TuNombre#TuTag");

    let name = "";
    let tag = "";

    if (q.includes("#")) {
      const parts = q.split("#");
      name = parts[0].trim();
      tag = parts[1].trim();
    } else {
      const parts = q.trim().split(" ");
      name = parts[0] || "";
      tag = parts[1] || "";
    }

    if (!name || !tag) return res.send("🎮 Usa el formato: !rank Nombre#TAG");

    try {
      const targetUrl = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      const response = await fetch(targetUrl);
      if (!response.ok) return res.send(`🎮 No hay datos para ${name}#${tag}.`);

      let result = await response.text();
      result = result.trim();
      if (result.length > 150) result = result.substring(0, 147) + "...";

      return res.send(`🎮 ${name}#${tag} | ${result}`);
    } catch {
      return res.send(`🎮 No se encontraron datos para ${name}#${tag}.`);
    }
  }

  return res.send("OK");
};
