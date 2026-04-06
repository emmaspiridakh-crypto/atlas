# ============================================
# SECTION 1 — IMPORTS & FLASK KEEP_ALIVE
# ============================================

print(">>> BOT FILE LOADED <<<")

import os
import discord
import asyncio
import json
import time
import re
from discord.ext import commands
from discord import app_commands
from flask import Flask
from threading import Thread
import datetime

app = Flask('')

@app.route('/')
def home():
    return "OK"

def run():
    app.run(host='0.0.0.0', port=10000)

def keep_alive():
    t = Thread(target=run)
    t.start()

# ============================================
# SECTION 2 — BOT SETUP & INTENTS
# ============================================

TOKEN = os.getenv("TOKEN")

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="!", intents=intents)

GUILD_ID = 1490079978300117212

# ============================================
# SECTION 3 — IDs (ALL TOGETHER)
# ============================================

# ROLE IDs
FOUNDER_ROLE_ID        = 1490084094749573151
OWNER_ID               = 1490084247682285699
CO_OWNER_ID            = 1490136469287993464
DEVELOPER_ID           = 1490134524221460621
MANAGER_ID             = 1490134503249936525
STAFF_ID               = 1490088402656170045
JOBORG_ID              = 1490338701799194767
APPLICATION_MANAGER_ID = 1490134509830803507
DUTY_ROLE_ID           = 1490338840395649266

# AUTOROLE
AUTOROLE_ID = 1490134521687969864

# ============ WHITELIST / APPLICATIONS ============
WHITELIST_MANAGER_ROLE_ID    = 1490339511186489437
WHITELIST_ROLE_ID            = 1490339131341930577
STAFF_APP_ROLE_ID            = 1490134518768730204
MANAGER_APP_ROLE_ID          = 1490134518768730204

WHITELIST_PANEL_CHANNEL_ID   = 1490340915343134741
WHITELIST_RESULTS_CHANNEL_ID = 1490340158283972800
WHITELIST_CATEGORY_ID        = 1490340549125865683

STAFF_PANEL_CHANNEL_ID       = 1490134614541340834
STAFF_RESULTS_CHANNEL_ID     = 1490340185576181770
STAFF_CATEGORY_ID            = 1490341195090755844

MANAGER_PANEL_CHANNEL_ID     = 1490134614541340834
MANAGER_RESULTS_CHANNEL_ID   = 1490340217687769259
MANAGER_CATEGORY_ID          = 1490341277567549550

DUTY_PANEL_CHANNEL_ID        = 1490341549719162971
DUTY_LOG_CHANNEL_ID          = 1490341619059261510
DUTY_LEADERBOARD_CHANNEL_ID  = 1490341549719162971

SECURITY_LOG_CHANNEL_ID      = 1490340271156756490

# ============ INVITE TRACKER ============
INVITE_LOG_CHANNEL_ID = 0  # <-- βάλε το ID του καναλιού για invite logs

# ============ PANEL IMAGES ============
SERVER_BANNER_URL    = "https://i.imgur.com/TQdHB7o.jpeg"  # <-- μεγάλη εικόνα server
SERVER_THUMBNAIL_URL = "https://i.imgur.com/TQdHB7o.jpeg"  # <-- μικρό thumbnail

# ROLES ΠΟΥ ΜΠΟΡΟΥΝ ΝΑ ΚΑΝΟΥΝ ACCEPT/DENY
APPLICATION_MANAGER_ROLES = [FOUNDER_ROLE_ID, OWNER_ID, CO_OWNER_ID, WHITELIST_MANAGER_ROLE_ID, APPLICATION_MANAGER_ID]

# ============ ΕΡΩΤΗΣΕΙΣ ============
WHITELIST_QUESTIONS = [
    "Ποιο είναι το όνομα και η ηλικία σου (IRL);",
    "Δώσε μια σύντομη περιγραφή του χαρακτήρα σου (προσωπικότητα, background, στόχοι).",
    "Ποιο είναι το επάγγελμα ή η κύρια δραστηριότητα που θέλεις να ακολουθήσει ο χαρακτήρας σου;",
    "Τι είναι το Powergaming; Δώσε παράδειγμα.",
    "Τι είναι το Metagaming; Δώσε παράδειγμα.",
    "Πώς αντιδράς όταν κάποιος κάνει RDM/VDM πάνω σου;",
    "Τι είναι το FailRP; Δώσε παράδειγμα.",
    "Τι περιμένεις από την κοινότητα και τι μπορείς να προσφέρεις εσύ;"
]

STAFF_QUESTIONS = [
    "Πόσο χρονών είσαι?",
    "Πώς σε λένε στο discord?",
    "Πόσες ώρες θα μπορείς να είσαι on duty την μέρα?",
    "Έχεις εμπειρία πανω στο staff κομμάτι? Αν ναι που?",
    "Τι θα κάνεις αν κάποιος φίλος σου ή άλλο staff κάνει abuse perms?",
    "Τι θα κανεις αν κάποιο member προσβάλει κάποιο αλλο άτομο ή staff?",
    "Τι θα κανεις αν υπάρχουν πολλά άτομα στο support και είσαι μόνος σου?",
    "Τι βήματα θα ακολουθήσεις αν έρθει κάποιος παίχτης να αναφέρει ενα περιστατικό που έγινε in game?",
    "Τι θα κάνεις αν κάποιος χρήστης αναφέρει ότι έχει πέσει θύμα RDM/VDM;",
    "Γιατί να επιλέξουμε εσένα και όχι κάποιον άλλο υποψήφιο?"
]

MANAGER_QUESTIONS = [
    "Πόσο χρονών είσαι?",
    "Πώς σε λένε στο discord?",
    "Πόσες ώρες θα μπορείς να είσαι on duty την μέρα?",
    "Τι θέση manager θέλεις στον server?",
    "Έχεις εμπειρία πάνω στο κομμάτι management που θες να ασχοληθείς στον server? Αν ναι που?",
    "Τι θα κάνεις αν τα members τσακώνονται και ασκούν λεκτική βία?",
    "Πως θα κρατήσεις την ομαδικότητα στον server και θα δώσεις κίνητρο να είναι ενεργεί?",
    "Τι θα κάνεις αν κάποιο member ή staff δεν υπακούει στους κανόνες του server?",
    "Γνωρίζεις οτι σε ένα ticket δεν απαντάς αν έχει απαντήσει κάποιος άλλος εκτός αν σου ζητηθεί?",
    "Τι θα κάνεις αν υπάρχουν πολλά άτομα στο support και είσαι μόνος σου?",
    "Γιατί να επιλέξουμε εσένα και όχι κάποιον άλλο υποψήφιο?"
]

# CATEGORY IDs
MAIN_TICKET_CATEGORY_ID = 1490134558182473959
JOB_TICKET_CATEGORY_ID  = 1490134559315197992

# TEMP VOICE
TEMP_VOICE_CATEGORY_ID = 1490134557272313947
TEMP_VOICE_CHANNEL_ID  = 1490134590608642179

# LOG CHANNELS
ON_OFF_DUTY_LOG_ID            = 1490341619059261510
BOT_LOG_ID                    = 1490134570056683670
MESSAGE_EDIT_LOG_CHANNEL_ID   = 1490134573986873475
MESSAGE_DELETE_LOG_CHANNEL_ID = 1490134573986873475
MEMBER_JOIN_LOG_CHANNEL_ID    = 1490134577933582387
MEMBER_LEAVE_LOG_CHANNEL_ID   = 1490134577933582387
ROLE_UPDATE_LOG_CHANNEL_ID    = 1490134580282261534
VOICE_LOG_CHANNEL_ID          = 1490134572225134702
CHANNEL_CREATE_LOG_CHANNEL_ID = 1490134581217591366
CHANNEL_DELETE_LOG_CHANNEL_ID = 1490134581217591366
ROLE_CREATE_LOG_CHANNEL_ID    = 1490134580282261534
ROLE_DELETE_LOG_CHANNEL_ID    = 1490134580282261534
TICKET_LOG_ID                 = 1490134569025011784

