// netlify/functions/askAI.js

import fetch from "node-fetch"; 

// Simple in-memory conversation storage (per session)
const conversations = {};

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);

    const userQuestion = body.question || "";
    // You can send a unique sessionId from the frontend
    const sessionId = body.sessionId || "default";

    // Initialize conversation if it doesn't exist
    if (!conversations[sessionId]) {
      conversations[sessionId] = [
        { 
          role: "system", 
          content: "Te egy barátságos magyar nyelvű asszisztens vagy, aki érthetően válaszol idősebb felhasználóknak." 
        }
      ];
    }

    // Add user's message to the conversation
    conversations[sessionId].push({ role: "user", content: userQuestion });

    // Call OpenAI API with full conversation
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: conversations[sessionId]
      })
    });

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content || "Sajnálom, nem tudtam választ adni.";

    // Add AI's response to the conversation
    conversations[sessionId].push({ role: "assistant", content: answer });

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
