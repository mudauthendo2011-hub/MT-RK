/* 
 * Made by MUDAU Thendo
 * Royal Edition © 2025
 * This file is part of MT-RK and is licensed under the GNU GPLv3.
 * Handle with care, and only use in compliance with the License.
 * See the LICENSE file or https://www.gnu.org/licenses/gpl-3.0.html
 * -------------------------------------------------------------------------------
 */

const { MTRK, wtype, updateConfig, prefix, updateEnv, updateEnvSudo, addEnvSudo, removeEnvSudo, replaceEnvSudo, getEnvValue, envExists, listEnvKeys, toBoolean, getPlatformInfo, setVar, updateVar, delVar, getVars, config, myMods, getAdmins 
  } = require("../core")
  const fs = require("fs")
  
  
  
module.exports = {
  name: "setvar",
  desc: "set a config in config.env/config.js",
  fromMe: true,
  type: "config",
}, async (m, text)=> {
  try {
  if (!text)  return await m.send(`*provide the var name and value*\n_example: ${prefix}setvar SESSION_ID=kord-ai_321`)
  var [key, ...args] = text.split("=")
  key = key.toUpperCase()
  var value = args.join("=").trim()
  if (!key || !value) return await m.send(`*provide the var name and value*\n_example: ${prefix}setvar SESSION_ID kord-ai_321`) 
  const platformInfo = getPlatformInfo()
  if (platformInfo.platform === "render") {
    try {
      await m.send(`*_Config Successfully Set_* *${key.toUpperCase()}* _to_ *${value}*\n_Restarting..._`)
      await setVar(key.toUpperCase(), value)
    } catch (error) {
      await m.send(`*Error setting variable:* ${error.message}`)
    }
  } else {
    var isExist = await envExists()
    if (isExist) {
      if (!process.env[key]) {
        await updateEnv(key, value)
        return await m.send(`*Config set successfully!*\n\n_Created ${key} with value ${value}_`)
      } else {
        await updateEnv(key, value)
        return await m.send(`*Config set successfully!*`)
      }
    } else {
      await updateConfig(key, value)
      return await m.send(`*Config set successfully!*`)
    }
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
name: "getvar",
  desc: "get all variables from config.js/config.env",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
    if (!text) return m.reply("_*provide var name...*_\n_example: getvar SUDO_")
    const key = text.trim().toUpperCase()
    if (typeof key !== 'string' || !key.trim()) {
    await m.reply("_*Invalid variable!...*_")
    } else if (await envExists()) {
    return await m.send(`*${key}*: ${process.env[key]}`)
    } else if (config()[key]) {
    return await m.send(`*${key}*: ${config()[key]}`)
    } else {
    await m.reply(`_*'${key}' not found in config*_`)
    }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: 'delvar',
  desc: "delete a variable/setting",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
  const key = text.trim().toUpperCase()
  const platformInfo = getPlatformInfo()
  if (platformInfo.platform === "render") {
    try {
      await m.send(`_*successfully deleted ${key}*_\n\n> restarting..`)
      await delVar(key)
    } catch (error) {
      await m.send(`*Error deleting variable:* ${error.message}`)
    }
  } else {
    var isExist = await envExists()
    if (isExist) {
      await updateEnv(key, null, { remove: true})
    } else {
      await updateConfig(key, null, {remove: true})
    }
    await m.send(`_*successfully deleted ${key}*_`)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "allvar",
  desc: "get all variables/settings",
  fromMe: true,
  type: "config",
}, async (m, text)=> {
  try {
  const platformInfo = getPlatformInfo()
  
  if (platformInfo.platform === "render") {
    try {
      const result = await getVars()
      if (result.success) {
  var data = '*All Vars (Render)*\n\n'
  for (var item of result.data) {
    const variable = item.envVar
    data += `*${variable.key}*: ${variable.value}\n`
  }
  return await m.send(data)
}
    } catch (error) {
      await m.send(`*Error getting variables:* ${error.message}`)
      return
    }
  }
  if (await envExists()) {
    var h = await listEnvKeys()
      var daa = '*All Vars*\n\n'
    for (var hh of h) {
      daa += `*${hh}*: ${process.env[hh]}\n`
    }
    return await m.send(`${daa}`)
  } else {
    const data = '*All Vars*\n\n' + Object.keys(config())
    .map(key => `*${key}:* ${config()[key]}`)
    .join('\n')
    return await m.send(`${data}`)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

async function updateAllConfig(key, value, m) {
  const platformInfo = getPlatformInfo()
  if (platformInfo.platform === "render") {
    try {
      await m.send(`*_${key} set to ${value}_*\n_Restarting..._`)
      if (process.env[key]) {
        await setVar(key, value)
      } else {
        await setVar(key, value)
      }
    } catch (error) {
      await m.send(`*Error updating variable:* ${error.message}`)
    }
  } else {
    var isExist = await envExists()
    if (isExist) {
      if (!process.env[key]) {
        await updateEnv(key, value)
        return await m.send(`*_${key} set to ${value}_*`)
      } else {
        await updateEnv(key, value)
        return await m.send(`*_${key} set to ${value}_*`)
      }
    } else {
      await updateConfig(key, value)
      return await m.send(`*_${key} set to ${value}_*`)
    }
  }
}

function toggle(cmdName, envKey, displayName) {
  try {
  return async (m, text, cmd) => {
    const allowed = [...myMods().map(x => x + '@s.whatsapp.net'), m.ownerJid]
    text = text.split(" ")[0].toLowerCase()
    const validInputs = ['on', 'off', 'true', 'false']

if (!text) {
  if (config().RES_TYPE.toLowerCase() === "button") {
    return await m.btnText("*Toggle on/off*", {
      [`${cmd} on`]: "ON",
      [`${cmd} off`]: "OFF",
    })
  } else if (config().RES_TYPE.toLowerCase() === "poll") {
    return await m.send({
      name: "*Toggle on/off*",
      values: [{ name: "on", id: `${cmdName} on` }, { name: "off", id: `${cmdName} off` }],
      withPrefix: true,
      onlyOnce: true,
      participates: allowed,
      selectableCount: true,
    }, {}, "poll")
  } else {
    return await m.send(`*Use:* ${cmd} on/off`)
  }
}

if (!validInputs.includes(text)) {
  return await m.send(`*Invalid option:* _${text}_\n_Use only 'on', 'off', 'true', or 'false'_`)
}
    
    var t = toBoolean(text)
    var envVal = process.env[envKey]
    var configVal = config()[envKey]
    if ((envVal !== undefined && toBoolean(envVal) == t) || (configVal !== undefined && toBoolean(configVal) == t)) {
  return await m.send(`*${displayName} already set to ${text}..*`)
    }
    
    await updateAllConfig(envKey, text, m)
  }
  } catch (e) {
    console.log("cmd error", e)
    return m.sendErr(e)
  }
}

function deltog() {
  try {
    return async (m, text, cmd) => {
      const allowed = [...myMods().map(x => x + '@s.whatsapp.net'), m.ownerJid]
      text = text.split(" ")[0].toLowerCase()
      const validInputs = ['on', 'p', 'chat', 'g', 'off']

      if (text && !validInputs.includes(text) && !text.match(/^\d+$/)) {
        return await m.send(`*Invalid option:* _${text}_\n_Use: 'on/p' (owner), 'chat/g' (in chat), 'off' (disable), or phone number_`)
      }

      if (!text) {
        if (config().RES_TYPE.toLowerCase() === "button") {
          return await m.btnText("*Antidelete Settings*", {
            [`${cmd} on`]: "TO OWNER",
            [`${cmd} chat`]: "IN CHAT",
            [`${cmd} off`]: "DISABLE",
          })
        } else if (config().RES_TYPE.toLowerCase() === "poll") {
          return await m.send({
            name: "*Antidelete Settings*",
            values: [
              { name: "To Owner", id: `${cmd} on` },
              { name: "In Chat", id: `${cmd} chat` },
              { name: "Disable", id: `${cmd} off` }
            ],
            withPrefix: true,
            onlyOnce: true,
            participates: allowed,
            selectableCount: true,
          }, {}, "poll")
        } else {
          return await m.send(`*Use:* ${cmd} on/p/chat/g/off or phone number\n\n*Options:*\n• on/p - Send to owner\n• chat/g - Send in chat\n• off - Disable\n• [number] - Send to specific number`)
        }
      }

      let finalValue = text
      if (text.match(/^\d+$/)) {
        finalValue = text
      }

      var envVal = process.env.ANTIDELETE
      var configVal = config().ANTIDELETE
      if ((envVal !== undefined && envVal === finalValue) || (configVal !== undefined && configVal === finalValue)) {
        return await m.send(`*Anti Delete already set to ${text}..*`)
      }

      await updateAllConfig('ANTIDELETE', finalValue, m)
    }
  } catch (e) {
    console.log("cmd error", e)
    return m.sendErr(e)
  }
}


module.exports = {
  name: "readstatus",
  desc: "turn on/off readstatus",
  fromMe: true,
  type: "config",
}, toggle("readstatus", "STATUS_VIEW", "Read Status"))

module.exports = {
  name: "likestatus",
  desc: "turn on/off likestatus",
  fromMe: true,
  type: "config",
}, toggle("likestatus", "LIKE_STATUS", "Like Status"))

module.exports = {
  name: "startupmsg",
  desc: "turn on/off startupmsg",
  fromMe: true,
  type: "config",
}, toggle("startupmsg", "STARTUP_MSG", "Startup Msg"))


module.exports = {
  name: "alwaysonline",
  desc: "turn on/off always online",
  fromMe: true,
  type: "config",
}, toggle("alwaysonline", "ALWAYS_ONLINE", "Always Online"))

MTRK({
  name: "antidelete",
  desc: "configure antidelete settings",
  fromMe: true,
  type: "config",
}, deltog())


module.exports = {
  name: "antiedit",
  desc: "turn on/off Anti-Edit",
  fromMe: true,
  type: "config",
}, toggle("antiedit", "ANTI_EDIT", "Anti Edit"))

module.exports = {
  name: "antieditchat",
  desc: "turn on/off antiedit in chat",
  fromMe: true,
  type: "config",
}, toggle("antieditchat", "ANTI_EDIT_IN_CHAT", "Anti Edit In Chat"))