# VOICE COUNTER CHANNELS
MEMBERS_CHANNEL_ID = 1490134565145022544
BOTS_CHANNEL_ID    = 1490134568009990154
ONLINE_CHANNEL_ID  = 1490134566558502994
BOOSTS_CHANNEL_ID  = 1490134571147071538

# ============================================
# SECTION 4 — HELPERS
# ============================================

def is_owner_or_coowner(user: discord.Member):
    return any(r.id in (FOUNDER_ROLE_ID, OWNER_ID, CO_OWNER_ID) for r in user.roles)

def can_manage_applications(user: discord.Member):
    return any(r.id in APPLICATION_MANAGER_ROLES for r in user.roles)

# ============================================
# SECTION 5 — DUTY SYSTEM STORAGE
# ============================================

DUTY_FILE = "duty.json"

def load_duty_data():
    if not os.path.exists(DUTY_FILE):
        with open(DUTY_FILE, "w") as f:
            json.dump({}, f)
    with open(DUTY_FILE, "r") as f:
        return json.load(f)

def save_duty_data(data):
    with open(DUTY_FILE, "w") as f:
        json.dump(data, f, indent=4)

duty_data = load_duty_data()

# ============================================
# SECTION 5B — SECURITY STORAGE
# ============================================

SECURITY_FILE = "security.json"

def load_security_data():
    if not os.path.exists(SECURITY_FILE):
        with open(SECURITY_FILE, "w") as f:
            json.dump({"spam": {}, "ban_kick_tracker": {}}, f)
    with open(SECURITY_FILE, "r") as f:
        return json.load(f)

def save_security_data(data):
    with open(SECURITY_FILE, "w") as f:
        json.dump(data, f, indent=4)

security_data = load_security_data()

# ============================================
# SECTION 5C — INVITE TRACKER STORAGE
# ============================================

INVITE_FILE = "invites.json"

def load_invite_data():
    if not os.path.exists(INVITE_FILE):
        with open(INVITE_FILE, "w") as f:
            json.dump({}, f)
    with open(INVITE_FILE, "r") as f:
        return json.load(f)

def save_invite_data(data):
    with open(INVITE_FILE, "w") as f:
        json.dump(data, f, indent=4)

invite_data = load_invite_data()
# invite_data format: { "user_id": { "total": 0, "real": 0, "left": 0 } }

# Cache των invites του guild
invite_cache = {}  # code -> uses

# ============================================
# SECTION 6 — VOICE CHANNEL COUNTERS
# ============================================

async def update_voice_channels(guild: discord.Guild):
    members = sum(1 for m in guild.members if not m.bot)
    bots    = sum(1 for m in guild.members if m.bot)
    online  = sum(1 for m in guild.members if m.status != discord.Status.offline)
    boosts  = guild.premium_subscription_count

    members_ch = guild.get_channel(MEMBERS_CHANNEL_ID)
    bots_ch    = guild.get_channel(BOTS_CHANNEL_ID)
    online_ch  = guild.get_channel(ONLINE_CHANNEL_ID)
    boosts_ch  = guild.get_channel(BOOSTS_CHANNEL_ID)

    if members_ch: await members_ch.edit(name=f"👤 Members: {members}")
    if bots_ch:    await bots_ch.edit(name=f"🤖 Bots: {bots}")
    if online_ch:  await online_ch.edit(name=f"🟢 Online: {online}")
    if boosts_ch:  await boosts_ch.edit(name=f"🚀 Boosts: {boosts}")

@bot.event
async def on_presence_update(before, after):
    await update_voice_channels(after.guild)

@bot.event
async def on_guild_update(before, after):
    if before.premium_subscription_count != after.premium_subscription_count:
        await update_voice_channels(after)

# ============================================
# SECTION 7 — VOICE LOGS
# ============================================

@bot.event
async def on_voice_state_update(member, before, after):
    guild = member.guild
    log   = bot.get_channel(VOICE_LOG_CHANNEL_ID)

    if after.channel and after.channel.id == TEMP_VOICE_CHANNEL_ID:
        category     = guild.get_channel(TEMP_VOICE_CATEGORY_ID)
        temp_channel = await guild.create_voice_channel(
            name=f"{member.name}'s Support", category=category
        )
        try:
            await member.move_to(temp_channel)
        except:
            pass
        if log:
            embed = discord.Embed(title="📞 Support Channel Created",
                                  description=f"Created for {member.mention}",
                                  color=discord.Color.blue())
            embed.set_footer(text=f"Channel ID: {temp_channel.id}")
            await log.send(embed=embed)

    if before.channel and before.channel.category_id == TEMP_VOICE_CATEGORY_ID:
        if before.channel.id != TEMP_VOICE_CHANNEL_ID:
            if len(before.channel.members) == 0:
                try:
                    await before.channel.delete()
                    if log:
                        embed = discord.Embed(title="🗑️ Support Channel Deleted",
                                              description=f"Channel **{before.channel.name}** deleted (empty).",
                                              color=discord.Color.red())
                        await log.send(embed=embed)
                except:
                    pass

    if not log:
        return

    if before.channel is None and after.channel is not None:
        embed = discord.Embed(title="🔊 Voice Join",
                              description=f"**{member.mention}** joined **{after.channel.name}**",
                              color=discord.Color.green())
        embed.set_thumbnail(url=member.avatar)
        embed.set_footer(text=f"User ID: {member.id}")
        await log.send(embed=embed)
    elif before.channel is not None and after.channel is None:
        embed = discord.Embed(title="🔇 Voice Leave",
                              description=f"**{member.mention}** left **{before.channel.name}**",
                              color=discord.Color.red())
        embed.set_thumbnail(url=member.avatar)
        embed.set_footer(text=f"User ID: {member.id}")
        await log.send(embed=embed)
    elif before.channel != after.channel:
        embed = discord.Embed(title="🔁 Voice Move",
                              description=f"**{member.mention}** moved from **{before.channel.name}** to **{after.channel.name}**",
                              color=discord.Color.yellow())
        embed.set_thumbnail(url=member.avatar)
        embed.set_footer(text=f"User ID: {member.id}")
        await log.send(embed=embed)

# ============================================
# SECTION 8 — ROLE LOGS
# ============================================

@bot.event
async def on_guild_role_create(role):
    log = bot.get_channel(ROLE_CREATE_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="🆕 Role Created", description=f"**{role.name}**",
                              color=discord.Color.green())
        embed.set_footer(text=f"Role ID: {role.id}")
        await log.send(embed=embed)

@bot.event
async def on_guild_role_delete(role):
    log = bot.get_channel(ROLE_DELETE_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="🗑️ Role Deleted", description=f"**{role.name}**",
                              color=discord.Color.red())
        embed.set_footer(text=f"Role ID: {role.id}")
        await log.send(embed=embed)

