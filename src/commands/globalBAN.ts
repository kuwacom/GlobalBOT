import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const command = {
    name: "gban",
    description: "グローバルBAN",
    options: [
        { // USER BAN
            name: "user",
            description: "ユーザー指定でBAN",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "BANするユーザー",
                    required: true,
                    type: 6 
                },
                {
                    name: "reason",
                    description: "理由",
                    type: 3
                }
            ]
        },
        { // USER BAN
            name: "userid",
            description: "ユーザーID指定でBAN",
            type: 1,
            options: [
                {
                    name: "id",
                    description: "BANするユーザーID",
                    required: true,
                    type: 3 
                },
                {
                    name: "reason",
                    description: "理由",
                    type: 3
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

    if (subCommand == "user") {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        
    } else if (subCommand == "userid") {
        const userId = interaction.options.getString("userid");
        const reason = interaction.options.getString("reason");

    }
}
