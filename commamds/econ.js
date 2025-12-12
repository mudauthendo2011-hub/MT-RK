/* 
 * Made by MUDAU Thendo
 * Royal Edition © 2025
 * This file is part of MT-RK and is licensed under the GNU GPLv3.
 * Handle with care, and only use in compliance with the License.
 * See the LICENSE file or https://www.gnu.org/licenses/gpl-3.0.html
 * -------------------------------------------------------------------------------
 */

const { MTRK, prefix, wtype, config, getData, storeData } = require("../core")
const fs = require("fs")
const path = require("path")
const edb = require("../core/edb")
if (config().MONGODB_URI) {
var con = edb.connect(config().MONGODB_URI)
} else {
  con = undefined
}
const k = "MTRK"
const stored = path.join(__dirname, '..', 'core', 'store')


module.exports = {
  name: "economy|econ",
  desc: "manage economy commands",
  fromMe: wtype,
  type: "economy"
}, async (m, text) => {
  try {
    if (!config().MONGODB_URI || config().MONGODB_URI === "") {
      return await m.send("```You need to set MONGODB_URI at config\nexample setvar MONGODB_URI=your url..```");
    }

    var edata = await getData("econ") || [];

    if (text && text.toLowerCase() === "off") {
      if (!edata.includes(m.chat)) {
        return await m.send("```💎 Economy Commands Are Already Inactive```");
      }
      edata = edata.filter(chat => chat !== m.chat);
      await storeData("econ", edata);
      return await m.send("```📉 Economy commands deactivated```");
    }

    if (text && text.toLowerCase() === "on") {
      if (edata.includes(m.chat)) {
        return await m.send("```💎 Economy Commands Are Already Active```");
      }
      edata.push(m.chat);
      await storeData("econ", edata);
      return await m.send("```📈 Economy commands activated```");
    }

    if (!edata.includes(m.chat)) {
      edata.push(m.chat);
      await storeData("econ", edata);
    }

    return await m.send("```📈 Economy commands activated```");
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});


module.exports = {
  name: "bal|wallet",
  desc: "[economy] shows user's balance",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const b = await edb.balance(m.sender, k);

    const msg = `
彡─✦『 💰 USER BALANCE 』✦─彡
┃ 💎 Wallet: R${b.wallet}
┃ 🏦 Bank: R${b.bank}/₹${b.bankCapacity}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "💰 Balance Check",
        body: "Your current financial status",
        thumbnail: fs.readFileSync(path.join(stored, 'wallet.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "daily",
  desc: "[economy] claim daily coins",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const d = await edb.daily(m.sender, k, 1001);

    if (d.cd) {
      return await m.send(
        `彡─✦『 ⭕ DAILY COOLDOWN 』✦─彡\n┃ You've already claimed for today\n┃ ⏱️ Come back in: ${d.cdL}\n彡────────────────彡`,
        {
          title: "⏰ Daily Cooldown",
          body: "Come back later for your reward",
          thumbnail: fs.readFileSync(path.join(stored, 'cooldown.png'))
        },
        "ad"
      );
    } else {
      const newBal = await edb.balance(m.sender, k);
      const msg = `
彡─✦『 🎁 DAILY REWARD 』✦─彡
┃ 🎉 You've claimed: R${d.amount}
┃ 💰 New Balance: R${newBal.wallet}
┃ ⏱️ Cooldown: 24 Hours
彡────────────────彡
`;
      return await m.send(
        msg,
        {
          title: "🎁 Daily Reward",
          body: "Successfully claimed your daily coins",
          thumbnail: fs.readFileSync(path.join(stored, 'daily.png'))
        },
        "ad"
      );
    }
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});


