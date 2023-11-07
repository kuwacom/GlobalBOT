import { logger, config, client } from "../bot";
import { sleep, getMember, cacheUpdate, GChatConfRoleCheck } from "../modules/utiles";
import * as GChatManager from "../modules/GChatManager";
import * as FormatButton from "../format/button";
import * as FormatEmbed from "../format/embed";
import * as FormatERROR from "../format/error";
import * as Types from "../modules/types";
import * as dbManager from "../modules/dbManager";
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

export const executeInteraction = async (interaction: Types.DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    // 権限チェック
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (interaction.user.id != interaction.guild.ownerId && !GChatConfRoleCheck(member.roles)) {
        interaction.reply(FormatERROR.interaction.PermissionDenied(Types.Commands.config.gchat.editable));
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

    if (subcommandGroup == "ban") {
        if (!config.adminIds.includes(interaction.user.id)) { // BOT運営かの権限チェック
            interaction.reply(FormatERROR.interaction.SystemPermissionDenied());
            return;
        }
        const id = interaction.options.getString("id");
        if (!id) return;
        if (subCommand == "user") {
            const reset = GChatManager.banUser(id);
            if (!reset) {
                interaction.reply(FormatERROR.interaction.GChat.AlreadyBANedUser(Types.Commands.gchat.ban.user));
                return;
            }
            interaction.reply(FormatEmbed.interaction.GChat.DoneBANUser(Types.Commands.gchat.ban.user));
            return;
        } else if (subCommand == "server") {
            const reset = GChatManager.banServer(id);
            if (!reset) {
                interaction.reply(FormatERROR.interaction.GChat.AlreadyBANedServer(Types.Commands.gchat.ban.server));
                return;
            }
            interaction.reply(FormatEmbed.interaction.GChat.DoneBANServer(Types.Commands.gchat.ban.server));
            return;
        }
    } else if (subcommandGroup == "unban") {
        if (!config.adminIds.includes(interaction.user.id)) {
            interaction.reply(FormatERROR.interaction.PermissionDenied(Types.Commands.config.editable));
            return;
        }
        const id = interaction.options.getString("id");
        if (!id) return;
        if (subCommand == "user") {
            const reset = GChatManager.unbanUser(id);
            if (!reset) {
                interaction.reply(FormatERROR.interaction.GChat.NotBANedUser(Types.Commands.gchat.unban.user));
                return;
            }
            interaction.reply(FormatEmbed.interaction.GChat.DoneUnBANUser(Types.Commands.gchat.unban.user));
            return;
        } else if (subCommand == "server") {
            const reset = GChatManager.unbanServer(id);
            if (!reset) {
                interaction.reply(FormatERROR.interaction.GChat.NotBANedServer(Types.Commands.gchat.unban.server));
                return;
            }
            interaction.reply(FormatEmbed.interaction.GChat.DoneUnBANServer(Types.Commands.gchat.unban.server));
            return;
        }
    }

    if (subCommand == "list") {

        await cacheUpdate();
        
        const baseFields: Discord.APIEmbedField[] = 
        (await Promise.all(Object.keys(dbManager.GChatDBs).map(async(channelId) => {
            const GChatDB = dbManager.getGChatDB(channelId);
            if (!GChatDB) return;

            const channel = await client.channels.fetch(channelId).catch((error) => logger.error("not found channel: "+channelId));
            if (channel?.type != Discord.ChannelType.GuildText) return; // これがないと型エラー

            const serverDB = dbManager.getServerDB(channel.guild.id);
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

        const pageSlice = config.pageSlice.GChatList; // ページごとに表示する量
        const betweenFields = baseFields.slice(0, pageSlice);
    
        let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
            .addComponents(FormatButton.GBANBack(0, true))
            .addComponents(FormatButton.GBANNext(1));
        if (0 == Math.ceil(baseFields.length / pageSlice) - 1) {
            button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                .addComponents(FormatButton.GBANBack(0, true))
                .addComponents(FormatButton.GBANNext(1, true));
        }
    
        const embeds = [
            new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.info)
                .setTitle(`-- GlobaChat List - 1/${Math.ceil(baseFields.length / pageSlice)} --`)
                .setDescription("グローバルBANリスト")
                .setDescription(
                    `**全 ${baseFields.length}個中  1~${pageSlice}個目**`
                )
                .setFields(betweenFields)
                .setFooter({ text: config.embed.footerText })
        ];
        interaction.reply({ embeds: embeds, components: [ button ], ephemeral: true });
        return;

    }else if (subCommand == "link") {
        const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;
        if (channel?.type != Discord.ChannelType.GuildText) return;

        const result = GChatManager.linkGchat(channel.id, interaction.user.id);
        if (!result) {
            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.warning)
            .setTitle(config.emoji.warning + 'すでに接続されています')
            .setDescription(
                'このチャンネルはすでにグローバルチャットへ接続されています\n\n'+
                `\`${Types.Commands.gchat.unlink}\` より切断できます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: true
            });
            return;
        }

        const serverDB = dbManager.getServerDB(interaction.guild.id);
        serverDB.GChat.enabled = true;
        dbManager.saveServerDB(interaction.guild.id);

        const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.success)
        .setTitle(config.emoji.check + '接続しました！')
        .setDescription(
            `<#${channel.id}> をグローバルチャットへ接続しました！\n`+
            `接続をした人: <@${interaction.user.id}>\n\n`+
            `\`${Types.Commands.gchat.unlink}\` より切断できます`
        )
        .setFooter({ text: config.embed.footerText })

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
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.warning + '接続されていません')
                .setDescription(
                    'このチャンネルはすでにグローバルチャットへ接続されていないチャンネルです\n\n'+
                    `\`${Types.Commands.gchat.link}\` より接続できます`
                )
                .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: true
            });
            return;
        }

        const serverDB = dbManager.getServerDB(interaction.guild.id);
        serverDB.GChat.enabled = false;
        dbManager.saveServerDB(interaction.guild.id);

        const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.success)
        .setTitle(config.emoji.check + '切断しました！')
        .setDescription(
            `<#${channel.id}> をグローバルチャットから切断しました！\n`+
            `接続をした人: <@${interaction.user.id}>\n\n`+
            `\`${Types.Commands.gchat.link}\` より接続できます`
        )
        .setFooter({ text: config.embed.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    }

}