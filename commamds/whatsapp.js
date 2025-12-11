/* 
 * Made by MUDAU Thendo
 * This file is part of MT-RK and is licensed under the GNU GPLv3.
 */

const { MTRK, wtype, isAdmin, isadminn, saveFilter, listFilters, removeFilter, prefix, getData, storeData, isBotAdmin } = require("../core")

// Delete message command
MTRK({
  cmd: "delete|del|dlt",
  desc: "delete a replied message",
  fromMe: wtype,
  type: "user",
}, async (m, text) => {
  try {
    if (!m.quoted) return await m.send("_Reply to a message to delete_")
    
    if (m.isGroup) {
      if (m.quoted.fromMe && m.isCreator) {
        await m.send(m.quoted, {}, "delete")
        return await m.send(m, {}, "delete")
      }

      let ad = await isAdmin(m)
      let botAd = await isBotAdmin(m)
      if (!botAd) return await m.send("_I'm not admin.._")
      if (!ad) return await m.send("_You're not admin.._")
      
      await m.send(m.quoted, {}, "delete")
      return await m.send(m, {}, "delete")
    }

    if (!m.isCreator) return await m.send("_I don't know you.._")
    await m.send(m.quoted, {}, "delete")
    if (m.fromMe) {
      return await m.send(m, {}, "delete")
    } else return
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Archive chat
MTRK({
  cmd: "archive",
  desc: "archive a chat",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    const lmsg = { message: m.message, key: m.key, messageTimestamp: m.timestamp }
    await m.client.chatModify({ archive: true, lastMessages: [lmsg] }, m.chat)
    return await m.send('_chat archived_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Unarchive chat
MTRK({
  cmd: "unarchive",
  desc: "unarchive a chat",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    const lmsg = { message: m.message, key: m.key, messageTimestamp: m.timestamp }
    await m.client.chatModify({ archive: false, lastMessages: [lmsg] }, m.chat)
    return await m.send('_chat unarchived_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Get JID
MTRK({
  cmd: "jid",
  desc: "gets jid of either replied user or present chat",
  fromMe: wtype,
  type: "user",
}, async (m) => {
  try {
    if (m.quoted.sender) return await m.send(m.quoted.sender)
    else return await m.send(m.chat)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Set profile picture
MTRK({
  cmd: "pp|setpp",
  desc: "changes profile pic to replied photo",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    if (!m.quoted.image && !m.image) return await m.send("_reply to a picture_")
    let picpath
    if (m.quoted.image) picpath = await m.quoted.download()
    else picpath = await m.client.downloadMediaMessage(m)
    await m.client.updateProfilePicture(m.user.jid, picpath)
    return await m.send("_profile pic changed_")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove profile picture
MTRK({
  cmd: "removepp",
  desc: "removes profile picture",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    await m.client.removeProfilePicture(m.user.jid)
    return await m.send("_profile pic removed.._")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Clear chat
MTRK({
  cmd: "clear",
  desc: "clear a chat",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    await m.client.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] }, m.chat)
    await m.send('_Chat Cleared_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Pin chat
MTRK({
  cmd: "pinchat|chatpin",
  desc: "pin a chat",
  fromMe: true,
  type: "user"
}, async (m, text) => {
  try {
    await m.client.chatModify({ pin: true }, m.chat)
    await m.send('_Chat Pined_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Unpin chat
MTRK({
  cmd: "unpinchat|unchatpin",
  desc: "unpin a chat",
  fromMe: true,
  type: "user"
}, async (m, text) => {
  try {
    await m.client.chatModify({ pin: false }, m.chat)
    await m.send('_Chat Unpined_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Block user
MTRK({
  cmd: "block",
  desc: 'block a user',
  fromMe: true,
  type: 'user',
}, async (m, text) => {
  try {
    if (m.isGroup && m.quoted?.sender) await m.client.updateBlockStatus(m.quoted?.sender, "block")
    else await m.client.updateBlockStatus(m.chat, "block")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Unblock user
MTRK({
  cmd: "unblock",
  desc: 'unblock a user',
  fromMe: true,
  type: 'user',
}, async (m, text) => {
  try {
    if (m.isGroup && m.quoted?.sender) await m.client.updateBlockStatus(m.quoted?.sender, "unblock")
    else await m.client.updateBlockStatus(m.chat, "unblock")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Block list
MTRK({
  cmd: "blocklist",
  desc: "fetches list of blocked numbers",
  fromMe: true,
  type: 'user',
}, async (m, text) => {
  try {
    const num = await m.client.fetchBlocklist()
    if (!num?.length) return await m.send("_No blocked users found!_")
    const blockList = `_*❏ Block List ❏*_\n\n${num.map(n => `➟ +${n.replace('@s.whatsapp.net', '')}`).join('\n')}`
    return await m.send(blockList)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Set profile name
MTRK({
  cmd: "setname",
  desc: "set profile name",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    if (!text) return await m.send(`_*Provide a name to set!*_\n_Example: ${prefix}setname MUDAU Thendo_`)
    await m.client.updateProfileName(text)
    await m.send(`_Profile name updated to ${text}_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Set bio
MTRK({
  cmd: "bio|setbio",
  desc: "set bio for profile",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    if (!text) return await m.send(`*_Provide A Text_*_\nExample: ${prefix}setbio Busy making MT-RK_`)
    await m.client.updateProfileStatus(text)
    await m.send('_Bio updated_')
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Get profile pic
MTRK({
  cmd: "getpp",
  desc: "get profile pic of a user/group",
  fromMe: true,
  type: "user",
}, async (m, text) => {
  try {
    let jid
    if (m.isGroup && m.quoted?.sender) jid = m.quoted.sender
    else jid = m.isGroup ? m.chat : m.quoted?.sender || m.chat
    let pic = await m.client.profilePictureUrl(jid, 'image')
    return await m.send(pic, {}, "image")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Forward message
MTRK({
  cmd: "forward|fwrd",
  desc: "forward a message",
  fromMe: true,
  type: "user",
}, async (m, text, cmd, store) => {
  try {
    if (!m.quoted) return await m.send("_Reply to the msg you want to forward.._")
    if (!text) return await m.send(`_*Provide a number/jid!*_\nExample: ${cmd} 2348033221144`)
    let jidd = text.includes("@g.us") || text.includes("@s.whatsapp.net") ? text : `${text}@s.whatsapp.net`
    await m.forwardMessage(jidd, await store.loadMessage(m.chat, m.quoted))
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   Privacy commands
============================ */

// Change lastseen privacy
MTRK({
  cmd: 'lastseen',
  desc: 'change lastseen privacy',
  fromMe: true,
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\nChange last seen privacy settings`)
    const valid = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!valid.includes(match)) return await m.send(`_Action must be one of: ${valid.join('/')}._`)
    await m.client.updateLastSeenPrivacy(match)
    await m.send(`_Privacy settings for *last seen* updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Change online privacy
MTRK({
  cmd: 'online',
  desc: 'change online privacy',
  fromMe: true,
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\nChange online privacy settings`)
    const valid = ['all', 'match_last_seen']
    if (!valid.includes(match)) return await m.send(`_Action must be one of: ${valid.join('/')}._`)
    await m.client.updateOnlinePrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Privacy for profile picture
MTRK({
  cmd: 'mypp',
  desc: 'profile picture privacy',
  fromMe: true,
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\nChange profile picture privacy settings`)
    const valid = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!valid.includes(match)) return await m.send(`_Action must be one of: ${valid.join('/')}._`)
    await m.client.updateProfilePicturePrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Privacy for status
MTRK({
  cmd: 'mystatus',
  desc: 'status privacy',
  fromMe: true,
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\nChange status privacy settings`)
    const valid = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!valid.includes(match)) return await m.send(`_Action must be one of: ${valid.join('/')}._`)
    await m.client.updateStatusPrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   PM Filters
============================ */

// Set a PM filter
MTRK({
  cmd: "pfilter",
  desc: "Set a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "pfilter")
    await saveFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove a PM filter
MTRK({
  cmd: "pstop",
  desc: "Remove a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (!text) return await m.send("_Specify a keyword to remove_")
    await removeFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   Group Filters
============================ */

// Set a group filter
MTRK({
  cmd: "gfilter",
  desc: "Set a group filter",
  fromMe: true,
  type: "autoreply",
  gc: true,
  adminOnly: true,
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "gfilter")
    await saveFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove a group filter
MTRK({
  cmd: "gstop",
  desc: "Remove a group filter",
  fromMe: true,
  type: "autoreply",
  gc: true,
  adminOnly: true,
}, async (m, text) => {
  try {
    if (!text) return await m.send("_Specify a keyword to remove_")
    await removeFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   Message Listener
============================ */

MTRK({
  on: "text",
  fromMe: false,
}, async (m) => {
  try {
    if (m.sender === m.ownerJid) return

    // PM filters
    if (!m.isGroup) {
      let global = await getData("pfilter") || {}
      let gmatch = global["pm"]?.[m.body?.toLowerCase()]
      if (gmatch) {
        if (gmatch.type && gmatch.file) {
          let buff = Buffer.from(gmatch.file, "base64")
          return await m.send(buff, { caption: gmatch.caption, mimetype: gmatch.mimetype }, gmatch.type.replace("Message", ""))
        } else return await m.send(gmatch.msg)
      }
      return
    }

    // Group filters
    let local = await getData("gfilter") || {}
    let res = local[m.chat]?.[m.body?.toLowerCase()]
    if (res) {
      if (res.type && res.file) {
        let buff = Buffer.from(res.file, "base64")
        return await m.send(buff, { caption: res.caption, mimetype: res.mimetype }, res.type.replace("Message", ""))
      } else return await m.send(res.msg)
    }

  } catch (e) {
    console.log("listener error", e)
  }
})

/* ============================
   Mute / Unmute Users & Stickers
============================ */

// Mute a user or a sticker
MTRK({
  cmd: "mute-user",
  desc: "Mute a user or a sticker",
  fromMe: true,
  type: "bot",
  gc: true,
  adminOnly: true,
}, async (m, text) => {
  try {
    const botAd = await isBotAdmin(m)
    if (!botAd) return await m.send("_*✘Bot Needs To Be Admin!*_")

    const _b = await getData("blacklisted") || {}
    if (!_b[m.chat]) _b[m.chat] = { users: [], stk: [] }
    const bl = _b[m.chat]

    // Mute sticker
    if (text.includes("-s")) {
      if (!m.quoted.sticker) return await m.send("_Reply to the sticker to mute_")
      const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
      if (bl.stk.includes(hash)) return await m.send("_Sticker is already muted_")
      bl.stk.push(hash)
      await storeData("blacklisted", _b)
      return await m.send("_Sticker muted_")
    }

    // Mute user
    const input = m.mentionedJid?.[0] || m.quoted?.sender || text
    if (!input) return await m.send("_Need user…_")
    const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
    if (await isadminn(m, user)) return await m.send("_User is an admin_")
    if (bl.users.includes(user)) return await m.send("_User is already muted_")
    bl.users.push(user)
    await storeData("blacklisted", _b)
    return await m.send(`@${user.split("@")[0]} has been muted`, { mentions: [user] })

  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Unmute a user or a sticker
MTRK({
  cmd: "unmute-user",
  desc: "Unmute a user or a sticker",
  fromMe: true,
  type: "bot",
  gc: true,
  adminOnly: true,
}, async (m, text) => {
  try {
    const botAd = await isBotAdmin(m)
    if (!botAd) return await m.send("_*✘Bot Needs To Be Admin!*_")

    const _b = await getData("blacklisted") || {}
    if (!_b[m.chat]) return await m.send("_No one muted here_")
    const bl = _b[m.chat]

    // Unmute sticker
    if (text.includes("-s")) {
      if (!m.quoted.sticker) return await m.send("_Reply to the sticker to unmute_")
      const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
      if (!bl.stk.includes(hash)) return await m.send("_Sticker is not muted_")
      bl.stk = bl.stk.filter(h => h !== hash)
      await storeData("blacklisted", _b)
      return await m.send("_Sticker unmuted_")
    }

    // Unmute user
    const input = m.mentionedJid?.[0] || m.quoted?.sender || text
    if (!input) return await m.send("_Need user…_")
    const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
    if (await isadminn(m, user)) return await m.send("_User is an admin_")
    if (!bl.users.includes(user)) return await m.send("_User is not muted_")
    bl.users = bl.users.filter(u => u !== user)
    await storeData("blacklisted", _b)
    return await m.send(`@${user.split("@")[0]} has been unmuted`, { mentions: [user] })

  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   Listener for Muted Users/Stickers
============================ */

MTRK({
  on: "all",
  fromMe: false,
}, async (m) => {
  try {
    if (!m.isGroup) return
    const botAd = await isBotAdmin(m)
    if (!botAd) return

    const data = await getData("blacklisted")
    if (!data || !data[m.chat]) return

    const bl = data[m.chat]

    // Delete muted user messages
    if (bl.users.includes(m.sender)) return await m.send(m, {}, "delete")

    // Delete muted sticker messages
    if (m.mtype === "stickerMessage" && m.msg?.fileSha256) {
      const hash = Buffer.from(m.msg.fileSha256).toString("hex")
      if (bl.stk.includes(hash)) return await m.send(m, {}, "delete")
    }

  } catch (e) {
    console.log("listener error", e)
  }
})

/* ============================
   Privacy Commands
============================ */

// Last Seen Privacy
MTRK({
  cmd: 'lastseen',
  fromMe: true,
  desc: 'Change last seen privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change last seen privacy settings_`)
    const available = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateLastSeenPrivacy(match)
    await m.send(`_Privacy settings for *last seen* updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Online Privacy
MTRK({
  cmd: 'online',
  fromMe: true,
  desc: 'Change online privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change *online* privacy settings_`)
    const available = ['all', 'match_last_seen']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateOnlinePrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Profile Picture Privacy
MTRK({
  cmd: 'mypp',
  fromMe: true,
  desc: 'Change profile picture privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change profile picture privacy settings_`)
    const available = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateProfilePicturePrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Status Privacy
MTRK({
  cmd: 'mystatus',
  fromMe: true,
  desc: 'Change status privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change status privacy settings_`)
    const available = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateStatusPrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Read Receipts Privacy
MTRK({
  cmd: 'read',
  fromMe: true,
  desc: 'Change read & receipts privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change read & receipts privacy_`)
    const available = ['all', 'none']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateReadReceiptsPrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Group Add Privacy
MTRK({
  cmd: 'allow-gcadd|groupadd',
  fromMe: true,
  desc: 'Change group add privacy',
  type: 'privacy'
}, async (m, match, cmd) => {
  try {
    if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change group add privacy_`)
    const available = ['all', 'contacts', 'contact_blacklist', 'none']
    if (!available.includes(match)) return await m.send(`_Action must be: ${available.join('/')}._`)
    await m.client.updateGroupsAddPrivacy(match)
    await m.send(`_Privacy updated to *${match}*_`)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   PM & Group Filters + Listener
============================ */

// Set a PM filter
MTRK({
  cmd: "pfilter",
  desc: "Set a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "pfilter")
    await saveFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove a PM filter
MTRK({
  cmd: "pstop",
  desc: "Remove a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (!text) return await m.send("Specify a keyword to remove")
    await removeFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Set a group filter
MTRK({
  cmd: "gfilter",
  desc: "Set a group filter",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "gfilter")
    await saveFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove a group filter
MTRK({
  cmd: "gstop",
  desc: "Remove a group filter",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (!text) return await m.send("Specify a keyword to remove")
    await removeFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Message listener for filters
MTRK({
  on: "text",
  fromMe: false,
}, async (m) => {
  try {
    if (m.sender === m.ownerJid) return

    // PM Filter
    if (!m.isGroup) {
      let global = await getData("pfilter") || {}
      let gmatch = global["pm"]?.[m.body?.toLowerCase()]
      if (gmatch) {
        if (gmatch.type && gmatch.file) {
          let buff = Buffer.from(gmatch.file, "base64")
          return await m.send(buff, { caption: gmatch.caption, mimetype: gmatch.mimetype }, gmatch.type.replace("Message", ""))
        } else {
          return await m.send(gmatch.msg)
        }
      }
      return
    }

    // Group Filter
    let local = await getData("gfilter") || {}
    let res = local[m.chat]?.[m.body?.toLowerCase()]
    if (res) {
      if (res.type && res.file) {
        let buff = Buffer.from(res.file, "base64")
        return await m.send(buff, { caption: res.caption, mimetype: res.mimetype }, res.type.replace("Message", ""))
      } else {
        return await m.send(res.msg)
      }
    }
  } catch (e) {
    console.log("listener error", e)
  }
})

/* ============================
   Mute / Unmute + Auto-delete
============================ */

// Mute a user or sticker
MTRK({
  cmd: "mute-user",
  desc: "Mute a user or a sticker",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "bot",
}, async (m, text) => {
  try {
    const botAd = await isBotAdmin(m)
    if (!botAd) return await m.send("_*✘ Bot Needs To Be Admin!*_")

    const _b = await getData("blacklisted") || {}
    if (!_b[m.chat]) _b[m.chat] = { users: [], stk: [] }
    const bl = _b[m.chat]

    // Sticker mute
    if (text.includes("-s")) {
      if (!m.quoted.sticker) return await m.send("_Reply to the sticker to mute_")
      const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
      if (bl.stk.includes(hash)) return await m.send("_Sticker is already muted_")
      bl.stk.push(hash)
      await storeData("blacklisted", _b)
      return await m.send("_Sticker muted_")
    }

    // User mute
    const input = m.mentionedJid?.[0] || m.quoted?.sender || text
    if (!input) return await m.send('Need user...')
    const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
    if (await isadminn(m, user)) return await m.send("User is an admin")
    if (bl.users.includes(user)) return await m.send("_User is already muted_")
    bl.users.push(user)
    await storeData("blacklisted", _b)
    return await m.send(`@${user.split("@")[0]} has been muted`, { mentions: [user] })
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Unmute a user or sticker
MTRK({
  cmd: "unmute-user",
  desc: "Unmute a user or sticker",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "bot",
}, async (m, text) => {
  try {
    const botAd = await isBotAdmin(m)
    if (!botAd) return await m.send("_*✘ Bot Needs To Be Admin!*_")

    const _b = await getData("blacklisted") || {}
    if (!_b[m.chat]) return await m.send("_No one muted here_")
    const bl = _b[m.chat]

    // Sticker unmute
    if (text.includes("-s")) {
      if (!m.quoted.sticker) return await m.send("_Reply to the sticker to unmute_")
      const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
      if (!bl.stk.includes(hash)) return await m.send("_Sticker is not muted_")
      bl.stk = bl.stk.filter(h => h !== hash)
      await storeData("blacklisted", _b)
      return await m.send("_Sticker unmuted_")
    }

    // User unmute
    const input = m.mentionedJid?.[0] || m.quoted?.sender || text
    if (!input) return await m.send('Need user...')
    const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
    if (await isadminn(m, user)) return await m.send("User is an admin")
    if (!bl.users.includes(user)) return await m.send("_User is not muted_")
    bl.users = bl.users.filter(u => u !== user)
    await storeData("blacklisted", _b)
    return await m.send(`@${user.split("@")[0]} has been unmuted`, { mentions: [user] })
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Auto-delete muted users and stickers
MTRK({
  on: "all",
  fromMe: false
}, async (m) => {
  try {
    if (!m.isGroup) return
    const botAd = await isBotAdmin(m)
    if (!botAd) return

    const data = await getData("blacklisted")
    if (!data || !data[m.chat]) return
    const bl = data[m.chat]

    // Delete muted user messages
    if (bl.users.includes(m.sender)) return await m.send(m, {}, "delete")

    // Delete muted stickers
    if (m.mtype === "stickerMessage" && m.msg?.fileSha256) {
      const hash = Buffer.from(m.msg.fileSha256).toString("hex")
      if (bl.stk.includes(hash)) return await m.send(m, {}, "delete")
    }
  } catch (e) {
    console.log("listener error", e)
  }
})

/* ============================
   Forward + Privacy Commands
============================ */

// Forward a message
MTRK({
  cmd: "forward|fwrd",
  desc: "forward a message",
  fromMe: true,
  type: "user",
}, async (m, text, cmd, store) => {
  try {
    if (!m.quoted) return await m.send("_Reply to the message you want to forward.._")
    if (!text) return await m.send(`_*Provide a number/jid!*_\nExample:\n${cmd} 2348033221144\n${cmd} 2348033221144@s.whatsapp.net\nUse ${prefix}jid to get the jid of a chat`)
    
    let jidd
    if (text.includes("@g.us") || text.includes("@s.whatsapp.net") || text.includes("newsletter")) {
      jidd = text
    } else {
      jidd = `${text}@s.whatsapp.net`
    }
    await m.forwardMessage(jidd, await store.loadMessage(m.chat, m.quoted))
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

/* ============================
   Privacy Commands
============================ */

const privacyCommands = [
  { cmd: "lastseen", desc: "Change last seen privacy", type: "privacy", options: ['all','contacts','contact_blacklist','none'], method: "updateLastSeenPrivacy" },
  { cmd: "online", desc: "Change online privacy", type: "privacy", options: ['all','match_last_seen'], method: "updateOnlinePrivacy" },
  { cmd: "mypp", desc: "Profile picture privacy", type: "privacy", options: ['all','contacts','contact_blacklist','none'], method: "updateProfilePicturePrivacy" },
  { cmd: "mystatus", desc: "Status privacy", type: "privacy", options: ['all','contacts','contact_blacklist','none'], method: "updateStatusPrivacy" },
  { cmd: "read", desc: "Read receipts privacy", type: "privacy", options: ['all','none'], method: "updateReadReceiptsPrivacy" },
  { cmd: "allow-gcadd|groupadd", desc: "Group add privacy", type: "privacy", options: ['all','contacts','contact_blacklist','none'], method: "updateGroupsAddPrivacy" },
]

privacyCommands.forEach(pcmd => {
  MTRK({
    cmd: pcmd.cmd,
    fromMe: true,
    desc: pcmd.desc,
    type: pcmd.type
  }, async (m, match, cmd) => {
    try {
      if (!match) return await m.send(`_*Example:* ${cmd} all\n_to change ${cmd} privacy_`)
      if (!pcmd.options.includes(match)) return await m.send(`_Action must be one of *${pcmd.options.join('/')}*_`)
      await m.client[pcmd.method](match)
      await m.send(`_Privacy Updated to *${match}*_`)
    } catch (e) {
      console.log("cmd error", e)
      return await m.sendErr(e)
    }
  })
})

/* ============================
   PM / Group Filters + Auto-reply
============================ */

// PM Filter (private message)
MTRK({
  cmd: "pfilter",
  desc: "Set a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "pfilter")
    await saveFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove PM filter
MTRK({
  cmd: "pstop",
  desc: "Remove a PM filter",
  fromMe: true,
  pm: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (!text) return await m.send("Specify a keyword to remove")
    await removeFilter(m, text, "pfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Group Filter (admin-only)
MTRK({
  cmd: "gfilter",
  desc: "Set a group filter",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (text.toLowerCase() === "list") return await listFilters(m, "gfilter")
    await saveFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Remove group filter
MTRK({
  cmd: "gstop",
  desc: "Remove a group filter",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "autoreply",
}, async (m, text) => {
  try {
    if (!text) return await m.send("Specify a keyword to remove")
    await removeFilter(m, text, "gfilter")
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})

// Auto-reply listener
MTRK({
  on: "text",
  fromMe: false,
}, async (m) => {
  try {
    if (m.sender === m.ownerJid) return

    // PM filter
    if (!m.isGroup) {
      const global = await getData("pfilter") || {}
      const gmatch = global["pm"]?.[m.body?.toLowerCase()]
      if (gmatch) {
        if (gmatch.type && gmatch.file) {
          const buff = Buffer.from(gmatch.file, "base64")
          return await m.send(buff, { caption: gmatch.caption, mimetype: gmatch.mimetype }, gmatch.type.replace("Message",""))
        } else {
          return await m.send(gmatch.msg)
        }
      }
      return
    }

    // Group filter
    const local = await getData("gfilter") || {}
    const res = local[m.chat]?.[m.body?.toLowerCase()]
    if (res) {
      if (res.type && res.file) {
        const buff = Buffer.from(res.file, "base64")
        return await m.send(buff, { caption: res.caption, mimetype: res.mimetype }, res.type.replace("Message",""))
      } else {
        return await m.send(res.msg)
      }
    }

  } catch (e) {
    console.log("listener error", e)
  }
})

/* ============================
   Bot-only commands (Mute/Unmute + Blacklist)
============================ */

// Mute user or sticker
MTRK({
  cmd: "mute-user",
  desc: "Mute a user or a sticker",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "bot",
}, async (m, text) => {
  const botAd = await isBotAdmin(m)
  if (!botAd) return await m.send("_*✘Bot Needs To Be Admin!*_")

  const _b = await getData("blacklisted") || {}
  if (!_b[m.chat]) _b[m.chat] = { users: [], stk: [] }
  const bl = _b[m.chat]

  if (text.includes("-s")) {
    if (!m.quoted?.sticker) return await m.send("_Reply to the sticker to mute_")
    const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
    if (bl.stk.includes(hash)) return await m.send("_Sticker is already muted_")
    bl.stk.push(hash)
    await storeData("blacklisted", _b)
    return await m.send("_Sticker muted_")
  }

  const input = m.mentionedJid?.[0] || m.quoted?.sender || text
  if (!input) return await m.send("Need user...")
  const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
  if (await isadminn(m, user)) return await m.send("User is an admin")
  if (bl.users.includes(user)) return await m.send("_User is already muted_")
  bl.users.push(user)
  await storeData("blacklisted", _b)
  return await m.send(`@${user.split("@")[0]} has been muted`, { mentions: [user] })
})

// Unmute user or sticker
MTRK({
  cmd: "unmute-user",
  desc: "Unmute a user or sticker",
  fromMe: true,
  gc: true,
  adminOnly: true,
  type: "bot",
}, async (m, text) => {
  const botAd = await isBotAdmin(m)
  if (!botAd) return await m.send("_*✘Bot Needs To Be Admin!*_")

  const _b = await getData("blacklisted") || {}
  if (!_b[m.chat]) return await m.send("_No one muted here_")
  const bl = _b[m.chat]

  if (text.includes("-s")) {
    if (!m.quoted?.sticker) return await m.send("_Reply to the sticker to unmute_")
    const hash = m.quoted.fileSha256 ? Buffer.from(m.quoted.fileSha256).toString('hex') : null
    if (!bl.stk.includes(hash)) return await m.send("_Sticker is not muted_")
    bl.stk = bl.stk.filter(h => h !== hash)
    await storeData("blacklisted", _b)
    return await m.send("_Sticker unmuted_")
  }

  const input = m.mentionedJid?.[0] || m.quoted?.sender || text
  if (!input) return await m.send("Need user...")
  const user = (input.includes('@') ? input.split('@')[0] : input).replace(/\D/g, '') + '@s.whatsapp.net'
  if (await isadminn(m, user)) return await m.send("User is an admin")
  if (!bl.users.includes(user)) return await m.send("_User is not muted_")
  bl.users = bl.users.filter(u => u !== user)
  await storeData("blacklisted", _b)
  return await m.send(`@${user.split("@")[0]} has been unmuted`, { mentions: [user] })
})

// Delete messages from muted users or stickers
MTRK({
  on: "all",
  fromMe: false,
}, async (m) => {
  if (!m.isGroup) return

  const botAd = await isBotAdmin(m)
  if (!botAd) return

  const data = await getData("blacklisted")
  if (!data || !data[m.chat]) return
  const bl = data[m.chat]

  if (bl.users.includes(m.sender)) return await m.send(m, {}, "delete")

  if (m.mtype === "stickerMessage" && m.msg?.fileSha256) {
    const hash = Buffer.from(m.msg.fileSha256).toString("hex")
    if (bl.stk.includes(hash)) return await m.send(m, {}, "delete")
  }
})
