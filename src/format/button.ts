import { logger, config, client } from "../bot";
import * as Types from "../types/types";
import Discord from "discord.js";

// import * as FormatButton from "../format/button"


// ヘルプパネル
export const ToHelp = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpBack:${num}`)
    .setLabel("/ スラッシュコマンドのヘルプはこちら")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Success)
    .setDisabled(disabled)
}

export const HelpBack = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpBack:${num}`)
    .setLabel("<-")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}

export const HelpNext = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpNext:${num}`)
    .setLabel("->")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}


export const GBANBack = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`GBANBack:${num}`)
    .setLabel("<-")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}

export const GBANNext = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`GBANNext:${num}`)
    .setLabel("->")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}



export const GChatBack = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`GChatBack:${num}`)
    .setLabel("<-")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}

export const GChatNext = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`GChatNext:${num}`)
    .setLabel("->")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}