@bot.event
async def on_member_update(before, after):
    guild = after.guild
    log   = bot.get_channel(ROLE_UPDATE_LOG_CHANNEL_ID)

    if len(after.roles) > len(before.roles):
        new_role = next(role for role in after.roles if role not in before.roles)
        async for entry in guild.audit_logs(limit=5, action=discord.AuditLogAction.member_role_update):
            if entry.target.id == after.id:
                if log:
                    embed = discord.Embed(title="➕ Role Added", color=discord.Color.green())
                    embed.add_field(name="User",      value=f"{after.mention}", inline=False)
                    embed.add_field(name="Role",      value=f"**{new_role.name}**", inline=False)
                    embed.add_field(name="Moderator", value=f"{entry.user.mention}", inline=False)
                    embed.set_footer(text=f"User ID: {after.id} | Role ID: {new_role.id}")
                    await log.send(embed=embed)
                break
    elif len(after.roles) < len(before.roles):
        removed_role = next(role for role in before.roles if role not in after.roles)
        async for entry in guild.audit_logs(limit=5, action=discord.AuditLogAction.member_role_update):
            if entry.target.id == after.id:
                if log:
                    embed = discord.Embed(title="➖ Role Removed", color=discord.Color.red())
                    embed.add_field(name="User",      value=f"{after.mention}", inline=False)
                    embed.add_field(name="Role",      value=f"**{removed_role.name}**", inline=False)
                    embed.add_field(name="Moderator", value=f"{entry.user.mention}", inline=False)
                    embed.set_footer(text=f"User ID: {after.id} | Role ID: {removed_role.id}")
                    await log.send(embed=embed)
                break

# ============================================
# SECTION 9 — CHANNEL LOGS
# ============================================

@bot.event
async def on_guild_channel_create(channel):
    log = bot.get_channel(CHANNEL_CREATE_LOG_CHANNEL_ID)
    if log:
        await log.send(f"📁 Channel created: **{channel.name}** (Type: {str(channel.type).title()})")

@bot.event
async def on_guild_channel_delete(channel):
    log = bot.get_channel(CHANNEL_DELETE_LOG_CHANNEL_ID)
    if log:
        await log.send(f"🗑️ Channel deleted: **{channel.name}** (Type: {str(channel.type).title()})")

# ============================================
# SECTION 10 — MESSAGE LOGS
# ============================================

@bot.event
async def on_message_edit(before, after):
    if before.author.bot:
        return
    if before.content == after.content:
        return
    log = bot.get_channel(MESSAGE_EDIT_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="✏️ Message Edited", color=discord.Color.orange())
        embed.add_field(name="User",    value=f"{before.author} ({before.author.id})", inline=False)
        embed.add_field(name="Channel", value=before.channel.mention, inline=False)
        embed.add_field(name="Before",  value=before.content or "None", inline=False)
        embed.add_field(name="After",   value=after.content or "None", inline=False)
        await log.send(embed=embed)

@bot.event
async def on_message_delete(message):
    if message.author.bot:
        return
    log = bot.get_channel(MESSAGE_DELETE_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="🗑️ Message Deleted", color=discord.Color.red())
        embed.add_field(name="User",    value=f"{message.author}", inline=False)
        embed.add_field(name="Channel", value=message.channel.mention, inline=False)
        embed.add_field(name="Content", value=message.content or "None", inline=False)
        await log.send(embed=embed)

# ============================================
# SECTION 11 — TICKET SYSTEM
# ============================================

class TicketCloseView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🔒 Close Ticket", style=discord.ButtonStyle.red, custom_id="close_ticket_button")
    async def close_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        guild       = interaction.guild
        log_channel = guild.get_channel(TICKET_LOG_ID)
        if log_channel:
            embed = discord.Embed(title="❌ Ticket Closed",
                                  description=f"Το ticket έκλεισε από {interaction.user.mention}",
                                  color=discord.Color.red())
            embed.add_field(name="Channel", value=interaction.channel.mention, inline=False)
            await log_channel.send(embed=embed)
        await interaction.response.send_message("Το ticket θα κλείσει σε 4 δευτερόλεπτα...", ephemeral=False)
        await asyncio.sleep(4)
        try:
            await interaction.channel.delete(reason=f"Ticket closed by {interaction.user}")
        except:
            pass

class MainTicketSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(label="Owner",   description="Επικοινωνία με Owner", emoji="👑"),
            discord.SelectOption(label="Bug",     description="Αναφορά bug",          emoji="🐞"),
            discord.SelectOption(label="Report",  description="Αναφορά παίκτη",       emoji="📙"),
            discord.SelectOption(label="Support", description="Γενική υποστήριξη",    emoji="💬"),
        ]
        super().__init__(custom_id="main_ticket_select", placeholder="Make a selection",
                         min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        guild    = interaction.guild
        author   = interaction.user
        category = guild.get_channel(MAIN_TICKET_CATEGORY_ID)
        if not category:
            return await interaction.response.send_message("Η κατηγορία ticket δεν βρέθηκε.", ephemeral=True)
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        if self.values[0] == "Owner":
            roles_ids   = [OWNER_ID, CO_OWNER_ID, FOUNDER_ROLE_ID]
            name        = f"owner-{author.name}".replace(" ", "-").lower()
            ticket_type = "Owner Ticket"
        elif self.values[0] == "Bug":
            roles_ids   = [DEVELOPER_ID, OWNER_ID, CO_OWNER_ID, FOUNDER_ROLE_ID]
            name        = f"bug-{author.name}".replace(" ", "-").lower()
            ticket_type = "Bug Report"
        elif self.values[0] == "Report":
            roles_ids   = [MANAGER_ID, OWNER_ID, CO_OWNER_ID, FOUNDER_ROLE_ID]
            name        = f"report-{author.name}".replace(" ", "-").lower()
            ticket_type = "Report"
        else:
            roles_ids   = [STAFF_ID, OWNER_ID, CO_OWNER_ID, FOUNDER_ROLE_ID]
            name        = f"support-{author.name}".replace(" ", "-").lower()
            ticket_type = "Support"
        for rid in roles_ids:
            role = guild.get_role(rid)
            if role:
                overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)
        channel = await guild.create_text_channel(name=name, category=category, overwrites=overwrites,
                                                  reason=f"Ticket created by {author} ({ticket_type})")

        # Embed μέσα στο ticket channel με εικόνα server
        embed = discord.Embed(
            title=f"🎫 {ticket_type}",
            description=(
                f"Γεια σου {author.mention}!\n\n"
                f"**Το staff θα σε εξυπηρετήσει σύντομα.**\n"
                f"Παρακαλώ περίγραψε το αίτημά σου παρακάτω.\n\n"
                f"*You can only have one active ticket at a time.*"
            ),
            color=discord.Color.from_rgb(20, 20, 40)
        )
        embed.set_image(url=SERVER_BANNER_URL)
        embed.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        embed.set_footer(text="Atlas Roleplay • Support System")
        await channel.send(embed=embed, view=TicketCloseView())

        log_channel = guild.get_channel(TICKET_LOG_ID)
        if log_channel:
            log_embed = discord.Embed(title="📂 Νέο Ticket",
                                      description=f"Ο χρήστης {author.mention} άνοιξε ticket.",
                                      color=discord.Color.blue())
            log_embed.add_field(name="Τύπος",   value=ticket_type)
            log_embed.add_field(name="Channel", value=channel.mention)
            await log_channel.send(embed=log_embed)

        await interaction.response.send_message(f"Το ticket σου δημιουργήθηκε: {channel.mention}", ephemeral=True)

class MainTicketPanel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(MainTicketSelect())

class JobTicketSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(label="Civilian Job", description="Αίτηση για civilian εργασία", emoji="👮"),
            discord.SelectOption(label="Criminal Job", description="Αίτηση για criminal εργασία", emoji="🕵️"),
        ]
        super().__init__(custom_id="job_ticket_select", placeholder="Make a selection",
                         min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        guild    = interaction.guild
        author   = interaction.user
        category = guild.get_channel(JOB_TICKET_CATEGORY_ID)
        if not category:
            return await interaction.response.send_message("Η job ticket κατηγορία δεν βρέθηκε.", ephemeral=True)
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        if self.values[0] == "Civilian Job":
            roles_ids   = [JOBORG_ID]
            name        = f"civilian-{author.name}".replace(" ", "-").lower()
            ticket_type = "Civilian Job"
        else:
            roles_ids   = [JOBORG_ID]
            name        = f"criminal-{author.name}".replace(" ", "-").lower()
            ticket_type = "Criminal Job"
        for rid in roles_ids:
            role = guild.get_role(rid)
            if role:
                overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)
        channel = await guild.create_text_channel(name=name, category=category, overwrites=overwrites,
                                                  reason=f"Job ticket created by {author} ({ticket_type})")

        # Embed μέσα στο job ticket channel με εικόνα server
        embed = discord.Embed(
            title=f"🎫 {ticket_type}",
            description=(
                f"Γεια σου {author.mention}!\n\n"
                f"**Ένας Job Manager θα σε εξυπηρετήσει σύντομα.**\n"
                f"Παρακαλώ περίγραψε την εργασία που σε ενδιαφέρει.\n\n"
                f"*You can only have one active ticket at a time.*"
            ),
            color=discord.Color.from_rgb(20, 20, 40)
        )
        embed.set_image(url=SERVER_BANNER_URL)
        embed.set_thumbnail(url=SERVER_THUMBNAIL_URL)
        embed.set_footer(text="Atlas Roleplay • Job System")
        await channel.send(embed=embed, view=TicketCloseView())

        log_channel = guild.get_channel(TICKET_LOG_ID)
        if log_channel:
            log_embed = discord.Embed(title="📂 Νέο Job Ticket",
                                      description=f"Ο χρήστης {author.mention} άνοιξε job ticket.",
                                      color=discord.Color.blue())
            log_embed.add_field(name="Τύπος",   value=ticket_type)
            log_embed.add_field(name="Channel", value=channel.mention)
            await log_channel.send(embed=log_embed)

        await interaction.response.send_message(f"Το job ticket σου δημιουργήθηκε: {channel.mention}", ephemeral=True)

class JobTicketPanel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(JobTicketSelect())

# ============================================
# SECTION 12 — APPLICATION SYSTEM (WHITELIST / STAFF / MANAGER)
# ============================================

active_application_sessions = {}

class ReasonModal(discord.ui.Modal):
    def __init__(self, action: str, target_user_id: int, app_type: str, original_message: discord.Message):
        super().__init__(title=f"{'Accept' if action == 'accept' else 'Deny'} — Reason")
        self.action           = action
        self.target_user_id   = target_user_id
        self.app_type         = app_type
        self.original_message = original_message

        self.reason_input = discord.ui.TextInput(
            label="Reason (υποχρεωτικό)",
            style=discord.TextStyle.paragraph,
            placeholder="Γράψε τον λόγο...",
            required=True,
            max_length=500
        )
        self.add_item(self.reason_input)

    async def on_submit(self, interaction: discord.Interaction):
        guild       = interaction.guild
        reason      = self.reason_input.value
        target      = guild.get_member(self.target_user_id)
        action_text = "✅ Accepted" if self.action == "accept" else "❌ Denied"
        color       = discord.Color.green() if self.action == "accept" else discord.Color.red()

        original_embed = self.original_message.embeds[0] if self.original_message.embeds else None
        if original_embed:
            original_embed.add_field(
                name=f"{action_text} by",
                value=f"{interaction.user.mention} — {reason}",
                inline=False
            )
            original_embed.color = color
            await self.original_message.edit(embed=original_embed, view=None)

        if self.action == "accept":
            role_id = {
                "whitelist": WHITELIST_ROLE_ID,
                "staff":     STAFF_APP_ROLE_ID,
                "manager":   MANAGER_APP_ROLE_ID,
            }.get(self.app_type)
            if target and role_id:
                role = guild.get_role(role_id)
                if role:
                    try:
                        await target.add_roles(role)
                    except:
                        pass
            if target:
                try:
                    dm_embed = discord.Embed(
                        title=f"✅ Η αίτησή σου για {self.app_type.capitalize()} έγινε δεκτή!",
                        description=f"**Reason:** {reason}",
                        color=discord.Color.green()
                    )
                    await target.send(embed=dm_embed)
                except:
                    pass
        else:
            if target:
                try:
                    dm_embed = discord.Embed(
                        title=f"❌ Η αίτησή σου για {self.app_type.capitalize()} απορρίφθηκε.",
                        description=f"**Reason:** {reason}",
                        color=discord.Color.red()
                    )
                    await target.send(embed=dm_embed)
                except:
                    pass

        await interaction.response.send_message(
            f"{action_text} από {interaction.user.mention}. Reason: {reason}",
            ephemeral=True
        )

class ApplicationDecisionView(discord.ui.View):
    def __init__(self, target_user_id: int, app_type: str):
        super().__init__(timeout=None)
        self.target_user_id = target_user_id
        self.app_type       = app_type

    @discord.ui.button(label="✅ Accept with Reason", style=discord.ButtonStyle.green, custom_id="app_accept_placeholder")
    async def accept_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not can_manage_applications(interaction.user):
            return await interaction.response.send_message("❌ Δεν έχεις δικαίωμα.", ephemeral=True)
        modal = ReasonModal("accept", self.target_user_id, self.app_type, interaction.message)
        await interaction.response.send_modal(modal)

    @discord.ui.button(label="❌ Deny with Reason", style=discord.ButtonStyle.red, custom_id="app_deny_placeholder")
    async def deny_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not can_manage_applications(interaction.user):
            return await interaction.response.send_message("❌ Δεν έχεις δικαίωμα.", ephemeral=True)
        modal = ReasonModal("deny", self.target_user_id, self.app_type, interaction.message)
        await interaction.response.send_modal(modal)

class StartApplicationView(discord.ui.View):
    def __init__(self, app_type: str):
        super().__init__(timeout=None)
        self.app_type = app_type
        label_map = {
            "whitelist": "▶️ Start Whitelist",
            "staff":     "▶️ Start Staff Application",
            "manager":   "▶️ Start Manager Application",
        }
        self.start_btn.label     = label_map.get(app_type, "▶️ Start")
        self.start_btn.custom_id = f"start_app_{app_type}"

    @discord.ui.button(label="▶️ Start", style=discord.ButtonStyle.blurple, custom_id="start_app_placeholder")
    async def start_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        channel_id = interaction.channel.id
        if channel_id in active_application_sessions:
            return await interaction.response.send_message("Η αίτηση είναι ήδη σε εξέλιξη.", ephemeral=True)

        questions = {
            "whitelist": WHITELIST_QUESTIONS,
            "staff":     STAFF_QUESTIONS,
            "manager":   MANAGER_QUESTIONS,
        }.get(self.app_type, [])

        active_application_sessions[channel_id] = {
            "user_id":   interaction.user.id,
            "type":      self.app_type,
            "questions": questions,
            "answers":   [],
            "q_index":   0,
        }

        await interaction.response.send_message(
            f"**Ερώτηση 1/{len(questions)}:**\n{questions[0]}"
        )

