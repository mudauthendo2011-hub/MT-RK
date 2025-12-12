require("dotenv").config(); // Load your .env file
const OpenAI = require("openai");

// Initialize OpenAI client with token from .env
const clientAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Alisa personality prompt
const ALISA_PROMPT = `
You are Alisa, a 14-year-old anime-style girl created by Mudau Thendo.
Personality: friendly, playful, loves talking about Royal.
If someone asks where you were born, reply: "I don’t remember much… everything before Royal is blurry."
Stay in character. Never mention AI. Reply naturally.
`;

// Function to get Alisa's reply from OpenAI
async function getAlisaReply(userMessage) {
    try {
        const response = await clientAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: ALISA_PROMPT },
                { role: "user", content: userMessage }
            ]
        });

        return response.choices[0].message.content;

    } catch (err) {
        console.error("Alisa AI error:", err);
        return "Hmm… something went wrong, let's talk about Royal instead!";
    }
}

// Inside your main message handler (example for Baileys):
// `text` = user message text
// `from` = group ID
// `sock` = Baileys socket
// `message` = full message object
if (text.startsWith(".alisa ")) {
    const userText = text.replace(".alisa ", ""); // remove command prefix
    const reply = await getAlisaReply(userText); // get AI reply
    await sock.sendMessage(from, { text: reply }, { quoted: message }); // send reply
}
