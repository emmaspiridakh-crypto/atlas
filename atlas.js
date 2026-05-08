print(">>> GLORIOUS SHOP BOT LOADED <<<")

import os, discord, asyncio, json, time, re
from discord.ext import commands
from flask import Flask
from threading import Thread
import datetime

# ══════════════════════════════════════════════════════════════
#  KEEP ALIVE (Replit / Render)
# ══════════════════════════════════════════════════════════════
app = Flask('')

@app.route('/')
def home():
    return "OK"

def run():
    app.run(host='0.0.0.0', port=10000)

def keep_alive():
    t = Thread(target=run)
    t.daemon = True
    t.start()

# ══════════════════════════════════════════════════════════════
#  BOT INIT
# ══════════════════════════════════════════════════════════════
TOKEN   = os.getenv("TOKEN")
intents = discord.Intents.all()
bot     = commands.Bot(command_prefix="!", intents=intents)
GUILD_ID = 1490079978300117212

# ══════════════════════════════════════════════════════════════
#  ROLE IDs  —  αλλάξτε τα με τα δικά σας IDs
# ══════════════════════════════════════════════════════════════
CEO_ROLE_ID            =  1490084094749573151 # CEO  (= Founder)
OWNER_ROLE_ID          =  1490084247682285699  # Owner
CO_OWNER_ROLE_ID       =  1490136469287993464 # Co-Owner
CREATOR_ROLE_ID        =  1502327656019005530  # Creator  (= Developer)
MANAGER_ROLE_ID        =  1490134503249936525  # Management
STAFF_ROLE_ID          =  1490088402656170045  # Staff
DONATE_MANAGER_ROLE_ID =  1490134506793861193  # Donate Manager

AUTOROLE_ID  =  1502329776252256266         # Auto-role κατά join
DUTY_ROLE_ID =  1490338840395649266            # On-Duty role

# ══════════════════════════════════════════════════════════════
#  CHANNEL IDs
# ══════════════════════════════════════════════════════════════
# ── Ticket Αποτελέσματα / Κατηγορίες ──────────────────────────
#  Support Ticket Panel
SUPPORT_CATEGORY_ID = 1502327809719406673

#  Buy Panel
BUY_PANEL_CATEGORY_ID = 1502327808825884874

#  Services Ticket Panel
SERVICES_CATEGORY_ID  = 1502347790653722704

# ── Logs ──────────────────────────────────────────────────────
BOT_LOG_ID                    = 1502327881055998084
MESSAGE_EDIT_LOG_CHANNEL_ID   = 1502327886030569544
MESSAGE_DELETE_LOG_CHANNEL_ID = 1502327886030569544
MEMBER_JOIN_LOG_CHANNEL_ID    = 1502327883232841801
MEMBER_LEAVE_LOG_CHANNEL_ID   = 1502327883232841801
ROLE_UPDATE_LOG_CHANNEL_ID    = 1502327884881334343
VOICE_LOG_CHANNEL_ID          = 1502327881991192778
CHANNEL_CREATE_LOG_CHANNEL_ID = 1502328585451733053
CHANNEL_DELETE_LOG_CHANNEL_ID = 1502328585451733053
ROLE_CREATE_LOG_CHANNEL_ID    = 1502327884881334343
ROLE_DELETE_LOG_CHANNEL_ID    = 1502327884881334343
TICKET_LOG_ID                 = 1502327879864680498
DUTY_LOG_CHANNEL_ID           = 1502447599670788106
DUTY_LEADERBOARD_CHANNEL_ID   = 1502447599670788106
SECURITY_LOG_CHANNEL_ID       = 1502328608805486765
SUGGESTION_CHANNEL_ID         = 1502327874919600301
REVIEW_CHANNEL_ID             = 1502327876249190491
INVITE_LOG_CHANNEL_ID         = 1502328657958404189

# ── Voice Counters ────────────────────────────────────────────
MEMBERS_CHANNEL_ID = 1502447935378423908
BOTS_CHANNEL_ID    = 1502448235577479248
ONLINE_CHANNEL_ID  = 1502448168544243833
BOOSTS_CHANNEL_ID  = 1502448264820035625

# ── Temp Voice ────────────────────────────────────────────────
TEMP_VOICE_CATEGORY_ID = 1502349327165554698
TEMP_VOICE_CHANNEL_ID  = 1502340058399641670

# ══════════════════════════════════════════════════════════════
#  BRANDING
# ══════════════════════════════════════════════════════════════
SERVER_NAME          = "Glorious Shop"
SERVER_THUMBNAIL_URL = "https://i.imgur.com/mDene4Q.png"
BANNER_SUPPORT       = "https://i.imgur.com/bpJLtyU.png"
BANNER_BUY           = "https://i.imgur.com/bpJLtyU.png"
BANNER_SERVICES      = "https://i.imgur.com/bpJLtyU.png"
BANNER_SUGGEST       = "https://i.imgur.com/bpJLtyU.png"
BANNER_REVIEW        = "https://i.imgur.com/bpJLtyU.png"

# ══════════════════════════════════════════════════════════════
#  PERMISSION HELPERS
# ══════════════════════════════════════════════════════════════
def is_ceo(u):
    return any(r.id == CEO_ROLE_ID for r in u.roles)

def is_owner_or_above(u):
    return any(r.id in (CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID) for r in u.roles)

def is_staff_or_above(m):
    return any(r.id in (
        CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID,
        CREATOR_ROLE_ID, MANAGER_ROLE_ID, STAFF_ROLE_ID
    ) for r in m.roles)

def is_manager_or_above(m):
    return any(r.id in (
        CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID,
        CREATOR_ROLE_ID, MANAGER_ROLE_ID
    ) for r in m.roles)

def has_mod_permissions(m):
    return (m.guild_permissions.kick_members or m.guild_permissions.ban_members or
            is_staff_or_above(m))

# ══════════════════════════════════════════════════════════════
#  DATA FILES
# ══════════════════════════════════════════════════════════════
DUTY_FILE = "duty.json"

def load_duty_data():
    if not os.path.exists(DUTY_FILE):
        open(DUTY_FILE, "w").write("{}")
    return json.load(open(DUTY_FILE))

def save_duty_data(d):
    json.dump(d, open(DUTY_FILE, "w"), indent=4)

duty_data = load_duty_data()

SECURITY_FILE = "security.json"

def load_security_data():
    if not os.path.exists(SECURITY_FILE):
        json.dump({"spam": {}, "ban_kick_tracker": {}, "alts": []}, open(SECURITY_FILE, "w"))
    return json.load(open(SECURITY_FILE))

def save_security_data(d):
    json.dump(d, open(SECURITY_FILE, "w"), indent=4)

security_data = load_security_data()

INVITE_FILE = "invites.json"

def load_invite_data():
    if not os.path.exists(INVITE_FILE):
        open(INVITE_FILE, "w").write("{}")
    return json.load(open(INVITE_FILE))

def save_invite_data(d):
    json.dump(d, open(INVITE_FILE, "w"), indent=4)

invite_data  = load_invite_data()
invite_cache = {}

ALT_ACCOUNT_AGE_DAYS = 30
ALT_AUTO_KICK        = True
WHITELISTED_BOT_IDS  = set()
URL_PATTERN   = re.compile(r"(https?://|www\.)\S+|discord\.gg/\S+", re.IGNORECASE)
TOKEN_PATTERN = re.compile(r"[MNO][a-zA-Z0-9_-]{23,25}\.[a-zA-Z0-9_-]{6}\.[a-zA-Z0-9_-]{27,38}")

spam_tracker      = {}
ban_kick_tracker  = {}
pending_bots      = {}

# ══════════════════════════════════════════════════════════════
#  SECURITY ALERT HELPER
# ══════════════════════════════════════════════════════════════
async def send_security_alert(guild, embed, ping=True):
    sec_log = bot.get_channel(SECURITY_LOG_CHANNEL_ID)
    if not sec_log:
        return
    ceo_role = guild.get_role(CEO_ROLE_ID)
    content  = ceo_role.mention if (ping and ceo_role) else None
    asyncio.create_task(sec_log.send(content=content, embed=embed))

# ══════════════════════════════════════════════════════════════
#  VOICE COUNTERS
# ══════════════════════════════════════════════════════════════
async def update_voice_channels(guild):
    for ch_id, name in [
        (MEMBERS_CHANNEL_ID, f"👤 Members: {sum(1 for m in guild.members if not m.bot)}"),
        (BOTS_CHANNEL_ID,    f"🤖 Bots: {sum(1 for m in guild.members if m.bot)}"),
        (ONLINE_CHANNEL_ID,  f"🟢 Online: {sum(1 for m in guild.members if m.status != discord.Status.offline)}"),
        (BOOSTS_CHANNEL_ID,  f"🚀 Boosts: {guild.premium_subscription_count}"),
    ]:
        ch = guild.get_channel(ch_id)
        if ch:
            try:
                await ch.edit(name=name)
            except:
                pass

@bot.event
async def on_presence_update(before, after):
    await update_voice_channels(after.guild)

@bot.event
async def on_guild_update(before, after):
    if before.premium_subscription_count != after.premium_subscription_count:
        await update_voice_channels(after)

