import { logger, config, client } from "../bot";
import { sleep, slashCommands } from "../modules/utiles";
import * as GBANManager from "../modules/GBANManager";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const command = {
    name: "gban",
    description: "グローバルBAN",
    options: [
        {
            name: "ban",
            description: "BAN",
            type: 2,
            options: [
                { // USER
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
                { // USERID
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
        },
        {
            name: "unban",
            description: "BAN",
            type: 2,
            options: [
                { // USER
                    name: "user",
                    description: "ユーザー指定で解除",
                    type: 1,
                    options: [
                        {
                            name: "user",
                            description: "解除するユーザー",
                            required: true,
                            type: 6 
                        }
                    ]
                },
                { // USERID
                    name: "userid",
                    description: "ユーザーID指定で解除",
                    type: 1,
                    options: [
                        {
                            name: "id",
                            description: "解除するユーザーID",
                            required: true,
                            type: 3 
                        }
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
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

    if (subcommandGroup == "ban") { // ban
        if (subCommand == "user") {
            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");
            if (!user) return;
            console.log(user)
            console.log(reason)

            const result = GBANManager.ban(user.id, reason, interaction.user.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.warning + 'すでにBANされています')
                .setDescription(
                    'このユーザーはすでにグローバルBANされています\n\n'+
                    `\`${Types.Commands.gban.unban.user}\` よりBANを解除できます`
                )
                .setFooter({ text: config.embed.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: false
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.check + 'グローバルBANしました！')
            .setDescription(
                'BOTを導入している全サーバーでBANしました！\n'+
                `BANした人: <@${interaction.user.id}>\n\n`+
                `\`${Types.Commands.gban.unban.user}\` よりBANを解除できます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        } else if (subCommand == "userid") {
            const userId = interaction.options.getString("userid");
            const reason = interaction.options.getString("reason");
            if (!userId) return;
            console.log(userId)
            console.log(reason)

            const result = GBANManager.ban(userId, reason, interaction.user.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.warning + 'すでにBANされています')
                .setDescription(
                    'このユーザーはすでにグローバルBANされています\n\n'+
                    `\`${Types.Commands.gban.unban.userId}\` よりBANを解除できます`
                )
                .setFooter({ text: config.embed.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: false
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.check + 'グローバルBANしました！')
            .setDescription(
                'BOTを導入している全サーバーでBANしました！\n'+
                `BANした人: <@${interaction.user.id}>\n\n`+
                `\`${Types.Commands.gban.unban.userId}\` よりBANを解除できます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    } else if (subcommandGroup == "unban") { // ban解除
        if (subCommand == "user") {
            const user = interaction.options.getUser("user");
            if (!user) return;
            console.log(user)
            
            const result = GBANManager.unBan(user.id);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.warning + 'BANされていないユーザーです')
                .setDescription(
                    'このユーザーはグローバルBANされていません\n\n'+
                    `\`${Types.Commands.gban.ban.user}\` よりBANできます`
                )
                .setFooter({ text: config.embed.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: false
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.check + 'グローバルBANを解除しました！')
            .setDescription(
                'BOTを導入している全サーバーでBAN解除しました！\n'+
                `BAN解除した人: <@${interaction.user.id}>\n\n`+
                `\`${Types.Commands.gban.ban.user}\` よりBANできます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        } else if (subCommand == "userid") {
            const userId = interaction.options.getString("userid");
            if (!userId) return;
            console.log(userId)
            
            const result = GBANManager.unBan(userId);
            if (!result) {
                const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.error)
                .setTitle(config.emoji.warning + 'BANされていないユーザーです')
                .setDescription(
                    'このユーザーはグローバルBANされていません\n\n'+
                    `\`${Types.Commands.gban.ban.userId}\` よりBANできます`
                )
                .setFooter({ text: config.embed.footerText })
        
                interaction.reply({
                    embeds: [ embed ],
                    ephemeral: false
                });
                return;
            }

            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.error)
            .setTitle(config.emoji.check + 'グローバルBANを解除しました！')
            .setDescription(
                'BOTを導入している全サーバーでBAN解除しました！\n'+
                `BAN解除した人: <@${interaction.user.id}>\n\n`+
                `\`${Types.Commands.gban.ban.userId}\` よりBANできます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    }
}
