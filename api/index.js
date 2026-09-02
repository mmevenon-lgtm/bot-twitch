module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action || "";
  const q = req.query.q || "";

  if (action === "ia") {
    if (!q || !q.trim()) {
      return res.send("🤖 Hazme una pregunta. Ejemplo: !ia hola");
    }

    // Promesa con tiempo límite estricto de 1.8 segundos para evitar timeouts de Vercel/Nightbot
    const fetchWithTimeout = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);

      try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?system=Responde+en+espanol+en+una+frase+corta`, {
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) return "🤖 La IA no está disponible en este momento.";

        let text = await response.text();
        text = text.replace(/[\r\n]+/g, " ").trim();
        return text.length > 140 ? text.substring(0, 137) + "..." : text;
      } catch (err) {
        return "🤖 La IA tardó demasiado en responder. Intenta de nuevo.";
      }
    };

    const result = await fetchWithTimeout();
    return res.send(`🤖 ${result.replace(/^🤖\s*/, "")}`);
  }

  return res.send("OK");
};
