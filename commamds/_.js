/*
 * Copyright © 2025 Mudau Thendo
 * This file is part of MT-RK (Royal) and is licensed under the GNU GPLv3.
 * Handle with care, Royal commands ahead.
 * You may not use this file except in compliance with the License.
 * See the LICENSE file or https://www.gnu.org/licenses/gpl-3.0.html
 * -------------------------------------------------------------------------------
 */

const { format } = require('util');
const os = require('os');
const moment = require('moment-timezone');
const Settings = require('../framework/Class/Settings');
const s = require('../set');
const { cm } = require('../framework/Class/Commands'); // MT-RK command list

module.exports = {
  name: 'menu',
  desc: 'Display all bot commands and system info',
  fromMe: true,
  type: 'bot'
}, async (m, text) => {
  try {
    // Organize commands by category
    let commandsByCategory = {};
    cm.forEach(cmd => {
      if (!commandsByCategory[cmd.categorie]) commandsByCategory[cmd.categorie] = [];
      commandsByCategory[cmd.categorie].push(cmd.nomCom);
    });

    // Date & time
    moment.tz(s.TIMEZONE);
    const date = moment().format('DD/MM/YYYY');
    const time = moment().format('HH:mm:ss');

    // Header
    let msg = `\n╭───『 *${s.BOT_NAME} Menu* 』───\n`;
    msg += `│  Prefix: ${s.PREFIX}\n`;
    msg += `│  Mode: ${Settings.MODE}\n`;
    msg += `│ create: Mudau thendo
    msg += `╰────────────────────\n\n`;

    // Command list
    msg += '╭───『 *COMMAND MENU* 』───\n';
    for (const category in commandsByCategory) {
      msg += `│ ⚔️ ${category.toUpperCase()}:\n`;
      const cmds = commandsByCategory[category];
      for (let i = 0; i < cmds.length; i++) {
        msg += `│ • ${s.PREFIX}${cmds[i]}\n`;
      }
      msg += '│\n';
    }
    msg += '╰────────────────────\n\n';
    msg += `🗡️ *Developers*: Mudau Thendo\n`;
    msg += '✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦';

    // Send menu
    await m.send(msg);

  } catch (err) {
    console.error('Menu Error:', err);
    await m.send('_*somthing went rwong while getting menu*_: ' + err);
  }
});
