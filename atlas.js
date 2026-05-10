console.log(">>> GLORIOUS SHOP BOT LOADED <<<");

const {
  Client, GatewayIntentBits, Partials, Collection,
  EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder,
  TextInputStyle, PermissionsBitField, AuditLogEvent,
  ActivityType, Status,
} = require("discord.js");
const express = require("express");
const fs = require("fs");

// ══════════════════════════════════════════════════════════════
//  KEEP ALIVE
// ══════════════════════════════════════════════════════════════
const app = express();
app.get("/", (_, res) => res.send("OK"));
app.listen(10000, "0.0.0.0", () => console.log("Keep-alive on :10000"));

// ══════════════════════════════════════════════════════════════
//  BOT INIT
// ══════════════════════════════════════════════════════════════
const TOKEN    = process.env.TOKEN;
const GUILD_ID = "1490079978300117212";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

// ══════════════════════════════════════════════════════════════
//  ROLE IDs
// ══════════════════════════════════════════════════════════════
const CEO_ROLE_ID            = "1490084094749573151";
const OWNER_ROLE_ID          = "1490084247682285699";
const CO_OWNER_ROLE_ID       = "1490136469287993464";
const CREATOR_ROLE_ID        = "1502327656019005530";
const MANAGER_ROLE_ID        = "1490134503249936525";
const STAFF_ROLE_ID          = "1490088402656170045";
const DONATE_MANAGER_ROLE_ID = "1490134506793861193";

const AUTOROLE_ID  = "1502329776252256266";
const DUTY_ROLE_ID = "1490338840395649266";

// ══════════════════════════════════════════════════════════════
//  CHANNEL IDs
// ══════════════════════════════════════════════════════════════
const SUPPORT_CATEGORY_ID  = "1502327809719406673";
const BUY_PANEL_CATEGORY_ID = "1502327808825884874";
const SERVICES_CATEGORY_ID  = "1502347790653722704";

const BOT_LOG_ID                    = "1502327881055998084";
const MESSAGE_EDIT_LOG_CHANNEL_ID   = "1502327886030569544";
const MESSAGE_DELETE_LOG_CHANNEL_ID = "1502327886030569544";
const MEMBER_JOIN_LOG_CHANNEL_ID    = "1502327883232841801";
const MEMBER_LEAVE_LOG_CHANNEL_ID   = "1502327883232841801";
const ROLE_UPDATE_LOG_CHANNEL_ID    = "1502327884881334343";
const VOICE_LOG_CHANNEL_ID          = "1502327881991192778";
const CHANNEL_CREATE_LOG_CHANNEL_ID = "1502328585451733053";
const CHANNEL_DELETE_LOG_CHANNEL_ID = "1502328585451733053";
const ROLE_CREATE_LOG_CHANNEL_ID    = "1502327884881334343";
const ROLE_DELETE_LOG_CHANNEL_ID    = "1502327884881334343";
const TICKET_LOG_ID                 = "1502327879864680498";
const DUTY_LOG_CHANNEL_ID           = "1502447599670788106";
const DUTY_LEADERBOARD_CHANNEL_ID   = "1502447599670788106";
const SECURITY_LOG_CHANNEL_ID       = "1502328608805486765";
const SUGGESTION_CHANNEL_ID         = "1502328608805486765";
const REVIEW_CHANNEL_ID             = "1502327876249190491";
const INVITE_LOG_CHANNEL_ID         = "1502328657958404189";

const MEMBERS_CHANNEL_ID = "1502447935378423908";
const BOTS_CHANNEL_ID    = "1502448235577479248";
const ONLINE_CHANNEL_ID  = "1502448168544243833";
const BOOSTS_CHANNEL_ID  = "1502448264820035625";

const TEMP_VOICE_CATEGORY_ID = "1502349327165554698";
const TEMP_VOICE_CHANNEL_ID  = "1502340058399641670";

// ══════════════════════════════════════════════════════════════
//  BRANDING
// ══════════════════════════════════════════════════════════════
const SERVER_NAME          = "Glorious Shop";
const SERVER_THUMBNAIL_URL = "https://i.imgur.com/F6vMnVL.jpeg";
const BANNER_SUPPORT       = "https://i.imgur.com/YL0btaL.jpeg";
const BANNER_BUY           = "https://i.imgur.com/YL0btaL.jpeg";
const BANNER_SERVICES      = "https://i.imgur.com/YL0btaL.jpeg";
const BANNER_SUGGEST       = "https://i.imgur.com/YL0btaL.jpeg";
const BANNER_REVIEW        = "https://i.imgur.com/YL0btaL.jpeg";

// ══════════════════════════════════════════════════════════════
//  PERMISSION HELPERS
// ══════════════════════════════════════════════════════════════
function hasRole(member, ...roleIds) {
  return roleIds.some(id => member.roles.cache.has(id));
}
const isCeo            = m => hasRole(m, CEO_ROLE_ID);
const isOwnerOrAbove   = m => hasRole(m, CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID);
const isStaffOrAbove   = m => hasRole(m, CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID, CREATOR_ROLE_ID, MANAGER_ROLE_ID, STAFF_ROLE_ID);
const isManagerOrAbove = m => hasRole(m, CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID, CREATOR_ROLE_ID, MANAGER_ROLE_ID);
const hasModPerms      = m => m.permissions.has(PermissionsBitField.Flags.KickMembers) ||
                              m.permissions.has(PermissionsBitField.Flags.BanMembers) ||
                              isStaffOrAbove(m);

// ══════════════════════════════════════════════════════════════
//  DATA FILES
// ══════════════════════════════════════════════════════════════
const DUTY_FILE     = "duty.json";
const SECURITY_FILE = "security.json";
const INVITE_FILE   = "invites.json";

function loadJSON(file, def = {}) {
  try {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(def, null, 4)); return def; }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch { return def; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

let dutyData     = loadJSON(DUTY_FILE);
let securityData = loadJSON(SECURITY_FILE, { spam: {}, ban_kick_tracker: {}, alts: [] });
let inviteData   = loadJSON(INVITE_FILE);
const inviteCache = new Map();

let ALT_ACCOUNT_AGE_DAYS = 30;
let ALT_AUTO_KICK        = true;
const WHITELISTED_BOT_IDS = new Set();

const URL_PATTERN   = /(https?:\/\/|www\.)\S+|discord\.gg\/\S+/gi;
const TOKEN_PATTERN = /[MNO][a-zA-Z0-9_-]{23,25}\.[a-zA-Z0-9_-]{6}\.[a-zA-Z0-9_-]{27,38}/;

const spamTracker    = {};
const banKickTracker = {};
const pendingBots    = {};

// ══════════════════════════════════════════════════════════════
//  DUTY HELPERS
// ══════════════════════════════════════════════════════════════
function getTotalSeconds(uid, now) {
  const d = dutyData[uid];
  if (!d || typeof d !== "object") return 0;
  let total = d.total_seconds || 0;
  if (d.start_time) total += now - d.start_time;
  return total;
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h}h ${m}m ${s}s`;
}

// ══════════════════════════════════════════════════════════════
//  SECURITY ALERT HELPER
// ══════════════════════════════════════════════════════════════
async function sendSecurityAlert(guild, embed, ping = true) {
  const ch = guild.channels.cache.get(SECURITY_LOG_CHANNEL_ID);
  if (!ch) return;
  const ceoRole = guild.roles.cache.get(CEO_ROLE_ID);
  const content = ping && ceoRole ? ceoRole.toString() : null;
  await ch.send({ content, embeds: [embed] }).catch(() => {});
}

// ══════════════════════════════════════════════════════════════
//  VOICE COUNTERS
// ══════════════════════════════════════════════════════════════
async function updateVoiceChannels(guild) {
  const members = await guild.members.fetch().catch(() => guild.members.cache);
  const updates = [
    [MEMBERS_CHANNEL_ID, `👤 Members: ${members.filter(m => !m.user.bot).size}`],
    [BOTS_CHANNEL_ID,    `🤖 Bots: ${members.filter(m => m.user.bot).size}`],
    [ONLINE_CHANNEL_ID,  `🟢 Online: ${members.filter(m => m.presence?.status !== "offline" && m.presence?.status).size}`],
    [BOOSTS_CHANNEL_ID,  `🚀 Boosts: ${guild.premiumSubscriptionCount || 0}`],
  ];
  for (const [id, name] of updates) {
    const ch = guild.channels.cache.get(id);
    if (ch) await ch.setName(name).catch(() => {});
  }
}

// ══════════════════════════════════════════════════════════════
//  MASS BAN/KICK TRACKER
// ══════════════════════════════════════════════════════════════
async function trackMassAction(guild, moderator, actionType) {
  if (!moderator) return;
  const uid = moderator.id;
  const now = Date.now() / 1000;
  if (!banKickTracker[uid]) banKickTracker[uid] = [];
  banKickTracker[uid].push(now);
  banKickTracker[uid] = banKickTracker[uid].filter(t => now - t < 10);

  if (banKickTracker[uid].length >= 3) {
    banKickTracker[uid] = [];
    const mm     = guild.members.cache.get(uid);
    const exempt = [CEO_ROLE_ID, OWNER_ROLE_ID];
    const isEx   = mm && exempt.some(r => mm.roles.cache.has(r));
    if (mm && !isEx) {
      await mm.timeout(7 * 24 * 60 * 60 * 1000, `Mass ${actionType}`).catch(() => {});
      const e = new EmbedBuilder()
        .setTitle(`⚠️ Mass ${actionType.toUpperCase()} Detected!`)
        .setDescription(`${mm} performed mass ${actionType}.\n**1 week timeout** applied.`)
        .setColor(0x8B0000)
        .setTimestamp();
      await sendSecurityAlert(guild, e, true);
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  TICKET CHANNEL CREATION HELPER
// ══════════════════════════════════════════════════════════════
async function createTicketChannel(interaction, { categoryId, name, title, desc, color, roleIds, banner, footer }) {
  const guild  = interaction.guild;
  const author = interaction.user;
  const member = interaction.member;
  const cat    = guild.channels.cache.get(categoryId);
  if (!cat) return interaction.reply({ content: "❌ Category not found.", ephemeral: true });

  const overwrites = [
    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    { id: author.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
  ];
  for (const rid of roleIds) {
    const r = guild.roles.cache.get(rid);
    if (r) overwrites.push({ id: r.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] });
  }

  const ch = await guild.channels.create({
    name,
    parent: cat.id,
    permissionOverwrites: overwrites,
  });

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setColor(color)
    .setImage(banner)
    .setThumbnail(SERVER_THUMBNAIL_URL)
    .setFooter({ text: footer });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("close_ticket_button").setLabel("🔒 Close Ticket").setStyle(ButtonStyle.Danger)
  );
  await ch.send({ embeds: [embed], components: [closeRow] });

  const lc = guild.channels.cache.get(TICKET_LOG_ID);
  if (lc) {
    const le = new EmbedBuilder()
      .setTitle(`📂 New Ticket — ${title}`)
      .setColor(0x0099ff)
      .setThumbnail(author.displayAvatarURL())
      .addFields(
        { name: "👤 From",     value: `${author}`, inline: true },
        { name: "📋 Category", value: title,        inline: true },
        { name: "📁 Channel",  value: `${ch}`,      inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Ticket Log` })
      .setTimestamp();
    await lc.send({ embeds: [le] });
  }

  await interaction.reply({ content: `✅ Ticket created: ${ch}`, ephemeral: true });
}

