import Discord from "discord.js";
import client from "../discord";
import DBManager from "./dbManager";

namespace GBANManager {

    export const init = async (guildId: string) => {
        const guild = await client.guilds.fetch(guildId);
        Object.keys(DBManager.GBANDBs).forEach(async(userId) => {
            const GBANDB = DBManager.getGBANDB(userId);
            if (!GBANDB) return;

            if (!GBANDB.reason) GBANDB.reason = "";
            guild.bans.create(userId, {
                reason: GBANDB.reason
            });
        });
    }


    export const ban = async (userId: string, userName: string | null = "None", reason: string | null, sourceUserId: string, guildId: string): Promise<boolean> => {
        let GBANDB = DBManager.getGBANDB(userId);
        if (GBANDB) return false;

        GBANDB = {
            userId: userId,
            userName: userName ? userName : "None",
            reason: reason ? reason : null,
            sourceUserId: sourceUserId,
            serverId: guildId,
            time: new Date()
        }
        DBManager.saveGBANDB(userId, GBANDB);

        (await client.guilds.fetch()).forEach(async(guild) => {
            const serverDB = DBManager.getServerDB(guild.id);
            if (!serverDB?.GBAN.enabled) return;

            const guild_ = await client.guilds.fetch(guild.id);
            if (!reason) reason = "";
            guild_.bans.create(userId, {
                reason: reason
            });
        });
        return true;
    }


    export const unBan = async (userId: string): Promise<boolean> => {
        let GBANDB = DBManager.getGBANDB(userId);
        if (!GBANDB) return false;

        DBManager.removeGBANDB(userId);
        
        (await client.guilds.fetch()).forEach(async(guild) => {
            const serverDB = DBManager.getServerDB(guild.id);
            if (!serverDB?.GBAN.enabled) return;
            
            const guild_ = await client.guilds.fetch(guild.id);
            guild_.bans.remove(userId);
        });
        return true;
    }
}

export default GBANManager;