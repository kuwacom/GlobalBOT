import { embedConfig, slashCommandsConfig } from "../config/discord";
import env from "../config/env";
import EmbedFormat from "../format/embed";
import ErrorFormat from "../format/error";
import { DiscordCommandInteraction } from "../types/discord";
import DBManager from "../utiles/dbManager";
import RoleManager from "../utiles/roleManager";
import { sleep, serverConfRoleCheck, GBANConfRoleCheck, GChatConfRoleCheck } from "../utiles/utiles";
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

export const executeInteraction = async (interaction: DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    // 権限チェック
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (interaction.user.id != interaction.guild.ownerId && !serverConfRoleCheck(member.roles)) {
        interaction.reply(ErrorFormat.interaction.PermissionDenied(slashCommandsConfig.config.editable));
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();
    if (subcommandGroup == "config-editable") { // config editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = RoleManager.addConfigRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.AlreadyRegisteredRole(slashCommandsConfig.config.editable));
                return;
            }
            
            interaction.reply(EmbedFormat.interaction.DoneRegisterRole(slashCommandsConfig.config.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = RoleManager.removeConfigRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRole(slashCommandsConfig.config.editable))
            }

            interaction.reply(EmbedFormat.interaction.DoneRemoveRole(slashCommandsConfig.config.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = RoleManager.getConfigRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRoles(slashCommandsConfig.config.editable));
                return;
            }

            interaction.reply(EmbedFormat.interaction.RoleList(roleIds, slashCommandsConfig.config.editable));
            return;
        }
    } else if (subcommandGroup == "gban-editable") { // GBAN editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = RoleManager.addGBANRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.AlreadyRegisteredRole(slashCommandsConfig.config.gban.editable));
                return;
            }
            
            interaction.reply(EmbedFormat.interaction.DoneRegisterRole(slashCommandsConfig.config.gban.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = RoleManager.removeGBANRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRole(slashCommandsConfig.config.gban.editable))
            }

            interaction.reply(EmbedFormat.interaction.DoneRemoveRole(slashCommandsConfig.config.gban.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = RoleManager.getGBANRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRoles(slashCommandsConfig.config.gban.editable));
                return;
            }

            interaction.reply(EmbedFormat.interaction.RoleList(roleIds, slashCommandsConfig.config.gban.editable));
            return;
        }
    } else if (subcommandGroup == "gchat-editable") { // GChat editable
        if (subCommand == "add") {
            const role = interaction.options.getRole("role");
            if (!role) return;

            const result = RoleManager.addGChatRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.AlreadyRegisteredRole(slashCommandsConfig.config.gchat.editable));
                return;
            }
            
            interaction.reply(EmbedFormat.interaction.DoneRegisterRole(slashCommandsConfig.config.gchat.editable))
            return;
        } else if (subCommand == "remove") {
            const role = interaction.options.getRole("role");
            if (!role) return;
            const result = RoleManager.removeGChatRole(role.id, interaction.guild.id);
            if (!result) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRole(slashCommandsConfig.config.gchat.editable))
            }

            interaction.reply(EmbedFormat.interaction.DoneRemoveRole(slashCommandsConfig.config.gchat.editable));
            return;
        } else if (subCommand == "list") {
            const roleIds = RoleManager.getGChatRoles(interaction.guild.id);
            if (!roleIds) {
                interaction.reply(ErrorFormat.interaction.NotRegisteredRoles(slashCommandsConfig.config.gchat.editable));
                return;
            }

            interaction.reply(EmbedFormat.interaction.RoleList(roleIds, slashCommandsConfig.config.gchat.editable));
            return;
        }
    }




    if (subcommandGroup == "gban") {
        if (subCommand == "enabled") {
            const switcBoolean = interaction.options.getBoolean("switch");
            if (switcBoolean == undefined) return;
            const serverDB = DBManager.getServerDB(interaction.guild.id);
    
            serverDB.GBAN.enabled = switcBoolean;
    
            DBManager.saveServerDB(interaction.guild.id);
            
            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + '設定を変更しました！')
            .setDescription(
                `グローバルBANを${switcBoolean?"有効":"無効"}にしました！\n\n`+
                `\`${slashCommandsConfig.config.gban.enabled}\` より設定を変更できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
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
            const serverDB = DBManager.getServerDB(interaction.guild.id);
    
            serverDB.GChat.enabled = switcBoolean;
            
            DBManager.saveServerDB(interaction.guild.id);
            
            const embed = new Discord.EmbedBuilder()
            .setColor(embedConfig.colors.success)
            .setTitle(env.emoji.check + '設定を変更しました！')
            .setDescription(
                `グローバルチャットを${switcBoolean?"有効":"無効"}にしました！\n\n`+
                `\`${slashCommandsConfig.config.gchat.enabled}\` より設定を変更できます`
            )
            .setFooter({ text: embedConfig.footerText })
    
            interaction.reply({
                embeds: [ embed ],
                ephemeral: false
            });
            return;
        }
    }
}
