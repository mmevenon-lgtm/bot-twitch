module.exports = async (req, res) => {
  // Encabezados para evitar almacenamiento en caché y forzar texto plano
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  const action = req.query.action || "";
  const q = req.query.q || "";

  // 1. COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q || !q.trim()) return res.send("🤖 Escribe una pregunta. Ejemplo: !ia hola");

    try {
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?system=Responde+en+espanol+en+menos+de+10+palabras`);
      if (!response.ok) return res.send("🤖 La IA no está disponible.");

      let text = await response.text();
      text = text.replace(/[\r\n]+/g, " ").trim();
      if (text.length > 100) text = text.substring(0, 97) + "...";

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("🤖 La IA no pudo responder ahora.");
    }
  }

  // 2. COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q || !q.trim()) return res.send("🎮 Uso correcto: !rank TuNombre#TuTag");

    let name = "";
    let tag = "";

    if (q.includes("#")) {
      const parts = q.split("#");
      name = parts[0].trim();
      tag = parts[1].trim();
    } else {
      name = q.trim();
      tag = "";
    }

    if (!name) return res.send("🎮 Usa el formato: !rank Nombre#TAG");

    try {
      const targetUrl = tag 
        ? `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`
        : `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}?show=combo&display=0`;

      const response = await fetch(targetUrl);
      if (!response.ok) return res.send(`🎮 No hay datos para ${q}.`);

      let result = await response.text();
      result = result.trim();
      if (result.length > 120) result = result.substring(0, 117) + "...";

      return res.send(`🎮 ${q} | ${result}`);
    } catch {
      return res.send(`🎮 No se encontraron datos para ${q}.`);
    }
  }

  return res.send("Servidor activo.");
};
