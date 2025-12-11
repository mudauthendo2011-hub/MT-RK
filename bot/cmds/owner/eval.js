export default {
    name: "eval",
    alias: [">", "ev", "run"],
    description: "Run JavaScript code (Owner Only)",
    category: "admin",

    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Owner only
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to use eval." });
            return;
        }

        // No code provided
        const code = args.join(" ");
        if (!code) {
            await sock.sendMessage(from, { text: "❌ Provide code to evaluate.\nExample:\n.eval 1+1" });
            return;
        }

        // Secure sandboxed environment
        // Disabled dangerous globals
        const blocked = ["require", "process", "child_process", "exec", "spawn", "writeFile", "rm", "unlink"];
        for (const bad of blocked) {
            if (code.includes(bad)) {
                await sock.sendMessage(from, { text: `❌ Blocked keyword detected: ${bad}` });
                return;
            }
        }

        try {
            let result = await eval(`(async () => { ${code} })()`);
            if (typeof result !== "string") {
                result = JSON.stringify(result, null, 2);
            }

            await sock.sendMessage(from, {
                text: `📤 *Eval Result:*\n\n${result}`
            });

        } catch (err) {
            await sock.sendMessage(from, {
                text: `❌ *Eval Error:*\n\n${err.message}`
            });
        }
    }
};
