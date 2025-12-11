const fs = require("fs");
const path = require("path");

// Path to mods db
const dbPath = path.join(__dirname, "../../database/mods.json");

// Load database
function loadDB() {
    if (!fs.existsSync(dbPath)) {
        return { mods: [], bannedGroups: [], bannedUsers: [] };
    }
    return JSON.parse(fs.readFileSync(dbPath));
}

// Save database
function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: "unban",
    description: "Unban a user from the bot",
    category: "mods",

    execute: async (sock, msg, args, { isMod, from, sender, reply }) => {

        // Only mods can unban
        if (!isMod) {
            return await reply("You are not allowed to use this command.");
        }

        // If no target mentioned
        if (!msg.message?.extendedTextMessage?.contextInfo?.participant && !args[0]) {
            return await reply("Tag a user or provide a number.\nExample: .unban @user");
        }

        // Get target number
        let target =
            msg.message?.extendedTextMessage?.contextInfo?.participant ||
            args[0].replace(/[^0-9]/g, "");

        if (!target) {
            return await reply("Invalid target.");
        }

        // Clean MSISDN (WhatsApp JID)
        if (!target.includes("@s.whatsapp.net")) {
            target = target + "@s.whatsapp.net";
        }

        const db = loadDB();

        // Check if user is banned
        if (!db.bannedUsers.includes(target)) {
            return await reply("This user is not banned.");
        }

        // Remove from ban list
        db.bannedUsers = db.bannedUsers.filter(u => u !== target);
        saveDB(db);

        await reply(`User has been *unbanned*.\nThey can now use the bot again.`);
    }
};
