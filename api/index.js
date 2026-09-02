const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const action = req.query.action;
  const q = req.query.q;

  // 1. COMANDO DE IA (!ia)
  if (action === "ia") {
    if (!q || q.trim() === "") {
      return res.send("🤖 Hazme una pregunta. Ejemplo: !ia ¿Qué es Valorant?");
    }

    try {
      const postData = new URLSearchParams({ text: q, lc: "es" }).toString();

      const options = {
        hostname: "api.simsimi.vn",
        path: "/v1/simtalk",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData)
        },
        timeout: 4000
      };

      const request = https.request(options, (response) => {
        let body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          try {
            const data = JSON.parse(body);
            let reply = data.message || "Sin respuesta.";
            reply = reply.replace(/[\r\n]+/g, " ").trim();
            if (reply.length > 150) reply = reply.substring(0, 147) + "...";
            res.send(`🤖 ${reply}`);
          } catch {
            res.send("🤖 La IA dio una respuesta no válida.");
          }
        });
      });

      request.on("error", () => res.send("🤖 La IA no pudo responder ahora."));
      request.on("timeout", () => {
        request.destroy();
        res.send("🤖 Tiempo de espera agotado.");
      });

      request.write(postData);
      request.end();
    } catch {
      return res.send("🤖 Error al procesar la IA.");
    }
    return;
  }

  // 2. COMANDO DE RANK (!rank)
  if (action === "rank") {
    if (!q || q.trim() === "") {
      return res.send("🎮 Uso correcto: !rank TuNombre#TuTag");
    }

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

    if (!name || !tag) return res.send("🎮 Usa el formato: !rank Nombre#TAG");

    const targetUrl = `https://api.kyroskoh.xyz/valorant/v1/mmr/eu/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?show=combo&display=0`;

    https.get(targetUrl, { timeout: 4000 }, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        let result = data.trim();
        if (result.length > 200) result = result.substring(0, 197) + "...";
        res.send(`🎮 ${name}#${tag} | ${result}`);
      });
    }).on("error", () => {
      res.send(`🎮 No se pudieron obtener datos para ${name}#${tag}.`);
    });
    return;
  }

  return res.send("Servidor activo");
};