module.exports = {
  name: "dep|deposit",
  desc: "[economy] deposit money to bank",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!text) return await m.send("```⚠️ Please specify amount to deposit```");

    const amount = text.toLowerCase() === "all" ? "all" : parseInt(text);
    if (amount !== "all" && (isNaN(amount) || amount <= 0)) {
      return await m.send("```❌ Please provide a valid amount```");
    }

    const result = await edb.deposit(m.sender, k, amount);
    if (result.noten) return await m.send("```💸 Insufficient wallet balance```");

    const newBal = await edb.balance(m.sender, k);
    const msg = `
彡─✦『 🏦 DEPOSIT SUCCESS 』✦─彡
┃ 💰 Deposited: R${result.amount}
┃ 💎 Wallet: R${newBal.wallet}
┃ 🏦 Bank: R${newBal.bank}/₹${newBal.bankCapacity}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "🏦 Bank Deposit",
        body: "Money safely stored in bank",
        thumbnail: fs.readFileSync(path.join(stored, 'deposit.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "with|withdraw",
  desc: "[economy] withdraw money from bank",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!text) return await m.send("```⚠️ Please specify amount to withdraw```");

    const amount = text.toLowerCase() === "all" ? "all" : parseInt(text);
    if (amount !== "all" && (isNaN(amount) || amount <= 0)) {
      return await m.send("```❌ Please provide a valid amount```");
    }

    const result = await edb.withdraw(m.sender, k, amount);
    if (result.noten) return await m.send("```💸 Insufficient bank balance```");
    if (result.invalid) return await m.send("```❌ Invalid amount specified```");

    const newBal = await edb.balance(m.sender, k);

    const msg = `
