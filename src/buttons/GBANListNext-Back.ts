import { logger, config, client } from "../bot";
import { autoDeleteMessage, sec2HHMMSS, sleep, getMember, cacheUpdate } from "../utiles/utiles";
import * as Types from "../types/types";
import * as FormatERROR from "../format/error";
import * as FormatButton from "../format/button";
import * as dbManager from "../utiles/dbManager";
import Discord from "discord.js";

export const button = {
    customId: ["GBANNext", "GBANBack"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const guild = interaction.guild;
    if (!guild || !interaction.member) return;

    await cacheUpdate();

    const baseFields: Discord.APIEmbedField[] = 
    (await Promise.all(Object.keys(dbManager.GBANDBs).map(async(userId) => {
        const GBANDB = dbManager.getGBANDB(userId);
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


    const pageSlice = config.pageSlice.GBANList; // ページごとに表示する量
    const betweenFields = baseFields.slice(Number(values[0]) * pageSlice, (Number(values[0]) * pageSlice) + pageSlice);

    // 過去のボタン押したときとかで存在しないページの場合最初に戻す ヘルプ変えることなんてないからほぼない
    if (Number(values[0]) > (Math.ceil(baseFields.length / pageSlice) - 1)) values[0] = "0";

    let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
    if (Number(values[0]) == 0) {
        button.addComponents(FormatButton.GBANBack(0, true))
            .addComponents(FormatButton.GBANNext(Number(values[0]) + 1));
    } else if (Number(values[0]) == Math.ceil(baseFields.length / pageSlice) - 1) {
        button.addComponents(FormatButton.GBANBack(Number(values[0]) - 1))
            .addComponents(FormatButton.GBANNext(0, true));
    } else if (0 == Math.ceil(baseFields.length / pageSlice) - 1) {
        button.addComponents(FormatButton.GBANBack(1, true))
            .addComponents(FormatButton.GBANNext(0, true));
    } else {
        button.addComponents(FormatButton.GBANBack(Number(values[0]) - 1))
            .addComponents(FormatButton.GBANNext(Number(values[0]) + 1));
    }

    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.info)
            .setTitle(`-- GlobaBAN List - ${Number(values[0]) + 1}/${Math.ceil(baseFields.length / pageSlice)} --`)
            .setDescription("グローバルBANリスト")
            .setDescription(
                `**全 ${baseFields.length}個中  ${(Number(values[0]) * pageSlice) + 1}~${(Number(values[0]) * pageSlice) + pageSlice}個目**`
            )
            .setFields(betweenFields)
            .setFooter({ text: config.embed.footerText })
    ];
    interaction.update({ embeds: embeds, components: [ button ], allowedMentions: { repliedUser: false } });
    return;
}