import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as dbManager from "../modules/dbManager"; 
import * as Types from "../modules/types";
import Discord from "discord.js";

export const command = {
    name: "config",
    description: "BOTの詳細設定が可能です",
    options: [
        { // GBAN
            name: "gban-switch",
            description: "グローバルBANの有効設定",
            type: 1,
            options: [
                {
                    name: "switch",
                    description: "デフォルト => True",
                    required: true,
                    type: 5
                }
            ]
        },
        { // GChat
            name: "gchat-switch",
            description: "グローバルチャットの有効設定",
            type: 1,
            options: [
                {
                    name: "switch",
                    description: "デフォルト => False",
                    required: true,
                    type: 5
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
    if (subCommand == "gban-switch") {
        const switcBoolean = interaction.options.getBoolean("switch");
        if (switcBoolean == undefined) return;
        const serverDB = dbManager.getServerDB(interaction.guild.id);

        serverDB.GBANable = switcBoolean;

        dbManager.saveServerDB(interaction.guild.id);
        
        const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.success)
        .setTitle(config.emoji.check + '設定を変更しました！')
        .setDescription(
            `グローバルBANを${switcBoolean?"有効":"無効"}にしました！\n\n`+
            `\`${Types.Commands.config.GBANable}\` より設定を変更できます`
        )
        .setFooter({ text: config.embed.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    } else if (subCommand == "gchat-switch") {
        const switcBoolean = interaction.options.getBoolean("switch");
        if (switcBoolean == undefined) return;
        const serverDB = dbManager.getServerDB(interaction.guild.id);

        serverDB.GChatable = switcBoolean;
        
        dbManager.saveServerDB(interaction.guild.id);
        
        const embed = new Discord.EmbedBuilder()
        .setColor(Types.embedCollar.success)
        .setTitle(config.emoji.check + '設定を変更しました！')
        .setDescription(
            `グローバルチャットを${switcBoolean?"有効":"無効"}にしました！\n\n`+
            `\`${Types.Commands.config.GChatable}\` より設定を変更できます`
        )
        .setFooter({ text: config.embed.footerText })

        interaction.reply({
            embeds: [ embed ],
            ephemeral: false
        });
        return;
    }
}
