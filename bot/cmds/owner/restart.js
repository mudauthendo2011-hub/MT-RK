export default {
    name: "restart",
    alias: ["reboot", "rs"],
    description: "Restart the bot (Owner Only)",
    category: "admin",

    run: async ({ sock, msg, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Only owners can restart
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to restart the bot." });
            return;
        }

        // Confirm restart message
        await sock.sendMessage(from, { text: "🔄 Restarting bot, please wait..." });

        // Delay to make sure message is sent before restart
        setTimeout(() => {
            // Safe restart: exits the process.
            process.exit(0);
        }, 500);
    }
};