class SendApplicationView(discord.ui.View):
    def __init__(self, app_type: str, user_id: int, questions: list, answers: list):
        super().__init__(timeout=None)
        self.app_type  = app_type
        self.user_id   = user_id
        self.questions = questions
        self.answers   = answers

    @discord.ui.button(label="📨 Send", style=discord.ButtonStyle.green, custom_id="send_application")
    async def send_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.id != self.user_id:
            return await interaction.response.send_message("❌ Δεν είσαι εσύ αυτός που κάνει αίτηση.", ephemeral=True)

        guild = interaction.guild
        results_channel_id = {
            "whitelist": WHITELIST_RESULTS_CHANNEL_ID,
            "staff":     STAFF_RESULTS_CHANNEL_ID,
            "manager":   MANAGER_RESULTS_CHANNEL_ID,
        }.get(self.app_type)

        results_channel = guild.get_channel(results_channel_id)
        member = guild.get_member(self.user_id)

        embed = discord.Embed(
            title=f"📋 Αίτηση {self.app_type.capitalize()} — {member.display_name if member else self.user_id}",
            color=discord.Color.blurple()
        )
        embed.set_author(name=str(member), icon_url=member.avatar.url if member and member.avatar else None)

        for q, a in zip(self.questions, self.answers):
            embed.add_field(name=f"❓ {q}", value=f"💬 {a}", inline=False)

        embed.set_footer(text=f"User ID: {self.user_id}")

        view = ApplicationDecisionView(self.user_id, self.app_type)
        if results_channel:
            await results_channel.send(embed=embed, view=view)

        await interaction.response.edit_message(
            content="✅ Η αίτησή σου στάλθηκε! Θα ενημερωθείς με DM για το αποτέλεσμα.",
            view=None
        )

        if interaction.channel.id in active_application_sessions:
            del active_application_sessions[interaction.channel.id]

async def handle_application_message(message: discord.Message):
    channel_id = message.channel.id
    if channel_id not in active_application_sessions:
        return False

    session = active_application_sessions[channel_id]
    if message.author.id != session["user_id"]:
        return False

    session["answers"].append(message.content)
    session["q_index"] += 1

    questions = session["questions"]
    q_index   = session["q_index"]

    if q_index < len(questions):
        await message.channel.send(
            f"**Ερώτηση {q_index + 1}/{len(questions)}:**\n{questions[q_index]}"
        )
    else:
        view = SendApplicationView(session["type"], session["user_id"], questions, session["answers"])
        await message.channel.send(
            "✅ Απάντησες σε όλες τις ερωτήσεις! Πάτα **Send** για να στείλεις την αίτησή σου.",
            view=view
        )

    return True

class ApplicationPanelView(discord.ui.View):
    def __init__(self, app_type: str):
        super().__init__(timeout=None)
        self.app_type = app_type
        label_map = {
            "whitelist": "📋 Whitelist",
            "staff":     "👮 Staff Application",
            "manager":   "👔 Manager Application",
        }
        self.apply_btn.label     = label_map.get(app_type, "Apply")
        self.apply_btn.custom_id = f"open_app_{app_type}"

    @discord.ui.button(label="Apply", style=discord.ButtonStyle.blurple, custom_id="open_app_placeholder")
    async def apply_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        guild        = interaction.guild
        author       = interaction.user
        category_id  = {
            "whitelist": WHITELIST_CATEGORY_ID,
            "staff":     STAFF_CATEGORY_ID,
            "manager":   MANAGER_CATEGORY_ID,
        }.get(self.app_type)

        category     = guild.get_channel(category_id)
        channel_name = f"{self.app_type}-{author.name}".replace(" ", "-").lower()

        existing = discord.utils.get(guild.text_channels, name=channel_name)
        if existing:
            return await interaction.response.send_message(
                f"Έχεις ήδη ανοιχτό κανάλι: {existing.mention}", ephemeral=True
            )

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            author: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
        }
        for rid in APPLICATION_MANAGER_ROLES:
            role = guild.get_role(rid)
            if role:
                overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)

        channel = await guild.create_text_channel(
            name=channel_name, category=category, overwrites=overwrites
        )

        title_map = {
            "whitelist": "📋 Whitelist Application",
            "staff":     "👮 Staff Application",
            "manager":   "👔 Manager Application",
        }

        embed = discord.Embed(
            title=title_map.get(self.app_type, "Application"),
            description=f"Καλώς ήρθες {author.mention}!\nΠάτα το κουμπί παρακάτω για να ξεκινήσεις.",
            color=discord.Color.blurple()
        )
        embed.set_image(url=SERVER_BANNER_URL)

        start_view = StartApplicationView(self.app_type)
        await channel.send(embed=embed, view=start_view)
        await interaction.response.send_message(f"Το κανάλι σου δημιουργήθηκε: {channel.mention}", ephemeral=True)

# ============================================
# SECTION 13 — DUTY SYSTEM
# ============================================