// ══════════════════════════════════════════════════════════════
//  INTERACTION HANDLER
// ══════════════════════════════════════════════════════════════
client.on("interactionCreate", async interaction => {
  try {
    // ── BUTTONS ──────────────────────────────────────────────
    if (interaction.isButton()) {
      // Close Ticket
      if (interaction.customId === "close_ticket_button") {
        const lc = interaction.guild.channels.cache.get(TICKET_LOG_ID);
        if (lc) {
          const e = new EmbedBuilder()
            .setTitle("❌ Ticket Closed")
            .setColor(0xff0000)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
              { name: "🔒 Closed by", value: `${interaction.user}`,          inline: true },
              { name: "📁 Channel",   value: interaction.channel.name,        inline: true },
            )
            .setFooter({ text: `${SERVER_NAME} • Ticket Log` })
            .setTimestamp();
          await lc.send({ embeds: [e] });
        }
        await interaction.reply({ content: "🔒 Closing in 4 seconds..." });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 4000);
        return;
      }

      // Duty: On Duty
      if (interaction.customId === "duty_on") {
        const member = interaction.member;
        const dr = interaction.guild.roles.cache.get(DUTY_ROLE_ID);
        if (dr && member.roles.cache.has(DUTY_ROLE_ID))
          return interaction.reply({ content: "⚠️ You are already On Duty!", ephemeral: true });
        if (dr) await member.roles.add(dr).catch(() => {});
        const uid = interaction.user.id;
        if (!dutyData[uid] || typeof dutyData[uid] !== "object") dutyData[uid] = { total_seconds: 0 };
        dutyData[uid].start_time = Date.now() / 1000;
        saveJSON(DUTY_FILE, dutyData);
        const log = interaction.guild.channels.cache.get(DUTY_LOG_CHANNEL_ID);
        if (log) {
          const e = new EmbedBuilder()
            .setTitle("🟢 On Duty").setColor(0x00ff00)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`${interaction.user} is now **On Duty**.`)
            .setFooter({ text: `${SERVER_NAME} • Duty Log | User ID: ${interaction.user.id}` })
            .setTimestamp();
          await log.send({ embeds: [e] });
        }
        return interaction.reply({ content: "✅ You are now **On Duty**!", ephemeral: true });
      }

      // Duty: Off Duty
      if (interaction.customId === "duty_off") {
        const member = interaction.member;
        const dr = interaction.guild.roles.cache.get(DUTY_ROLE_ID);
        if (!member.roles.cache.has(DUTY_ROLE_ID))
          return interaction.reply({ content: "⚠️ You are not On Duty!", ephemeral: true });
        if (dr) await member.roles.remove(dr).catch(() => {});
        const uid = interaction.user.id;
        let sessionSecs = 0;
        if (dutyData[uid]?.start_time) {
          sessionSecs = Date.now() / 1000 - dutyData[uid].start_time;
          dutyData[uid].total_seconds = (dutyData[uid].total_seconds || 0) + sessionSecs;
          delete dutyData[uid].start_time;
          saveJSON(DUTY_FILE, dutyData);
        }
        const ds    = formatDuration(sessionSecs);
        const total = dutyData[uid]?.total_seconds || 0;
        const th    = Math.floor(total / 3600);
        const tm    = Math.floor((total % 3600) / 60);
        const log   = interaction.guild.channels.cache.get(DUTY_LOG_CHANNEL_ID);
        if (log) {
          const e = new EmbedBuilder()
            .setTitle("🔴 Off Duty").setColor(0xff0000)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`${interaction.user} went **Off Duty**.`)
            .addFields(
              { name: "⏱ Session", value: ds,              inline: true },
              { name: "📊 Total",  value: `${th}h ${tm}m`, inline: true },
            )
            .setFooter({ text: `${SERVER_NAME} • Duty Log | User ID: ${interaction.user.id}` })
            .setTimestamp();
          await log.send({ embeds: [e] });
        }
        return interaction.reply({ content: `✅ **Off Duty!** Session: **${ds}** | Total: **${th}h ${tm}m**`, ephemeral: true });
      }

      // Duty: Status
      if (interaction.customId === "duty_status") {
        const guild = interaction.guild;
        const dr    = guild.roles.cache.get(DUTY_ROLE_ID);
        const now   = Date.now() / 1000;
        const onDutyMembers = [];
        if (dr) {
          for (const [, m] of guild.members.cache) {
            if (m.roles.cache.has(DUTY_ROLE_ID) && !m.user.bot) {
              const uid = m.user.id;
              if (dutyData[uid]?.start_time) {
                const elapsed = now - dutyData[uid].start_time;
                onDutyMembers.push(`🟢 ${m} — \`${formatDuration(elapsed)}\``);
              } else {
                onDutyMembers.push(`🟢 ${m} — \`0h 0m 0s\``);
              }
            }
          }
        }
        const e = new EmbedBuilder()
          .setTitle("📋 Duty Status").setColor(0x5865f2)
          .setDescription(onDutyMembers.length ? onDutyMembers.join("\n") : "❌ Nobody is On Duty right now.")
          .setFooter({ text: `${onDutyMembers.length} member(s) on duty | ${SERVER_NAME}` })
          .setTimestamp();
        return interaction.reply({ embeds: [e], ephemeral: true });
      }

      // Duty: Leaderboard
      if (interaction.customId === "duty_leaderboard_btn") {
        const guild = interaction.guild;
        const now   = Date.now() / 1000;
        const dr    = guild.roles.cache.get(DUTY_ROLE_ID);
        const totals = Object.entries(dutyData)
          .filter(([, d]) => typeof d === "object")
          .map(([uid, d]) => [uid, getTotalSeconds(uid, now)])
          .filter(([, s]) => s > 0)
          .sort((a, b) => b[1] - a[1]);
        const medals = ["🥇", "🥈", "🥉"];
        let desc = "";
        for (let i = 0; i < Math.min(10, totals.length); i++) {
          const [uid, secs] = totals[i];
          const member = guild.members.cache.get(uid);
          const name   = member ? member.displayName : `User ${uid}`;
          const hh     = Math.floor(secs / 3600);
          const mn     = Math.floor((secs % 3600) / 60);
          const medal  = i < 3 ? medals[i] : `**#${i + 1}**`;
          const isOn   = member && dr && member.roles.cache.has(DUTY_ROLE_ID) ? " 🟢" : "";
          desc += `${medal} ${name}${isOn} — \`${hh}h ${mn}m\`\n`;
        }
        const e = new EmbedBuilder()
          .setTitle("🏆 Duty Leaderboard").setColor(0xffd700)
          .setDescription(desc || "No duty data yet.")
          .setFooter({ text: `🟢 = Currently on duty • Times never reset | ${SERVER_NAME}` })
          .setTimestamp();
        return interaction.reply({ embeds: [e], ephemeral: true });
      }

      // Suggestion button
      if (interaction.customId === "make_suggestion_btn") {
        const modal = new ModalBuilder()
          .setCustomId("suggestion_modal")
          .setTitle("💡 Make a Suggestion")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("suggestion_input")
                .setLabel("Your suggestion")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Write your suggestion here...")
                .setRequired(true)
                .setMaxLength(1000)
            )
          );
        return interaction.showModal(modal);
      }

      // Review button
      if (interaction.customId === "make_review_btn") {
        const ratingRow = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("star_select_review")
            .setPlaceholder("⭐ Select your rating...")
            .addOptions([
              { label: "⭐ 1 Star",          emoji: "⭐", value: "1" },
              { label: "⭐⭐ 2 Stars",        emoji: "⭐", value: "2" },
              { label: "⭐⭐⭐ 3 Stars",      emoji: "⭐", value: "3" },
              { label: "⭐⭐⭐⭐ 4 Stars",    emoji: "⭐", value: "4" },
              { label: "⭐⭐⭐⭐⭐ 5 Stars",  emoji: "⭐", value: "5" },
            ])
        );
        const e = new EmbedBuilder()
          .setTitle("⭐ Select Your Rating")
          .setDescription("Choose your star rating, then write your review!")
          .setColor(0xffd700);
        return interaction.reply({ embeds: [e], components: [ratingRow], ephemeral: true });
      }

      // Bot verification: Accept
      if (interaction.customId.startsWith("bot_accept_")) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
          return interaction.reply({ content: "❌ Admins only.", ephemeral: true });
        const botId = interaction.customId.replace("bot_accept_", "");
        delete pendingBots[botId];
        const botMember = interaction.guild.members.cache.get(botId);
        if (botMember) {
          for (const [, ch] of interaction.guild.channels.cache) {
            await ch.permissionOverwrites.delete(botMember, "Bot accepted").catch(() => {});
          }
        }
        const e = new EmbedBuilder()
          .setTitle("✅ Bot Accepted")
          .setDescription(`**${botMember?.user?.tag ?? botId}** was accepted by ${interaction.user}.`)
          .setColor(0x00ff00).setTimestamp();
        await interaction.message.edit({ embeds: [e], components: [] });
        return interaction.reply({ content: "✅ Bot accepted!", ephemeral: true });
      }

      // Bot verification: Deny
      if (interaction.customId.startsWith("bot_deny_")) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
          return interaction.reply({ content: "❌ Admins only.", ephemeral: true });
        const botId     = interaction.customId.replace("bot_deny_", "");
        const botMember = interaction.guild.members.cache.get(botId);
        let kicked = false;
        if (botMember) {
          await botMember.kick(`Bot denied by ${interaction.user.tag}`).then(() => kicked = true).catch(() => {});
        }
        delete pendingBots[botId];
        const e = new EmbedBuilder()
          .setTitle("❌ Bot Denied & Kicked")
          .setDescription(`**${botMember?.user?.tag ?? botId}** kicked by ${interaction.user}.\nKick: ${kicked ? "✅" : "❌"}`)
          .setColor(0xff0000).setTimestamp();
        await interaction.message.edit({ embeds: [e], components: [] });
        return interaction.reply({ content: "❌ Bot denied and kicked.", ephemeral: true });
      }
    }

    // ── SELECT MENUS ──────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      // Support Ticket
      if (interaction.customId === "support_ticket_select") {
        const v = interaction.values[0];
        const author = interaction.user;
        const configs = {
          admin: {
            name:    `admin-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "👑 Talk to Administrator",
            roleIds: [CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
            desc:    `Hello ${author}!\n\nA member of the **Administration** will be with you shortly.\nPlease describe your matter below.\n\n*One active ticket at a time.*`,
            color:   0xffd700,
          },
          support: {
            name:    `support-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "💬 Support Ticket",
            roleIds: [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
            desc:    `Hello ${author}!\n\nOur **Support Team** will assist you shortly.\nPlease describe your issue below.\n\n*One active ticket at a time.*`,
            color:   0x5865f2,
          },
          report: {
            name:    `report-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "📋 Report Ticket",
            roleIds: [OWNER_ROLE_ID, CEO_ROLE_ID],
            desc:    `Hello ${author}!\n\nPlease provide full details of the **report** below.\nInclude usernames, timestamps and any evidence.\n\n*One active ticket at a time.*`,
            color:   0xff0000,
          },
          purchase: {
            name:    `purchase-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "🛒 Help with a Purchase",
            roleIds: [CEO_ROLE_ID],
            desc:    `Hello ${author}!\n\nA **CEO** team member will help you with your purchase shortly.\nPlease provide your order details below.\n\n*One active ticket at a time.*`,
            color:   0x00ff00,
          },
          other: {
            name:    `other-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "📌 Other Ticket",
            roleIds: [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID, CEO_ROLE_ID, CO_OWNER_ROLE_ID],
            desc:    `Hello ${author}!\n\nOur team will be with you shortly.\nPlease explain your request below.\n\n*One active ticket at a time.*`,
            color:   0x141428,
          },
        };
        const cfg = configs[v];
        return createTicketChannel(interaction, {
          categoryId: SUPPORT_CATEGORY_ID,
          banner:     BANNER_SUPPORT,
          footer:     `${SERVER_NAME} • Support System`,
          ...cfg,
        });
      }

      // Buy Ticket
      if (interaction.customId === "buy_ticket_select") {
        const v      = interaction.values[0];
        const author = interaction.user;
        const configs = {
          buy_product: {
            name:    `buy-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "🛍️ Buy a Product",
            roleIds: [CEO_ROLE_ID, DONATE_MANAGER_ROLE_ID],
            desc:    `Hello ${author}!\n\nThank you for your interest in purchasing a product!\nPlease let us know **what you'd like to buy** and a team member will assist you.\n\n*One active ticket at a time.*`,
            color:   0x00ff00,
          },
          make_order: {
            name:    `order-${author.username}`.toLowerCase().replace(/ /g, "-"),
            title:   "📦 Make an Order",
            roleIds: [CEO_ROLE_ID, CREATOR_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
            desc:    `Hello ${author}!\n\nPlease describe your **custom order** in as much detail as possible.\nOur team will review it and get back to you shortly.\n\n*One active ticket at a time.*`,
            color:   0xffa500,
          },
        };
        const cfg = configs[v];
        return createTicketChannel(interaction, {
          categoryId: BUY_PANEL_CATEGORY_ID,
          banner:     BANNER_BUY,
          footer:     `${SERVER_NAME} • Buy Panel`,
          ...cfg,
        });
      }

      // Services Ticket
      if (interaction.customId === "services_ticket_select") {
        const author = interaction.user;
        return createTicketChannel(interaction, {
          categoryId: SERVICES_CATEGORY_ID,
          name:       `service-${author.username}`.toLowerCase().replace(/ /g, "-"),
          title:      "⚙️ Buy a Service",
          roleIds:    [CEO_ROLE_ID],
          desc:       `Hello ${author}!\n\nThank you for your interest in one of our **services**!\nPlease describe the service you'd like and our CEO team will be in touch shortly.\n\n*One active ticket at a time.*`,
          color:      0x5865f2,
          banner:     BANNER_SERVICES,
          footer:     `${SERVER_NAME} • Services`,
        });
      }

      // Star rating for review
      if (interaction.customId === "star_select_review") {
        const stars = parseInt(interaction.values[0]);
        const modal = new ModalBuilder()
          .setCustomId(`review_modal_${stars}`)
          .setTitle("⭐ Write a Review")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("review_input")
                .setLabel("Your review")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Share your experience...")
                .setRequired(true)
                .setMaxLength(1000)
            )
          );
        return interaction.showModal(modal);
      }
    }

    // ── MODALS ────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      // Suggestion
      if (interaction.customId === "suggestion_modal") {
        const text = interaction.fields.getTextInputValue("suggestion_input");
        const ch   = interaction.guild.channels.cache.get(SUGGESTION_CHANNEL_ID);
        if (!ch) return interaction.reply({ content: "❌ Channel not found.", ephemeral: true });
        const e = new EmbedBuilder()
          .setTitle("💡 New Suggestion")
          .setDescription(text)
          .setColor(0x5865f2)
          .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
          .setThumbnail(SERVER_THUMBNAIL_URL)
          .setFooter({ text: `User ID: ${interaction.user.id} • ${SERVER_NAME}` })
          .setTimestamp();
        const msg = await ch.send({ embeds: [e] });
        await msg.react("👍");
        await msg.react("👎");
        return interaction.reply({ content: "✅ Suggestion submitted!", ephemeral: true });
      }

      // Review
      if (interaction.customId.startsWith("review_modal_")) {
        const stars = parseInt(interaction.customId.replace("review_modal_", ""));
        const text  = interaction.fields.getTextInputValue("review_input");
        const ch    = interaction.guild.channels.cache.get(REVIEW_CHANNEL_ID);
        if (!ch) return interaction.reply({ content: "❌ Channel not found.", ephemeral: true });
        const sd = "⭐".repeat(stars) + "☆".repeat(5 - stars);
        const colorMap = { 1: 0xff0000, 2: 0xff8800, 3: 0xffff00, 4: 0x00ff00, 5: 0xffd700 };
        const e = new EmbedBuilder()
          .setTitle("⭐ New Review")
          .setColor(colorMap[stars] || 0x5865f2)
          .addFields(
            { name: "Rating",  value: sd,   inline: false },
            { name: "Comment", value: text, inline: false },
          )
          .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
          .setThumbnail(SERVER_THUMBNAIL_URL)
          .setFooter({ text: `User ID: ${interaction.user.id} • ${SERVER_NAME}` })
          .setTimestamp();
        await ch.send({ embeds: [e] });
        return interaction.reply({ content: `✅ Review submitted! (${sd})`, ephemeral: true });
      }
    }
  } catch (err) {
    console.error("Interaction error:", err);
    try {
      if (!interaction.replied && !interaction.deferred)
        await interaction.reply({ content: "❌ An error occurred.", ephemeral: true });
    } catch {}
  }
});

