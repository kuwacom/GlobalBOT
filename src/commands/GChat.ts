import { embedConfig, slashCommandsConfig } from "../config/discord";
import env from "../config/env";
import client from "../discord";
import ButtonFormat from "../format/button";
import EmbedFormat from "../format/embed";
import ErrorFormat from "../format/error";
import { DiscordCommandInteraction } from "../types/discord";
import GChatManager from "../utiles/GChatManager";
import { addGChatBadWord, removeGChatBadWord } from "../utiles/badword";
import DBManager from "../utiles/dbManager";
import logger from "../utiles/logger";
import { sleep, getMember, cacheUpdate, GChatConfRoleCheck } from "../utiles/utiles";
import Discord, { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName('gchat')
    .setDescription('グローバルチャット')
    .addSubcommand(subCommand => subCommand
        .setName('list')
        .setDescription('グローバルチャット接続リスト')
    ).addSubcommand(subCommand => subCommand
        .setName('link')
        .setDescription('指定したチャンネルをグローバルチャットへ接続します')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('接続するチャンネル')
            .setRequired(false)
            .addChannelTypes(
                Discord.ChannelType.GuildText,
                Discord.ChannelType.GuildVoice
            )
        )
    ).addSubcommand(subCommand => subCommand
        .setName('unlink')
        .setDescription('指定したチャンネルをグローバルチャットから切断します')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('切断するチャンネル')
            .setRequired(false)
            .addChannelTypes(
                Discord.ChannelType.GuildText,
                Discord.ChannelType.GuildVoice
            )
        )
    )
    

    .addSubcommandGroup(subCommandGroup => subCommandGroup
        .setName('badword')
        .setDescription('禁止ワードを設定します')
        .addSubcommand(subCommand => subCommand
            .setName('add')
            .setDescription('禁止ワードを登録します')
            .addStringOption(option => option
                .setName('text')
                .setDescription('登録する文字')
                .setRequired(true)
            )
        ).addSubcommand(subCommand => subCommand
            .setName('remove')
            .setDescription('禁止ワードを削除します')
            .addStringOption(option => option
                .setName('text')
                .setDescription('削除する文字')
                .setRequired(true)
            )
        )
    )

    .addSubcommandGroup(subCommandGroup => subCommandGroup
        .setName('ban')
        .setDescription('指定したユーザーおよびサーバーをグローバルチャットからBANします')
        .addSubcommand(subCommand => subCommand
            .setName('user')
            .setDescription('指定したユーザーをグローバルチャットからBANします')
            .addStringOption(option => option
                .setName('id')
                .setDescription('BANするユーザーID')
                .setRequired(true)
            )
        ).addSubcommand(subCommand => subCommand
            .setName('server')
            .setDescription('指定したサーバーをグローバルチャットからBANします')
            .addStringOption(option => option
                .setName('id')
                .setDescription('BANするサーバーID')
                .setRequired(true)
            )
        )
    ).addSubcommandGroup(subCommandGroup => subCommandGroup
        .setName('unban')
        .setDescription('指定したユーザーおよびサーバーをグローバルチャットのBANを解除します')
        .addSubcommand(subCommand => subCommand
            .setName('user')
            .setDescription('指定したユーザーをグローバルチャットのBANを解除します')
            .addStringOption(option => option
                .setName('id')
                .setDescription('解除するユーザーID')
                .setRequired(true)
            )
        ).addSubcommand(subCommand => subCommand
            .setName('server')
            .setDescription('指定したサーバーをグローバルチャットからBANします')
            .addStringOption(option => option
                .setName('id')
                .setDescription('解除するサーバーID')
                .setRequired(true)
            )
        )
    )


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

    if (subcommandGroup == 'badword') {
        if (!env.adminIds.includes(interaction.user.id)) { // BOT運営かの権限チェック
            interaction.reply(ErrorFormat.interaction.SystemPermissionDenied());
            return;
        }

        const text = interaction.options.getString('text');
        if (!text) return;

        if (subCommand == 'add') {
            if (!addGChatBadWord(text)) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + '既に登録されています')
                .setDescription(
                    'この禁止ワードはすでに登録されています\n\n'+
                    `\`${slashCommandsConfig.gchat.badWord.remove}\` より削除できます`
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
            .setTitle(env.emoji.check + '登録しました！')
            .setDescription(
                `\`${text}\` を禁止ワードへ登録しました！\n`+
                `\`${slashCommandsConfig.gchat.badWord.remove}\` より削除できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        } else if (subCommand == 'remove') {
            if (!removeGChatBadWord(text)) {
                const embed = new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(env.emoji.warning + '登録されていません')
                .setDescription(
                    'この文字は禁止ワードへ登録されていません\n'+
                    `\`${slashCommandsConfig.gchat.badWord.add}\` より登録できます`
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
            .setTitle(env.emoji.check + '削除しました！')
            .setDescription(
                `\`${text}\` を禁止ワードから削除しました！\n`+
                `\`${slashCommandsConfig.gchat.badWord.remove}\` より登録できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    } else
    
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