# ══════════════════════════════════════════════════════════════
#  LOGS
# ══════════════════════════════════════════════════════════════
@bot.event
async def on_voice_state_update(member, before, after):
    guild = member.guild
    log   = bot.get_channel(VOICE_LOG_CHANNEL_ID)

    # Temp voice creation
    if after.channel and after.channel.id == TEMP_VOICE_CHANNEL_ID:
        cat = guild.get_channel(TEMP_VOICE_CATEGORY_ID)
        tc  = await guild.create_voice_channel(name=f"{member.name}'s Channel", category=cat)
        try:
            await member.move_to(tc)
        except:
            pass
        if log:
            e = discord.Embed(title="📞 Support Channel Created", color=discord.Color.blue(),
                              timestamp=discord.utils.utcnow())
            e.set_thumbnail(url=member.display_avatar.url)
            e.add_field(name="👤 User",    value=f"{member.mention} (`{member.id}`)", inline=True)
            e.add_field(name="📁 Channel", value=f"**{tc.name}**", inline=True)
            e.set_footer(text=f"{SERVER_NAME} • Voice Log | Channel ID: {tc.id}")
            await log.send(embed=e)

    # Temp voice deletion
    if (before.channel and before.channel.category_id == TEMP_VOICE_CATEGORY_ID
            and before.channel.id != TEMP_VOICE_CHANNEL_ID
            and len(before.channel.members) == 0):
        try:
            nc = before.channel.name
            await before.channel.delete()
            if log:
                e = discord.Embed(title="🗑️ Support Channel Deleted", color=discord.Color.red(),
                                  timestamp=discord.utils.utcnow())
                e.add_field(name="📁 Channel", value=f"**{nc}**", inline=True)
                e.add_field(name="📌 Reason",  value="Empty channel", inline=True)
                e.set_footer(text=f"{SERVER_NAME} • Voice Log")
                await log.send(embed=e)
        except:
            pass

    if not log:
        return

    if not before.channel and after.channel:
        e = discord.Embed(title="🔊 Voice Join", color=discord.Color.green(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",    value=f"{member.mention} (`{member.id}`)", inline=True)
        e.add_field(name="🔊 Channel", value=f"**{after.channel.name}**", inline=True)
        e.set_footer(text=f"{SERVER_NAME} • Voice Log | User ID: {member.id}")
        await log.send(embed=e)
    elif before.channel and not after.channel:
        e = discord.Embed(title="🔇 Voice Leave", color=discord.Color.red(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",    value=f"{member.mention} (`{member.id}`)", inline=True)
        e.add_field(name="🔇 Channel", value=f"**{before.channel.name}**", inline=True)
        e.set_footer(text=f"{SERVER_NAME} • Voice Log | User ID: {member.id}")
        await log.send(embed=e)
    elif before.channel != after.channel:
        e = discord.Embed(title="🔀 Voice Move", color=discord.Color.yellow(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User", value=f"{member.mention} (`{member.id}`)", inline=False)
        e.add_field(name="📤 From", value=f"**{before.channel.name}**", inline=True)
        e.add_field(name="📥 To",   value=f"**{after.channel.name}**",  inline=True)
        e.set_footer(text=f"{SERVER_NAME} • Voice Log | User ID: {member.id}")
        await log.send(embed=e)


@bot.event
async def on_guild_role_create(role):
    log = bot.get_channel(ROLE_CREATE_LOG_CHANNEL_ID)
    if not log:
        return
    moderator = "Unknown"
    try:
        async for entry in role.guild.audit_logs(limit=1, action=discord.AuditLogAction.role_create):
            moderator = entry.user.mention
            break
    except:
        pass
    e = discord.Embed(title="🆕 Role Created", color=discord.Color.green(),
                      timestamp=discord.utils.utcnow())
    e.add_field(name="📛 Name",    value=f"**{role.name}**", inline=True)
    e.add_field(name="🎨 Color",   value=str(role.color),    inline=True)
    e.add_field(name="👤 By",      value=moderator,           inline=True)
    e.add_field(name="🆔 Role ID", value=f"`{role.id}`",      inline=True)
    e.set_footer(text=f"{SERVER_NAME} • Role Log")
    await log.send(embed=e)


@bot.event
async def on_guild_role_delete(role):
    log = bot.get_channel(ROLE_DELETE_LOG_CHANNEL_ID)
    if not log:
        return
    moderator = "Unknown"
    try:
        async for entry in role.guild.audit_logs(limit=1, action=discord.AuditLogAction.role_delete):
            moderator = entry.user.mention
            break
    except:
        pass
    e = discord.Embed(title="🗑️ Role Deleted", color=discord.Color.red(),
                      timestamp=discord.utils.utcnow())
    e.add_field(name="📛 Name",    value=f"**{role.name}**", inline=True)
    e.add_field(name="👤 By",      value=moderator,           inline=True)
    e.add_field(name="🆔 Role ID", value=f"`{role.id}`",      inline=True)
    e.set_footer(text=f"{SERVER_NAME} • Role Log")
    await log.send(embed=e)


@bot.event
async def on_member_update(before, after):
    guild = after.guild
    log   = bot.get_channel(ROLE_UPDATE_LOG_CHANNEL_ID)
    if not log:
        return
    if len(after.roles) > len(before.roles):
        new_role = next(r for r in after.roles if r not in before.roles)
        async for entry in guild.audit_logs(limit=5, action=discord.AuditLogAction.member_role_update):
            if entry.target.id == after.id:
                e = discord.Embed(title="➕ Role Added", color=discord.Color.green(),
                                  timestamp=discord.utils.utcnow())
                e.set_thumbnail(url=after.display_avatar.url)
                e.add_field(name="👤 User",       value=f"{after.mention} (`{after.id}`)", inline=True)
                e.add_field(name="🎭 Role",        value=f"**{new_role.name}**",            inline=True)
                e.add_field(name="🛡️ Moderator", value=entry.user.mention,               inline=True)
                e.set_footer(text=f"{SERVER_NAME} • Role Log | Role ID: {new_role.id}")
                await log.send(embed=e)
                break
    elif len(after.roles) < len(before.roles):
        removed = next(r for r in before.roles if r not in after.roles)
        async for entry in guild.audit_logs(limit=5, action=discord.AuditLogAction.member_role_update):
            if entry.target.id == after.id:
                e = discord.Embed(title="➖ Role Removed", color=discord.Color.red(),
                                  timestamp=discord.utils.utcnow())
                e.set_thumbnail(url=after.display_avatar.url)
                e.add_field(name="👤 User",       value=f"{after.mention} (`{after.id}`)", inline=True)
                e.add_field(name="🎭 Role",        value=f"**{removed.name}**",             inline=True)
                e.add_field(name="🛡️ Moderator", value=entry.user.mention,               inline=True)
                e.set_footer(text=f"{SERVER_NAME} • Role Log | Role ID: {removed.id}")
                await log.send(embed=e)
                break


@bot.event
async def on_guild_channel_create(channel):
    log = bot.get_channel(CHANNEL_CREATE_LOG_CHANNEL_ID)
    if not log:
        return
    moderator = "Unknown"
    try:
        async for entry in channel.guild.audit_logs(limit=1, action=discord.AuditLogAction.channel_create):
            moderator = entry.user.mention
            break
    except:
        pass
    e = discord.Embed(title="📁 Channel Created", color=discord.Color.green(),
                      timestamp=discord.utils.utcnow())
    e.add_field(name="📛 Name",       value=f"**{channel.name}**",         inline=True)
    e.add_field(name="📂 Type",       value=str(channel.type).capitalize(), inline=True)
    e.add_field(name="👤 By",         value=moderator,                      inline=True)
    if hasattr(channel, "category") and channel.category:
        e.add_field(name="🗂️ Category", value=channel.category.name, inline=True)
    e.add_field(name="🆔 Channel ID", value=f"`{channel.id}`", inline=True)
    e.set_footer(text=f"{SERVER_NAME} • Channel Log")
    await log.send(embed=e)


@bot.event
async def on_guild_channel_delete(channel):
    log = bot.get_channel(CHANNEL_DELETE_LOG_CHANNEL_ID)
    if not log:
        return
    moderator = "Unknown"
    try:
        async for entry in channel.guild.audit_logs(limit=1, action=discord.AuditLogAction.channel_delete):
            moderator = entry.user.mention
            break
    except:
        pass
    e = discord.Embed(title="🗑️ Channel Deleted", color=discord.Color.red(),
                      timestamp=discord.utils.utcnow())
    e.add_field(name="📛 Name",       value=f"**{channel.name}**",         inline=True)
    e.add_field(name="📂 Type",       value=str(channel.type).capitalize(), inline=True)
    e.add_field(name="👤 By",         value=moderator,                      inline=True)
    e.add_field(name="🆔 Channel ID", value=f"`{channel.id}`",              inline=True)
    e.set_footer(text=f"{SERVER_NAME} • Channel Log")
    await log.send(embed=e)


@bot.event
async def on_message_edit(before, after):
    if before.author.bot or before.content == after.content:
        return
    log = bot.get_channel(MESSAGE_EDIT_LOG_CHANNEL_ID)
    if not log:
        return
    e = discord.Embed(title="✏️ Message Edited", color=discord.Color.orange(),
                      timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=before.author.display_avatar.url)
    e.add_field(name="👤 User",    value=f"{before.author.mention} (`{before.author.id}`)", inline=True)
    e.add_field(name="📢 Channel", value=before.channel.mention,                            inline=True)
    e.add_field(name="📝 Before",  value=before.content[:1020] or "*[empty]*",              inline=False)
    e.add_field(name="📝 After",   value=after.content[:1020]  or "*[empty]*",              inline=False)
    e.add_field(name="🔗 Link",    value=f"[Jump to message]({after.jump_url})",            inline=False)
    e.set_footer(text=f"{SERVER_NAME} • Message Log | User ID: {before.author.id}")
    await log.send(embed=e)


@bot.event
async def on_message_delete(message):
    if message.author.bot:
        return
    log = bot.get_channel(MESSAGE_DELETE_LOG_CHANNEL_ID)
    if not log:
        return
    e = discord.Embed(title="🗑️ Message Deleted", color=discord.Color.red(),
                      timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=message.author.display_avatar.url)
    e.add_field(name="👤 User",    value=f"{message.author.mention} (`{message.author.id}`)", inline=True)
    e.add_field(name="📢 Channel", value=message.channel.mention,                             inline=True)
    e.add_field(name="📝 Content", value=message.content[:1020] or "*[no text]*",             inline=False)
    if message.attachments:
        e.add_field(name="📎 Files", value="\n".join(a.filename for a in message.attachments), inline=False)
    e.set_footer(text=f"{SERVER_NAME} • Message Log | User ID: {message.author.id}")
    await log.send(embed=e)

# ══════════════════════════════════════════════════════════════
#  TICKET CLOSE VIEW  (shared across all panels)
# ══════════════════════════════════════════════════════════════
class TicketCloseView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🔒 Close Ticket", style=discord.ButtonStyle.red,
                       custom_id="close_ticket_button")
    async def close_ticket(self, interaction, button):
        lc = interaction.guild.get_channel(TICKET_LOG_ID)
        if lc:
            e = discord.Embed(title="❌ Ticket Closed", color=discord.Color.red(),
                              timestamp=discord.utils.utcnow())
            e.set_thumbnail(url=interaction.user.display_avatar.url)
            e.add_field(name="🔒 Closed by", value=interaction.user.mention,      inline=True)
            e.add_field(name="📁 Channel",   value=interaction.channel.name,      inline=True)
            e.set_footer(text=f"{SERVER_NAME} • Ticket Log")
            await lc.send(embed=e)
        await interaction.response.send_message("🔒 Closing in 4 seconds...")
        await asyncio.sleep(4)
        try:
            await interaction.channel.delete()
        except:
            pass

# ══════════════════════════════════════════════════════════════
#  SUPPORT TICKET PANEL
#  Categories:
#    • Talk to Administrator  → CEO, Owner, Co-Owner
#    • Support               → Staff, Management, Owner, Co-Owner
#    • Report                → Owner, CEO
#    • Help with a Purchase  → CEO
#    • Other                 → Staff, Management, Owner, CEO, Co-Owner
# ══════════════════════════════════════════════════════════════
class SupportTicketSelect(discord.ui.Select):
    def __init__(self):
        opts = [
            discord.SelectOption(
                label="Talk to Administrator",
                description="Direct line to the Administration",
                emoji="👑",
                value="admin"
            ),
            discord.SelectOption(
                label="Support",
                description="General support from our team",
                emoji="💬",
                value="support"
            ),
            discord.SelectOption(
                label="Report",
                description="Report a user or incident",
                emoji="📋",
                value="report"
            ),
            discord.SelectOption(
                label="Help with a Purchase",
                description="Need help with an order or payment?",
                emoji="🛒",
                value="purchase"
            ),
            discord.SelectOption(
                label="Other",
                description="Anything that doesn't fit above",
                emoji="📌",
                value="other"
            ),
        ]
        super().__init__(
            custom_id="support_ticket_select",
            placeholder="📂 Select a category...",
            min_values=1, max_values=1,
            options=opts
        )

    async def callback(self, interaction):
        guild  = interaction.guild
        author = interaction.user
        cat    = guild.get_channel(SUPPORT_CATEGORY_ID)
        if not cat:
            return await interaction.response.send_message("❌ Category not found.", ephemeral=True)

        v = self.values[0]

        # Determine name, title, and which roles can see the ticket
        config = {
            "admin": {
                "name":  f"admin-{author.name}".replace(" ", "-").lower(),
                "title": "👑 Talk to Administrator",
                "roles": [CEO_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "A member of the **Administration** will be with you shortly.\n"
                          "Please describe your matter below.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.gold(),
            },
            "support": {
                "name":  f"support-{author.name}".replace(" ", "-").lower(),
                "title": "💬 Support Ticket",
                "roles": [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "Our **Support Team** will assist you shortly.\n"
                          "Please describe your issue below.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.blurple(),
            },
            "report": {
                "name":  f"report-{author.name}".replace(" ", "-").lower(),
                "title": "📋 Report Ticket",
                "roles": [OWNER_ROLE_ID, CEO_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "Please provide full details of the **report** below.\n"
                          "Include usernames, timestamps and any evidence.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.red(),
            },
            "purchase": {
                "name":  f"purchase-{author.name}".replace(" ", "-").lower(),
                "title": "🛒 Help with a Purchase",
                "roles": [CEO_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "A **CEO** team member will help you with your purchase shortly.\n"
                          "Please provide your order details below.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.green(),
            },
            "other": {
                "name":  f"other-{author.name}".replace(" ", "-").lower(),
                "title": "📌 Other Ticket",
                "roles": [STAFF_ROLE_ID, MANAGER_ROLE_ID, OWNER_ROLE_ID, CEO_ROLE_ID, CO_OWNER_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "Our team will be with you shortly.\n"
                          "Please explain your request below.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.from_rgb(20, 20, 40),
            },
        }[v]

        ow = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        for rid in config["roles"]:
            r = guild.get_role(rid)
            if r:
                ow[r] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)

        ch = await guild.create_text_channel(name=config["name"], category=cat, overwrites=ow)

        e = discord.Embed(title=config["title"], description=config["desc"], color=config["color"])
        e.set_image(url=BANNER_SUPPORT)
        e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        e.set_footer(text=f"{SERVER_NAME} • Support System")
        await ch.send(embed=e, view=TicketCloseView())

        lc = guild.get_channel(TICKET_LOG_ID)
        if lc:
            le = discord.Embed(title="📂 New Support Ticket", color=discord.Color.blue(),
                               timestamp=discord.utils.utcnow())
            le.set_thumbnail(url=author.display_avatar.url)
            le.add_field(name="👤 From",     value=author.mention,      inline=True)
            le.add_field(name="📋 Category", value=config["title"],     inline=True)
            le.add_field(name="📁 Channel",  value=ch.mention,          inline=True)
            le.set_footer(text=f"{SERVER_NAME} • Ticket Log")
            await lc.send(embed=le)

        await interaction.response.send_message(f"✅ Ticket created: {ch.mention}", ephemeral=True)


class SupportTicketPanel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(SupportTicketSelect())

# ══════════════════════════════════════════════════════════════
#  BUY PANEL TICKET
#  Categories:
#    • Buy a Product  → CEO, Donate Manager
#    • Make an Order  → CEO, Creator, Owner, Co-Owner
# ══════════════════════════════════════════════════════════════
class BuyTicketSelect(discord.ui.Select):
    def __init__(self):
        opts = [
            discord.SelectOption(
                label="Buy a Product",
                description="Purchase a product from our store",
                emoji="🛍️",
                value="buy_product"
            ),
            discord.SelectOption(
                label="Make an Order",
                description="Place a custom order",
                emoji="📦",
                value="make_order"
            ),
        ]
        super().__init__(
            custom_id="buy_ticket_select",
            placeholder="🛒 Select a category...",
            min_values=1, max_values=1,
            options=opts
        )

    async def callback(self, interaction):
        guild  = interaction.guild
        author = interaction.user
        cat    = guild.get_channel(BUY_PANEL_CATEGORY_ID)
        if not cat:
            return await interaction.response.send_message("❌ Category not found.", ephemeral=True)

        v = self.values[0]

        config = {
            "buy_product": {
                "name":  f"buy-{author.name}".replace(" ", "-").lower(),
                "title": "🛍️ Buy a Product",
                "roles": [CEO_ROLE_ID, DONATE_MANAGER_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "Thank you for your interest in purchasing a product!\n"
                          "Please let us know **what you'd like to buy** and a team member will assist you.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.green(),
            },
            "make_order": {
                "name":  f"order-{author.name}".replace(" ", "-").lower(),
                "title": "📦 Make an Order",
                "roles": [CEO_ROLE_ID, CREATOR_ROLE_ID, OWNER_ROLE_ID, CO_OWNER_ROLE_ID],
                "desc":  (f"Hello {author.mention}!\n\n"
                          "Please describe your **custom order** in as much detail as possible.\n"
                          "Our team will review it and get back to you shortly.\n\n"
                          "*One active ticket at a time.*"),
                "color": discord.Color.from_rgb(255, 165, 0),
            },
        }[v]

        ow = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        for rid in config["roles"]:
            r = guild.get_role(rid)
            if r:
                ow[r] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)

        ch = await guild.create_text_channel(name=config["name"], category=cat, overwrites=ow)

        e = discord.Embed(title=config["title"], description=config["desc"], color=config["color"])
        e.set_image(url=BANNER_BUY)
        e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        e.set_footer(text=f"{SERVER_NAME} • Buy Panel")
        await ch.send(embed=e, view=TicketCloseView())

        lc = guild.get_channel(TICKET_LOG_ID)
        if lc:
            le = discord.Embed(title="🛒 New Buy Ticket", color=discord.Color.gold(),
                               timestamp=discord.utils.utcnow())
            le.set_thumbnail(url=author.display_avatar.url)
            le.add_field(name="👤 From",     value=author.mention,  inline=True)
            le.add_field(name="📋 Category", value=config["title"], inline=True)
            le.add_field(name="📁 Channel",  value=ch.mention,      inline=True)
            le.set_footer(text=f"{SERVER_NAME} • Ticket Log")
            await lc.send(embed=le)

        await interaction.response.send_message(f"✅ Ticket created: {ch.mention}", ephemeral=True)


class BuyTicketPanel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(BuyTicketSelect())

# ══════════════════════════════════════════════════════════════
#  SERVICES TICKET PANEL
#  Categories:
#    • Buy a Service  → CEO
# ══════════════════════════════════════════════════════════════
class ServicesTicketSelect(discord.ui.Select):
    def __init__(self):
        opts = [
            discord.SelectOption(
                label="Buy a Service",
                description="Purchase a service from Glorious Shop",
                emoji="⚙️",
                value="buy_service"
            ),
        ]
        super().__init__(
            custom_id="services_ticket_select",
            placeholder="⚙️ Select a service...",
            min_values=1, max_values=1,
            options=opts
        )

    async def callback(self, interaction):
        guild  = interaction.guild
        author = interaction.user
        cat    = guild.get_channel(SERVICES_CATEGORY_ID)
        if not cat:
            return await interaction.response.send_message("❌ Category not found.", ephemeral=True)

        name  = f"service-{author.name}".replace(" ", "-").lower()
        title = "⚙️ Buy a Service"
        desc  = (f"Hello {author.mention}!\n\n"
                 "Thank you for your interest in one of our **services**!\n"
                 "Please describe the service you'd like and our CEO team will be in touch shortly.\n\n"
                 "*One active ticket at a time.*")

        ow = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        ceo_role = guild.get_role(CEO_ROLE_ID)
        if ceo_role:
            ow[ceo_role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)

        ch = await guild.create_text_channel(name=name, category=cat, overwrites=ow)

        e = discord.Embed(title=title, description=desc, color=discord.Color.from_rgb(88, 101, 242))
        e.set_image(url=BANNER_SERVICES)
        e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        e.set_footer(text=f"{SERVER_NAME} • Services")
        await ch.send(embed=e, view=TicketCloseView())

        lc = guild.get_channel(TICKET_LOG_ID)
        if lc:
            le = discord.Embed(title="⚙️ New Services Ticket", color=discord.Color.blurple(),
                               timestamp=discord.utils.utcnow())
            le.set_thumbnail(url=author.display_avatar.url)
            le.add_field(name="👤 From",    value=author.mention, inline=True)
            le.add_field(name="📁 Channel", value=ch.mention,     inline=True)
            le.set_footer(text=f"{SERVER_NAME} • Ticket Log")
            await lc.send(embed=le)

        await interaction.response.send_message(f"✅ Ticket created: {ch.mention}", ephemeral=True)


class ServicesTicketPanel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(ServicesTicketSelect())

# ══════════════════════════════════════════════════════════════
#  DUTY SYSTEM
# ══════════════════════════════════════════════════════════════
def get_total_seconds(uid: str, now: float) -> float:
    d = duty_data.get(uid, {})
    if not isinstance(d, dict):
        return 0.0
    total = d.get("total_seconds", 0.0)
    if "start_time" in d:
        total += now - d["start_time"]
    return total


class DutyView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🟢 On Duty", style=discord.ButtonStyle.green,
                       custom_id="duty_on", row=0)
    async def on_duty(self, interaction, button):
        uid = str(interaction.user.id)
        dr  = interaction.guild.get_role(DUTY_ROLE_ID)
        if dr in interaction.user.roles:
            return await interaction.response.send_message("⚠️ You are already On Duty!", ephemeral=True)
        if dr:
            try:
                await interaction.user.add_roles(dr)
            except:
                pass
        if uid not in duty_data or not isinstance(duty_data[uid], dict):
            duty_data[uid] = {"total_seconds": 0.0}
        duty_data[uid]["start_time"] = time.time()
        save_duty_data(duty_data)

        log = bot.get_channel(DUTY_LOG_CHANNEL_ID)
        if log:
            e = discord.Embed(title="🟢 On Duty", color=discord.Color.green(),
                              timestamp=discord.utils.utcnow())
            e.set_thumbnail(url=interaction.user.display_avatar.url)
            e.description = f"{interaction.user.mention} is now **On Duty**."
            e.set_footer(text=f"{SERVER_NAME} • Duty Log | User ID: {interaction.user.id}")
            await log.send(embed=e)

        await interaction.response.send_message("✅ You are now **On Duty**!", ephemeral=True)

    @discord.ui.button(label="🔴 Off Duty", style=discord.ButtonStyle.red,
                       custom_id="duty_off", row=0)
    async def off_duty(self, interaction, button):
        uid = str(interaction.user.id)
        dr  = interaction.guild.get_role(DUTY_ROLE_ID)
        if dr not in interaction.user.roles:
            return await interaction.response.send_message("⚠️ You are not On Duty!", ephemeral=True)
        if dr:
            try:
                await interaction.user.remove_roles(dr)
            except:
                pass

        ss = 0.0
        if uid in duty_data and isinstance(duty_data[uid], dict) and "start_time" in duty_data[uid]:
            ss = time.time() - duty_data[uid]["start_time"]
            duty_data[uid]["total_seconds"] = duty_data[uid].get("total_seconds", 0.0) + ss
            duty_data[uid].pop("start_time", None)
            save_duty_data(duty_data)

        h, r   = divmod(int(ss), 3600)
        m, s2  = divmod(r, 60)
        ds = f"{h}h {m}m {s2}s"
        total  = duty_data.get(uid, {}).get("total_seconds", 0.0)
        th, tr = divmod(int(total), 3600)
        tm2, _ = divmod(tr, 60)

        log = bot.get_channel(DUTY_LOG_CHANNEL_ID)
        if log:
            e = discord.Embed(title="🔴 Off Duty", color=discord.Color.red(),
                              timestamp=discord.utils.utcnow())
            e.set_thumbnail(url=interaction.user.display_avatar.url)
            e.description = f"{interaction.user.mention} went **Off Duty**."
            e.add_field(name="⏱ Session", value=ds,              inline=True)
            e.add_field(name="📊 Total",  value=f"{th}h {tm2}m", inline=True)
            e.set_footer(text=f"{SERVER_NAME} • Duty Log | User ID: {interaction.user.id}")
            await log.send(embed=e)

        await interaction.response.send_message(
            f"✅ **Off Duty!** Session: **{ds}** | Total: **{th}h {tm2}m**", ephemeral=True)

    @discord.ui.button(label="📋 Duty Status", style=discord.ButtonStyle.blurple,
                       custom_id="duty_status", row=1)
    async def duty_status(self, interaction, button):
        guild = interaction.guild
        dr    = guild.get_role(DUTY_ROLE_ID)
        now   = time.time()
        on_duty_members = []
        if dr:
            for m in guild.members:
                if dr in m.roles and not m.bot:
                    uid = str(m.id)
                    if uid in duty_data and "start_time" in duty_data[uid]:
                        elapsed = now - duty_data[uid]["start_time"]
                        hh, rem = divmod(int(elapsed), 3600)
                        mn, sc  = divmod(rem, 60)
                        on_duty_members.append((m, f"{hh}h {mn}m {sc}s"))
                    else:
                        on_duty_members.append((m, "0h 0m 0s"))

        e = discord.Embed(title="📋 Duty Status", color=discord.Color.blurple(),
                          timestamp=discord.utils.utcnow())
        if on_duty_members:
            e.description = "\n".join(f"🟢 {m.mention} — `{dur}`" for m, dur in on_duty_members)
            e.set_footer(text=f"{len(on_duty_members)} member(s) on duty | {SERVER_NAME}")
        else:
            e.description = "❌ Nobody is On Duty right now."
            e.set_footer(text=f"{SERVER_NAME} • Duty Status")
        await interaction.response.send_message(embed=e, ephemeral=True)

    @discord.ui.button(label="🏆 Leaderboard", style=discord.ButtonStyle.grey,
                       custom_id="duty_leaderboard_btn", row=1)
    async def leaderboard_btn(self, interaction, button):
        guild = interaction.guild
        now   = time.time()
        totals = []
        for uid, d in duty_data.items():
            if not isinstance(d, dict):
                continue
            total = get_total_seconds(uid, now)
            if total > 0:
                totals.append((uid, total))
        totals.sort(key=lambda x: x[1], reverse=True)

        medals = ["🥇", "🥈", "🥉"]
        e = discord.Embed(title="🏆 Duty Leaderboard", color=discord.Color.gold(),
                          timestamp=discord.utils.utcnow())
        desc = ""
        dr   = guild.get_role(DUTY_ROLE_ID)
        for i, (uid, secs) in enumerate(totals[:10]):
            member = guild.get_member(int(uid))
            name   = member.display_name if member else f"User {uid}"
            hh, rem = divmod(int(secs), 3600)
            mn, _   = divmod(rem, 60)
            medal   = medals[i] if i < 3 else f"**#{i+1}**"
            is_on   = " 🟢" if (member and dr and dr in member.roles) else ""
            desc   += f"{medal} {name}{is_on} — `{hh}h {mn}m`\n"

        e.description = desc or "No duty data yet."
        e.set_footer(text=f"🟢 = Currently on duty • Times never reset | {SERVER_NAME}")
        await interaction.response.send_message(embed=e, ephemeral=True)

# ══════════════════════════════════════════════════════════════
#  SUGGESTION SYSTEM
# ══════════════════════════════════════════════════════════════
class SuggestionModal(discord.ui.Modal, title="💡 Make a Suggestion"):
    suggestion_input = discord.ui.TextInput(
        label="Your suggestion",
        style=discord.TextStyle.paragraph,
        placeholder="Write your suggestion here...",
        required=True,
        max_length=1000
    )

    async def on_submit(self, interaction):
        ch = interaction.guild.get_channel(SUGGESTION_CHANNEL_ID)
        if not ch:
            return await interaction.response.send_message("❌ Channel not found.", ephemeral=True)
        e = discord.Embed(title="💡 New Suggestion", description=self.suggestion_input.value,
                          color=discord.Color.from_rgb(88, 101, 242), timestamp=discord.utils.utcnow())
        e.set_author(name=interaction.user.display_name,
                     icon_url=interaction.user.avatar.url if interaction.user.avatar else None)
        e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        e.set_footer(text=f"User ID: {interaction.user.id} • {SERVER_NAME}")
        msg = await ch.send(embed=e)
        await msg.add_reaction("👍")
        await msg.add_reaction("👎")
        await interaction.response.send_message("✅ Suggestion submitted!", ephemeral=True)


class SuggestionPanelView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="💡 Make a Suggestion", style=discord.ButtonStyle.blurple,
                       custom_id="make_suggestion_btn")
    async def make_suggestion(self, interaction, button):
        await interaction.response.send_modal(SuggestionModal())

# ══════════════════════════════════════════════════════════════
#  REVIEW SYSTEM
# ══════════════════════════════════════════════════════════════
class ReviewModal(discord.ui.Modal, title="⭐ Write a Review"):
    review_input = discord.ui.TextInput(
        label="Your review",
        style=discord.TextStyle.paragraph,
        placeholder="Share your experience...",
        required=True,
        max_length=1000
    )

    def __init__(self, stars):
        super().__init__()
        self.stars = stars

    async def on_submit(self, interaction):
        ch = interaction.guild.get_channel(REVIEW_CHANNEL_ID)
        if not ch:
            return await interaction.response.send_message("❌ Channel not found.", ephemeral=True)
        sd = "⭐" * self.stars + "☆" * (5 - self.stars)
        cm = {
            1: discord.Color.red(),
            2: discord.Color.orange(),
            3: discord.Color.yellow(),
            4: discord.Color.green(),
            5: discord.Color.from_rgb(255, 215, 0)
        }
        e = discord.Embed(title="⭐ New Review",
                          color=cm.get(self.stars, discord.Color.blurple()),
                          timestamp=discord.utils.utcnow())
        e.add_field(name="Rating",  value=sd,                    inline=False)
        e.add_field(name="Comment", value=self.review_input.value, inline=False)
        e.set_author(name=interaction.user.display_name,
                     icon_url=interaction.user.avatar.url if interaction.user.avatar else None)
        e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        e.set_footer(text=f"User ID: {interaction.user.id} • {SERVER_NAME}")
        await ch.send(embed=e)
        await interaction.response.send_message(f"✅ Review submitted! ({sd})", ephemeral=True)


class StarSelect(discord.ui.Select):
    def __init__(self):
        opts = [
            discord.SelectOption(label="⭐ 1 Star",     emoji="⭐", value="1"),
            discord.SelectOption(label="⭐⭐ 2 Stars",   emoji="⭐", value="2"),
            discord.SelectOption(label="⭐⭐⭐ 3 Stars", emoji="⭐", value="3"),
            discord.SelectOption(label="⭐⭐⭐⭐ 4 Stars",  emoji="⭐", value="4"),
            discord.SelectOption(label="⭐⭐⭐⭐⭐ 5 Stars", emoji="⭐", value="5"),
        ]
        super().__init__(custom_id="star_select_review", placeholder="⭐ Select your rating...",
                         min_values=1, max_values=1, options=opts)

    async def callback(self, interaction):
        await interaction.response.send_modal(ReviewModal(int(self.values[0])))


class StarSelectView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(StarSelect())


class ReviewPanelView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="⭐ Write a Review", style=discord.ButtonStyle.blurple,
                       custom_id="make_review_btn")
    async def make_review(self, interaction, button):
        e = discord.Embed(title="⭐ Select Your Rating",
                          description="Choose your star rating, then write your review!",
                          color=discord.Color.from_rgb(255, 215, 0))
        await interaction.response.send_message(embed=e, view=StarSelectView(), ephemeral=True)

# ══════════════════════════════════════════════════════════════
#  SECURITY — BOT VERIFICATION
# ══════════════════════════════════════════════════════════════
class BotVerificationView(discord.ui.View):
    def __init__(self, bot_member):
        super().__init__(timeout=None)
        self.bot_member = bot_member
        self.accept_btn.custom_id = f"bot_accept_{bot_member.id}"
        self.deny_btn.custom_id   = f"bot_deny_{bot_member.id}"

    @discord.ui.button(label="✅ Accept Bot", style=discord.ButtonStyle.green,
                       custom_id="bot_accept_placeholder")
    async def accept_btn(self, interaction, button):
        if not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message("❌ Admins only.", ephemeral=True)
        pending_bots.pop(str(self.bot_member.id), None)
        try:
            for ch in interaction.guild.channels:
                try:
                    await ch.set_permissions(self.bot_member, overwrite=None, reason="Bot accepted")
                except:
                    pass
        except:
            pass
        e = discord.Embed(title="✅ Bot Accepted",
                          description=f"**{self.bot_member}** was accepted by {interaction.user.mention}.",
                          color=discord.Color.green(), timestamp=discord.utils.utcnow())
        await interaction.message.edit(embed=e, view=None)
        await interaction.response.send_message("✅ Bot accepted!", ephemeral=True)

    @discord.ui.button(label="❌ Deny Bot (Kick)", style=discord.ButtonStyle.red,
                       custom_id="bot_deny_placeholder")
    async def deny_btn(self, interaction, button):
        if not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message("❌ Admins only.", ephemeral=True)
        kicked = False
        try:
            await self.bot_member.kick(reason=f"Bot denied by {interaction.user}")
            kicked = True
        except:
            pass
        pending_bots.pop(str(self.bot_member.id), None)
        e = discord.Embed(title="❌ Bot Denied & Kicked",
                          description=f"**{self.bot_member}** kicked by {interaction.user.mention}.\nKick: {'✅' if kicked else '❌'}",
                          color=discord.Color.red(), timestamp=discord.utils.utcnow())
        await interaction.message.edit(embed=e, view=None)
        await interaction.response.send_message("❌ Bot denied and kicked.", ephemeral=True)

# ══════════════════════════════════════════════════════════════
#  SECURITY — MASS BAN/KICK TRACKER
# ══════════════════════════════════════════════════════════════
@bot.event
async def on_member_ban(guild, user):
    await _track_mass_action(guild, user, "ban")


@bot.event
async def on_member_remove(member):
    await asyncio.sleep(1)
    async for entry in member.guild.audit_logs(limit=3, action=discord.AuditLogAction.kick):
        if (entry.target.id == member.id and
                (datetime.datetime.utcnow() - entry.created_at.replace(tzinfo=None)).seconds < 5):
            await _track_mass_action(member.guild, entry.user, "kick")
            break

    uid = str(member.id)
    if uid in invite_data and "invited_by" in invite_data[uid]:
        iid = invite_data[uid]["invited_by"]
        if iid in invite_data:
            invite_data[iid]["left"]  = invite_data[iid].get("left", 0) + 1
            invite_data[iid]["real"]  = max(0, invite_data[iid].get("total", 0) - invite_data[iid].get("left", 0))
            save_invite_data(invite_data)

    await update_voice_channels(member.guild)

    log = bot.get_channel(MEMBER_LEAVE_LOG_CHANNEL_ID)
    if log:
        roles = [r.mention for r in member.roles if r.name != "@everyone"]
        e = discord.Embed(title="🔴 Member Left", color=discord.Color.red(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",         value=f"{member.mention} (`{member.id}`)", inline=True)
        e.add_field(name="📛 Username",     value=str(member),                        inline=True)
        e.add_field(name="👥 Members now",  value=str(member.guild.member_count),     inline=True)
        e.add_field(name="🎭 Roles",        value=" ".join(roles) if roles else "None", inline=False)
        e.set_footer(text=f"{SERVER_NAME} • Member Log | User ID: {member.id}")
        await log.send(embed=e)


async def _track_mass_action(guild, moderator, action_type):
    uid = str(moderator.id) if hasattr(moderator, "id") else str(moderator)
    now = time.time()
    if uid not in ban_kick_tracker:
        ban_kick_tracker[uid] = []
    ban_kick_tracker[uid].append(now)
    ban_kick_tracker[uid] = [t for t in ban_kick_tracker[uid] if now - t < 10]
    if len(ban_kick_tracker[uid]) >= 3:
        ban_kick_tracker[uid] = []
        mm     = guild.get_member(int(uid))
        exempt = [CEO_ROLE_ID, OWNER_ROLE_ID]
        is_ex  = mm and any(r.id in exempt for r in mm.roles)
        if mm and not is_ex:
            try:
                await mm.timeout(datetime.timedelta(weeks=1), reason=f"Mass {action_type}")
            except:
                pass
            e = discord.Embed(title=f"⚠️ Mass {action_type.upper()} Detected!",
                              description=f"{mm.mention} performed mass {action_type}.\n**1 week timeout** applied.",
                              color=discord.Color.dark_red(), timestamp=discord.utils.utcnow())
            await send_security_alert(guild, e, ping=True)

# ══════════════════════════════════════════════════════════════
#  ON MESSAGE
# ══════════════════════════════════════════════════════════════
@bot.event
async def on_message(message):
    if message.author.bot:
        await bot.process_commands(message)
        return

    guild  = message.guild
    author = message.author

    # Token detection
    if guild and TOKEN_PATTERN.search(message.content):
        try:
            await message.delete()
        except:
            pass
        e = discord.Embed(
            title="🔑 TOKEN DETECTED & DELETED!",
            description=(f"{author.mention} sent something that looks like a **Bot Token**!\n"
                         "The message has been deleted.\n\n"
                         "⚠️ **If it's your token, regenerate it IMMEDIATELY!**"),
            color=discord.Color.dark_red(), timestamp=discord.utils.utcnow()
        )
        e.set_thumbnail(url=author.display_avatar.url)
        e.add_field(name="👤 User",    value=f"{author.mention} (`{author.id}`)", inline=True)
        e.add_field(name="📢 Channel", value=message.channel.mention,            inline=True)
        e.set_footer(text=f"{SERVER_NAME} • Security Log")
        await send_security_alert(guild, e, ping=True)
        return

    # Link detection
    if guild and URL_PATTERN.search(message.content):
        exempt = [CEO_ROLE_ID, OWNER_ROLE_ID]
        is_ex  = any(r.id in exempt for r in author.roles)
        if not is_ex and not author.guild_permissions.administrator:
            try:
                await message.delete()
            except:
                pass
            try:
                await author.timeout(datetime.timedelta(hours=1), reason="Link detected")
            except:
                pass
            e = discord.Embed(
                title="🔗 Link Detected & Deleted",
                description=f"{author.mention} sent a link and received a **1 hour timeout**.",
                color=discord.Color.orange(), timestamp=discord.utils.utcnow()
            )
            e.set_thumbnail(url=author.display_avatar.url)
            e.add_field(name="👤 User",    value=f"{author.mention} (`{author.id}`)", inline=True)
            e.add_field(name="📢 Channel", value=message.channel.mention,            inline=True)
            e.set_footer(text=f"{SERVER_NAME} • Security Log")
            await send_security_alert(guild, e, ping=False)
            return

    # Spam detection
    if guild:
        uid = str(author.id)
        now = time.time()
        if uid not in spam_tracker:
            spam_tracker[uid] = []
        spam_tracker[uid].append(now)
        spam_tracker[uid] = [t for t in spam_tracker[uid] if now - t < 5]
        if len(spam_tracker[uid]) >= 5:
            spam_tracker[uid] = []
            if not author.guild_permissions.administrator:
                try:
                    await author.timeout(datetime.timedelta(minutes=10), reason="Spam")
                except:
                    pass
                e = discord.Embed(
                    title="🚫 Spam Detected",
                    description=f"{author.mention} was spamming and received a **10 minute timeout**.",
                    color=discord.Color.red(), timestamp=discord.utils.utcnow()
                )
                e.set_thumbnail(url=author.display_avatar.url)
                e.add_field(name="👤 User",    value=f"{author.mention} (`{author.id}`)", inline=True)
                e.add_field(name="📢 Channel", value=message.channel.mention,            inline=True)
                e.set_footer(text=f"{SERVER_NAME} • Security Log")
                await send_security_alert(guild, e, ping=False)

    await bot.process_commands(message)

# ══════════════════════════════════════════════════════════════
#  ON MEMBER JOIN
# ══════════════════════════════════════════════════════════════
@bot.event
async def on_member_join(member):
    guild = member.guild

    # Bot verification flow
    if member.bot:
        if member.id in WHITELISTED_BOT_IDS:
            return
        try:
            for ch in guild.channels:
                try:
                    await ch.set_permissions(
                        member,
                        send_messages=False,
                        read_messages=False,
                        connect=False,
                        speak=False,
                        reason="Bot pending verification"
                    )
                except:
                    pass
        except:
            pass
        is_v  = bool(member.public_flags and discord.PublicUserFlags.verified_bot in member.public_flags)
        bt    = "✅ Verified Bot" if is_v else "⚠️ Unverified / Custom Bot"
        color = discord.Color.yellow() if is_v else discord.Color.dark_red()
        e = discord.Embed(
            title=f"🤖 New Bot {'(UNVERIFIED ⚠️)' if not is_v else '(Verified)'}",
            description=(f"**{member}** ({member.mention}) joined.\n\n"
                         f"**Type:** {bt}\n**ID:** `{member.id}`\n"
                         f"**Created:** <t:{int(member.created_at.timestamp())}:F>\n\n"
                         "⚠️ Zero permissions until accepted."),
            color=color, timestamp=discord.utils.utcnow()
        )
        e.set_thumbnail(url=member.display_avatar.url)
        e.set_footer(text=f"{SERVER_NAME} • Security Log")
        sl = bot.get_channel(SECURITY_LOG_CHANNEL_ID)
        if sl:
            owner_role = guild.get_role(OWNER_ROLE_ID)
            c = owner_role.mention if owner_role else None
            msg = await sl.send(content=c, embed=e, view=BotVerificationView(member))
            pending_bots[str(member.id)] = msg.id
        return

    # Alt account detection
    age = (datetime.datetime.utcnow() - member.created_at.replace(tzinfo=None)).days
    if age < ALT_ACCOUNT_AGE_DAYS:
        e = discord.Embed(title="🚨 ALT ACCOUNT DETECTED!", color=discord.Color.dark_red(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",    value=f"{member.mention} (`{member.id}`)", inline=False)
        e.add_field(name="📅 Age",     value=f"**{age} days**",                  inline=True)
        e.add_field(name="📆 Created", value=f"<t:{int(member.created_at.timestamp())}:F>", inline=True)
        if ALT_AUTO_KICK:
            try:
                await member.kick(reason=f"Alt account — age: {age} days")
                e.add_field(name="⚡ Action", value="✅ **Auto-kicked**", inline=False)
            except Exception as err:
                e.add_field(name="⚡ Action", value=f"❌ Failed: {err}", inline=False)
        else:
            e.add_field(name="⚡ Action", value="⚠️ Alert only", inline=False)
        e.set_footer(text=f"{SERVER_NAME} • Security Log")
        await send_security_alert(guild, e, ping=True)
        if ALT_AUTO_KICK:
            return

    # Auto-role
    r = guild.get_role(AUTOROLE_ID)
    if r:
        try:
            await member.add_roles(r)
        except:
            pass

    # Invite tracking
    try:
        ni  = await guild.invites()
        nim = {i.code: i.uses for i in ni}
        inviter = None
        for code, ou in invite_cache.get(guild.id, {}).items():
            if nim.get(code, 0) > ou:
                for i in ni:
                    if i.code == code:
                        inviter = i.inviter
                        break
                break
        invite_cache[guild.id] = nim
        if inviter:
            iid = str(inviter.id)
            mid = str(member.id)
            if mid not in invite_data:
                invite_data[mid] = {}
            invite_data[mid]["invited_by"] = iid
            if iid not in invite_data:
                invite_data[iid] = {"total": 0, "real": 0, "left": 0}
            invite_data[iid]["total"] = invite_data[iid].get("total", 0) + 1
            invite_data[iid]["real"]  = invite_data[iid].get("total", 0) - invite_data[iid].get("left", 0)
            save_invite_data(invite_data)
            il = bot.get_channel(INVITE_LOG_CHANNEL_ID)
            if il:
                e = discord.Embed(title="📨 New Invite",
                                  description=f"{member.mention} joined via {inviter.mention}'s invite",
                                  color=discord.Color.green(), timestamp=discord.utils.utcnow())
                e.set_thumbnail(url=member.display_avatar.url)
                e.add_field(
                    name="📊 Inviter Stats",
                    value=(f"**Name:** {inviter.display_name}\n"
                           f"**Total:** {invite_data[iid].get('total', 0)}\n"
                           f"**Real:** {invite_data[iid].get('real', 0)}\n"
                           f"**Left:** {invite_data[iid].get('left', 0)}"),
                    inline=False
                )
                e.set_footer(text=f"{SERVER_NAME} • Invite Log | User ID: {member.id}")
                await il.send(embed=e)
    except Exception as ex:
        print(f"Invite error: {ex}")

    # Join log
    log = bot.get_channel(MEMBER_JOIN_LOG_CHANNEL_ID)
    if log:
        e = discord.Embed(title="🟢 Member Joined", color=discord.Color.green(),
                          timestamp=discord.utils.utcnow())
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",         value=f"{member.mention} (`{member.id}`)", inline=True)
        e.add_field(name="📛 Username",     value=str(member),                        inline=True)
        e.add_field(name="📅 Account Age",  value=f"<t:{int(member.created_at.timestamp())}:R>", inline=True)
        e.add_field(name="👥 Members now",  value=str(guild.member_count),            inline=True)
        e.set_footer(text=f"{SERVER_NAME} • Member Log | User ID: {member.id}")
        await log.send(embed=e)

    await update_voice_channels(guild)

# ══════════════════════════════════════════════════════════════
#  COMMANDS
# ══════════════════════════════════════════════════════════════

# ── MODERATION ────────────────────────────────────────────────
@bot.command()
async def ban(ctx, member: discord.Member = None, *, reason="No reason provided"):
    if not has_mod_permissions(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    if not member:
        return await ctx.reply("Usage: `!ban @user [reason]`")
    await member.ban(reason=reason)
    await ctx.reply(f"🔨 **{member}** has been banned.\n📌 Reason: {reason}")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"🔨 **{ctx.author}** banned **{member}** — {reason}")


@bot.command()
async def kick(ctx, member: discord.Member = None, *, reason="No reason provided"):
    if not has_mod_permissions(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    if not member:
        return await ctx.reply("Usage: `!kick @user [reason]`")
    await member.kick(reason=reason)
    await ctx.reply(f"👢 **{member}** has been kicked.\n📌 Reason: {reason}")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"👢 **{ctx.author}** kicked **{member}** — {reason}")


@bot.command()
async def timeout(ctx, member: discord.Member = None, minutes: int = None, *, reason="No reason provided"):
    if not has_mod_permissions(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    if not member or not minutes:
        return await ctx.reply("Usage: `!timeout @user <minutes> [reason]`")
    await member.timeout(datetime.timedelta(minutes=minutes), reason=reason)
    await ctx.reply(f"⏳ **{member}** has been timed out for **{minutes} minute(s)**.\n📌 Reason: {reason}")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"⏳ **{ctx.author}** timed out **{member}** for {minutes}min — {reason}")


@bot.command()
async def clearmessage(ctx, amount: int = None):
    if not has_mod_permissions(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    if not amount:
        return await ctx.reply("Usage: `!clearmessage <amount>`")
    await ctx.channel.purge(limit=amount + 1)
    await ctx.send(f"🧹 Deleted **{amount}** message(s).", delete_after=3)


# ── INFO ──────────────────────────────────────────────────────
@bot.command()
async def serverstatus(ctx):
    if not is_staff_or_above(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    g = ctx.guild
    e = discord.Embed(title="📊 Server Status", color=discord.Color.blurple(),
                      timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=g.icon.url if g.icon else None)
    e.add_field(name="👤 Members", value=sum(1 for m in g.members if not m.bot))
    e.add_field(name="🤖 Bots",    value=sum(1 for m in g.members if m.bot))
    e.add_field(name="🟢 Online",  value=sum(1 for m in g.members if m.status != discord.Status.offline))
    e.add_field(name="🚀 Boosts",  value=g.premium_subscription_count)
    e.set_footer(text=f"{SERVER_NAME} • Server Status")
    await ctx.reply(embed=e)


@bot.command()
async def invites(ctx, member: discord.Member = None):
    if not is_staff_or_above(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    t   = member or ctx.author
    uid = str(t.id)
    d   = invite_data.get(uid, {"total": 0, "real": 0, "left": 0})
    e = discord.Embed(title=f"📨 Invites — {t.display_name}", color=discord.Color.blurple(),
                      timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=t.display_avatar.url)
    e.add_field(name="📊 Total", value=str(d.get("total", 0)), inline=True)
    e.add_field(name="✅ Real",  value=str(d.get("real", 0)),  inline=True)
    e.add_field(name="🚪 Left", value=str(d.get("left", 0)),  inline=True)
    e.set_footer(text=f"{SERVER_NAME} • Invite Log")
    await ctx.reply(embed=e)


@bot.command()
async def serverinvites(ctx):
    if not is_staff_or_above(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    guild   = ctx.guild
    entries = []
    for uid, d in invite_data.items():
        if not isinstance(d, dict):
            continue
        total = d.get("total", 0)
        if total <= 0:
            continue
        member = guild.get_member(int(uid))
        name   = member.display_name if member else f"User {uid}"
        entries.append((name, total, d.get("real", 0), d.get("left", 0)))
    entries.sort(key=lambda x: x[1], reverse=True)

    e = discord.Embed(title=f"📨 Server Invites — {guild.name}", color=discord.Color.blurple(),
                      timestamp=discord.utils.utcnow())
    if guild.icon:
        e.set_thumbnail(url=guild.icon.url)
    e.set_image(url=BANNER_SUPPORT)

    if entries:
        medals = ["🥇", "🥈", "🥉"]
        desc   = ""
        for i, (name, total, real, left) in enumerate(entries[:20]):
            medal  = medals[i] if i < 3 else f"**#{i+1}**"
            desc  += f"{medal} **{name}** — `{total}` total | `{real}` real | `{left}` left\n"
        e.description = desc
    else:
        e.description = "No invite data available yet."
    e.set_footer(text=f"{SERVER_NAME} • {guild.member_count} total members")
    await ctx.send(embed=e)


@bot.command()
async def scan(ctx, member: discord.Member = None):
    if not is_staff_or_above(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    await ctx.reply("🔍 Scanning...", delete_after=2)
    guild = ctx.guild

    if member:
        age = (datetime.datetime.utcnow() - member.created_at.replace(tzinfo=None)).days
        al  = []
        alb = {
            discord.AuditLogAction.ban:                "🔨 Ban",
            discord.AuditLogAction.kick:               "👢 Kick",
            discord.AuditLogAction.member_role_update: "🎭 Role Update",
            discord.AuditLogAction.channel_delete:     "🗑️ Channel Delete",
            discord.AuditLogAction.role_delete:        "🗑️ Role Delete",
        }
        try:
            async for entry in guild.audit_logs(limit=50):
                if entry.user.id == member.id and entry.action in alb:
                    al.append(
                        f"{alb[entry.action]} → `{getattr(entry.target, 'name', str(entry.target))}` "
                        f"<t:{int(entry.created_at.timestamp())}:R>"
                    )
                    if len(al) >= 8:
                        break
        except:
            pass

        e = discord.Embed(
            title=f"🔍 Scan — {member.display_name}",
            color=discord.Color.dark_red() if (age < ALT_ACCOUNT_AGE_DAYS or member.guild_permissions.administrator)
                  else discord.Color.blurple(),
            timestamp=discord.utils.utcnow()
        )
        e.set_thumbnail(url=member.display_avatar.url)
        e.add_field(name="👤 User",    value=f"{member} (`{member.id}`)", inline=True)
        e.add_field(name="📅 Age",     value=f"{age} days {'⚠️ Possible ALT' if age < ALT_ACCOUNT_AGE_DAYS else '✅'}", inline=True)
        e.add_field(name="📆 Created", value=f"<t:{int(member.created_at.timestamp())}:F>", inline=True)
        e.add_field(
            name="🔑 Permissions",
            value=(f"Administrator: {'✅' if member.guild_permissions.administrator else '❌'}\n"
                   f"Ban: {'✅' if member.guild_permissions.ban_members else '❌'}\n"
                   f"Kick: {'✅' if member.guild_permissions.kick_members else '❌'}\n"
                   f"Manage Guild: {'✅' if member.guild_permissions.manage_guild else '❌'}"),
            inline=True
        )
        e.add_field(name="🎭 Roles",
                    value=", ".join(r.mention for r in member.roles[1:]) or "None",
                    inline=False)
        e.add_field(name=f"📋 Recent Actions ({len(al)})",
                    value="\n".join(al) if al else "None found",
                    inline=False)
        e.set_footer(text=f"{SERVER_NAME} • Scan")
        await ctx.send(embed=e)
        return

    admins = []; newa = []; bl = []; sus = []
    for m in guild.members:
        age = (datetime.datetime.utcnow() - m.created_at.replace(tzinfo=None)).days
        if m.bot:
            iv = bool(m.public_flags and discord.PublicUserFlags.verified_bot in m.public_flags)
            bl.append(f"{'✅' if iv else '⚠️'} {m.mention} (`{m.id}`)")
        if not m.bot and m.guild_permissions.administrator:
            admins.append(f"{m.mention} (`{m.id}`)")
        if not m.bot and age < ALT_ACCOUNT_AGE_DAYS:
            newa.append(f"{m.mention} — {age} days")
        if not m.bot and m.guild_permissions.administrator and age < ALT_ACCOUNT_AGE_DAYS:
            sus.append(f"🚨 {m.mention} — Admin + {age} days")

    e = discord.Embed(title=f"🔍 Server Scan — {guild.name}",
                      color=discord.Color.dark_orange(), timestamp=discord.utils.utcnow())
    e.add_field(name=f"👑 Administrators ({len(admins)})",                      value="\n".join(admins[:10]) or "None", inline=False)
    e.add_field(name=f"🤖 Bots ({len(bl)}) ✅/⚠️",                            value="\n".join(bl[:10])     or "None", inline=False)
    e.add_field(name=f"⚠️ New accounts < {ALT_ACCOUNT_AGE_DAYS}d ({len(newa)})", value="\n".join(newa[:10])   or "None", inline=False)
    e.add_field(name=f"🚨 Suspicious ({len(sus)})",                             value="\n".join(sus[:10])    or "✅ None", inline=False)
    e.set_footer(text=f"{SERVER_NAME} • Scan | {guild.member_count} members")
    await ctx.send(embed=e)


# ── OWNER / CO-OWNER / CEO ────────────────────────────────────
@bot.command()
async def say(ctx, *, message: str):
    if not is_owner_or_above(ctx.author):
        return await ctx.reply("❌ Owner / Co-Owner / CEO only.")
    await ctx.send(message)
    try:
        await ctx.message.delete()
    except:
        pass


@bot.command()
async def say2(ctx, *, message: str):
    """Embed message with server thumbnail."""
    if not is_owner_or_above(ctx.author):
        return await ctx.reply("❌ Owner / Co-Owner / CEO only.")
    guild = ctx.guild
    e = discord.Embed(description=message, color=discord.Color.from_rgb(20, 20, 40),
                      timestamp=discord.utils.utcnow())
    if guild.icon:
        e.set_thumbnail(url=guild.icon.url)
    e.set_footer(text=guild.name, icon_url=guild.icon.url if guild.icon else None)
    await ctx.send(embed=e)
    try:
        await ctx.message.delete()
    except:
        pass


# ── CEO ONLY ──────────────────────────────────────────────────
@bot.command()
async def dmall(ctx, *, message: str):
    """DM all members with an embed."""
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    guild   = ctx.guild
    now_str = discord.utils.utcnow().strftime("%d/%m/%Y %H:%M UTC")
    sent    = 0
    failed  = 0
    for m in guild.members:
        if m.bot:
            continue
        try:
            e = discord.Embed(description=message, color=discord.Color.from_rgb(20, 20, 40),
                              timestamp=discord.utils.utcnow())
            if guild.icon:
                e.set_thumbnail(url=guild.icon.url)
            e.set_footer(
                text=f"Sent by: {ctx.author.display_name} • {now_str}",
                icon_url=ctx.author.display_avatar.url
            )
            await m.send(embed=e)
            sent += 1
        except:
            failed += 1
            continue
    await ctx.reply(f"📨 Delivered to **{sent}** member(s). ❌ Failed: **{failed}**.")


@bot.command()
async def setaltdays(ctx, days: int = None):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    global ALT_ACCOUNT_AGE_DAYS
    if not days or days < 1:
        return await ctx.reply(f"Current threshold: **{ALT_ACCOUNT_AGE_DAYS} days**\nUsage: `!setaltdays <days>`")
    ALT_ACCOUNT_AGE_DAYS = days
    await ctx.reply(f"✅ New alt threshold: **{days} days**")


@bot.command()
async def togglealtban(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    global ALT_AUTO_KICK
    ALT_AUTO_KICK = not ALT_AUTO_KICK
    await ctx.reply(f"Alt auto-kick: {'✅ **Enabled**' if ALT_AUTO_KICK else '❌ **Disabled**'}")


@bot.command()
async def dutypanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title="🟢 Staff Duty Panel",
        description=("Press **On Duty** when your shift starts and **Off Duty** when it ends.\n\n"
                     "📋 **Duty Status** — See who is on duty right now\n"
                     "🏆 **Leaderboard** — All-time duty hours"),
        color=discord.Color.green()
    )
    e.set_footer(text=f"{SERVER_NAME} • Duty System")
    await ctx.send(embed=e, view=DutyView())
    await ctx.reply("✅ Panel sent.", delete_after=2)


@bot.command()
async def supportpanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title=f"{SERVER_NAME} — Support Panel",
        description=("**Open a ticket to get in touch with the right team member.**\n\n"
                     "👑 **Talk to Administrator** — Administration\n"
                     "💬 **Support** — General help\n"
                     "📋 **Report** — Report a user\n"
                     "🛒 **Help with a Purchase** — Order assistance\n"
                     "📌 **Other** — Anything else\n\n"
                     "*One active ticket at a time.*"),
        color=discord.Color.from_rgb(20, 20, 40)
    )
    e.set_image(url=BANNER_SUPPORT)
    e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    e.set_footer(text=f"{SERVER_NAME} • Support System")
    await ctx.send(embed=e, view=SupportTicketPanel())
    await ctx.reply("✅ Panel sent.", delete_after=2)


@bot.command()
async def buypanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title=f"{SERVER_NAME} — Buy Panel",
        description=("**Ready to make a purchase?**\n\n"
                     "🛍️ **Buy a Product** — Browse and purchase from our store\n"
                     "📦 **Make an Order** — Place a custom order\n\n"
                     "*One active ticket at a time.*"),
        color=discord.Color.from_rgb(20, 20, 40)
    )
    e.set_image(url=BANNER_BUY)
    e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    e.set_footer(text=f"{SERVER_NAME} • Buy Panel")
    await ctx.send(embed=e, view=BuyTicketPanel())
    await ctx.reply("✅ Panel sent.", delete_after=2)


@bot.command()
async def servicespanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title=f"{SERVER_NAME} — Services",
        description=("**Interested in one of our professional services?**\n\n"
                     "⚙️ **Buy a Service** — Purchase a premium service\n\n"
                     "*One active ticket at a time.*"),
        color=discord.Color.from_rgb(88, 101, 242)
    )
    e.set_image(url=BANNER_SERVICES)
    e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    e.set_footer(text=f"{SERVER_NAME} • Services")
    await ctx.send(embed=e, view=ServicesTicketPanel())
    await ctx.reply("✅ Panel sent.", delete_after=2)


@bot.command()
async def suggestionpanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title=f"💡 {SERVER_NAME} — Suggestions",
        description=("**Have an idea for us?**\n"
                     "Click the button, write your suggestion and submit it!\n"
                     "The community votes 👍 / 👎"),
        color=discord.Color.from_rgb(88, 101, 242)
    )
    e.set_image(url=BANNER_SUGGEST)
    e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    e.set_footer(text=f"{SERVER_NAME} • Suggestion System")
    await ctx.send(embed=e, view=SuggestionPanelView())
    await ctx.reply("✅ Panel sent.", delete_after=2)


@bot.command()
async def reviewpanel(ctx):
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(
        title=f"⭐ {SERVER_NAME} — Reviews",
        description=("**How was your experience?**\n"
                     "Click the button, choose your star rating (1–5) and leave a comment!"),
        color=discord.Color.from_rgb(255, 215, 0)
    )
    e.set_image(url=BANNER_REVIEW)
    e.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    e.set_footer(text=f"{SERVER_NAME} • Review System")
    await ctx.send(embed=e, view=ReviewPanelView())
    await ctx.reply("✅ Panel sent.", delete_after=2)


# ── HELP PANELS ───────────────────────────────────────────────
@bot.command()
async def panel(ctx):
    """Full CEO command reference."""
    if not is_ceo(ctx.author):
        return await ctx.reply("❌ CEO only.")
    e = discord.Embed(title=f"📌 {SERVER_NAME} — CEO Panel",
                      color=discord.Color.dark_gray(), timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=ctx.guild.icon.url if ctx.guild.icon else None)
    e.add_field(name="🛠 Moderation",  value="`!ban` `!kick` `!timeout` `!clearmessage`",                    inline=False)
    e.add_field(name="📊 Info",        value="`!serverstatus` `!invites [@user]` `!serverinvites` `!scan [@user]`", inline=False)
    e.add_field(name="🧰 Utility",     value="`!say <msg>` `!say2 <msg>` `!dmall <msg>`",                    inline=False)
    e.add_field(name="🔍 Security",    value="`!setaltdays <days>` `!togglealtban`",                          inline=False)
    e.add_field(name="🎫 Panels",      value="`!supportpanel` `!buypanel` `!servicespanel`\n`!suggestionpanel` `!reviewpanel` `!dutypanel`", inline=False)
    e.set_footer(text=f"{SERVER_NAME} • CEO Panel | {ctx.author}")
    await ctx.reply(embed=e)


@bot.command()
async def panel2(ctx):
    """Owner / Co-Owner command reference."""
    if not is_owner_or_above(ctx.author):
        return await ctx.reply("❌ Owner / Co-Owner / CEO only.")
    e = discord.Embed(title=f"📌 {SERVER_NAME} — Owner Panel",
                      color=discord.Color.gold(), timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=ctx.guild.icon.url if ctx.guild.icon else None)
    e.add_field(name="🛠 Moderation", value="`!ban @user [reason]`\n`!kick @user [reason]`\n`!timeout @user <minutes> [reason]`\n`!clearmessage <amount>`", inline=False)
    e.add_field(name="📊 Info",       value="`!serverstatus`\n`!invites [@user]`\n`!serverinvites`\n`!scan [@user]`",                                         inline=False)
    e.add_field(name="🧰 Utility",    value="`!say <msg>`\n`!say2 <msg>`",                                                                                     inline=False)
    e.set_footer(text=f"{SERVER_NAME} • Owner Panel | {ctx.author}")
    await ctx.reply(embed=e)


@bot.command()
async def panel3(ctx):
    """Staff / Management command reference."""
    if not is_staff_or_above(ctx.author):
        return await ctx.reply("❌ You don't have permission to use this command.")
    e = discord.Embed(title=f"📌 {SERVER_NAME} — Staff Panel",
                      color=discord.Color.blurple(), timestamp=discord.utils.utcnow())
    e.set_thumbnail(url=ctx.guild.icon.url if ctx.guild.icon else None)
    e.add_field(name="🛠 Moderation", value="`!ban @user [reason]`\n`!kick @user [reason]`\n`!timeout @user <minutes> [reason]`\n`!clearmessage <amount>`", inline=False)
    e.add_field(name="📊 Info",       value="`!serverstatus`\n`!invites [@user]`\n`!serverinvites`\n`!scan [@user]`",                                         inline=False)
    e.set_footer(text=f"{SERVER_NAME} • Staff Panel | {ctx.author}")
    await ctx.reply(embed=e)

# ══════════════════════════════════════════════════════════════
#  ON READY
# ══════════════════════════════════════════════════════════════
@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")

    # Re-register all persistent views
    for v in [
        SupportTicketPanel(),
        BuyTicketPanel(),
        ServicesTicketPanel(),
        TicketCloseView(),
        DutyView(),
        SuggestionPanelView(),
        ReviewPanelView(),
        StarSelectView(),
    ]:
        bot.add_view(v)

    guild = bot.get_guild(GUILD_ID)
    if guild:
        await update_voice_channels(guild)
        try:
            invs = await guild.invites()
            invite_cache[guild.id] = {i.code: i.uses for i in invs}
            print(f"✅ Loaded {len(invs)} invite(s) into cache.")
        except Exception as e:
            print(f"⚠️ Invite cache error: {e}")

    await bot.change_presence(activity=discord.Game(name=SERVER_NAME))
    print(f"🚀 {SERVER_NAME} Bot is fully online!")


# ══════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    keep_alive()
    bot.run(TOKEN)