module.exports = {
  name: "savestatus",
  desc: "turn on/off save status",
  fromMe: true,
  type: "config",
}, toggle("savestatus", "SAVE_STATUS", "Save Status"))

module.exports = {
  name: "cmdreact",
  desc: "turn on/off command react",
  fromMe: true,
  type: "config",
}, toggle("cmdreact", "CMD_REACT", "Command React"))

module.exports = {
  name: "readmsg|read",
  desc: "turn on/off read message",
  fromMe: true,
  type: "config",
}, toggle("readmsg", "READ_MESSAGE", "Read Message"))

module.exports = {
  name: "rejectcall",
  desc: "turn on/off reject call",
  fromMe: true,
  type: "config",
}, toggle("rejectcall", "REJECT_CALL", "Reject Call"))

module.exports = {
  name: "setsudo",
  desc: "add a user to sudo",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
  let users = []

  if (!text && !m.quoted) return await m.send("_Reply/mention/provide a user or type 'admins'_")

if (text.trim().toLowerCase() === 'admins') {
  if (!m.isGroup) return await m.send("_'admins' can only be used in groups_")
  const admins = await getAdmins(m.client, m.chat)
  users = admins.map(j => j.split('@')[0])
} else {
  const u = m.mentionedJid?.[0] || m.quoted?.sender || (text || '').trim()
  if (!u) return await m.send("_Reply/mention/provide a user_")
  users = [u.split('@')[0]]
}

  const current = config().SUDO || ""
  const cNumbers = current.split(',').map(n => n.trim()).filter(n => n)
  const existing = new Set(cNumbers)
  const toAdd = users.filter(u => !existing.has(u))
  if (toAdd.length === 0) return await m.send("_User(s) already a sudo_")
  const nsn = [...existing, ...toAdd].join(",")

  if (m.client.platform === "render") {
    try {
      await m.send(`\`\`\`${toAdd.join(', ')} added to sudo list...\n_Restarting\`\`\``)
      await setVar("SUDO", nsn)
    } catch (er) {
      console.error(er)
      return await m.send(`error: ${er}`)
    }
  }

  const isExist = await envExists()
  if (isExist) {
    await updateEnv("SUDO", nsn)
    return await m.send(`\`\`\`${toAdd.join(', ')} added to sudo list...\`\`\``)
  } else {
    await updateConfig("SUDO", nsn, { replace: true })
    return await m.send(`\`\`\`${toAdd.join(', ')} added to sudo list...\`\`\``)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "delsudo",
  desc: "delete user from sudo list",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
  let users = []

  if (!text && !m.quoted) return await m.send("_Reply/mention/provide a user or type 'admins'_")

if (text.trim().toLowerCase() === 'admins') {
  if (!m.isGroup) return await m.send("_'admins' can only be used in groups_")
  const admins = await getAdmins(m.client, m.chat)
  users = admins.map(j => j.split('@')[0])
} else {
  const u = m.mentionedJid?.[0] || m.quoted?.sender || (text || '').trim()
  if (!u) return await m.send("_Reply/mention/provide a user_")
  users = [u.split('@')[0]]
}

  const current = config().SUDO || ""
  const cNumbers = current.split(',').map(n => n.trim()).filter(n => n)
  const filtered = cNumbers.filter(n => !users.includes(n))
  if (filtered.length === cNumbers.length) return await m.send("_User(s) not in sudo list_")
  const nsn = filtered.length ? filtered.join(",") : "false"

  if (m.client.platform === "render") {
    try {
      await m.send(`\`\`\`${users.join(', ')} removed from sudo list...\n_Restarting\`\`\``)
      await setVar("SUDO", nsn)
    } catch (er) {
      console.error(er)
      return await m.send(`error: ${er}`)
    }
  }

  const isExist = await envExists()
  if (isExist) {
    await updateEnv("SUDO", nsn)
    return await m.send(`\`\`\`${users.join(', ')} removed from sudo list...\`\`\``)
  } else {
    await updateConfig("SUDO", nsn, { replace: true })
    return await m.send(`\`\`\`${users.join(', ')} removed from sudo list...\`\`\``)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})


module.exports = {
  name: "guards|protecters",
  desc: "get all guards",
  fromMe: wtype,
  type: "config",
}, async (m, text) => {
  try {
    // Get guards from config
    var guardList = (config().SUDO || "")
      .split(",")
      .map(n => n.trim())
      .filter(n => n);

    if (guardList.length === 0)
      return await m.send("_Guard list is empty_");

    // Royal-style message
    var msg = "╔═════✦❖✦═════╗\n";
    msg += "   𝗥𝗢𝗬𝗔𝗟 𝗚𝗨𝗔𝗥𝗗𝗦  \n";
    msg += "╚═════✦❖✦═════╝\n";
    msg += "     ⟢ 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗘𝗥𝗦 ⟢\n";
    msg += "——————————————\n\n";

    var mentionJids = [];
    guardList.forEach(guard => {
      msg += `• @${guard}\n`;
      mentionJids.push(guard + '@s.whatsapp.net');
    });

    msg += "\n——————————————\n";
    msg += ">  ⚠️ Do not tag guards without a valid reason.\n";
    msg += "> Improper use may result in restrictions.";

    // Send message with mentions
    return await m.send(msg, { mentions: mentionJids });

  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "setmod|addmod",
  desc: "add a user to mod list",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
  let users = []

  if (!text && !m.quoted) return await m.send("_Reply/mention/provide a user or type 'admins'_")

if (text.trim().toLowerCase() === 'admins') {
  if (!m.isGroup) return await m.send("_'admins' can only be used in groups_")
  const admins = await getAdmins(m.client, m.chat)
  users = admins.map(j => j.split('@')[0])
} else {
  const u = m.mentionedJid?.[0] || m.quoted?.sender || (text || '').trim()
  if (!u) return await m.send("_Reply/mention/provide a user_")
  users = [u.split('@')[0]]
}

  const current = config().MODS || ""
  const cNumbers = current.split(',').map(n => n.trim()).filter(n => n)
  const existing = new Set(cNumbers)
  const toAdd = users.filter(u => !existing.has(u))
  if (toAdd.length === 0) return await m.send("_User(s) already a mod_")
  const nsn = [...existing, ...toAdd].join(",")

  if (m.client.platform === "render") {
    try {
      await m.send(`\`\`\`${toAdd.join(', ')} added to mod list...\n_Restarting\`\`\``)
      await setVar("MODS", nsn)
    } catch (er) {
      console.error(er)
      return await m.send(`error: ${er}`)
    }
  }

  const isExist = await envExists()
  if (isExist) {
    await updateEnv("MODS", nsn)
    return await m.send(`\`\`\`${toAdd.join(', ')} added to mod list...\`\`\``)
  } else {
    await updateConfig("MODS", nsn, { replace: true })
    return await m.send(`\`\`\`${toAdd.join(', ')} added to mod list...\`\`\``)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "delmod",
  desc: "delete user from mod list",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
  let users = []

  if (!text && !m.quoted) return await m.send("_Reply/mention/provide a user or type 'admins'_")

if (text.trim().toLowerCase() === 'admins') {
  if (!m.isGroup) return await m.send("_'admins' can only be used in groups_")
  const admins = await getAdmins(m.client, m.chat)
  users = admins.map(j => j.split('@')[0])
} else {
  const u = m.mentionedJid?.[0] || m.quoted?.sender || (text || '').trim()
  if (!u) return await m.send("_Reply/mention/provide a user_")
  users = [u.split('@')[0]]
}

  const current = config().MODS || ""
  const cNumbers = current.split(',').map(n => n.trim()).filter(n => n)
  const filtered = cNumbers.filter(n => !users.includes(n))
  if (filtered.length === cNumbers.length) return await m.send("_User(s) not in mod list_")
  const nsn = filtered.length ? filtered.join(",") : "false"

  if (m.client.platform === "render") {
    try {
      await m.send(`\`\`\`${users.join(', ')} removed from mod list...\n_Restarting\`\`\``)
      await setVar("MODS", nsn)
    } catch (er) {
      console.error(er)
      return await m.send(`error: ${er}`)
    }
  }

  const isExist = await envExists()
  if (isExist) {
    await updateEnv("MODS", nsn)
    return await m.send(`\`\`\`${users.join(', ')} removed from mod list...\`\`\``)
  } else {
    await updateConfig("MODS", nsn, { replace: true })
    return await m.send(`\`\`\`${users.join(', ')} removed from mod list...\`\`\``)
  }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "mods",
  desc: "get all mods",
  fromMe: wtype,
  type: "config",
}, async (m, text) => {
  try {
    // Get mods from config
    var modList = (config().MODS || "")
      .split(",")
      .map(n => n.trim())
      .filter(n => n);

    if (modList.length === 0)
      return await m.send("_Mods list is empty_");

    // Royal-style message
    var msg = "╔═════✦❖✦═════╗\n";
    msg += "   𝗥𝗢𝗬𝗔𝗟 𝗦𝗧𝗔𝗙𝗙  \n";
    msg += "╚═════✦❖✦═════╝\n";
    msg += "     ⟢ 𝙈𝙊𝘿𝙎 𝙇𝙄𝙎𝙏 ⟢\n";
    msg += "——————————————\n\n";

    var mentionJids = [];
    modList.forEach(mod => {
      msg += `• @${mod}\n`;
      mentionJids.push(mod + '@s.whatsapp.net');
    });

    msg += "\n——————————————\n";
    msg += ">  ⚠️ Please avoid using this command without a valid reason.\n";
    msg += "Unnecessary tagging of staff may result in a restriction.";

    // Send message with mentions
    return await m.send(msg, { mentions: mentionJids });

  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
}); 

module.exports = {
name: "mode",
  desc: "set bot to private or public",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
    const allowed = [...myMods().map(x => x + '@s.whatsapp.net'), m.ownerJid]
    var cmdName = "mode"
    if (!text) return config().RES_TYPE.toLowerCase() == "poll" ? await m.send({
    name: "*Toggle private/public*",
    values: [{name: "private", id: `${cmdName} private`}, {name: "public", id: `${cmdName} public`}],
    withPrefix: true,
    onlyOnce: true,
    participates: allowed,
    selectableCount: true,
    }, {}, "poll") : await m.send("Use either public or private")
    if (text.toLowerCase() == "private") {
    if (config().WORKTYPE.toLowerCase() == "private") return await m.send("_Bot is already private.._")
    else {
    await updateAllConfig("WORKTYPE", "private", m)
    }
    } else if (text.toLowerCase() == "public") {
    if (config().WORKTYPE.toLowerCase() == "public") return await m.send("_Bot is already public.._")
    else {
    await updateAllConfig("WORKTYPE", "public", m)
    }
    } else {
    return config().RES_TYPE.toLowerCase() == "poll" ? await m.send({
    name: "*Toggle private/public*",
    values: [{name: "private", id: `${cmdName} private`}, {name: "public", id: `${cmdName} public`}],
    withPrefix: true,
    onlyOnce: true,
    participates: allowed,
    selectableCount: true,
    }, {}, "poll") : await m.send("Use either public or private")
    }
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
name: "statusemoji",
  desc: "set like status emoji",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
    if (!text) return await m.send("_provide an emoji:emojis_\n_example: statusemoji 🤍 or statusemoji 🤍,🥏")
    await updateAllConfig("STATUS_EMOJI", text, m)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "savecmd",
  desc: "set save emoji",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
    if (!text) return await m.send("_provide an emoji_\n_example: savecmd 🤍")
    await updateAllConfig("SAVE_CMD", text, m)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

module.exports = {
  name: "vvcmd",
  desc: "set vv emoji",
  fromMe: true,
  type: "config",
}, async (m, text) => {
  try {
    if (!text) return await m.send("_provide an emoji_\n_example: vvcmd 🤍")
    await updateAllConfig("VV_CMD", text, m)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})
