module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const q = req.query.q || "";

  if (!q.trim()) {
    return res.send("🤖 Escribe algo.");
  }

  try {
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?model=mistral`);
    
    if (!response.ok) {
      return res.send("🤖 Hola, ¿qué tal?");
    }

    let text = await response.text();
    text = text.replace(/[\r\n]+/g, " ").trim();
    
    // Forzar un límite estricto de 120 caracteres para que Twitch nunca lo bloquee
    if (text.length > 120) {
      text = text.substring(0, 117) + "...";
    }

    return res.send(`🤖 ${text}`);
  } catch {
    return res.send("🤖 Todo bien por aquí.");
  }
};
