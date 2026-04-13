export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    try {
        const { image, mimeType } = req.body;
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "system",
                        content: "You are an Auction Expert. Extract data precisely. FORMAT: YEAR: [val], GRADE: [val], CHASSIS: [val], SUMMARY: [1 concise paragraph], INTERIOR: [1 concise paragraph], EXTERIOR: [1 concise paragraph], VERDICT: [BUY, CAUTION, or AVOID with 1 reason]."
                    },
                    {
                        role: "user",
                        content: [{ type: "text", text: "Analyze the uploaded auction sheet. Be concise." }, { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }]
                    }
                ],
                temperature: 0.1,
                max_tokens: 600
            })
        });
        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}
