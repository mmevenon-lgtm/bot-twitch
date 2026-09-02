module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action || "";
  const q = req.query.q || "";

  // COMANDO IA
  if (action === "ia") {
    if (!q.trim()) return res.send("🤖 Escribe una pregunta.");

    try {
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?system=Responde+en+espanol+en+una+frase+corta`);
      if (!response.ok) return res.send("🤖 La IA no está disponible.");

      let text = await response.text();
      text = text.replace(/[\r\n]+/g, " ").trim();
      if (text.length > 150) text = text.substring(0, 147) + "...";

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("🤖 Tiempo de respuesta agotado.");
    }
  }

  // COMANDO RANK
  if (action === "rank") {
    if (!q.trim()) return res.send("🎮 Usa: !rank Nombre#Tag");

    const parts = q.includes("#") ? q.split("#") : q.split(" ");
    const name = (parts[0] || "").trim();
    const tag = (parts[1] || "").trim();

    if (!name || !tag) return res.send("🎮 Formato incorrecto. Ejemplo: !rank Nombre#Tag");

    try {
      const url = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      const response = await fetch(url);
      if (!response.ok) return res.send(`🎮 No hay datos para ${name}#${tag}.`);

      let result = await response.text();
      return res.send(`🎮 ${name}#${tag} | ${result.trim()}`);
    } catch {
      return res.send("🎮 Error al consultar el rango.");
    }
  }

  return res.send("Servidor Activo");
};
