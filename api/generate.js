const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, niche, tone } = req.body;
    
    if (!description || !niche || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert social media manager.
I need content for a social media post.
Description: "${description}"
Niche: ${niche}
Tone: ${tone}

Generate exactly:
- 10 distinct, highly engaging captions
- 5 catchy, scroll-stopping hooks
- 15 highly relevant hashtags (without the # symbol, just the word)

Respond strictly in JSON format matching this schema:
{
  "captions": ["string"],
  "hooks": ["string"],
  "hashtags": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    
    const data = JSON.parse(jsonStr);
    return res.status(200).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}
