// netlify/functions/askAI.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);

    // A kérdés, amit a felhasználó írt
    const userQuestion = body.question || "";

    // 🔑 Az API kulcsot a Netlify környezeti változók közé kell tenni
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Hívjuk meg az OpenAI Chat Completions API-t
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // vagy gpt-3.5-turbo, olcsóbb
        messages: [
          { role: "system", content: "Te egy barátságos magyar nyelvű asszisztens vagy, aki érthetően válaszol idősebb felhasználóknak." },
          { role: "user", content: userQuestion }
        ]
      })
    });

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content || "Sajnálom, nem tudtam választ adni.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    console.error("Hiba:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "Hiba történt a kiszolgálón." })
    };
  }
}
