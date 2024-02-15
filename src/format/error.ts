import { logger, config, client } from "../bot";
import * as Types from "../types/types";
import Discord from "discord.js";

// interaction
export const interaction = {
    // template一個目のエラー
    TemplateError: {
        embeds: [
            new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.error+"エラー")
            .setDescription("エラーです")
            .setFooter({ text: config.embed.footerText })
        ],
        ephemeral: true
    } as Discord.InteractionReplyOptions,

    // 権限足りないときエラー
    PermissionDenied: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.error+"権限がありません！")
                .setDescription(
                    "このコマンドを実行する権限がありません！\n"+
                    "サーバーのオーナーに設定変更を申し出てください\n\n"+
                    `\`${hintCommand}\`より権限を設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: true
        };
    },
    SystemPermissionDenied: (): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.error+"権限がありません！")
                .setDescription(
                    "このコマンドを実行する権限がありません！\n"+
                    "このサーバーはBOT運営者のみが利用可能です"
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: true
        };
    },
    AlreadyRegisteredRole: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.warning+"すでに登録されています！")
                .setDescription(
                    "このロールはすでに登録済みです\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: true
        };
    },
    NotRegisteredRole: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.warning+"存在しないロールです！")
                .setDescription(
                    "このロールは登録されていません\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: true
        };
    },
    NotRegisteredRoles: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.warning)
                .setTitle(config.emoji.warning+"ロールがありません！")
                .setDescription(
                    "ロールの設定がされていません！\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: true
        };
    },


    GChat: {
        AlreadyBANedUser: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Types.embedCollar.warning)
                    .setTitle(config.emoji.warning+"すでにBANされています！")
                    .setDescription(
                        "このユーザーはすでにBANされています！\n\n"+
                        `\`${hintCommand}\`より設定可能です`
                    )
                    .setFooter({ text: config.embed.footerText })
                ],
                ephemeral: true
            };
        },
        NotBANedUser: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Types.embedCollar.warning)
                    .setTitle(config.emoji.warning+"BANされていないユーザーです！")
                    .setDescription(
                        "このユーザーはBANされていないユーザーです！\n\n"+
                        `\`${hintCommand}\`より設定可能です`
                    )
                    .setFooter({ text: config.embed.footerText })
                ],
                ephemeral: true
            };
        },

        AlreadyBANedServer: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Types.embedCollar.warning)
                    .setTitle(config.emoji.warning+"すでにBANされています！")
                    .setDescription(
                        "このサーバーはすでにBANされています！\n\n"+
                        `\`${hintCommand}\`より設定可能です`
                    )
                    .setFooter({ text: config.embed.footerText })
                ],
                ephemeral: true
            };
        },
        NotBANedServer: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Types.embedCollar.warning)
                    .setTitle(config.emoji.warning+"BANされていないサーバーです！")
                    .setDescription(
                        "このサーバーはBANされていないユーザーです！\n\n"+
                        `\`${hintCommand}\`より設定可能です`
                    )
                    .setFooter({ text: config.embed.footerText })
                ],
                ephemeral: true
            };
        }
    }
}

// message
export const message = {
    // textCommandに対応してないとき
    NotSupportTextCommand: {
        embeds: [
            new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.error+"エラー")
            .setDescription(
                "このコマンドはテキストコマンドに対応していません！"
            )
            .setFooter({ text: config.embed.footerText })
        ],
        allowedMentions: {
            repliedUser: true
        }
    } as Discord.MessageReplyOptions,
    
    // 引数ないとき
    NoArg: {
        embeds: [
            new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.warning)
            .setTitle(config.emoji.error+"エラー")
            .setDescription("**引数を入力してください**")
            .setFooter({ text: config.embed.footerText })
        ],
        allowedMentions: {
            repliedUser: true
        }
    } as Discord.MessageReplyOptions,

    // コマンドがないとき
    NotfoundCommand: {
        embeds: [
            new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.error+"エラー")
            .setDescription(
                "**コマンドが見つかりません**"
                )
            .setFooter({ text: config.embed.footerText })
        ],
        allowedMentions: {
            repliedUser: true
        }
    } as Discord.MessageReplyOptions,
}