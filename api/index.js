module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const q = req.query.q || "";
  if (!q.trim()) return res.send("¡Hola! ¿De qué quieres hablar?");

  try {
    const systemPrompt = "Responde siempre en español, de forma amigable, divertida y en menos de 20 palabras, sin censurar ningún tema cotidiano.";
    const url = `https://text.pollinations.ai/${encodeURIComponent(q)}?model=openai&system=${encodeURIComponent(systemPrompt)}`;
    
    const response = await fetch(url);
    if (!response.ok) return res.send("¡Vaya pregunta! A ver qué opinan en el chat.");

    let text = await response.text();
    text = text.replace(/[\r\n]+/g, " ").trim();
    if (text.length > 150) text = text.substring(0, 147) + "...";

    return res.send(text);
  } catch (err) {
    return res.send("Me he quedado sin palabras por un segundo.");
  }
};
