/*
 * Copyright © 2025 Mudau Thendo
 * This file is part of MT-RK (Royal) and is licensed under the GNU GPLv3.
 * Handle with care, Royal commands ahead.
 * You may not use this file except in compliance with the License.
 * See the LICENSE file or https://www.gnu.org/licenses/gpl-3.0.html
 * -------------------------------------------------------------------------------
 */

const os = require("os")
const { changeFont } = require("../core")
const { prefix, MTRK, wtype, secondsToHms, config, commands } = require("../core")
const { version } = require("../package.json")

const format = (bytes) => {
  const sizes = ["B", "KB", "MB", "GB"]
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i]
}

function clockString(ms) {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? "--" : Math.floor(ms % 3600000 / 60000)
  let s = isNaN(ms) ? "--" : Math.floor(ms % 60000 / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(":")
}

const getRandomFont = () => {
  return "sansItalic"
}

kord({
  cmd: "menu",
  desc: "list of commands",
  react: "💬",
  fromMe: wtype,
  type: "help",
}, async (m) => {
  try {
    const types = {}
    commands.forEach(({ cmd, type }) => {
      if (!cmd) return
      const main = cmd.split("|")[0].trim()
      const cat = type || "other"
      if (!types[cat]) types[cat] = []
      types[cat].push(main)
    })

    const requestedType = m.text ? m.text.toLowerCase().trim() : null
    const availableTypes = Object.keys(types).map(t => t.toLowerCase())
    
    const more = String.fromCharCode(8206)
    const readmore = more.repeat(4001)
    
    if (requestedType && availableTypes.includes(requestedType)) {
      const actualType = Object.keys(types).find(t => t.toLowerCase() === requestedType)
      
      const at = await changeFont(actualType.toUpperCase(), "monospace")
      const cmdList = types[actualType].map(cmd => 
        `│ ${prefix}${cmd.replace(/[^a-zA-Z0-9-+]/g, "")}`
      ).join('\n')
      const formattedCmds = await changeFont(cmdList, getRandomFont())
      
      let menu = `\`\`\`┌─────── ⨺⃝Х ────────┐
 Category: ${actualType.toUpperCase()}
 Commands: ${types[actualType].length}
 Prefix: ${prefix}
└───────────────────┘\`\`\`
${readmore}

     ┏ ${at} ┓ 
┍────────⨺⃝Х────────┑ 
${formattedCmds}
┕────────⨺⃝Х ───────┙ 

Tip: Use ${prefix}menu to see all categories`
      
      const bodyContent = `     ┏ ${at} ┓ 
┍────────⨺⃝Х────────┑ 
${formattedCmds}
┕────────⨺⃝Х ───────┙ 

Tip: Use ${prefix}menu to see all categories`
      
      const styledBody = await changeFont(bodyContent, getRandomFont())
      const final = `\`\`\`┌────── ⨺⃝Х ──────┐
 Category: ${actualType.toUpperCase()}
 Commands: ${types[actualType].length}
 Prefix: ${prefix}
└──────────────────────┘\`\`\`
${readmore}

${styledBody}`
      return m.send(final)
    }
    
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    const uptime = await secondsToHms(process.uptime())
    const memoryUsage = format(os.totalmem() - os.freemem())
    
    let menu = `┌─────── ⨺⃝Х ───────┐
 Owner: ${config().OWNER_NAME}
 Name: ${config().BOT_NAME}
 Prefix: . 
└─────────────────┘
${readmore}

`

    const categoryList = Object.keys(types).map(async (type) => {
      const cmdList = types[type].map(cmd => 
        `│ ${prefix}${cmd.replace(/[^a-zA-Z0-9-+]/g, "")}`
      ).join('\n')
      const formattedCmds = await changeFont(cmdList, getRandomFont())
      const tty = await changeFont(type.toUpperCase(), "monospace")
      
      return ` ┏ ${tty} ┓
┍────────⨺⃝Х────────┑ 
${formattedCmds}
┕────────⨺⃝─────────┙ `
    })

    const resolvedCategoryList = await Promise.all(categoryList)
    menu += resolvedCategoryList.join('\n\n')


    menu += `\n\nTip: this bot was made by the 彡⨺⃝Х彡 team`

    const final = menu.trim()
 try {
  if (config().MENU_IMAGE)
    return m.send(config().MENU_IMAGE, { caption: final }, "image")
   } catch (e) {}

   return m.send(final)
  } catch (e) {
    console.log("cmd error", e)
    return await m.sendErr(e)
  }
})