彡─✦『 💸 WITHDRAW SUCCESS 』✦─彡
┃ 💰 Withdrawn: R${result.amount}
┃ 💎 Wallet: R${newBal.wallet}
┃ 🏦 Bank: R${newBal.bank}/₹${newBal.bankCapacity}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "💸 Bank Withdrawal",
        body: "Money withdrawn to wallet",
        thumbnail: fs.readFileSync(path.join(stored, 'withdraw.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "give|pay",
  desc: "[economy] give money to someone",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!m.quoted && !text) return await m.send("```⚠️ Reply to someone or mention with amount```");

    let target = m.quoted ? m.quoted.sender : m.mentions[0];
    let amount = text ? parseInt(text.split(" ")[1] || text) : parseInt(text);

    if (!target) return await m.send("```❌ Please specify who to pay```");
    if (isNaN(amount) || amount <= 0) return await m.send("```❌ Please provide valid amount```");
    if (target === m.sender) return await m.send("```😂 You cannot pay yourself```");

    const senderBal = await edb.balance(m.sender, k);
    if (senderBal.wallet < amount) return await m.send("```💸 Insufficient wallet balance```");

    await edb.deduct(m.sender, k, amount);
    await edb.give(target, k, amount);

    const msg = `
彡─✦『 💸 PAYMENT SUCCESS 』✦─彡
┃ 💰 Amount: R${amount}
┃ 👤 To: @${target.split("@")[0]}
┃ 💎 Your Balance: R${senderBal.wallet - amount}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "💸 Payment Sent",
        body: "Transaction completed successfully",
        thumbnail: fs.readFileSync(path.join(stored, 'payment.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "work",
  desc: "[economy] work to earn money",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const result = await edb.work(m.sender, k);

    if (result.cd) {
      return await m.send(
        `彡─✦『 ⭕ WORK COOLDOWN 』✦─彡\n┃ You're still tired from work\n┃ ⏱️ Come back in: ${result.cdL}\n彡────────────────彡`,
        {
          title: "😴 Work Cooldown",
          body: "Take a rest before working again",
          thumbnail: fs.readFileSync(path.join(stored, 'tired.png'))
        },
        "ad"
      );
    }

    const jobs = ["Developer", "Designer", "Teacher", "Doctor", "Engineer", "Chef", "Writer", "Artist"];
    const job = jobs[Math.floor(Math.random() * jobs.length)];

    const msg = `
彡─✦『 💼 WORK COMPLETE 』✦─彡
┃ 👷 Job: ${job}
┃ 💰 Earned: R${result.amount}
┃ ⏱️ Cooldown: R${result.cdL}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "💼 Work Complete",
        body: `Worked as ${job} and earned money`,
        thumbnail: fs.readFileSync(path.join(stored, 'work.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "rob",
  desc: "[economy] attempt to rob someone",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!m.quoted && !m.mentions[0]) return await m.send("```⚠️ Reply to someone or mention to rob```");

    const target = m.quoted ? m.quoted.sender : m.mentions[0];
    if (target === m.sender) return await m.send("```😂 You cannot rob yourself```");

    const result = await edb.rob(m.sender, k, target);

    if (result.cd) {
      return await m.send(
        `彡─✦『 ⭕ ROB COOLDOWN 』✦─彡\n┃ You recently attempted robbery\n┃ ⏱️ Come back in: ${result.cdL}\n彡────────────────彡`,
        {
          title: "🚨 Rob Cooldown",
          body: "Lay low for a while",
          thumbnail: fs.readFileSync(path.join(stored, 'police.png'))
        },
        "ad"
      );
    }

    if (result.lowbal) {
      return await m.send("```💸 Target doesn't have enough money to rob```");
    }

    if (result.success) {
      const msg = `
彡─✦『 🎯 ROBBERY SUCCESS 』✦─彡
┃ 💰 Stolen: R${result.amount}
┃ 👤 From: @${target.split("@")[0]}
┃ 😈 You got away with it!
彡────────────────彡
`;
      return await m.send(
        msg,
        {
          title: "🎯 Robbery Success",
          body: "Successfully robbed someone!",
          thumbnail: fs.readFileSync(path.join(stored, 'robbery.png'))
        },
        "ad"
      );
    } else {
      const msg = `
彡─✦『 🚨 ROBBERY FAILED 』✦─彡
┃ 💸 Fine: R${result.fine}
┃ 👮 Caught by guards!
┃ 😢 Better luck next time
彡────────────────彡
`;
      return await m.send(
        msg,
        {
          title: "🚨 Robbery Failed",
          body: "Caught and fined by guard",
          thumbnail: fs.readFileSync(path.join(stored, 'caught.png'))
        },
        "ad"
      );
    }
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
name: "gamble|bet",
  desc: "[economy] gamble your money",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!text) return await m.send("```⚠️ Please specify amount to gamble```");

    const amount = parseInt(text);
    if (isNaN(amount) || amount <= 0) return await m.send("```❌ Please provide valid amount```");

    const userBal = await edb.balance(m.sender, k);
    if (userBal.wallet < amount) return await m.send("```💸 Insufficient wallet balance```");

    const win = Math.random() > 0.5;

    if (win) {
      const winAmount = Math.floor(amount * (1 + Math.random()));
      await edb.give(m.sender, k, winAmount);

      const msg = `
彡─✦『 🎰 GAMBLING WIN 』✦─彡
┃ 💰 Bet: R${amount}
┃ 🎉 Won: R${winAmount}
┃ 💎 Profit: R${winAmount}
彡────────────────彡
`;

      return await m.send(
        msg,
        {
          title: "🎰 Gambling Win",
          body: "Lady luck is on your side!",
          thumbnail: fs.readFileSync(path.join(stored, 'jackpot.png'))
        },
        "ad"
      );
    } else {
      await edb.deduct(m.sender, k, amount);

      const msg = `
彡─✦『 💸 GAMBLING LOSS 』✦─彡
┃ 💰 Bet: R${amount}
┃ 😢 Lost: R${amount}
┃ 🎲 Better luck next time
彡────────────────彡
`;

      return await m.send(
        msg,
        {
          title: "💸 Gambling Loss",
          body: "Not your lucky day",
          thumbnail: fs.readFileSync(path.join(stored, 'loss.png'))
        },
        "ad"
      );
    }
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "lb|leaderboard|top|rich",
  desc: "[economy] show richest users",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const count = parseInt(text) || 10;
    const lb = await edb.lb(k, count > 20 ? 20 : count);

    if (lb.length === 0) {
      return await m.send(
        "彡─✦『 🏆 LEADERBOARD 』✦─彡\n┃ No users found in economy\n彡────────────────彡",
        {
          title: "🏆 Economy Leaderboard",
          body: "Top richest users in the chat",
          thumbnail: fs.readFileSync(path.join(stored, 'leaderboard.png'))
        },
        "ad"
      );
    }

    let msg = "彡─✦『 🏆 LEADERBOARD 』✦─彡\n";
    for (let i = 0; i < lb.length; i++) {
      const pos = i + 1;
      const user = lb[i];
      const total = user.wallet + user.bank;
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `${pos}.`;
      msg += `┃ ${medal} @${user.userID.split("@")[0]}: ₹${total}\n`;
    }
    msg += "彡────────────────彡";

    return await m.send(
      msg,
      {
        title: "🏆 Economy Leaderboard",
        body: "Top richest users in the chat",
        thumbnail: fs.readFileSync(path.join(stored, 'leaderboard.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "shop",
  desc: "[economy] view available items",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const shop = await edb.getShop();

    if (shop.length === 0) {
      return await m.send(
        "彡─✦『 🛒 ITEM SHOP 』✦─彡\n┃ No items available in the shop\n彡────────────────彡",
        {
          title: "🛒 Item Shop",
          body: "Browse available items to purchase",
          thumbnail: fs.readFileSync(path.join(stored, 'shop.png'))
        },
        "ad"
      );
    }

    let msg = "彡─✦『 🛒 ITEM SHOP 』✦─彡\n";
    shop.forEach((item, i) => {
      msg += `┃ ${i + 1}. ${item.name}\n┃    💰 Price: ₹${item.price}\n┃    📝 ${item.description}\n`;
    });
    msg += "彡────────────────彡";

    return await m.send(
      msg,
      {
        title: "🛒 Item Shop",
        body: "Browse available items to purchase",
        thumbnail: fs.readFileSync(path.join(stored, 'shop.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "buy",
  desc: "[economy] buy items from shop",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");
    if (!text) return await m.send("```⚠️ Please specify item name or number```");

    const result = await edb.buyItem(m.sender, k, text);

    if (result.notfound) {
      return await m.send("```❌ Item not found in shop```");
    }
    if (result.insufficient) {
      return await m.send("```💸 Insufficient balance to buy this item```");
    }

    const msg = `
彡─✦『 🛒 PURCHASE SUCCESS 』✦─彡
┃ 🎁 Item: ${result.item.name}
┃ 💰 Price: R${result.item.price}
┃ 💎 Remaining: R${result.newBalance}
彡────────────────彡
`;

    return await m.send(
      msg,
      {
        title: "🛒 Purchase Complete",
        body: `Successfully bought ${result.item.name}`,
        thumbnail: fs.readFileSync(path.join(stored, 'purchase.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});

module.exports = {
  name: "inv|inventory",
  desc: "[economy] view your inventory",
  fromMe: wtype,
  type: "economy",
}, async (m, text) => {
  try {
    var x = await getData("econ") || [];
    if (!x.includes(m.chat)) return await m.send("```💎 Economy Is Not Activated Here```");

    const inv = await edb.getInventory(m.sender, k);

    if (inv.length === 0) {
      return await m.send(
        "彡─✦『 📦 INVENTORY 』✦─彡\n┃ Your inventory is empty\n┃ Buy some items from the shop\n彡────────────────彡",
        {
          title: "📦 Empty Inventory",
          body: "Buy some items from shop",
          thumbnail: fs.readFileSync(path.join(stored, 'empty.png'))
        },
        "ad"
      );
    }

    let msg = "彡─✦『 📦 INVENTORY 』✦─彡\n";
    inv.forEach((item, i) => {
      msg += `┃ ${i + 1}. ${item.name} x${item.quantity}\n┃    📝 ${item.description}\n`;
    });
    msg += "彡────────────────彡";

    return await m.send(
      msg,
      {
        title: "📦 Your Inventory",
        body: "Items you currently own",
        thumbnail: fs.readFileSync(path.join(stored, 'inventory.png'))
      },
      "ad"
    );
  } catch (e) {
    console.log("cmd error", e);
    return await m.sendErr(e);
  }
});
