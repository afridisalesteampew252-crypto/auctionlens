export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        // Check if API key is set
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "API key not configured. Set GROQ_API_KEY in Vercel environment variables." });
        }

        const { image, mimeType } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { 
                "x-api-key": process.env.GROQ_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: mimeType || "image/jpeg",
                                    data: image
                                }
                            },
                            {
                                type: "text",
                                text: "You are an Auction Expert. Analyze this Japanese auction sheet image and extract data precisely.\n\nProvide response in this exact FORMAT:\n\nYEAR: [vehicle year]\nGRADE: [auction grade like 4.5, 4, R, etc]\nCHASSIS: [chassis number]\nSUMMARY: [1 concise paragraph about overall condition]\nINTERIOR: [1 concise paragraph about interior condition]\nEXTERIOR: [1 concise paragraph about exterior condition]\nVERDICT: [BUY, CAUTION, or AVOID with 1 reason]"
                            }
                        ]
                    }
                ]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "API error" });
        }
        
        const result = data.content[0].text;
        res.status(200).json({ result: result });
    } catch (e) { 
        res.status(500).json({ error: `Server error: ${e.message}` }); 
    }
}
