import Discord from "discord.js";
import { logger, config, client } from "../bot";
import * as Types from "./types";
import * as dbManager from "./dbManager";

export const init = (guildId: string) => {
    Object.keys(dbManager.GBANDBs).forEach(async(userId) => {
        const GBANDB = dbManager.getGBANDB(userId);
        if (!GBANDB) return;
        const guild = await client.guilds.fetch(guildId);

        if (!GBANDB.reason) GBANDB.reason = "";
        guild.bans.create(userId, {
            reason: GBANDB.reason
        });
    });
}


export const ban = (userId: string, reason: string | null, sourceUserId: string): boolean => {
    let GBANDB = dbManager.getGBANDB(userId);
    if (GBANDB) return false;

    GBANDB = {
        userId: userId,
        reason: reason ? reason : null,
        sourceUserId: sourceUserId,
        time: new Date()
    }
    dbManager.saveGBANDB(userId, GBANDB);

    Object.keys(dbManager.serverDBs).forEach(async(serverId) => {
        const serverDB = dbManager.getServerDB(serverId);
        if (!serverDB || !serverDB.GBAN) return;
        const guild = await client.guilds.fetch(serverId);

        if (!reason) reason = "";
        guild.bans.create(userId, {
            reason: reason
        });
    });
    return true;
}


export const unBan = (userId: string): boolean => {
    let GBANDB = dbManager.getGBANDB(userId);
    if (!GBANDB) return false;

    dbManager.removeGBANDB(userId);
    
    Object.keys(dbManager.serverDBs).forEach(async(serverId) => {
        const serverDB = dbManager.getServerDB(serverId);
        if (!serverDB || !serverDB.GBAN) return;
        const guild = await client.guilds.fetch(serverId);

        guild.bans.remove(userId);
    });
    return true;
}