import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const { action, q } = req.query;

  // COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q) return res.send("❌ Escribe una pregunta. Ejemplo: !ia ¿Qué es Valorant?");
    
    try {
      const prompt = "Responde en una sola frase corta de menos de 100 caracteres en español.";
      const url = `https://text.pollinations.ai/${encodeURIComponent(q)}?system=${encodeURIComponent(prompt)}&model=mistral`;
      
      const response = await fetch(url);
      
      if (!response.ok) return res.send("🤖 La IA no pudo responder.");
      
      let text = await response.text();
      text = text.replace(/[\r\n]+/g, " ").trim();

      // Recorte estricto a 300 caracteres para Nightbot
      if (text.length > 300) {
        text = text.substring(0, 297) + "...";
      }

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("❌ Error al conectar con la IA.");
    }
  }

  // COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q) return res.send("❌ Uso correcto: !rank TuNombre TuTag");

    const parts = q.trim().split(" ");
    const name = parts[0];
    const tag = parts[1];

    if (!name || !tag) {
      return res.send("❌ Formato incorrecto. Ejemplo: !rank Mixwell EUW");
    }

    try {
      const url = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.send(`❌ No se encontraron datos para ${name}#${tag}.`);
      }

      const result = await response.text();
      return res.send(`🎮 ${name}#${tag} | ${result.trim()}`);
    } catch {
      return res.send("⚠️ La API de VALORANT tardó demasiado.");
    }
  }

  return res.send("🤖 Servidor de Twitch activo.");
}