// ══════════════════════════════════════════════════════════════
//  VOICE STATE UPDATE
// ══════════════════════════════════════════════════════════════
client.on("voiceStateUpdate", async (before, after) => {
  const member = after.member || before.member;
  const guild  = member.guild;
  const log    = guild.channels.cache.get(VOICE_LOG_CHANNEL_ID);

  // Temp voice creation
  if (after.channelId === TEMP_VOICE_CHANNEL_ID) {
    const cat = guild.channels.cache.get(TEMP_VOICE_CATEGORY_ID);
    const tc  = await guild.channels.create({
      name:   `${member.user.username}'s Channel`,
      type:   2, // GUILD_VOICE
      parent: cat?.id,
    }).catch(() => null);
    if (tc) {
      await member.voice.setChannel(tc).catch(() => {});
      if (log) {
        const e = new EmbedBuilder()
          .setTitle("📞 Support Channel Created").setColor(0x0000ff)
          .setThumbnail(member.user.displayAvatarURL())
          .addFields(
            { name: "👤 User",    value: `${member} (\`${member.id}\`)`, inline: true },
            { name: "📁 Channel", value: `**${tc.name}**`,               inline: true },
          )
          .setFooter({ text: `${SERVER_NAME} • Voice Log | Channel ID: ${tc.id}` })
          .setTimestamp();
        await log.send({ embeds: [e] });
      }
    }
  }

  // Temp voice deletion
  if (before.channel &&
      before.channel.parentId === TEMP_VOICE_CATEGORY_ID &&
      before.channelId !== TEMP_VOICE_CHANNEL_ID &&
      before.channel.members.size === 0) {
    const nc = before.channel.name;
    await before.channel.delete().catch(() => {});
    if (log) {
      const e = new EmbedBuilder()
        .setTitle("🗑️ Support Channel Deleted").setColor(0xff0000)
        .addFields(
          { name: "📁 Channel", value: `**${nc}**`,     inline: true },
          { name: "📌 Reason",  value: "Empty channel", inline: true },
        )
        .setFooter({ text: `${SERVER_NAME} • Voice Log` })
        .setTimestamp();
      await log.send({ embeds: [e] });
    }
  }

  if (!log) return;

  if (!before.channel && after.channel) {
    const e = new EmbedBuilder()
      .setTitle("🔊 Voice Join").setColor(0x00ff00)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",    value: `${member} (\`${member.id}\`)`, inline: true },
        { name: "🔊 Channel", value: `**${after.channel.name}**`,    inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Voice Log | User ID: ${member.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  } else if (before.channel && !after.channel) {
    const e = new EmbedBuilder()
      .setTitle("🔇 Voice Leave").setColor(0xff0000)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",    value: `${member} (\`${member.id}\`)`, inline: true },
        { name: "🔇 Channel", value: `**${before.channel.name}**`,   inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Voice Log | User ID: ${member.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  } else if (before.channelId !== after.channelId) {
    const e = new EmbedBuilder()
      .setTitle("🔀 Voice Move").setColor(0xffff00)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User", value: `${member} (\`${member.id}\`)`, inline: false },
        { name: "📤 From", value: `**${before.channel.name}**`,   inline: true  },
        { name: "📥 To",   value: `**${after.channel.name}**`,    inline: true  },
      )
      .setFooter({ text: `${SERVER_NAME} • Voice Log | User ID: ${member.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  }
});

// ══════════════════════════════════════════════════════════════
//  GUILD EVENTS (channels, roles)
// ══════════════════════════════════════════════════════════════
client.on("channelCreate", async channel => {
  const log = channel.guild?.channels.cache.get(CHANNEL_CREATE_LOG_CHANNEL_ID);
  if (!log) return;
  let moderator = "Unknown";
  const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate }).catch(() => null);
  if (logs) moderator = logs.entries.first()?.executor?.toString() ?? "Unknown";
  const e = new EmbedBuilder()
    .setTitle("📁 Channel Created").setColor(0x00ff00)
    .addFields(
      { name: "📛 Name",       value: `**${channel.name}**`,                 inline: true },
      { name: "📂 Type",       value: String(channel.type),                  inline: true },
      { name: "👤 By",         value: moderator,                             inline: true },
      { name: "🆔 Channel ID", value: `\`${channel.id}\``,                  inline: true },
    )
    .setFooter({ text: `${SERVER_NAME} • Channel Log` })
    .setTimestamp();
  if (channel.parent) e.addFields({ name: "🗂️ Category", value: channel.parent.name, inline: true });
  await log.send({ embeds: [e] });
});

client.on("channelDelete", async channel => {
  if (!channel.guild) return;
  const log = channel.guild.channels.cache.get(CHANNEL_DELETE_LOG_CHANNEL_ID);
  if (!log) return;
  let moderator = "Unknown";
  const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete }).catch(() => null);
  if (logs) moderator = logs.entries.first()?.executor?.toString() ?? "Unknown";
  const e = new EmbedBuilder()
    .setTitle("🗑️ Channel Deleted").setColor(0xff0000)
    .addFields(
      { name: "📛 Name",       value: `**${channel.name}**`,  inline: true },
      { name: "📂 Type",       value: String(channel.type),   inline: true },
      { name: "👤 By",         value: moderator,              inline: true },
      { name: "🆔 Channel ID", value: `\`${channel.id}\``,   inline: true },
    )
    .setFooter({ text: `${SERVER_NAME} • Channel Log` })
    .setTimestamp();
  await log.send({ embeds: [e] });
});

client.on("roleCreate", async role => {
  const log = role.guild.channels.cache.get(ROLE_CREATE_LOG_CHANNEL_ID);
  if (!log) return;
  let moderator = "Unknown";
  const logs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate }).catch(() => null);
  if (logs) moderator = logs.entries.first()?.executor?.toString() ?? "Unknown";
  const e = new EmbedBuilder()
    .setTitle("🆕 Role Created").setColor(0x00ff00)
    .addFields(
      { name: "📛 Name",    value: `**${role.name}**`,    inline: true },
      { name: "🎨 Color",   value: role.hexColor,         inline: true },
      { name: "👤 By",      value: moderator,             inline: true },
      { name: "🆔 Role ID", value: `\`${role.id}\``,     inline: true },
    )
    .setFooter({ text: `${SERVER_NAME} • Role Log` })
    .setTimestamp();
  await log.send({ embeds: [e] });
});

