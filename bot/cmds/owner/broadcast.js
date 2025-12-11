export default {
    name: "broadcast",
    alias: ["bc", "broad", "bcast"],
    description: "Broadcast a message to all groups, all private chats, or both",
    category: "admin",

    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Only owners can broadcast
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to use this command." });
            return;
        }

        // Check if message content exists
        const content = args.join(" ");
        if (!content) {
            await sock.sendMessage(from, {
                text: "❌ Usage:\n\n.bc groups <message>\n.bc chats <message>\n.bc all <message>"
            });
            return;
        }

        // Split command mode + actual message
        const mode = args[0];
        const message = args.slice(1).join(" ");

        if (!["groups", "chats", "all"].includes(mode)) {
            await sock.sendMessage(from, {
                text: "❌ Invalid mode. Use one of:\n- groups\n- chats\n- all"
            });
            return;
        }

        // Fetch all stored chats
        const allChats = Object.keys(sock.chats);

        // Filter group chats
        const groupChats = allChats.filter(jid => jid.endsWith("@g.us"));

        // Filter private chats
        const privateChats = allChats.filter(
            jid => jid.endsWith("@s.whatsapp.net") || jid.includes("@c.us")
        );

        let targets = [];

        if (mode === "groups") targets = groupChats;
        if (mode === "chats") targets = privateChats;
        if (mode === "all") targets = [...groupChats, ...privateChats];

        // Send broadcasting message
        await sock.sendMessage(from, {
            text: `📢 Broadcasting message to ${targets.length} chats...`
        });

        // Broadcast loop
        for (const jid of targets) {
            try {
                await sock.sendMessage(jid, { text: `📢 *Broadcast Message:*\n\n${message}` });
            } catch (err) {
                console.log(`Broadcast failed for ${jid}`, err);
            }
        }

        // Final confirmation
        await sock.sendMessage(from, {
            text: "✅ Broadcast completed successfully."
        });
    }
};
