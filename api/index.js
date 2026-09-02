import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const { action, q } = req.query;

  // COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q) return res.send("❌ Escribe una pregunta. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      // Petición a API rápida con recorte estricto a 100 caracteres
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?model=openai&cache=false`);
      
      if (!response.ok) return res.send("🤖 La IA no pudo responder.");

      let rawText = await response.text();
      
      // Limpiar saltos de línea y formatear
      let cleanText = rawText.replace(/\s+/g, " ").trim();

      // Recortar con seguridad por debajo del límite de Nightbot (máx. 200 caracteres)
      if (cleanText.length > 200) {
        cleanText = cleanText.substring(0, 197) + "...";
      }

      return res.send(`🤖 ${cleanText}`);
    } catch {
      return res.send("❌ Error al procesar la respuesta.");
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
