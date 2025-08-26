import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("Request received:", req.body);

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ error: "POST only" });
  }

  const { message } = req.body;
  if (!message) {
    console.log("No message provided");
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY:", apiKey ? "loaded" : "missing");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }]
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API response:", data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("Empty response from Gemini API");
      return res.status(500).json({ error: "Gemini response empty", raw: data });
    }

    res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
  } catch (err) {
    console.error("Catch error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
