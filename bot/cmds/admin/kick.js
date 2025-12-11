export default {
    name: "kick",
    description: "Kick or add users in a group, or perform an admin-only akick across all groups",
    category: "admin",
    run: async ({ sock, msg, args, config }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        const from = msg.key.remoteJid;

        // Only allow owners
        if (!config.owner.includes(sender)) {
            await sock.sendMessage(from, { text: "❌ You are not allowed to use this command." });
            return;
        }

        // Check sub-command and target
        const subCommand = args[0];
        const target = args[1];

        if (!subCommand || !target) {
            await sock.sendMessage(from, {
                text: "❌ Usage:\n.kick 2760XXXXXXX\n.add 2760XXXXXXX\n.akick 2760XXXXXXX"
            });
            return;
        }

        try {
            if (subCommand === "kick") {
                if (!from.endsWith("@g.us")) {
                    await sock.sendMessage(from, { text: "❌ Kick can only be used in groups." });
                    return;
                }
                await sock.groupParticipantsUpdate(from, [target], "remove");
                await sock.sendMessage(from, { text: `✅ User ${target} kicked from this group.` });

            } else if (subCommand === "add") {
                if (!from.endsWith("@g.us")) {
                    await sock.sendMessage(from, { text: "❌ Add can only be used in groups." });
                    return;
                }
                await sock.groupParticipantsUpdate(from, [target], "add");
                await sock.sendMessage(from, { text: `✅ User ${target} added to this group.` });

            } else if (subCommand === "akick") {
                // Fetch all groups where bot is admin
                const groups = Object.keys(sock.chats)
                    .filter(jid => jid.endsWith("@g.us"))
                    .filter(jid => sock.chats[jid].groupMetadata?.participants?.some(p => p.jid === sock.user.id && p.isAdmin));

                for (const groupId of groups) {
                    try {
                        await sock.groupParticipantsUpdate(groupId, [target], "remove");
                        await sock.sendMessage(groupId, { text: `🚫 User ${target} has been akicked from this group.` });
                    } catch (err) {
                        console.log(`Failed to kick ${target} from group ${groupId}:`, err);
                    }
                }

                await sock.sendMessage(from, { text: `✅ User ${target} akicked from all groups where bot is admin.` });

            } else {
                await sock.sendMessage(from, { text: "❌ Invalid sub-command. Use kick, add, or akick." });
            }
        } catch (err) {
            console.log(err);
            await sock.sendMessage(from, { text: "❌ Failed to perform the action. Make sure the bot has admin rights." });
        }
    }
};
