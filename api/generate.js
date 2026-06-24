export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { description, niche, tone } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "user",
            content: `
You are an expert social media manager.

Description: ${description}
Niche: ${niche}
Tone: ${tone}

Generate:
- 10 captions
- 5 hooks
- 15 hashtags

Return ONLY valid JSON in this format:

{
  "captions": [],
  "hooks": [],
  "hashtags": []
}
`
          }
        ]
      })
    });

    const data = await response.json();

console.log("OPENROUTER RESPONSE:", JSON.stringify(data));

    const text = data.choices[0].message.content;

const jsonStart = text.indexOf("{");
const jsonEnd = text.lastIndexOf("}") + 1;

const jsonText = text.substring(jsonStart, jsonEnd);

const result = JSON.parse(jsonText);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate content" });
  }
}