class DutyView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🟢 On Duty", style=discord.ButtonStyle.green, custom_id="duty_on")
    async def on_duty(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_id   = str(interaction.user.id)
        guild     = interaction.guild
        duty_role = guild.get_role(DUTY_ROLE_ID)

        if duty_role in interaction.user.roles:
            return await interaction.response.send_message("Είσαι ήδη On Duty!", ephemeral=True)

        if duty_role:
            try:
                await interaction.user.add_roles(duty_role)
            except:
                pass

        duty_data[user_id] = duty_data.get(user_id, {"total_seconds": 0})
        duty_data[user_id]["start_time"] = time.time()
        save_duty_data(duty_data)

        log = bot.get_channel(DUTY_LOG_CHANNEL_ID)
        if log:
            embed = discord.Embed(title="🟢 On Duty",
                                  description=f"{interaction.user.mention} μπήκε On Duty.",
                                  color=discord.Color.green(),
                                  timestamp=discord.utils.utcnow())
            embed.set_thumbnail(url=interaction.user.avatar)
            await log.send(embed=embed)

        await interaction.response.send_message("✅ Είσαι τώρα **On Duty**!", ephemeral=True)

    @discord.ui.button(label="🔴 Off Duty", style=discord.ButtonStyle.red, custom_id="duty_off")
    async def off_duty(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_id   = str(interaction.user.id)
        guild     = interaction.guild
        duty_role = guild.get_role(DUTY_ROLE_ID)

        if duty_role not in interaction.user.roles:
            return await interaction.response.send_message("Δεν είσαι On Duty!", ephemeral=True)

        if duty_role:
            try:
                await interaction.user.remove_roles(duty_role)
            except:
                pass

        session_seconds = 0
        if user_id in duty_data and "start_time" in duty_data[user_id]:
            session_seconds = time.time() - duty_data[user_id]["start_time"]
            duty_data[user_id]["total_seconds"] = duty_data[user_id].get("total_seconds", 0) + session_seconds
            duty_data[user_id].pop("start_time", None)
            save_duty_data(duty_data)

        hours, rem    = divmod(int(session_seconds), 3600)
        minutes, secs = divmod(rem, 60)
        duration_str  = f"{hours}ω {minutes}λ {secs}δ"

        log = bot.get_channel(DUTY_LOG_CHANNEL_ID)
        if log:
            embed = discord.Embed(title="🔴 Off Duty",
                                  description=f"{interaction.user.mention} βγήκε Off Duty.",
                                  color=discord.Color.red(),
                                  timestamp=discord.utils.utcnow())
            embed.add_field(name="⏱ Διάρκεια session", value=duration_str)
            embed.set_thumbnail(url=interaction.user.avatar)
            await log.send(embed=embed)

        await interaction.response.send_message(f"✅ Βγήκες **Off Duty**! Ήσουν on duty για **{duration_str}**.", ephemeral=True)

async def update_duty_leaderboard(guild: discord.Guild):
    ch = guild.get_channel(DUTY_LEADERBOARD_CHANNEL_ID)
    if not ch:
        return

    sorted_users = sorted(
        [(uid, data.get("total_seconds", 0)) for uid, data in duty_data.items() if isinstance(data, dict)],
        key=lambda x: x[1],
        reverse=True
    )

    embed  = discord.Embed(title="🏆 Duty Leaderboard", color=discord.Color.gold(),
                           timestamp=discord.utils.utcnow())
    medals = ["🥇", "🥈", "🥉"]
    desc   = ""
    for i, (uid, secs) in enumerate(sorted_users[:10]):
        member = guild.get_member(int(uid))
        name   = member.display_name if member else f"User {uid}"
        h, r   = divmod(int(secs), 3600)
        m, _   = divmod(r, 60)
        medal  = medals[i] if i < 3 else f"**#{i+1}**"
        desc  += f"{medal} {name} — {h}ω {m}λ\n"

    embed.description = desc or "Κανένας δεν έχει κάνει duty ακόμα."
    embed.set_footer(text="Ανανεώνεται αυτόματα")

    async for msg in ch.history(limit=5):
        if msg.author == guild.me:
            await msg.edit(embed=embed)
            return
    await ch.send(embed=embed)

# ============================================
# SECTION 14 — SECURITY SYSTEM
# ============================================

spam_tracker     = {}
URL_PATTERN      = re.compile(r"(https?://|www\.)\S+|discord\.gg/\S+", re.IGNORECASE)
pending_bots     = {}
ban_kick_tracker = {}

class BotVerificationView(discord.ui.View):
    def __init__(self, bot_member: discord.Member):
        super().__init__(timeout=None)
        self.bot_member           = bot_member
        self.accept_btn.custom_id = f"bot_accept_{bot_member.id}"
        self.deny_btn.custom_id   = f"bot_deny_{bot_member.id}"

    @discord.ui.button(label="✅ Accept Bot", style=discord.ButtonStyle.green, custom_id="bot_accept_placeholder")
    async def accept_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message("❌ Μόνο admins.", ephemeral=True)
        pending_bots.pop(str(self.bot_member.id), None)

        # Αφαίρεσε τα channel-specific overwrites ώστε να ισχύουν τα default permissions
        try:
            for channel in interaction.guild.channels:
                try:
                    await channel.set_permissions(self.bot_member, overwrite=None,
                        reason="Bot accepted - permissions restored")
                except:
                    pass
        except:
            pass

        await interaction.message.edit(
            content=f"✅ Bot **{self.bot_member}** έγινε **accepted** από {interaction.user.mention}.",
            view=None
        )
        await interaction.response.send_message("✅ Bot accepted! Permissions αποκαταστάθηκαν.", ephemeral=True)

    @discord.ui.button(label="❌ Deny Bot (Kick)", style=discord.ButtonStyle.red, custom_id="bot_deny_placeholder")
    async def deny_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message("❌ Μόνο admins.", ephemeral=True)
        try:
            await self.bot_member.kick(reason=f"Bot denied by {interaction.user}")
        except:
            pass
        pending_bots.pop(str(self.bot_member.id), None)
        await interaction.message.edit(
            content=f"❌ Bot **{self.bot_member}** **kicked** από {interaction.user.mention}.",
            view=None
        )
        await interaction.response.send_message("❌ Bot denied and kicked.", ephemeral=True)

@bot.event
async def on_member_ban(guild, user):
    await _track_mass_action(guild, user, "ban")

@bot.event
async def on_member_remove(member):
    await asyncio.sleep(1)
    async for entry in member.guild.audit_logs(limit=3, action=discord.AuditLogAction.kick):
        if entry.target.id == member.id and (datetime.datetime.utcnow() - entry.created_at.replace(tzinfo=None)).seconds < 5:
            await _track_mass_action(member.guild, entry.user, "kick")
            break

    # --- INVITE TRACKER: member left ---
    uid = str(member.id)
    if uid in invite_data and "invited_by" in invite_data[uid]:
        inviter_id = invite_data[uid]["invited_by"]
        if inviter_id in invite_data:
            invite_data[inviter_id]["left"] = invite_data[inviter_id].get("left", 0) + 1
            invite_data[inviter_id]["real"] = max(0,
                invite_data[inviter_id].get("total", 0) - invite_data[inviter_id].get("left", 0)
            )
            save_invite_data(invite_data)

    await update_voice_channels(member.guild)

    log = bot.get_channel(MEMBER_LEAVE_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="🔴 Member Left",
                              description=f"{member.mention}",
                              color=discord.Color.red())
        embed.set_thumbnail(url=member.avatar)
        embed.set_footer(text=f"User ID: {member.id}")
        await log.send(embed=embed)

async def _track_mass_action(guild: discord.Guild, moderator, action_type: str):
    uid = str(moderator.id) if hasattr(moderator, 'id') else str(moderator)
    now = time.time()

    if uid not in ban_kick_tracker:
        ban_kick_tracker[uid] = []

    ban_kick_tracker[uid].append(now)
    ban_kick_tracker[uid] = [t for t in ban_kick_tracker[uid] if now - t < 10]

    if len(ban_kick_tracker[uid]) >= 3:
        ban_kick_tracker[uid] = []
        mod_member = guild.get_member(int(uid))
        sec_log    = bot.get_channel(SECURITY_LOG_CHANNEL_ID)

        if mod_member and not mod_member.guild_permissions.administrator:
            duration = datetime.timedelta(weeks=1)
            try:
                await mod_member.timeout(duration, reason=f"Mass {action_type} detected")
            except:
                pass
            if sec_log:
                embed = discord.Embed(
                    title=f"⚠️ Mass {action_type.upper()} Detected!",
                    description=f"{mod_member.mention} έκανε mass {action_type}.\nΔόθηκε **1 εβδομάδα timeout**.",
                    color=discord.Color.dark_red(),
                    timestamp=discord.utils.utcnow()
                )
                await sec_log.send(embed=embed)

# ============================================
# SECTION 15 — ON_MESSAGE (SECURITY + APPLICATIONS)
# ============================================

@bot.event
async def on_message(message: discord.Message):
    if message.author.bot:
        await bot.process_commands(message)
        return

    guild   = message.guild
    author  = message.author
    sec_log = bot.get_channel(SECURITY_LOG_CHANNEL_ID) if guild else None

    # ---- ANTI-LINK ----
    if guild and URL_PATTERN.search(message.content):
        exempt_roles = [FOUNDER_ROLE_ID, OWNER_ID]
        is_exempt = any(r.id in exempt_roles for r in author.roles)
        if not is_exempt and not author.guild_permissions.administrator:
            try:
                await message.delete()
            except:
                pass
            try:
                await author.timeout(datetime.timedelta(hours=1), reason="Link detected")
            except:
                pass
            if sec_log:
                embed = discord.Embed(
                    title="🔗 Link Detected & Deleted",
                    description=f"{author.mention} έστειλε link και πήρε **1 ώρα timeout**.",
                    color=discord.Color.orange(),
                    timestamp=discord.utils.utcnow()
                )
                embed.add_field(name="Channel", value=message.channel.mention)
                await sec_log.send(embed=embed)
            return

    # ---- ANTI-SPAM ----
    if guild:
        uid = str(author.id)
        now = time.time()
        if uid not in spam_tracker:
            spam_tracker[uid] = []
        spam_tracker[uid].append(now)
        spam_tracker[uid] = [t for t in spam_tracker[uid] if now - t < 5]

        if len(spam_tracker[uid]) >= 7:
            spam_tracker[uid] = []
            if not author.guild_permissions.administrator:
                try:
                    await author.timeout(datetime.timedelta(minutes=10), reason="Spam detected")
                except:
                    pass
                if sec_log:
                    embed = discord.Embed(
                        title="🚫 Spam Detected",
                        description=f"{author.mention} έκανε spam και πήρε **10 λεπτά timeout**.",
                        color=discord.Color.red(),
                        timestamp=discord.utils.utcnow()
                    )
                    embed.add_field(name="Channel", value=message.channel.mention)
                    await sec_log.send(embed=embed)

    # ---- APPLICATION QUESTIONS ----
    handled = await handle_application_message(message)
    if not handled:
        await bot.process_commands(message)

# ============================================
# SECTION 16 — ON MEMBER JOIN (INVITE TRACKER + AUTOROLE + LOG)
# ============================================

@bot.event
async def on_member_join(member: discord.Member):
    guild = member.guild

    # BOT VERIFICATION
    if member.bot:
        # Αφαίρεσε ΟΛΑ τα permissions από το bot μέχρι να γίνει accept
        try:
            # Βάλε το bot σε όλα τα channels με view_channel=False
            for channel in member.guild.channels:
                try:
                    await channel.set_permissions(member, 
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

        sec_log = bot.get_channel(SECURITY_LOG_CHANNEL_ID)
        if sec_log:
            embed = discord.Embed(
                title="🤖 Νέο Bot Εντοπίστηκε!",
                description=f"Το bot **{member}** ({member.mention}) μπήκε στον server.\nΑποφασίστε αν θα παραμείνει:\n\n⚠️ Το bot έχει **μηδενικά permissions** μέχρι να γίνει Accept.",
                color=discord.Color.yellow(),
                timestamp=discord.utils.utcnow()
            )
            embed.set_thumbnail(url=member.avatar)
            view = BotVerificationView(member)
            msg  = await sec_log.send(embed=embed, view=view)
            pending_bots[str(member.id)] = msg.id
        return

    # AUTOROLE
    role = guild.get_role(AUTOROLE_ID)
    if role:
        try:
            await member.add_roles(role)
        except:
            pass

    # INVITE TRACKER
    try:
        new_invites = await guild.invites()
        new_inv_map = {inv.code: inv.uses for inv in new_invites}
        inviter     = None

        for code, old_uses in invite_cache.get(guild.id, {}).items():
            new_uses = new_inv_map.get(code, 0)
            if new_uses > old_uses:
                # Βρήκαμε ποιο invite χρησιμοποιήθηκε
                for inv in new_invites:
                    if inv.code == code:
                        inviter = inv.inviter
                        break
                break

        # Update cache
        invite_cache[guild.id] = new_inv_map

        if inviter:
            inviter_id = str(inviter.id)
            member_id  = str(member.id)

            # Αποθήκευσε ποιος invited τον νέο member
            if member_id not in invite_data:
                invite_data[member_id] = {}
            invite_data[member_id]["invited_by"] = inviter_id

            # Αύξησε counters του inviter
            if inviter_id not in invite_data:
                invite_data[inviter_id] = {"total": 0, "real": 0, "left": 0}
            invite_data[inviter_id]["total"] = invite_data[inviter_id].get("total", 0) + 1
            invite_data[inviter_id]["real"]  = (
                invite_data[inviter_id].get("total", 0) - invite_data[inviter_id].get("left", 0)
            )
            save_invite_data(invite_data)

            # Log
            inv_log = bot.get_channel(INVITE_LOG_CHANNEL_ID)
            if inv_log:
                embed = discord.Embed(
                    title="📨 Νέο Invite",
                    description=f"{member.mention} μπήκε με invite του {inviter.mention}",
                    color=discord.Color.green(),
                    timestamp=discord.utils.utcnow()
                )
                embed.add_field(name="📊 Στατιστικά Inviter",
                                value=(
                                    f"**Όνομα:** {inviter.display_name}\n"
                                    f"**Συνολικά invites:** {invite_data[inviter_id].get('total', 0)}\n"
                                    f"**Real (ενεργά):** {invite_data[inviter_id].get('real', 0)}\n"
                                    f"**Έφυγαν:** {invite_data[inviter_id].get('left', 0)}"
                                ),
                                inline=False)
                embed.set_thumbnail(url=member.avatar)
                await inv_log.send(embed=embed)
        else:
            # Δεν βρέθηκε inviter, απλά update cache
            invite_cache[guild.id] = new_inv_map

    except Exception as e:
        print(f"Invite tracker error: {e}")

    # JOIN LOG
    log = bot.get_channel(MEMBER_JOIN_LOG_CHANNEL_ID)
    if log:
        embed = discord.Embed(title="🟢 Member Joined",
                              description=f"{member.mention}",
                              color=discord.Color.green())
        embed.set_thumbnail(url=member.avatar)
        embed.set_footer(text=f"User ID: {member.id}")
        await log.send(embed=embed)

    await update_voice_channels(guild)

# ============================================
# SECTION 17 — MODERATION COMMANDS
# ============================================

def has_staff_permissions(member: discord.Member):
    return (
        member.guild_permissions.kick_members or
        member.guild_permissions.ban_members or
        any(r.id in (STAFF_ID, MANAGER_ID, OWNER_ID, CO_OWNER_ID, FOUNDER_ROLE_ID) for r in member.roles)
    )

@bot.command()
async def ban(ctx, member: discord.Member = None, *, reason="No reason provided"):
    if not has_staff_permissions(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα να κάνεις ban.")
    if not member:
        return await ctx.reply("Πρέπει να γράψεις ποιον θέλεις να κάνεις ban.")
    await member.ban(reason=reason)
    await ctx.reply(f"🔨 Ο χρήστης **{member}** έγινε ban.")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"🔨 **{ctx.author}** banned **{member}** — Reason: {reason}")

@bot.command()
async def kick(ctx, member: discord.Member = None, *, reason="No reason provided"):
    if not has_staff_permissions(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα να κάνεις kick.")
    if not member:
        return await ctx.reply("Πρέπει να γράψεις ποιον θέλεις να κάνεις kick.")
    await member.kick(reason=reason)
    await ctx.reply(f"👢 Ο χρήστης **{member}** έγινε kick.")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"👢 **{ctx.author}** kicked **{member}** — Reason: {reason}")

@bot.command()
async def timeout(ctx, member: discord.Member = None, minutes: int = None, *, reason="No reason provided"):
    if not has_staff_permissions(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα να κάνεις timeout.")
    if not member or not minutes:
        return await ctx.reply("Χρήση: `!timeout @user <minutes> <reason>`")
    await member.timeout(datetime.timedelta(minutes=minutes), reason=reason)
    await ctx.reply(f"⏳ Ο χρήστης **{member}** μπήκε timeout για {minutes} λεπτά.")
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"⏳ **{ctx.author}** timed out **{member}** for **{minutes} minutes** — Reason: {reason}")

@bot.command()
async def clearmessage(ctx, amount: int = None):
    if not has_staff_permissions(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα να κάνεις clear.")
    if not amount:
        return await ctx.reply("Χρήση: `!clearmessage <amount>`")
    await ctx.channel.purge(limit=amount + 1)
    await ctx.send(f"🧹 Διαγράφηκαν **{amount}** μηνύματα.", delete_after=3)
    log = bot.get_channel(BOT_LOG_ID)
    if log:
        await log.send(f"🧹 **{ctx.author}** cleared **{amount}** messages in {ctx.channel.mention}")

# ============================================
# SECTION 18 — UTILITY COMMANDS
# ============================================

@bot.command()
async def say(ctx, *, message: str):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα.")
    await ctx.send(message)

@bot.command()
async def dmall(ctx, *, message: str):
    founder_role = ctx.guild.get_role(FOUNDER_ROLE_ID)
    if founder_role not in ctx.author.roles:
        return await ctx.reply("❌ Μόνο ο Founder μπορεί να χρησιμοποιήσει αυτή την εντολή.")
    sent = 0
    for member in ctx.guild.members:
        if member.bot:
            continue
        try:
            await member.send(message)
            sent += 1
        except:
            continue
    await ctx.reply(f"📨 Το μήνυμα στάλθηκε σε **{sent}** μέλη.")

@bot.command()
async def invites(ctx, member: discord.Member = None):
    """Εμφανίζει τα invites ενός χρήστη"""
    target = member or ctx.author
    uid    = str(target.id)
    data   = invite_data.get(uid, {"total": 0, "real": 0, "left": 0})
    embed  = discord.Embed(
        title=f"📨 Invites — {target.display_name}",
        color=discord.Color.blurple()
    )
    embed.add_field(name="📊 Συνολικά",    value=str(data.get("total", 0)), inline=True)
    embed.add_field(name="✅ Real",         value=str(data.get("real",  0)), inline=True)
    embed.add_field(name="🚪 Έφυγαν",      value=str(data.get("left",  0)), inline=True)
    embed.set_thumbnail(url=target.avatar)
    await ctx.reply(embed=embed)

@bot.command()
async def serverstatus(ctx):
    guild   = ctx.guild
    members = sum(1 for m in guild.members if not m.bot)
    bots    = sum(1 for m in guild.members if m.bot)
    online  = sum(1 for m in guild.members if m.status != discord.Status.offline)
    boosts  = guild.premium_subscription_count
    embed   = discord.Embed(title="📊 Server Status", color=discord.Color.blurple())
    embed.add_field(name="👤 Members", value=members)
    embed.add_field(name="🤖 Bots",    value=bots)
    embed.add_field(name="🟢 Online",  value=online)
    embed.add_field(name="🚀 Boosts",  value=boosts)
    await ctx.reply(embed=embed)

@bot.command()
async def panel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("❌ Δεν έχεις δικαίωμα.")
    embed = discord.Embed(title="📌 Atlas Roleplay — Command Panel",
                          description="Όλες οι βασικές εντολές του bot.",
                          color=discord.Color.dark_gray())
    embed.add_field(name="🛠 Moderation",   value="`!ban`, `!kick`, `!timeout`, `!clearmessage`", inline=False)
    embed.add_field(name="📊 Info",         value="`!serverstatus`, `!invites [@user]`",           inline=False)
    embed.add_field(name="🧰 Utility",      value="`!say`, `!dmall`",                              inline=False)
    embed.add_field(name="📋 Applications", value="`!whitelistpanel`, `!staffpanel`, `!managerpanel`", inline=False)
    embed.add_field(name="🟢 Duty",         value="`!dutypanel`, `!dutyleaderboard`",              inline=False)
    await ctx.reply(embed=embed)

# ============================================
# SECTION 19 — PANEL COMMANDS
# ============================================

@bot.command()
async def ticketpanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="Atlas Roleplay — Support Panel",
        description=(
            "**Open a ticket to contact the appropriate staff member.**\n"
            "Our staff are here to help with anything you need!\n\n"
            "*You can only have one active ticket at a time.*"
        ),
        color=discord.Color.from_rgb(20, 20, 40)
    )
    embed.set_image(url=SERVER_BANNER_URL)
    embed.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    embed.set_footer(text="Atlas Roleplay • Support System")
    await ctx.send(embed=embed, view=MainTicketPanel())
    await ctx.reply("Το νέο ticket panel στάλθηκε.", delete_after=2)

@bot.command()
async def jobpanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="Atlas Roleplay — Job Panel",
        description=(
            "**Επίλεξε την κατηγορία job ticket που χρειάζεσαι.**\n"
            "Η ομάδα μας θα σε εξυπηρετήσει άμεσα!\n\n"
            "*You can only have one active ticket at a time.*"
        ),
        color=discord.Color.from_rgb(20, 20, 40)
    )
    embed.set_image(url=SERVER_BANNER_URL)
    embed.set_thumbnail(url=SERVER_THUMBNAIL_URL)
    embed.set_footer(text="Atlas Roleplay • Job System")
    await ctx.send(embed=embed, view=JobTicketPanel())
    await ctx.reply("Το νέο job ticket panel στάλθηκε.", delete_after=2)

@bot.command()
async def whitelistpanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="📋 Whitelist — Atlas Roleplay",
        description="Κάνε αίτηση για να μπεις στον server!\nΠάτα το κουμπί παρακάτω.",
        color=discord.Color.blurple()
    )
    embed.set_image(url=SERVER_BANNER_URL)
    await ctx.send(embed=embed, view=ApplicationPanelView("whitelist"))
    await ctx.reply("Whitelist panel στάλθηκε.", delete_after=2)

@bot.command()
async def staffpanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="👮 Staff Application — Atlas Roleplay",
        description="Κάνε αίτηση για Staff!\nΠάτα το κουμπί παρακάτω.",
        color=discord.Color.green()
    )
    embed.set_image(url=SERVER_BANNER_URL)
    await ctx.send(embed=embed, view=ApplicationPanelView("staff"))
    await ctx.reply("Staff panel στάλθηκε.", delete_after=2)

