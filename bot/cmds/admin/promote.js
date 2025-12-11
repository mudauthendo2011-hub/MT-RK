export default {
    name: "promote",
    description: "Promote a user to group admin",
    category: "admin",
    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Only allow owners to run this command
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to use this command." });
            return;
        }

        // Must be used in a group
        if (!from.endsWith("@g.us")) {
            await sock.sendMessage(from, { text: "❌ This command can only be used in groups." });
            return;
        }

        // Check if a target user is provided
        const target = args[0];
        if (!target) {
            await sock.sendMessage(from, { text: "❌ Please provide a user to promot" });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], "promote");
            await sock.sendMessage(from, { text: `✅ User ${target} has been promoted to admin.` });
        } catch (err) {
            console.log(err);
            await sock.sendMessage(from, { text: "❌ Failed to promote the user. Make sure the bot is admin and has permissions." });
        }
    }
};
