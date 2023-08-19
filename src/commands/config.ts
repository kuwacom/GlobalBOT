import { logger, config, client } from "../bot";
import { sleep, serverConfRoleCheck, GBANConfRoleCheck, GChatConfRoleCheck } from "../modules/utiles";
import * as dbManager from "../modules/dbManager";
import * as roleManager from "../modules/roleManager";
import * as FormatERROR from "../format/error";
import * as FormatEmbed from "../format/embed";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const command = {
    name: "config",
    description: "BOTの詳細設定が可能です",
    options: [
        { // configコマンド権限
            name: "config-editable",
            description: "configコマンドの権限設定",
            type: 2,
            options: [
                {
                    name: "add",
                    description: "configコマンドを実行できるロールを追加",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "ロールを削除",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "list",
                    description: "現在登録されているロールを表示",
                    type: 1
                }
            ]
        },
        
        { // gbanコマンド権限
            name: "gban-editable",
            description: "configコマンドの権限設定",
            type: 2,
            options: [
                {
                    name: "add",
                    description: "configコマンドを実行できるロールを追加",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "ロールを削除",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "list",
                    description: "現在登録されているロールを表示",
                    type: 1
                }
            ]
        },
        
        { // gchatコマンド権限
            name: "gchat-editable",
            description: "configコマンドの権限設定",
            type: 2,
            options: [
                {
                    name: "add",
                    description: "configコマンドを実行できるロールを追加",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "ロールを削除",
                    type: 1,
                    options: [
                        {
                            name: "role",
                            description: "ロールを選択",
                            required: true,
                            type: 8
                        }
                    ]
                },
                {
                    name: "list",
                    description: "現在登録されているロールを表示",
                    type: 1
                }
            ]
        },



        { // GBAN
            name: "gban",
            description: "グローバルBANの有効設定",
            type: 2,
            options: [
                {
                    name: "enabled",
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
            ]
        },

        { // GChat
            name: "gchat",
            description: "グローバルチャットの有効設定",
            type: 2,
            options: [
                {
                    name: "enabled",
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
    ]
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild || !message.member || message.channel.type == Discord.ChannelType.GuildStageVoice) return;  // v14からステージチャンネルからだとsendできない
    // messageCommand

}

export const executeInteraction = async (interaction: Types.DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    // 権限チェック
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (interaction.user.id != interaction.guild.ownerId && !serverConfRoleCheck(member.roles)) {
        interaction.reply(FormatERROR.interaction.PermissionDenied(Types.Commands.config.editable));
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();
    if (subcommandGroup == "config-editable") { // config editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = roleManager.addConfigRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.AlreadyRegisteredRole(Types.Commands.config.editable));
                return;
            }
            
            interaction.reply(FormatEmbed.interaction.DoneRegisterRole(Types.Commands.config.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = roleManager.removeConfigRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRole(Types.Commands.config.editable))
            }

            interaction.reply(FormatEmbed.interaction.DoneRemoveRole(Types.Commands.config.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = roleManager.getConfigRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRoles(Types.Commands.config.editable));
                return;
            }

            interaction.reply(FormatEmbed.interaction.RoleList(roleIds, Types.Commands.config.editable));
            return;
        }
    } else if (subcommandGroup == "gban-editable") { // GBAN editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = roleManager.addGBANRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.AlreadyRegisteredRole(Types.Commands.config.gban.editable));
                return;
            }
            
            interaction.reply(FormatEmbed.interaction.DoneRegisterRole(Types.Commands.config.gban.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = roleManager.removeGBANRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRole(Types.Commands.config.gban.editable))
            }

            interaction.reply(FormatEmbed.interaction.DoneRemoveRole(Types.Commands.config.gban.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = roleManager.getGBANRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRoles(Types.Commands.config.gban.editable));
                return;
            }

            interaction.reply(FormatEmbed.interaction.RoleList(roleIds, Types.Commands.config.gban.editable));
            return;
        }
    } else if (subcommandGroup == "gchat-editable") { // GChat editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = roleManager.addGChatRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.AlreadyRegisteredRole(Types.Commands.config.gchat.editable));
                return;
            }
            
            interaction.reply(FormatEmbed.interaction.DoneRegisterRole(Types.Commands.config.gchat.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = roleManager.removeGChatRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRole(Types.Commands.config.gchat.editable))
            }

            interaction.reply(FormatEmbed.interaction.DoneRemoveRole(Types.Commands.config.gchat.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = roleManager.getGChatRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(FormatERROR.interaction.NotRegisteredRoles(Types.Commands.config.gchat.editable));
                return;
            }

            interaction.reply(FormatEmbed.interaction.RoleList(roleIds, Types.Commands.config.gchat.editable));
            return;
        }
    }




    if (subcommandGroup == "gban") {
        if (subCommand == "enabled") {
            const switcBoolean = interaction.options.getBoolean("switch");
            if (switcBoolean == undefined) return;
            const serverDB = dbManager.getServerDB(interaction.guild.id);
    
            serverDB.GBAN.enabled = switcBoolean;
    
            dbManager.saveServerDB(interaction.guild.id);
            
            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(config.emoji.check + '設定を変更しました！')
            .setDescription(
                `グローバルBANを${switcBoolean?"有効":"無効"}にしました！\n\n`+
                `\`${Types.Commands.config.gban.enabled}\` より設定を変更できます`
            )
            .setFooter({ text: config.embed.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    } else if (subcommandGroup == "gchat") {
        if (subCommand == "enabled") {
            const switcBoolean = interaction.options.getBoolean("switch");
            if (switcBoolean == undefined) return;
            const serverDB = dbManager.getServerDB(interaction.guild.id);
    
            serverDB.GChat.enabled = switcBoolean;
            
            dbManager.saveServerDB(interaction.guild.id);
            
            const embed = new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.success)
            .setTitle(config.emoji.check + '設定を変更しました！')
            .setDescription(
                `グローバルチャットを${switcBoolean?"有効":"無効"}にしました！\n\n`+
                `\`${Types.Commands.config.gchat.enabled}\` より設定を変更できます`
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