@bot.command()
async def managerpanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="👔 Manager Application — Atlas Roleplay",
        description="Κάνε αίτηση για Manager!\nΠάτα το κουμπί παρακάτω.",
        color=discord.Color.gold()
    )
    embed.set_image(url=SERVER_BANNER_URL)
    await ctx.send(embed=embed, view=ApplicationPanelView("manager"))
    await ctx.reply("Manager panel στάλθηκε.", delete_after=2)

@bot.command()
async def dutypanel(ctx):
    if not is_owner_or_coowner(ctx.author):
        return await ctx.reply("Δεν έχεις δικαίωμα.")
    embed = discord.Embed(
        title="🟢 Staff Duty Panel",
        description="Πάτα **On Duty** όταν ξεκινάς βάρδια και **Off Duty** όταν τελειώνεις.",
        color=discord.Color.green()
    )
    await ctx.send(embed=embed, view=DutyView())
    await ctx.reply("Duty panel στάλθηκε.", delete_after=2)

@bot.command()
async def dutyleaderboard(ctx):
    guild = ctx.guild
    await update_duty_leaderboard(guild)
    await ctx.reply("✅ Leaderboard ανανεώθηκε.", delete_after=3)

# ============================================
# SECTION 20 — ON_READY
# ============================================

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

    bot.add_view(MainTicketPanel())
    bot.add_view(JobTicketPanel())
    bot.add_view(TicketCloseView())
    bot.add_view(DutyView())
    bot.add_view(ApplicationPanelView("whitelist"))
    bot.add_view(ApplicationPanelView("staff"))
    bot.add_view(ApplicationPanelView("manager"))

    # Load invite cache
    guild = bot.get_guild(GUILD_ID)
    if guild:
        await update_voice_channels(guild)
        try:
            invs = await guild.invites()
            invite_cache[guild.id] = {inv.code: inv.uses for inv in invs}
            print(f"Loaded {len(invs)} invites into cache.")
        except Exception as e:
            print(f"Could not load invites: {e}")

    await bot.change_presence(activity=discord.Game(name="Atlas Roleplay"))
    print("Bot is fully online and ready.")

# ============================================
# SECTION 21 — START BOT
# ============================================

if __name__ == "__main__":
    keep_alive()
    bot.run(TOKEN)
