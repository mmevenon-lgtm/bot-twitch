JavaScript
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const { action, q } = req.query;

  // COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q) return res.send("❌ Escribe una pregunta. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      // API optimizada para respuestas cortas sin HTML
      const url = `https://api.simsimi.vn/v1/simtalk`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: q, lc: "es" })
      });

      if (!response.ok) {
        return res.send("🤖 La IA está descansando un momento.");
      }

      const data = await response.json();
      let reply = data.message || "🤖 Sin respuesta.";

      // Corte estricto a 150 caracteres
      if (reply.length > 150) {
        reply = reply.substring(0, 147) + "...";
      }

      return res.send(`🤖 ${reply}`);
    } catch {
      return res.send("🤖 La IA no pudo responder ahora.");
    }
  }

  // COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q) return res.send("❌ Uso correcto: !rank TuNombre#TuTag");

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
      return res.send("❌ Formato: !rank Nombre#TAG (Ejemplo: !rank Mixwell#EUW)");
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

  return res.send("🤖 Servidor listo.");
}
