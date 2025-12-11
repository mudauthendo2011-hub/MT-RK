export default {
    name: "ban",
    description: "Ban a user from using the bot or group commands",
    category: "admin",
    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;

        // Check if sender is the owner
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ You are not allowed to use this command."
            });
            return;
        }

        // Check if an argument was provided
        if (!args[0]) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide the number of the user to ban. Example: .ban 2760XXXXXXX"
            });
            return;
        }

        const userToBan = args[0];

        // Here you would implement your ban logic
        // For example, save the banned user to a JSON or database
        // For now, we just send a confirmation message
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ User ${userToBan} has been banned successfully.`
        });

        console.log(`User ${userToBan} banned by ${sender}`);
    }
};
