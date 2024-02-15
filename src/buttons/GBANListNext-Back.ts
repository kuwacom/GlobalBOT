import { autoDeleteMessage, sec2HHMMSS, sleep, getMember, cacheUpdate } from "../utiles/utiles";
import Discord from "discord.js";
import { DiscordButtonInteraction } from "../types/discord";
import DBManager from "../utiles/dbManager";
import client from "../discord";
import env from "../config/env";
import ButtonFormat from "../format/button";
import { embedConfig } from "../config/discord";

export const button = {
    customId: ["GBANNext", "GBANBack"]
}

export const executeInteraction = async (interaction: DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const guild = interaction.guild;
    if (!guild || !interaction.member) return;

    await cacheUpdate();

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
    const betweenFields = baseFields.slice(Number(values[0]) * pageSlice, (Number(values[0]) * pageSlice) + pageSlice);

    // 過去のボタン押したときとかで存在しないページの場合最初に戻す ヘルプ変えることなんてないからほぼない
    if (Number(values[0]) > (Math.ceil(baseFields.length / pageSlice) - 1)) values[0] = "0";

    let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
    if (Number(values[0]) == 0) {
        button.addComponents(ButtonFormat.GBANBack(0, true))
            .addComponents(ButtonFormat.GBANNext(Number(values[0]) + 1));
    } else if (Number(values[0]) == Math.ceil(baseFields.length / pageSlice) - 1) {
        button.addComponents(ButtonFormat.GBANBack(Number(values[0]) - 1))
            .addComponents(ButtonFormat.GBANNext(0, true));
    } else if (0 == Math.ceil(baseFields.length / pageSlice) - 1) {
        button.addComponents(ButtonFormat.GBANBack(1, true))
            .addComponents(ButtonFormat.GBANNext(0, true));
    } else {
        button.addComponents(ButtonFormat.GBANBack(Number(values[0]) - 1))
            .addComponents(ButtonFormat.GBANNext(Number(values[0]) + 1));
    }

    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.info)
            .setTitle(`-- GlobaBAN List - ${Number(values[0]) + 1}/${Math.ceil(baseFields.length / pageSlice)} --`)
            .setDescription("グローバルBANリスト")
            .setDescription(
                `**全 ${baseFields.length}個中  ${(Number(values[0]) * pageSlice) + 1}~${(Number(values[0]) * pageSlice) + pageSlice}個目**`
            )
            .setFields(betweenFields)
            .setFooter({ text: embedConfig.footerText })
    ];
    interaction.update({ embeds: embeds, components: [ button ], allowedMentions: { repliedUser: false } });
    return;
}