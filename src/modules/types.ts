import Discord from "discord.js";
import { config } from "../bot";

export const embedCollar = {
    info: config.embed.colors.info as Discord.ColorResolvable,
    success: config.embed.colors.success as Discord.ColorResolvable,
    warning: config.embed.colors.warning as Discord.ColorResolvable,
    error: config.embed.colors.error as Discord.ColorResolvable,
}

interface SlashCommandOption {
    name: string;
    description: string;
    required: boolean;
    type: number;
    options: SlashCommandOption[] | undefined;
}

export interface SlashCommand {
    name: string;
    description: string;
    options: SlashCommandOption[] | undefined;
}

export type DiscordCommandInteraction = Discord.ChatInputCommandInteraction<Discord.CacheType> | Discord.MessageContextMenuCommandInteraction<Discord.CacheType> | Discord.UserContextMenuCommandInteraction<Discord.CacheType>;
export interface Command {
    command: SlashCommand;
    executeMessage(message: Discord.Message): void;
    executeInteraction(interaction: DiscordCommandInteraction): void;
}

export type DiscordButtonInteraction = Discord.ButtonInteraction<Discord.CacheType>;
export interface Button {
    button: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordButtonInteraction): void;
}

export type DiscordSelectMenuInteraction = Discord.StringSelectMenuInteraction<Discord.CacheType>;
export interface SelectMenu {
    selectMenu: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordSelectMenuInteraction): void;
}

export type DiscordModalSubmitInteraction = Discord.ModalSubmitInteraction<Discord.CacheType>;
export interface Modal {
    modal: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordModalSubmitInteraction): void;
}


export const Commands =  {
    gban: {
        ban: {
            user: "/gban ban user",
            userId: "/gban ban userid"
        },
        unban: {
            user: "/gban unban user",
            userId: "/gban unban userid"
        }
    }
}


export interface ServerDB {
    id: string;
    GBAN: boolean; // globalBAN の有効無効
    GChat: boolean; // globalChat の有効無効
}


export interface GBANDB {
    userId: string;
    reason: string | null;
    sourceUserId: string; // BANをしたユーザー
    time: Date | null;
}

export interface GChatDB {
    channelId: string;
    sourceUserId: string; // GChatへ追加したユーザー
    time: Date | null;
}


// export enum GBAN {
//     Already = "already"
// }