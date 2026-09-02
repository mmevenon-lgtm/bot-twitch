module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const q = req.query.q || "";
  if (!q.trim()) return res.send("¡Hola! ¿De qué quieres hablar?");

  try {
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?model=openai`);
    if (!response.ok) return res.send("Interesante... cuéntame más sobre eso.");

    let text = await response.text();
    text = text.replace(/[\r\n]+/g, " ").trim();
    if (text.length > 150) text = text.substring(0, 147) + "...";

    return res.send(text);
  } catch (err) {
    return res.send("¡Vaya! Me he quedado pensando, di otra vez.");
  }
};
