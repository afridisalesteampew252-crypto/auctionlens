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

        // Use Groq API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-2-90b-vision",
                messages: [
                    {
                        role: "system",
                        content: "You are an Auction Expert. Analyze the provided auction sheet and extract data precisely in the specified format."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze this Japanese auction sheet image and extract data precisely.\n\nProvide response in this exact FORMAT:\n\nYEAR: [vehicle year]\nGRADE: [auction grade like 4.5, 4, R, etc]\nCHASSIS: [chassis number]\nSUMMARY: [1 concise paragraph about overall condition]\nINTERIOR: [1 concise paragraph about interior condition]\nEXTERIOR: [1 concise paragraph about exterior condition]\nVERDICT: [BUY, CAUTION, or AVOID with 1 reason]"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType || "image/jpeg"};base64,${image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 1024
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "API error" });
        }
        
        const result = data.choices[0].message.content;
        res.status(200).json({ result: result });
    } catch (e) { 
        res.status(500).json({ error: `Server error: ${e.message}` }); 
    }
}
