import { logger, config, client } from "../bot";
import { sleep } from "../utiles/utiles";
import * as Types from "../types/types";
import Discord from "discord.js";

export const button = {
    customId: ["idone", "idsecond"]
}

export const executeButton = async (interaction: Types.DiscordButtonInteraction) => {
    /**
     *  -- buttonの設定方法 --
     * 
     * cmd: コマンド名
     * values: 値(array)
     * 
     * button登録時に customId で
     * {コマンド名}:{値}:{値}...
     * のように設定していく
     */
    const [cmd, ...values] = interaction.customId.split(":");

    return;
}