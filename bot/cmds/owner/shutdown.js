export default {
    name: "shutdown",
    alias: ["stop", "poweroff"],
    description: "Shut down the bot safely (Owner Only)",
    category: "admin",

    run: async ({ sock, msg, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Owner-only permission
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to shutdown the bot." });
            return;
        }

        // Notify before shutdown
        await sock.sendMessage(from, { text: "🛑 Shutting down bot..." });

        // Safe stop after a short delay
        setTimeout(() => {
            process.exit(0);
        }, 500);
    }
};
