import { embedConfig, slashCommandsConfig } from "../config/discord";
import env from "../config/env";
import client from "../discord";
import ButtonFormat from "../format/button";
import EmbedFormat from "../format/embed";
import ErrorFormat from "../format/error";
import { DiscordCommandInteraction } from "../types/discord";
import GChatManager from "../utiles/GChatManager";
import DBManager from "../utiles/dbManager";
import logger from "../utiles/logger";
import { sleep, getMember, cacheUpdate, GChatConfRoleCheck } from "../utiles/utiles";
import Discord from "discord.js";

export const command = {
    name: "gchat",
    description: "グローバルチャット",
    options: [
        {
            name: "list",
            description: "グローバルチャット接続リスト",
            type: 1,
        },
        {
            name: "link",
            description: "指定したチャンネルをグローバルチャットへ接続します",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "接続するチャンネル",
                    required: false,
                    type: 7,
                    channel_type: [
                        0, 2
                    ]
                }
            ]
        },
        {
            name: "unlink",
            description: "指定したチャンネルをグローバルチャットから切断します",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "接続するチャンネル",
                    required: false,
                    type: 7,
                    channel_type: [
                        0, 2
                    ]
                }
            ]
        },
        {
            name: "banuser",
            description: "指定したユーザーをグローバルチャットからBANします",
            type: 1,
            options: [
                {
                    name: "id",
                    description: "BANするユーザーID",
                    required: true,
                    type: 7,
                    channel_type: [
                        0, 2
                    ]
                }
            ]
        },
        {
            name: "ban",
            description: "指定したユーザーおよびサーバーをグローバルチャットからBANします",
            type: 2,
            options: [
                {
                    name: "user",
                    description: "指定したユーザーをグローバルチャットからBANします",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "BANするユーザーID",
                            required: true,
                            type: 3
                        }
                    ]
                },
                {
                    name: "server",
                    description: "指定したサーバーをグローバルチャットからBANします",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "BANするサーバーID",
                            required: true,
                            type: 3
                        }
                    ]
                },
            ]
        },
        {
            name: "unban",
            description: "指定したユーザーおよびサーバーをグローバルチャットのBANを解除します",
            type: 2,
            options: [
                {
                    name: "user",
                    description: "指定したユーザーをグローバルチャットのBANを解除します",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "解除するユーザーID",
                            required: true,
                            type: 3
                        }
                    ]
                },
                {
                    name: "server",
                    description: "指定したサーバーをグローバルチャットのBANを解除します",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "解除するサーバーID",
                            required: true,
                            type: 3
                        }
                    ]
                },
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
    if (interaction.user.id != interaction.guild.ownerId && !GChatConfRoleCheck(member.roles)) {
        interaction.reply(ErrorFormat.interaction.PermissionDenied(slashCommandsConfig.config.gchat.editable));
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

    if (subcommandGroup == "ban") {
        if (!env.adminIds.includes(interaction.user.id)) { // BOT運営かの権限チェック
            interaction.reply(ErrorFormat.interaction.SystemPermissionDenied());
            return;
        }
        const id = interaction.options.getString("id");
        if (!id) return;
        if (subCommand == "user") {
            const reset = GChatManager.banUser(id);
            if (!reset) {
                interaction.reply(ErrorFormat.interaction.GChat.AlreadyBANedUser(slashCommandsConfig.gchat.ban.user));
                return;
            }
            interaction.reply(EmbedFormat.interaction.GChat.DoneBANUser(slashCommandsConfig.gchat.ban.user));
            return;
        } else if (subCommand == "server") {
            const reset = GChatManager.banServer(id);
            if (!reset) {
                interaction.reply(ErrorFormat.interaction.GChat.AlreadyBANedServer(slashCommandsConfig.gchat.ban.server));
                return;
            }
            interaction.reply(EmbedFormat.interaction.GChat.DoneBANServer(slashCommandsConfig.gchat.ban.server));
            return;
        }
    } else if (subcommandGroup == "unban") {
        if (!env.adminIds.includes(interaction.user.id)) {
            interaction.reply(ErrorFormat.interaction.PermissionDenied(slashCommandsConfig.config.editable));
            return;
        }
        const id = interaction.options.getString("id");
        if (!id) return;
        if (subCommand == "user") {
            const reset = GChatManager.unbanUser(id);
            if (!reset) {
                interaction.reply(ErrorFormat.interaction.GChat.NotBANedUser(slashCommandsConfig.gchat.unban.user));
                return;
            }
            interaction.reply(EmbedFormat.interaction.GChat.DoneUnBANUser(slashCommandsConfig.gchat.unban.user));
            return;
        } else if (subCommand == "server") {
            const reset = GChatManager.unbanServer(id);
            if (!reset) {
                interaction.reply(ErrorFormat.interaction.GChat.NotBANedServer(slashCommandsConfig.gchat.unban.server));
                return;
            }
            interaction.reply(EmbedFormat.interaction.GChat.DoneUnBANServer(slashCommandsConfig.gchat.unban.server));
            return;
        }
    }

    if (subCommand == "list") {

        await cacheUpdate();
        
        const baseFields: Discord.APIEmbedField[] = 
        (await Promise.all(Object.keys(DBManager.GChatDBs).map(async(channelId) => {
            const GChatDB = DBManager.getGChatDB(channelId);
            if (!GChatDB) return;

            const channel = await client.channels.fetch(channelId).catch((error) => {
                logger.error("unknown channel: "+channelId);
                return null;
            });
            if (channel?.type != Discord.ChannelType.GuildText) return; // これがないと型エラー

            const serverDB = DBManager.getServerDB(channel.guild.id);
            if (!serverDB.GChat.enabled) return;

            const LinkDate = new Date(GChatDB.time);
            const LinkedUser = (await getMember(GChatDB.sourceUserId))?.user.username
            return {
                name: channel.name,
                value: `チャンネルID: ${channelId} <#${channelId}>\n`+
                `接続したユーザー: \`${LinkedUser ? LinkedUser : "None"}\` | <@${GChatDB.sourceUserId}>\n`+
                `接続された日: <t:${Math.floor(LinkDate.getTime() / 1000)}:f> - <t:${Math.floor(LinkDate.getTime() / 1000)}:R>`,
                inline: true
            };
        }))).filter(e => e) as [];

        const pageSlice = env.pageSlice.GChatList; // ページごとに表示する量
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
                .setTitle(`-- GlobaChat List - 1/${Math.ceil(baseFields.length / pageSlice)} --`)
                .setDescription("グローバルBANリスト")
                .setDescription(
                    `**全 ${baseFields.length}個中  1~${pageSlice}個目**`
                )
                .setFields(betweenFields)
                .setFooter({ text: embedConfig.footerText })
        ];
        interaction.reply({ embeds: embeds, components: [ button ], ephemeral: true });
        return;

    }else if (subCommand == "link") {
        const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;
        if (channel?.type != Discord.ChannelType.GuildText) return;

        const result = GChatManager.linkGchat(channel.id, interaction.user.id);
        if (!result) {
            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.warning)
            .setTitle(env.emoji.warning + 'すでに接続されています')
            .setDescription(
                'このチャンネルはすでにグローバルチャットへ接続されています\n\n'+
                `\`${slashCommandsConfig.gchat.unlink}\` より切断できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: true
            });
            return;
        }

        const serverDB = DBManager.getServerDB(interaction.guild.id);
        serverDB.GChat.enabled = true;
        DBManager.saveServerDB(interaction.guild.id);

        const embed = new Discord.EmbedBuilder()
        .setColor(embedConfig.colors.success)
        .setTitle(env.emoji.check + '接続しました！')
        .setDescription(
            `<#${channel.id}> をグローバルチャットへ接続しました！\n`+
            `接続をした人: <@${interaction.user.id}>\n\n`+
            `\`${slashCommandsConfig.gchat.unlink}\` より切断できます`
        )
        .setFooter({ text: embedConfig.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    } else if (subCommand == "unlink") {
        const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;
        if (channel?.type != Discord.ChannelType.GuildText) return;

        const result = GChatManager.unLinkGchat(channel.id);
        if (!result) {
            const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + '接続されていません')
                .setDescription(
                    'このチャンネルはすでにグローバルチャットへ接続されていないチャンネルです\n\n'+
                    `\`${slashCommandsConfig.gchat.link}\` より接続できます`
                )
                .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: true
            });
            return;
        }

        const serverDB = DBManager.getServerDB(interaction.guild.id);
        serverDB.GChat.enabled = false;
        DBManager.saveServerDB(interaction.guild.id);

        const embed = new Discord.EmbedBuilder()
        .setColor(embedConfig.colors.success)
        .setTitle(env.emoji.check + '切断しました！')
        .setDescription(
            `<#${channel.id}> をグローバルチャットから切断しました！\n`+
            `接続をした人: <@${interaction.user.id}>\n\n`+
            `\`${slashCommandsConfig.gchat.link}\` より接続できます`
        )
        .setFooter({ text: embedConfig.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    }

}