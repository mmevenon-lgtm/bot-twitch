module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action;
  const q = req.query.q;

  // 1. COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q || !q.trim()) return res.send("🤖 Pregúntame algo. Ejemplo: !ia ¿Qué es Valorant?");

    try {
      // Usamos la API pública de Pollinations sin headers complejos (responde en milisegundos)
      const prompt = encodeURIComponent("Responde en español, 1 frase muy corta, sin saltos de línea.");
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(q)}?system=${prompt}`);

      if (!response.ok) return res.send("🤖 La IA no está disponible en este momento.");

      let text = await response.text();
      text = text.replace(/[\r\n]+/g, " ").trim();

      if (text.length > 150) {
        text = text.substring(0, 147) + "...";
      }

      return res.send(`🤖 ${text}`);
    } catch {
      return res.send("🤖 La IA tardó demasiado en responder.");
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
      const parts = q.trim().split(" ");
      name = parts[0];
      tag = parts[1];
    }

    if (!name || !tag) return res.send("🎮 Formato correcto: !rank Nombre#TAG");

    try {
      const targetUrl = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // Cancela si la API tarda más de 3.5s

      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.send(`🎮 No se encontraron datos para ${name}#${tag}.`);
      }

      let result = await response.text();
      result = result.trim();

      if (result.length > 180) {
        result = result.substring(0, 177) + "...";
      }

      return res.send(`🎮 ${name}#${tag} | ${result}`);
    } catch {
      return res.send(`🎮 La API de Valorant no respondió a tiempo para ${name}#${tag}.`);
    }
  }

  return res.send("OK");
};
