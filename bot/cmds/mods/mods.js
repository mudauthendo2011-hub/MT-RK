const fs = require("fs");
const path = require("path");

// Path to mods database
const dbPath = path.join(__dirname, "../../database/mods.json");

// Load database
function loadDB() {
    if (!fs.existsSync(dbPath)) {
        return { mods: [], bannedGroups: [], bannedUsers: [] };
    }
    return JSON.parse(fs.readFileSync(dbPath));
}

module.exports = {
    name: "mods",
    description: "Show the list of bot moderators",
    category: "public",

    execute: async (sock, msg, args, { from, reply }) => {
        const db = loadDB();

        let mods = db.mods;

        if (!mods || mods.length === 0) {
            return await reply("There are currently no mods assigned.");
        }

        // Format into a list
        let text = "*MD-RK MODERATORS*\n\n";

        mods.forEach((m, i) => {
            let num = m.replace("@s.whatsapp.net", "");
            text += `${i + 1}. wa.me/${num}\n`;
        });

        await reply(text);
    }
}; 
