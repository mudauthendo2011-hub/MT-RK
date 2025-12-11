export default {
    name: "demote",
    description: "Demote a user from group admin",
    category: "admin",
    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Only allow owners
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to use this command." });
            return;
        }

        // Must be in a group
        if (!from.endsWith("@g.us")) {
            await sock.sendMessage(from, { text: "❌ This command can only be used in groups." });
            return;
        }

        // Check for target user
        const target = args[0];
        if (!target) {
            await sock.sendMessage(from, { text: "❌ Please provide the number of the user to demote. Example: .demote 2760XXXXXXX" });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], "demote");
            await sock.sendMessage(from, { text: `✅ User ${target} has been demoted from admin.` });
        } catch (err) {
            console.log(err);
            await sock.sendMessage(from, { text: "❌ Failed to demote the user. Make sure the bot is admin and has permissions." });
        }
    }
};
