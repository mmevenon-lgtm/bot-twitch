JavaScript
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  // Añadimos la hora actual a la respuesta para forzar que Vercel no use caché
  console.log("Nueva petición recibida a las: " + new Date().toISOString());

  const { action, q } = req.query;

  // ==============================
  // 1. COMANDO DE IA (!ia)
  // ==============================
  if (action === "ia") {
    if (!q) return res.send("❌ Hazme una pregunta. Ejemplo: !ia ¿Cuál es el mejor mapa?");

    try {
      // Usamos el modelo 'openai' que suele ser más rápido y preciso para respuestas cortas
      // Y añadimos un prompt interno más agresivo para pedir brevedad
      const systemPrompt = encodeURIComponent("Responde en español, muy corto, máximo 1 frase, menos de 80 caracteres. No te enrolles.");
      const userPrompt = encodeURIComponent(q);
      const url = `https://text.pollinations.ai/${userPrompt}?system=${systemPrompt}&model=openai`;

      const response = await fetch(url);
      
      if (!response.ok) return res.send("🤖 La IA está saturada, prueba luego.");

      let text = await response.text();
      
      // Limpieza profunda de texto (quitar saltos de línea, asteriscos, etc.)
      text = text.replace(/[\r\n\*]+/g, " ").trim();

      // <--- CAMBIO AQUÍ: RECORTE EXTREMO --->
      // Recortamos a 140 caracteres. ¡Twitch permite 400, así que esto es súper seguro!
      // Si cortamos el texto, añadimos "..." al final.
      if (text.length > 140) {
        text = text.substring(0, 137) + "...";
      }

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("❌ Error al conectar con la IA.");
    }
  }

  // ==============================
  // 2. COMANDO DE RANK (!rank)
  // ==============================
  if (action === "rank") {
    // (El código de rank se mantiene igual, ya que este no suele dar problemas de longitud)
    if (!q) return res.send("❌ Uso correcto: !rank TuNombre#TuTag (Ejemplo: !rank Mixwell#EUW)");

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

    if (!name || !tag) {
      return res.send("❌ Usa el formato: !rank Nombre#TAG (Ejemplo: !rank Mixwell#EUW)");
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

  return res.send("🤖 Servidor activo v2.1."); // <--- CAMBIO AQUÍ: Versión para confirmar redespliegue
}
