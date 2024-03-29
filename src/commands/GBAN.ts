import { embedConfig, slashCommandsConfig } from "../config/discord";
import env from "../config/env";
import client from "../discord";
import ButtonFormat from "../format/button";
import ErrorFormat from "../format/error";
import { DiscordCommandInteraction } from "../types/discord";
import GBANManager from "../utiles/GBANManager";
import DBManager from "../utiles/dbManager";
import { sleep, getMember, cacheUpdate, GBANConfRoleCheck } from "../utiles/utiles";
import Discord from "discord.js";

export const command = {
    name: "gban",
    description: "グローバルBAN",
    options: [
        {
            name: "list",
            description: "グローバルBANリスト",
            type: 1,
        },
        {
            name: "sync",
            description: "グローバルBAN情報を同期させます",
            type: 1,
        },
        {
            name: "ban",
            description: "BAN",
            type: 2,
            options: [
                { // USER
                    name: "user",
                    description: "ユーザー指定でBAN",
                    type: 1,
                    options: [
                        {
                            name: "user",
                            description: "BANするユーザー",
                            required: true,
                            type: 6
                        },
                        {
                            name: "reason",
                            description: "理由",
                            type: 3
                        }
                    ]
                },
                { // USERID
                    name: "userid",
                    description: "ユーザーID指定でBAN",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "BANするユーザーID",
                            required: true,
                            type: 3 
                        },
                        {
                            name: "reason",
                            description: "理由",
                            type: 3
                        }
                    ]
                }
            ]
        },
        {
            name: "unban",
            description: "BAN",
            type: 2,
            options: [
                { // USER
                    name: "user",
                    description: "ユーザー指定で解除",
                    type: 1,
                    options: [
                        {
                            name: "user",
                            description: "解除するユーザー",
                            required: true,
                            type: 6 
                        }
                    ]
                },
                { // USERID
                    name: "userid",
                    description: "ユーザーID指定で解除",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "解除するユーザーID",
                            required: true,
                            type: 3 
                        }
                    ]
                }
            ]
        }
    ]
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild || !message.member || message.channel.type == Discord.ChannelType.GuildStageVoice) return;  // v14からステージチャンネルからだとsendできない
    // messageCommand

}

