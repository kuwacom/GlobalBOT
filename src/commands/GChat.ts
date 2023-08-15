import { logger, config, client } from "../bot";
import { sleep, getMember, cacheUpdate } from "../modules/utiles";
import * as GChatManager from "../modules/GChatManager";
import * as FormatButton from "../format/button";
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
    const subCommand = interaction.options.getSubcommand();
    if (subCommand == "list") {

        await cacheUpdate();
        
        const baseFields: Discord.APIEmbedField[] = 
        (await Promise.all(Object.keys(dbManager.GChatDBs).map(async(channelId) => {
            const GChatDB = dbManager.getGChatDB(channelId);
            if (!GChatDB) return;
    
            const channel = await client.channels.fetch(channelId);
            if (channel?.type != Discord.ChannelType.GuildText) return; // これがないと型エラー

            const serverDB = dbManager.getServerDB(channel.guild.id);
            if (!serverDB.GChatable) return;

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
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.warning + 'すでに接続されています')
            .setDescription(
                'このチャンネルはすでにグローバルチャットへ接続されています\n\n'+
                `\`${Types.Commands.gchat.unlink}\` より切断できます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }

        const serverDB = dbManager.getServerDB(interaction.guild.id);
        serverDB.GChatable = true;
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
            ephemeral: true
        });
        return;
    } else if (subCommand == "unlink") {
        const channel = interaction.options.getChannel("channel") ? interaction.options.getChannel("channel") : interaction.channel;
        if (channel?.type != Discord.ChannelType.GuildText) return;

        const result = GChatManager.linkGchat(channel.id, interaction.user.id);
        if (!result) {
            const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.warning + '接続されていません')
                .setDescription(
                    'このチャンネルはすでにグローバルチャットへ接続されていないチャンネルです\n\n'+
                    `\`${Types.Commands.gchat.link}\` より接続できます`
                )
                .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }

        const serverDB = dbManager.getServerDB(interaction.guild.id);
        serverDB.GChatable = false;
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
            ephemeral: true
        });
        return;
    }

}