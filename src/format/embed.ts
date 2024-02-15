import Discord from "discord.js";
import { embedConfig } from "../config/discord";
import env from "../config/env";

namespace EmbedFormat {

    // interaction
    export const interaction = {
        DoneRegisterRole: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(embedConfig.colors.success)
                    .setTitle(env.emoji.check+"登録しました！")
                    .setDescription(
                        "ロールを登録しました！\n\n"+
                        `\`${hintCommand}\`よりロールを設定可能です`
                    )
                    .setFooter({ text: embedConfig.footerText })
                ],
                ephemeral: false
            };
        },
        DoneRemoveRole: (hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(embedConfig.colors.success)
                    .setTitle(env.emoji.check+"削除しました！")
                    .setDescription(
                        "登録されているロールを削除しました！\n\n"+
                        `\`${hintCommand}\`よりロールを設定可能です`
                    )
                    .setFooter({ text: embedConfig.footerText })
                ],
                ephemeral: false
            };
        },
        RoleList: (roleIds: string[], hintCommand: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(embedConfig.colors.success)
                    .setTitle(env.emoji.check+"登録されているロール")
                    .setDescription(
                        roleIds.map(roleId => "<@&" + roleId + ">").join(" ")+
                        "\n\n"+
                        `\`${hintCommand}\`よりロールを設定可能です`
                    )
                    .setFooter({ text: embedConfig.footerText })
                ],
                ephemeral: false
            };
        },

        GChat: {
            DoneBANUser: (hintCommand: string): Discord.InteractionReplyOptions => {
                return {
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(embedConfig.colors.success)
                        .setTitle(env.emoji.check+"BANしました！")
                        .setDescription(
                            "ユーザーをグローバルチャットからBANしました！\n\n"+
                            `\`${hintCommand}\`より設定可能です`
                        )
                        .setFooter({ text: embedConfig.footerText })
                    ],
                    ephemeral: true
                };
            },
            DoneUnBANUser: (hintCommand: string): Discord.InteractionReplyOptions => {
                return {
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(embedConfig.colors.success)
                        .setTitle(env.emoji.check+"BANを解除しました！")
                        .setDescription(
                            "ユーザーのBANを解除しました！\n\n"+
                            `\`${hintCommand}\`より設定可能です`
                        )
                        .setFooter({ text: embedConfig.footerText })
                    ],
                    ephemeral: true
                };
            },
            DoneBANServer: (hintCommand: string): Discord.InteractionReplyOptions => {
                return {
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(embedConfig.colors.success)
                        .setTitle(env.emoji.check+"BANしました！")
                        .setDescription(
                            "サーバーをグローバルチャットからBANしました！\n\n"+
                            `\`${hintCommand}\`より設定可能です`
                        )
                        .setFooter({ text: embedConfig.footerText })
                    ],
                    ephemeral: true
                };
            },
            DoneUnBANServer: (hintCommand: string): Discord.InteractionReplyOptions => {
                return {
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(embedConfig.colors.success)
                        .setTitle(env.emoji.check+"BANを解除しました！")
                        .setDescription(
                            "サーバーのBANを解除しました！\n\n"+
                            `\`${hintCommand}\`より設定可能です`
                        )
                        .setFooter({ text: embedConfig.footerText })
                    ],
                    ephemeral: true
                };
            }
        }
    }
}

export default EmbedFormat;