export const executeInteraction = async (interaction: DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    // 権限チェック
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (interaction.user.id != interaction.guild.ownerId && !GBANConfRoleCheck(member.roles)) {
        interaction.reply(ErrorFormat.interaction.PermissionDenied(slashCommandsConfig.config.gban.editable));
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();
    if (subCommand == "list") {

        // await cacheUpdate();
        
        const baseFields: Discord.APIEmbedField[] = 
        (await Promise.all(Object.keys(DBManager.GBANDBs).map(async(userId) => {
            const GBANDB = DBManager.getGBANDB(userId);
            if (!GBANDB) return;
    
            const BANDate = new Date(GBANDB.time);
            const BANedUser = (await getMember(GBANDB.sourceUserId))?.user.username
            return{
                name: GBANDB.userName,
                value: `ユーザーID: ${userId} <@${userId}>\n`+
                `BANしたユーザー: \`${BANedUser ? BANedUser : "None"}\` | <@${GBANDB.sourceUserId}>\n`+
                (GBANDB.reason ? `BAN理由: \`${GBANDB.reason}\`\n` : "")+
                `BANされたサーバー: \`${client.guilds.cache.get(GBANDB.serverId)?.name}\`\n`+
                `BANされた日: <t:${Math.floor(BANDate.getTime() / 1000)}:f> - <t:${Math.floor(BANDate.getTime() / 1000)}:R>`,
                inline: true
            };
        }))).filter(e => e) as [];

        const pageSlice = env.pageSlice.GBANList; // ページごとに表示する量
        const betweenFields = baseFields.slice(0, pageSlice);
    
        let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
            .addComponents(ButtonFormat.GBANBack(0, true))
            .addComponents(ButtonFormat.GBANNext(1));
        if (0 == Math.ceil(baseFields.length / pageSlice) - 1) {
            button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                .addComponents(ButtonFormat.GBANBack(0, true))
                .addComponents(ButtonFormat.GBANNext(1, true));
        }
    
        const embeds = [
            new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.info)
                .setTitle(`-- GlobaBAN List - 1/${Math.ceil(baseFields.length / pageSlice)} --`)
                .setDescription("グローバルBANリスト")
                .setDescription(
                    `**全 ${baseFields.length}個中  1~${pageSlice}個目**`
                )
                .setFields(betweenFields)
                .setFooter({ text: embedConfig.footerText })
        ];
        interaction.reply({ embeds: embeds, components: [ button ], ephemeral: true });
        return;

    }else if (subCommand == "sync") {
        
        GBANManager.init(interaction.guild.id);
        
        const embed = new Discord.EmbedBuilder()
        .setColor(embedConfig.colors.success)
        .setTitle(env.emoji.check + 'グローバルBANと同期しました！')
        .setDescription(
            'グローバルBANとサーバーのBANを同期しました'
        )
        .setFooter({ text: embedConfig.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    }


    if (subcommandGroup == "ban") { // ban
        if (subCommand == "user") {
            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");
            if (!user) return;

            const result = await GBANManager.ban(user.id, user.username, reason, interaction.user.id, interaction.guild.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + 'すでにBANされています')
                .setDescription(
                    'このユーザーはすでにグローバルBANされています\n\n'+
                    `\`${slashCommandsConfig.gban.unban.user}\` よりBANを解除できます`
                )
                .setFooter({ text: embedConfig.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: true
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + 'グローバルBANしました！')
            .setDescription(
                'BOTを導入している全サーバーでBANしました！\n'+
                `BANをされた人: <@${user.id}> | \`${user.id}\`\n`+
                `BANをした人: <@${interaction.user.id}>\n\n`+
                `\`${slashCommandsConfig.gban.unban.user}\` よりBANを解除できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        } else if (subCommand == "userid") {
            const userId = interaction.options.getString("id");
            const reason = interaction.options.getString("reason");
            if (!userId) return;

            const result = await GBANManager.ban(userId, null, reason, interaction.user.id, interaction.guild.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + 'すでにBANされています')
                .setDescription(
                    'このユーザーはすでにグローバルBANされています\n\n'+
                    `\`${slashCommandsConfig.gban.unban.userId}\` よりBANを解除できます`
                )
                .setFooter({ text: embedConfig.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: true
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + 'グローバルBANしました！')
            .setDescription(
                'BOTを導入している全サーバーでBANしました！\n'+
                `BANをされた人: <@${userId}> | \`${userId}\`\n`+
                `BANをした人: <@${interaction.user.id}>\n\n`+
                `\`${slashCommandsConfig.gban.unban.userId}\` よりBANを解除できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    } else if (subcommandGroup == "unban") { // ban解除
        if (subCommand == "user") {
            const user = interaction.options.getUser("user");
            if (!user) return;
            
            const result = await GBANManager.unBan(user.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + 'BANされていないユーザーです')
                .setDescription(
                    'このユーザーはグローバルBANされていません\n\n'+
                    `\`${slashCommandsConfig.gban.ban.user}\` よりBANできます`
                )
                .setFooter({ text: embedConfig.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: true
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + 'グローバルBANを解除しました！')
            .setDescription(
                'BOTを導入している全サーバーでBAN解除しました！\n'+
                `BAN解除された人: <@${user.id}> | \`${user.id}\`\n`+
                `BAN解除した人: <@${interaction.user.id}>\n\n`+
                `\`${slashCommandsConfig.gban.ban.user}\` よりBANできます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        } else if (subCommand == "userid") {
            const userId = interaction.options.getString("id");
            if (!userId) return;
            
            const result = await GBANManager.unBan(userId);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + 'BANされていないユーザーです')
                .setDescription(
                    'このユーザーはグローバルBANされていません\n\n'+
                    `\`${slashCommandsConfig.gban.ban.userId}\` よりBANできます`
                )
                .setFooter({ text: embedConfig.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: true
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + 'グローバルBANを解除しました！')
            .setDescription(
                'BOTを導入している全サーバーでBAN解除しました！\n'+
                `BAN解除された人: <@${userId}> | \`${userId}\`\n`+
                `BAN解除した人: <@${interaction.user.id}>\n\n`+
                `\`${slashCommandsConfig.gban.ban.userId}\` よりBANできます`
            )
            .setFooter({ text: embedConfig.footerText })

            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    }
}
