import { logger, config, client } from "../bot";
import { sleep } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";

export const modal = {
    customId: ["idone", "idsecond"]
}

export const executeInteraction = async (interaction: Types.DiscordModalSubmitInteraction) => {
    /**
     *  -- modalの設定方法 --
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