import { logger, config, client } from "../bot";
import * as Types from "../modules/types";
import Discord from "discord.js";

// interaction
export const interaction = {
    DoneRegisterRole: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.success)
                .setTitle(config.emoji.check+"登録しました！")
                .setDescription(
                    "ロールを登録しました！\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: false
        };
    },
    DoneRemoveRole: (hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.success)
                .setTitle(config.emoji.check+"削除しました！")
                .setDescription(
                    "登録されているロールを削除しました！！\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: false
        };
    },
    RoleList: (roleIds: string[], hintCommand: string): Discord.InteractionReplyOptions => {
        return {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.success)
                .setTitle(config.emoji.check+"登録されているロール")
                .setDescription(
                    roleIds.map(roleId => "<@&" + roleId + ">").join(" ")+
                    "\n\n"+
                    `\`${hintCommand}\`よりロールを設定可能です`
                )
                .setFooter({ text: config.embed.footerText })
            ],
            ephemeral: false
        };
    }
}
