import Discord from "discord.js";
import { logger, config, client } from "../bot";
import * as Types from "./types";
import * as dbManager from "./dbManager";

export const linkGchat = (channelId: string, sourceUserId: string): boolean => {
    let GChatDB = dbManager.getGChatDB(channelId);
    if (GChatDB) return false;

    GChatDB = {
        channelId: channelId,
        sourceUserId: sourceUserId,
        time: new Date()
    }
    dbManager.saveGChatDB(channelId, GChatDB);

    return true;
}

export const unLinkGchat = (channelId: string) => {
    const GChatDB = dbManager.getGChatDB(channelId);
    if (!GChatDB) return false;

    dbManager.removeGChatDB(channelId);
    return true;
}