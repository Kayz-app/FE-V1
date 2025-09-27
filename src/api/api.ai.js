// src/api/ai.js

// Centralized AI API call
// Usage: callAIAPI("prompt text") or callAIAPI({ messages: [...] }, { temperature: 0.7 })
export const callAIAPI = async (input, options = {}) => {
  try {
    let bodyToSend;

    if (typeof input === "string") {
      bodyToSend = {
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps with real estate due diligence and investment analysis.",
          },
          { role: "user", content: input },
        ],
      };
    } else if (input && Array.isArray(input.messages)) {
      bodyToSend = { messages: input.messages };
    } else {
      // Fallback: wrap unknown input safely
      bodyToSend = {
        messages: [
          { role: "system", content: "You are an AI assistant." },
          { role: "user", content: JSON.stringify(input) },
        ],
      };
    }

    // Merge any extra options (temperature, model, etc.)
    if (options && typeof options === "object") {
      bodyToSend = { ...bodyToSend, ...options };
    }

    const resp = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyToSend),
    });

    if (!resp.ok) {
      let errBody;
      try {
        errBody = await resp.json();
      } catch {
        errBody = await resp.text();
      }
      throw new Error(
        `Backend AI API Error: ${resp.status} - ${JSON.stringify(errBody)}`
      );
      // End execution after throwing error
    }

    const data = await resp.json();

    if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    if (Array.isArray(data.choices) && typeof data.choices[0]?.text === "string") {
      return data.choices[0].text;
    }
    if (typeof data.text === "string") return data.text;
    if (typeof data.content === "string") return data.content;

    return JSON.stringify(data);
  } catch (err) {
    console.error("callAIAPI error:", err);
    throw err;
  }
};