client.on("roleDelete", async role => {
  const log = role.guild.channels.cache.get(ROLE_DELETE_LOG_CHANNEL_ID);
  if (!log) return;
  let moderator = "Unknown";
  const logs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete }).catch(() => null);
  if (logs) moderator = logs.entries.first()?.executor?.toString() ?? "Unknown";
  const e = new EmbedBuilder()
    .setTitle("🗑️ Role Deleted").setColor(0xff0000)
    .addFields(
      { name: "📛 Name",    value: `**${role.name}**`, inline: true },
      { name: "👤 By",      value: moderator,          inline: true },
      { name: "🆔 Role ID", value: `\`${role.id}\``,  inline: true },
    )
    .setFooter({ text: `${SERVER_NAME} • Role Log` })
    .setTimestamp();
  await log.send({ embeds: [e] });
});

client.on("guildMemberUpdate", async (before, after) => {
  const log = after.guild.channels.cache.get(ROLE_UPDATE_LOG_CHANNEL_ID);
  if (!log) return;
  if (after.roles.cache.size > before.roles.cache.size) {
    const newRole = after.roles.cache.find(r => !before.roles.cache.has(r.id));
    if (!newRole) return;
    const logs = await after.guild.fetchAuditLogs({ limit: 5, type: AuditLogEvent.MemberRoleUpdate }).catch(() => null);
    const entry = logs?.entries.find(e => e.target?.id === after.id);
    const e = new EmbedBuilder()
      .setTitle("➕ Role Added").setColor(0x00ff00)
      .setThumbnail(after.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",       value: `${after} (\`${after.id}\`)`, inline: true },
        { name: "🎭 Role",        value: `**${newRole.name}**`,        inline: true },
        { name: "🛡️ Moderator", value: entry?.executor?.toString() ?? "Unknown", inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Role Log | Role ID: ${newRole.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  } else if (after.roles.cache.size < before.roles.cache.size) {
    const removed = before.roles.cache.find(r => !after.roles.cache.has(r.id));
    if (!removed) return;
    const logs = await after.guild.fetchAuditLogs({ limit: 5, type: AuditLogEvent.MemberRoleUpdate }).catch(() => null);
    const entry = logs?.entries.find(e => e.target?.id === after.id);
    const e = new EmbedBuilder()
      .setTitle("➖ Role Removed").setColor(0xff0000)
      .setThumbnail(after.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",       value: `${after} (\`${after.id}\`)`, inline: true },
        { name: "🎭 Role",        value: `**${removed.name}**`,        inline: true },
        { name: "🛡️ Moderator", value: entry?.executor?.toString() ?? "Unknown", inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Role Log | Role ID: ${removed.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  }
});

// ══════════════════════════════════════════════════════════════
//  MESSAGE LOGS
// ══════════════════════════════════════════════════════════════
client.on("messageUpdate", async (before, after) => {
  if (before.author?.bot || before.content === after.content) return;
  const log = before.guild?.channels.cache.get(MESSAGE_EDIT_LOG_CHANNEL_ID);
  if (!log) return;
  const e = new EmbedBuilder()
    .setTitle("✏️ Message Edited").setColor(0xffa500)
    .setThumbnail(before.author.displayAvatarURL())
    .addFields(
      { name: "👤 User",    value: `${before.author} (\`${before.author.id}\`)`, inline: true  },
      { name: "📢 Channel", value: `${before.channel}`,                          inline: true  },
      { name: "📝 Before",  value: (before.content || "*[empty]*").slice(0, 1020), inline: false },
      { name: "📝 After",   value: (after.content  || "*[empty]*").slice(0, 1020), inline: false },
      { name: "🔗 Link",    value: `[Jump to message](${after.url})`,             inline: false },
    )
    .setFooter({ text: `${SERVER_NAME} • Message Log | User ID: ${before.author.id}` })
    .setTimestamp();
  await log.send({ embeds: [e] });
});

client.on("messageDelete", async message => {
  if (message.author?.bot) return;
  const log = message.guild?.channels.cache.get(MESSAGE_DELETE_LOG_CHANNEL_ID);
  if (!log || !message.author) return;
  const e = new EmbedBuilder()
    .setTitle("🗑️ Message Deleted").setColor(0xff0000)
    .setThumbnail(message.author.displayAvatarURL())
    .addFields(
      { name: "👤 User",    value: `${message.author} (\`${message.author.id}\`)`, inline: true  },
      { name: "📢 Channel", value: `${message.channel}`,                           inline: true  },
      { name: "📝 Content", value: (message.content || "*[no text]*").slice(0, 1020), inline: false },
    )
    .setFooter({ text: `${SERVER_NAME} • Message Log | User ID: ${message.author.id}` })
    .setTimestamp();
  if (message.attachments.size)
    e.addFields({ name: "📎 Files", value: message.attachments.map(a => a.name).join("\n"), inline: false });
  await log.send({ embeds: [e] });
});

// ══════════════════════════════════════════════════════════════
//  MEMBER BAN / KICK TRACKING
// ══════════════════════════════════════════════════════════════
client.on("guildBanAdd", async ban => {
  const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBan }).catch(() => null);
  const mod  = logs?.entries.first()?.executor;
  if (mod) await trackMassAction(ban.guild, mod, "ban");
});

client.on("guildMemberRemove", async member => {
  await new Promise(r => setTimeout(r, 1000));
  const logs = await member.guild.fetchAuditLogs({ limit: 3, type: AuditLogEvent.MemberKick }).catch(() => null);
  if (logs) {
    for (const [, entry] of logs.entries) {
      if (entry.target?.id === member.id && (Date.now() - entry.createdTimestamp) < 5000) {
        await trackMassAction(member.guild, entry.executor, "kick");
        break;
      }
    }
  }

  // Invite tracking on leave
  const uid = member.user.id;
  if (inviteData[uid]?.invited_by) {
    const iid = inviteData[uid].invited_by;
    if (inviteData[iid]) {
      inviteData[iid].left = (inviteData[iid].left || 0) + 1;
      inviteData[iid].real = Math.max(0, (inviteData[iid].total || 0) - (inviteData[iid].left || 0));
      saveJSON(INVITE_FILE, inviteData);
    }
  }

  await updateVoiceChannels(member.guild);

  const log = member.guild.channels.cache.get(MEMBER_LEAVE_LOG_CHANNEL_ID);
  if (!log) return;
  const roles = member.roles.cache.filter(r => r.name !== "@everyone").map(r => `${r}`).join(" ");
  const e = new EmbedBuilder()
    .setTitle("🔴 Member Left").setColor(0xff0000)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "👤 User",        value: `${member.user} (\`${member.id}\`)`, inline: true },
      { name: "📛 Username",    value: member.user.tag,                     inline: true },
      { name: "👥 Members now", value: String(member.guild.memberCount),    inline: true },
      { name: "🎭 Roles",       value: roles || "None",                     inline: false },
    )
    .setFooter({ text: `${SERVER_NAME} • Member Log | User ID: ${member.id}` })
    .setTimestamp();
  await log.send({ embeds: [e] });
});

// ══════════════════════════════════════════════════════════════
//  MESSAGE HANDLER (security + commands)
// ══════════════════════════════════════════════════════════════
client.on("messageCreate", async message => {
  if (!message.guild) return;

  const author = message.author;
  const guild  = message.guild;
  const member = message.member;

  // ── Token detection ─────────────────────────────────────────
  if (!author.bot && TOKEN_PATTERN.test(message.content)) {
    await message.delete().catch(() => {});
    const e = new EmbedBuilder()
      .setTitle("🔑 TOKEN DETECTED & DELETED!")
      .setDescription(`${author} sent something that looks like a **Bot Token**!\nThe message has been deleted.\n\n⚠️ **If it's your token, regenerate it IMMEDIATELY!**`)
      .setColor(0x8B0000)
      .setThumbnail(author.displayAvatarURL())
      .addFields(
        { name: "👤 User",    value: `${author} (\`${author.id}\`)`, inline: true },
        { name: "📢 Channel", value: `${message.channel}`,           inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Security Log` })
      .setTimestamp();
    await sendSecurityAlert(guild, e, true);
    return;
  }

  // ── Link detection ──────────────────────────────────────────
  if (!author.bot && URL_PATTERN.test(message.content)) {
    URL_PATTERN.lastIndex = 0;
    const exempt = [CEO_ROLE_ID, OWNER_ROLE_ID];
    const isEx   = exempt.some(r => member?.roles.cache.has(r));
    if (!isEx && !member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.delete().catch(() => {});
      await member?.timeout(60 * 60 * 1000, "Link detected").catch(() => {});
      const e = new EmbedBuilder()
        .setTitle("🔗 Link Detected & Deleted")
        .setDescription(`${author} sent a link and received a **1 hour timeout**.`)
        .setColor(0xffa500)
        .setThumbnail(author.displayAvatarURL())
        .addFields(
          { name: "👤 User",    value: `${author} (\`${author.id}\`)`, inline: true },
          { name: "📢 Channel", value: `${message.channel}`,           inline: true },
        )
        .setFooter({ text: `${SERVER_NAME} • Security Log` })
        .setTimestamp();
      await sendSecurityAlert(guild, e, false);
      return;
    }
  }
  URL_PATTERN.lastIndex = 0;

  // ── Spam detection ──────────────────────────────────────────
  if (!author.bot) {
    const uid = author.id;
    const now = Date.now() / 1000;
    if (!spamTracker[uid]) spamTracker[uid] = [];
    spamTracker[uid].push(now);
    spamTracker[uid] = spamTracker[uid].filter(t => now - t < 5);
    if (spamTracker[uid].length >= 5) {
      spamTracker[uid] = [];
      if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await member?.timeout(10 * 60 * 1000, "Spam").catch(() => {});
        const e = new EmbedBuilder()
          .setTitle("🚫 Spam Detected")
          .setDescription(`${author} was spamming and received a **10 minute timeout**.`)
          .setColor(0xff0000)
          .setThumbnail(author.displayAvatarURL())
          .addFields(
            { name: "👤 User",    value: `${author} (\`${author.id}\`)`, inline: true },
            { name: "📢 Channel", value: `${message.channel}`,           inline: true },
          )
          .setFooter({ text: `${SERVER_NAME} • Security Log` })
          .setTimestamp();
        await sendSecurityAlert(guild, e, false);
      }
    }
  }

  // ── Command prefix ──────────────────────────────────────────
  if (!message.content.startsWith("!")) return;
  const args    = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ── MODERATION ──────────────────────────────────────────────
  if (command === "ban") {
    if (!hasModPerms(member)) return message.reply("❌ You don't have permission to use this command.");
    const target = message.mentions.members.first();
    if (!target) return message.reply("Usage: `!ban @user [reason]`");
    const reason = args.slice(1).join(" ") || "No reason provided";
    await target.ban({ reason });
    await message.reply(`🔨 **${target.user.tag}** has been banned.\n📌 Reason: ${reason}`);
    const log = guild.channels.cache.get(BOT_LOG_ID);
    if (log) await log.send(`🔨 **${author.tag}** banned **${target.user.tag}** — ${reason}`);
    return;
  }

  if (command === "kick") {
    if (!hasModPerms(member)) return message.reply("❌ You don't have permission to use this command.");
    const target = message.mentions.members.first();
    if (!target) return message.reply("Usage: `!kick @user [reason]`");
    const reason = args.slice(1).join(" ") || "No reason provided";
    await target.kick(reason);
    await message.reply(`👢 **${target.user.tag}** has been kicked.\n📌 Reason: ${reason}`);
    const log = guild.channels.cache.get(BOT_LOG_ID);
    if (log) await log.send(`👢 **${author.tag}** kicked **${target.user.tag}** — ${reason}`);
    return;
  }

  if (command === "timeout") {
    if (!hasModPerms(member)) return message.reply("❌ You don't have permission to use this command.");
    const target  = message.mentions.members.first();
    const minutes = parseInt(args[1]);
    if (!target || !minutes) return message.reply("Usage: `!timeout @user <minutes> [reason]`");
    const reason = args.slice(2).join(" ") || "No reason provided";
    await target.timeout(minutes * 60 * 1000, reason);
    await message.reply(`⏳ **${target.user.tag}** has been timed out for **${minutes} minute(s)**.\n📌 Reason: ${reason}`);
    const log = guild.channels.cache.get(BOT_LOG_ID);
    if (log) await log.send(`⏳ **${author.tag}** timed out **${target.user.tag}** for ${minutes}min — ${reason}`);
    return;
  }

  if (command === "clearmessage") {
    if (!hasModPerms(member)) return message.reply("❌ You don't have permission to use this command.");
    const amount = parseInt(args[0]);
    if (!amount) return message.reply("Usage: `!clearmessage <amount>`");
    await message.channel.bulkDelete(amount + 1, true);
    const m = await message.channel.send(`🧹 Deleted **${amount}** message(s).`);
    setTimeout(() => m.delete().catch(() => {}), 3000);
    return;
  }

  // ── INFO ────────────────────────────────────────────────────
  if (command === "serverstatus") {
    if (!isStaffOrAbove(member)) return message.reply("❌ You don't have permission to use this command.");
    const g = message.guild;
    await g.members.fetch();
    const e = new EmbedBuilder()
      .setTitle("📊 Server Status").setColor(0x5865f2)
      .setThumbnail(g.iconURL())
      .addFields(
        { name: "👤 Members", value: String(g.members.cache.filter(m => !m.user.bot).size), inline: true },
        { name: "🤖 Bots",    value: String(g.members.cache.filter(m => m.user.bot).size),  inline: true },
        { name: "🟢 Online",  value: String(g.members.cache.filter(m => m.presence?.status && m.presence.status !== "offline").size), inline: true },
        { name: "🚀 Boosts",  value: String(g.premiumSubscriptionCount), inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Server Status` })
      .setTimestamp();
    return message.reply({ embeds: [e] });
  }

  if (command === "invites") {
    if (!isStaffOrAbove(member)) return message.reply("❌ You don't have permission to use this command.");
    const target = message.mentions.members.first() || member;
    const uid    = target.user.id;
    const d      = inviteData[uid] || { total: 0, real: 0, left: 0 };
    const e = new EmbedBuilder()
      .setTitle(`📨 Invites — ${target.displayName}`).setColor(0x5865f2)
      .setThumbnail(target.user.displayAvatarURL())
      .addFields(
        { name: "📊 Total", value: String(d.total || 0), inline: true },
        { name: "✅ Real",  value: String(d.real  || 0), inline: true },
        { name: "🚪 Left", value: String(d.left  || 0), inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Invite Log` })
      .setTimestamp();
    return message.reply({ embeds: [e] });
  }

  if (command === "serverinvites") {
    if (!isStaffOrAbove(member)) return message.reply("❌ You don't have permission to use this command.");
    const entries = Object.entries(inviteData)
      .filter(([, d]) => typeof d === "object" && (d.total || 0) > 0)
      .map(([uid, d]) => {
        const m = guild.members.cache.get(uid);
        return [m ? m.displayName : `User ${uid}`, d.total || 0, d.real || 0, d.left || 0];
      })
      .sort((a, b) => b[1] - a[1]);

    const medals = ["🥇", "🥈", "🥉"];
    let desc = entries.slice(0, 20).map(([name, total, real, left], i) =>
      `${i < 3 ? medals[i] : `**#${i + 1}**`} **${name}** — \`${total}\` total | \`${real}\` real | \`${left}\` left`
    ).join("\n") || "No invite data available yet.";

    const e = new EmbedBuilder()
      .setTitle(`📨 Server Invites — ${guild.name}`).setColor(0x5865f2)
      .setThumbnail(guild.iconURL())
      .setImage(BANNER_SUPPORT)
      .setDescription(desc)
      .setFooter({ text: `${SERVER_NAME} • ${guild.memberCount} total members` })
      .setTimestamp();
    return message.channel.send({ embeds: [e] });
  }

  if (command === "scan") {
    if (!isStaffOrAbove(member)) return message.reply("❌ You don't have permission to use this command.");
    await message.reply("🔍 Scanning...").then(m => setTimeout(() => m.delete().catch(() => {}), 2000));
    const target = message.mentions.members.first();

    if (target) {
      const ageDays = Math.floor((Date.now() - target.user.createdTimestamp) / 86400000);
      const actions = [];
      const actionLabels = {
        [AuditLogEvent.MemberBan]:       "🔨 Ban",
        [AuditLogEvent.MemberKick]:      "👢 Kick",
        [AuditLogEvent.MemberRoleUpdate]:"🎭 Role Update",
        [AuditLogEvent.ChannelDelete]:   "🗑️ Channel Delete",
        [AuditLogEvent.RoleDelete]:      "🗑️ Role Delete",
      };
      const logs = await guild.fetchAuditLogs({ limit: 50 }).catch(() => null);
      if (logs) {
        for (const [, entry] of logs.entries) {
          if (entry.executor?.id === target.id && actionLabels[entry.action]) {
            actions.push(`${actionLabels[entry.action]} → \`${entry.target?.name ?? String(entry.target)}\` <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`);
            if (actions.length >= 8) break;
          }
        }
      }
      const isSus = ageDays < ALT_ACCOUNT_AGE_DAYS || target.permissions.has(PermissionsBitField.Flags.Administrator);
      const e = new EmbedBuilder()
        .setTitle(`🔍 Scan — ${target.displayName}`)
        .setColor(isSus ? 0x8B0000 : 0x5865f2)
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: "👤 User",    value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
          { name: "📅 Age",     value: `${ageDays} days ${ageDays < ALT_ACCOUNT_AGE_DAYS ? "⚠️ Possible ALT" : "✅"}`, inline: true },
          { name: "📆 Created", value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:F>`, inline: true },
          { name: "🔑 Permissions", value:
            `Administrator: ${target.permissions.has(PermissionsBitField.Flags.Administrator) ? "✅" : "❌"}\n` +
            `Ban: ${target.permissions.has(PermissionsBitField.Flags.BanMembers) ? "✅" : "❌"}\n` +
            `Kick: ${target.permissions.has(PermissionsBitField.Flags.KickMembers) ? "✅" : "❌"}\n` +
            `Manage Guild: ${target.permissions.has(PermissionsBitField.Flags.ManageGuild) ? "✅" : "❌"}`,
            inline: true },
          { name: "🎭 Roles", value: target.roles.cache.filter(r => r.name !== "@everyone").map(r => `${r}`).join(", ") || "None", inline: false },
          { name: `📋 Recent Actions (${actions.length})`, value: actions.join("\n") || "None found", inline: false },
        )
        .setFooter({ text: `${SERVER_NAME} • Scan` })
        .setTimestamp();
      return message.channel.send({ embeds: [e] });
    }

    // Server-wide scan
    await guild.members.fetch();
    const admins = [], newAccs = [], bots = [], sus = [];
    for (const [, m] of guild.members.cache) {
      const ageDays = Math.floor((Date.now() - m.user.createdTimestamp) / 86400000);
      if (m.user.bot) {
        const iv = m.user.flags?.has("VerifiedBot") ?? false;
        bots.push(`${iv ? "✅" : "⚠️"} ${m} (\`${m.id}\`)`);
      }
      if (!m.user.bot && m.permissions.has(PermissionsBitField.Flags.Administrator)) admins.push(`${m} (\`${m.id}\`)`);
      if (!m.user.bot && ageDays < ALT_ACCOUNT_AGE_DAYS) newAccs.push(`${m} — ${ageDays} days`);
      if (!m.user.bot && m.permissions.has(PermissionsBitField.Flags.Administrator) && ageDays < ALT_ACCOUNT_AGE_DAYS) sus.push(`🚨 ${m} — Admin + ${ageDays} days`);
    }
    const e = new EmbedBuilder()
      .setTitle(`🔍 Server Scan — ${guild.name}`).setColor(0xff8c00)
      .addFields(
        { name: `👑 Administrators (${admins.length})`,                          value: admins.slice(0, 10).join("\n") || "None", inline: false },
        { name: `🤖 Bots (${bots.length}) ✅/⚠️`,                              value: bots.slice(0, 10).join("\n")   || "None", inline: false },
        { name: `⚠️ New accounts < ${ALT_ACCOUNT_AGE_DAYS}d (${newAccs.length})`, value: newAccs.slice(0, 10).join("\n") || "None", inline: false },
        { name: `🚨 Suspicious (${sus.length})`,                                 value: sus.slice(0, 10).join("\n")    || "✅ None", inline: false },
      )
      .setFooter({ text: `${SERVER_NAME} • Scan | ${guild.memberCount} members` })
      .setTimestamp();
    return message.channel.send({ embeds: [e] });
  }

  // ── UTILITY ─────────────────────────────────────────────────
  if (command === "say") {
    if (!isOwnerOrAbove(member)) return message.reply("❌ Owner / Co-Owner / CEO only.");
    const text = args.join(" ");
    if (!text) return message.reply("Usage: `!say <message>`");
    await message.channel.send(text);
    await message.delete().catch(() => {});
    return;
  }

  if (command === "say2") {
    if (!isOwnerOrAbove(member)) return message.reply("❌ Owner / Co-Owner / CEO only.");
    const text = args.join(" ");
    if (!text) return message.reply("Usage: `!say2 <message>`");
    const e = new EmbedBuilder()
      .setDescription(text)
      .setColor(0x141428)
      .setTimestamp();
    if (guild.iconURL()) e.setThumbnail(guild.iconURL()).setFooter({ text: guild.name, iconURL: guild.iconURL() });
    await message.channel.send({ embeds: [e] });
    await message.delete().catch(() => {});
    return;
  }

  if (command === "dmall") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const text = args.join(" ");
    if (!text) return message.reply("Usage: `!dmall <message>`");
    await guild.members.fetch();
    let sent = 0, failed = 0;
    for (const [, m] of guild.members.cache) {
      if (m.user.bot) continue;
      const e = new EmbedBuilder()
        .setDescription(text).setColor(0x141428)
        .setTimestamp();
      if (guild.iconURL()) e.setThumbnail(guild.iconURL());
      e.setFooter({ text: `Sent by: ${author.displayName} • ${new Date().toUTCString()}`, iconURL: author.displayAvatarURL() });
      await m.user.send({ embeds: [e] }).then(() => sent++).catch(() => failed++);
    }
    return message.reply(`📨 Delivered to **${sent}** member(s). ❌ Failed: **${failed}**.`);
  }

  // ── SECURITY ─────────────────────────────────────────────────
  if (command === "setaltdays") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const days = parseInt(args[0]);
    if (!days || days < 1) return message.reply(`Current threshold: **${ALT_ACCOUNT_AGE_DAYS} days**\nUsage: \`!setaltdays <days>\``);
    ALT_ACCOUNT_AGE_DAYS = days;
    return message.reply(`✅ New alt threshold: **${days} days**`);
  }

  if (command === "togglealtban") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    ALT_AUTO_KICK = !ALT_AUTO_KICK;
    return message.reply(`Alt auto-kick: ${ALT_AUTO_KICK ? "✅ **Enabled**" : "❌ **Disabled**"}`);
  }

  // ── PANELS ───────────────────────────────────────────────────
  if (command === "dutypanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle("🟢 Staff Duty Panel")
      .setDescription("Press **On Duty** when your shift starts and **Off Duty** when it ends.\n\n📋 **Duty Status** — See who is on duty right now\n🏆 **Leaderboard** — All-time duty hours")
      .setColor(0x00ff00)
      .setFooter({ text: `${SERVER_NAME} • Duty System` });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("duty_on").setLabel("🟢 On Duty").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("duty_off").setLabel("🔴 Off Duty").setStyle(ButtonStyle.Danger),
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("duty_status").setLabel("📋 Duty Status").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("duty_leaderboard_btn").setLabel("🏆 Leaderboard").setStyle(ButtonStyle.Secondary),
    );
    await message.channel.send({ embeds: [e], components: [row, row2] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  if (command === "supportpanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`${SERVER_NAME} — Support Panel`)
      .setDescription("**Open a ticket to get in touch with the right team member.**\n\n👑 **Talk to Administrator** — Administration\n💬 **Support** — General help\n📋 **Report** — Report a user\n🛒 **Help with a Purchase** — Order assistance\n📌 **Other** — Anything else\n\n*One active ticket at a time.*")
      .setColor(0x141428)
      .setImage(BANNER_SUPPORT)
      .setThumbnail(SERVER_THUMBNAIL_URL)
      .setFooter({ text: `${SERVER_NAME} • Support System` });
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("support_ticket_select")
        .setPlaceholder("📂 Select a category...")
        .addOptions([
          { label: "Talk to Administrator", description: "Direct line to the Administration",   emoji: "👑", value: "admin"    },
          { label: "Support",               description: "General support from our team",        emoji: "💬", value: "support"  },
          { label: "Report",                description: "Report a user or incident",            emoji: "📋", value: "report"   },
          { label: "Help with a Purchase",  description: "Need help with an order or payment?", emoji: "🛒", value: "purchase" },
          { label: "Other",                 description: "Anything that doesn't fit above",      emoji: "📌", value: "other"    },
        ])
    );
    await message.channel.send({ embeds: [e], components: [row] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  if (command === "buypanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`${SERVER_NAME} — Buy Panel`)
      .setDescription("**Ready to make a purchase?**\n\n🛍️ **Buy a Product** — Browse and purchase from our store\n📦 **Make an Order** — Place a custom order\n\n*One active ticket at a time.*")
      .setColor(0x141428)
      .setImage(BANNER_BUY)
      .setThumbnail(SERVER_THUMBNAIL_URL)
      .setFooter({ text: `${SERVER_NAME} • Buy Panel` });
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("buy_ticket_select")
        .setPlaceholder("🛒 Select a category...")
        .addOptions([
          { label: "Buy a Product", description: "Purchase a product from our store", emoji: "🛍️", value: "buy_product" },
          { label: "Make an Order", description: "Place a custom order",              emoji: "📦", value: "make_order"  },
        ])
    );
    await message.channel.send({ embeds: [e], components: [row] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  if (command === "servicespanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`${SERVER_NAME} — Services`)
      .setDescription("**Interested in one of our professional services?**\n\n⚙️ **Buy a Service** — Purchase a premium service\n\n*One active ticket at a time.*")
      .setColor(0x5865f2)
      .setImage(BANNER_SERVICES)
      .setThumbnail(SERVER_THUMBNAIL_URL)
      .setFooter({ text: `${SERVER_NAME} • Services` });
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("services_ticket_select")
        .setPlaceholder("⚙️ Select a service...")
        .addOptions([
          { label: "Buy a Service", description: "Purchase a service from Glorious Shop", emoji: "⚙️", value: "buy_service" },
        ])
    );
    await message.channel.send({ embeds: [e], components: [row] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  if (command === "suggestionpanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`💡 ${SERVER_NAME} — Suggestions`)
      .setDescription("**Have an idea for us?**\nClick the button, write your suggestion and submit it!\nThe community votes 👍 / 👎")
      .setColor(0x5865f2)
      .setImage(BANNER_SUGGEST)
      .setThumbnail(SERVER_THUMBNAIL_URL)
      .setFooter({ text: `${SERVER_NAME} • Suggestion System` });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("make_suggestion_btn").setLabel("💡 Make a Suggestion").setStyle(ButtonStyle.Primary)
    );
    await message.channel.send({ embeds: [e], components: [row] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  if (command === "reviewpanel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`⭐ ${SERVER_NAME} — Reviews`)
      .setDescription("**How was your experience?**\nClick the button, choose your star rating (1–5) and leave a comment!")
      .setColor(0xffd700)
      .setImage(BANNER_REVIEW)
      .setThumbnail(SERVER_THUMBNAIL_URL)
      .setFooter({ text: `${SERVER_NAME} • Review System` });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("make_review_btn").setLabel("⭐ Write a Review").setStyle(ButtonStyle.Primary)
    );
    await message.channel.send({ embeds: [e], components: [row] });
    const m = await message.reply("✅ Panel sent.");
    setTimeout(() => m.delete().catch(() => {}), 2000);
    return;
  }

  // ── HELP PANELS ──────────────────────────────────────────────
  if (command === "panel") {
    if (!isCeo(member)) return message.reply("❌ CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`📌 ${SERVER_NAME} — CEO Panel`).setColor(0x2b2b2b)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: "🛠 Moderation",  value: "`!ban` `!kick` `!timeout` `!clearmessage`", inline: false },
        { name: "📊 Info",        value: "`!serverstatus` `!invites [@user]` `!serverinvites` `!scan [@user]`", inline: false },
        { name: "🧰 Utility",     value: "`!say <msg>` `!say2 <msg>` `!dmall <msg>`", inline: false },
        { name: "🔍 Security",    value: "`!setaltdays <days>` `!togglealtban`", inline: false },
        { name: "🎫 Panels",      value: "`!supportpanel` `!buypanel` `!servicespanel`\n`!suggestionpanel` `!reviewpanel` `!dutypanel`", inline: false },
      )
      .setFooter({ text: `${SERVER_NAME} • CEO Panel | ${author.tag}` })
      .setTimestamp();
    return message.reply({ embeds: [e] });
  }

  if (command === "panel2") {
    if (!isOwnerOrAbove(member)) return message.reply("❌ Owner / Co-Owner / CEO only.");
    const e = new EmbedBuilder()
      .setTitle(`📌 ${SERVER_NAME} — Owner Panel`).setColor(0xffd700)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: "🛠 Moderation", value: "`!ban @user [reason]`\n`!kick @user [reason]`\n`!timeout @user <minutes> [reason]`\n`!clearmessage <amount>`", inline: false },
        { name: "📊 Info",       value: "`!serverstatus`\n`!invites [@user]`\n`!serverinvites`\n`!scan [@user]`", inline: false },
        { name: "🧰 Utility",    value: "`!say <msg>`\n`!say2 <msg>`", inline: false },
      )
      .setFooter({ text: `${SERVER_NAME} • Owner Panel | ${author.tag}` })
      .setTimestamp();
    return message.reply({ embeds: [e] });
  }

  if (command === "panel3") {
    if (!isStaffOrAbove(member)) return message.reply("❌ You don't have permission to use this command.");
    const e = new EmbedBuilder()
      .setTitle(`📌 ${SERVER_NAME} — Staff Panel`).setColor(0x5865f2)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: "🛠 Moderation", value: "`!ban @user [reason]`\n`!kick @user [reason]`\n`!timeout @user <minutes> [reason]`\n`!clearmessage <amount>`", inline: false },
        { name: "📊 Info",       value: "`!serverstatus`\n`!invites [@user]`\n`!serverinvites`\n`!scan [@user]`", inline: false },
      )
      .setFooter({ text: `${SERVER_NAME} • Staff Panel | ${author.tag}` })
      .setTimestamp();
    return message.reply({ embeds: [e] });
  }
});

// ══════════════════════════════════════════════════════════════
//  MEMBER JOIN
// ══════════════════════════════════════════════════════════════
client.on("guildMemberAdd", async member => {
  const guild = member.guild;

  // Bot verification
  if (member.user.bot) {
    if (WHITELISTED_BOT_IDS.has(member.id)) return;
    for (const [, ch] of guild.channels.cache) {
      await ch.permissionOverwrites.create(member, {
        SendMessages: false, ViewChannel: false, Connect: false, Speak: false,
      }, { reason: "Bot pending verification" }).catch(() => {});
    }
    const isVerified = member.user.flags?.has("VerifiedBot") ?? false;
    const bt    = isVerified ? "✅ Verified Bot" : "⚠️ Unverified / Custom Bot";
    const color = isVerified ? 0xffff00 : 0x8B0000;
    const e = new EmbedBuilder()
      .setTitle(`🤖 New Bot ${!isVerified ? "(UNVERIFIED ⚠️)" : "(Verified)"}`)
      .setDescription(`**${member.user.tag}** (${member}) joined.\n\n**Type:** ${bt}\n**ID:** \`${member.id}\`\n**Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n\n⚠️ Zero permissions until accepted.`)
      .setColor(color)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: `${SERVER_NAME} • Security Log` })
      .setTimestamp();
    const sl = guild.channels.cache.get(SECURITY_LOG_CHANNEL_ID);
    if (sl) {
      const ownerRole = guild.roles.cache.get(OWNER_ROLE_ID);
      const acceptBtn = new ButtonBuilder().setCustomId(`bot_accept_${member.id}`).setLabel("✅ Accept Bot").setStyle(ButtonStyle.Success);
      const denyBtn   = new ButtonBuilder().setCustomId(`bot_deny_${member.id}`).setLabel("❌ Deny Bot (Kick)").setStyle(ButtonStyle.Danger);
      const row       = new ActionRowBuilder().addComponents(acceptBtn, denyBtn);
      const msg = await sl.send({ content: ownerRole?.toString() ?? null, embeds: [e], components: [row] });
      pendingBots[member.id] = msg.id;
    }
    return;
  }

  // Alt detection
  const ageDays = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);
  if (ageDays < ALT_ACCOUNT_AGE_DAYS) {
    const e = new EmbedBuilder()
      .setTitle("🚨 ALT ACCOUNT DETECTED!").setColor(0x8B0000)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",    value: `${member} (\`${member.id}\`)`, inline: false },
        { name: "📅 Age",     value: `**${ageDays} days**`,          inline: true  },
        { name: "📆 Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Security Log` })
      .setTimestamp();
    if (ALT_AUTO_KICK) {
      await member.kick(`Alt account — age: ${ageDays} days`)
        .then(() => e.addFields({ name: "⚡ Action", value: "✅ **Auto-kicked**", inline: false }))
        .catch(err => e.addFields({ name: "⚡ Action", value: `❌ Failed: ${err}`, inline: false }));
    } else {
      e.addFields({ name: "⚡ Action", value: "⚠️ Alert only", inline: false });
    }
    await sendSecurityAlert(guild, e, true);
    if (ALT_AUTO_KICK) return;
  }

  // Auto-role
  const autoRole = guild.roles.cache.get(AUTOROLE_ID);
  if (autoRole) await member.roles.add(autoRole).catch(() => {});

  // Invite tracking
  try {
    const newInvites = await guild.invites.fetch();
    const oldInvites = inviteCache.get(guild.id) || new Map();
    let inviter = null;
    for (const [code, invite] of newInvites) {
      const old = oldInvites.get(code) || 0;
      if (invite.uses > old) { inviter = invite.inviter; break; }
    }
    inviteCache.set(guild.id, new Map(newInvites.map(i => [i.code, i.uses])));
    if (inviter) {
      const iid = inviter.id;
      const mid = member.user.id;
      if (!inviteData[mid]) inviteData[mid] = {};
      inviteData[mid].invited_by = iid;
      if (!inviteData[iid]) inviteData[iid] = { total: 0, real: 0, left: 0 };
      inviteData[iid].total = (inviteData[iid].total || 0) + 1;
      inviteData[iid].real  = (inviteData[iid].total || 0) - (inviteData[iid].left || 0);
      saveJSON(INVITE_FILE, inviteData);
      const il = guild.channels.cache.get(INVITE_LOG_CHANNEL_ID);
      if (il) {
        const e = new EmbedBuilder()
          .setTitle("📨 New Invite")
          .setDescription(`${member} joined via ${inviter}'s invite`)
          .setColor(0x00ff00)
          .setThumbnail(member.user.displayAvatarURL())
          .addFields({ name: "📊 Inviter Stats", value:
            `**Name:** ${inviter.displayName ?? inviter.username}\n` +
            `**Total:** ${inviteData[iid].total}\n**Real:** ${inviteData[iid].real}\n**Left:** ${inviteData[iid].left}`,
            inline: false })
          .setFooter({ text: `${SERVER_NAME} • Invite Log | User ID: ${member.id}` })
          .setTimestamp();
        await il.send({ embeds: [e] });
      }
    }
  } catch (ex) { console.error("Invite error:", ex); }

  // Join log
  const log = guild.channels.cache.get(MEMBER_JOIN_LOG_CHANNEL_ID);
  if (log) {
    const e = new EmbedBuilder()
      .setTitle("🟢 Member Joined").setColor(0x00ff00)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User",        value: `${member} (\`${member.id}\`)`, inline: true },
        { name: "📛 Username",    value: member.user.tag,                 inline: true },
        { name: "📅 Account Age", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "👥 Members now", value: String(guild.memberCount),       inline: true },
      )
      .setFooter({ text: `${SERVER_NAME} • Member Log | User ID: ${member.id}` })
      .setTimestamp();
    await log.send({ embeds: [e] });
  }

  await updateVoiceChannels(guild);
});

// ══════════════════════════════════════════════════════════════
//  PRESENCE / GUILD UPDATE (voice counters)
// ══════════════════════════════════════════════════════════════
client.on("presenceUpdate", async (_, after) => {
  if (after?.guild) await updateVoiceChannels(after.guild);
});

client.on("guildUpdate", async (before, after) => {
  if (before.premiumSubscriptionCount !== after.premiumSubscriptionCount)
    await updateVoiceChannels(after);
});

// ══════════════════════════════════════════════════════════════
//  READY
// ══════════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    await updateVoiceChannels(guild);
    try {
      const invs = await guild.invites.fetch();
      inviteCache.set(guild.id, new Map(invs.map(i => [i.code, i.uses])));
      console.log(`✅ Loaded ${invs.size} invite(s) into cache.`);
    } catch (e) { console.error("⚠️ Invite cache error:", e); }
  }

  client.user.setActivity(SERVER_NAME, { type: ActivityType.Playing });
  console.log(`🚀 ${SERVER_NAME} Bot is fully online!`);
});

// ══════════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════════
client.login(TOKEN);
