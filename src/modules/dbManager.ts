import Discord from "discord.js";
import * as Types from "./types";
import fs from "fs";
import path from "path";
import { config, logger } from "../bot";

export const serverDBs: { [serverId: string]: Types.ServerDB} = {};
export const GBANDBs: { [userId: string]: Types.GBANDB} = {};
export const GChatDBs: { [channelId: string]: Types.GChatDB} = {};

export const initialize = async(): Promise<void> => {
    fs.readdir(config.path.serverDB, (error, files) => { // serverDB
        if (error) logger.error("dbManager-serverDB" + error);
        files.filter((file) => {
            return path.extname(file).toLowerCase() == '.json';
        }).forEach(async (dir: any) => {
            logger.info("load serverdb: " + dir);
            
            try {
                const serverId = path.basename(dir, ".json");
                serverDBs[serverId] = JSON.parse(fs.readFileSync(config.path.serverDB +"/"+ dir).toString());
            } catch (error) {
                logger.error("ERROR DB:" + dir + "\n" + error);
            }
        });
    });

    fs.readdir(config.path.GBANDB, (error, files) => { // GBAN DB
        if (error) logger.error("dbManager-GBANDB" + error);
        files.filter((file) => {
            return path.extname(file).toLowerCase() == '.json';
        }).forEach(async (dir: any) => {
            logger.info("load GBANDB: " + dir);
            
            try {
                const userId = path.basename(dir, ".json");
                GBANDBs[userId] = JSON.parse(fs.readFileSync(config.path.GBANDB +"/"+ dir).toString());
            } catch (error) {
                logger.error("ERROR DB:" + dir + "\n" + error);
            }
        });
    });

    fs.readdir(config.path.GChatDB, (error, files) => { // GChat DB
        if (error) logger.error("dbManager-GChatDB" + error);
        files.filter((file) => {
            return path.extname(file).toLowerCase() == '.json';
        }).forEach(async (dir: any) => {
            logger.info("load GChatDB: " + dir);
            
            try {
                const channelId = path.basename(dir, ".json");
                GChatDBs[channelId] = JSON.parse(fs.readFileSync(config.path.GChatDB +"/"+ dir).toString());
            } catch (error) {
                logger.error("ERROR DB:" + dir + "\n" + error);
            }
        });
    });
}



export const getServerDB = (guildId: string): Types.ServerDB => {
    if (!serverDBs[guildId]) serverDBs[guildId] = {
        id: guildId,
        GBAN: true, 
        GChat: false
    };
    return serverDBs[guildId];
}
export const saveServerDB = async(guildId: string): Promise<void> => {
    fs.writeFile(config.path.serverDB+ "/" + guildId + ".json", JSON.stringify(serverDBs[guildId]), async (error) => {
        if (error) logger.error("[dbManager.saveServerDB] :" + error);
        logger.debug("DONE Save ServerDB " + guildId);
    });
}


export const getGBANDB = (userId: string): Types.GBANDB | null => {
    if (!GBANDBs[userId]) return null;
    return GBANDBs[userId];
}
export const saveGBANDB = async(userId: string, GBANDB: Types.GBANDB | undefined = undefined): Promise<void> => {
    if (GBANDB) GBANDBs[userId] = GBANDB;
    fs.writeFile(config.path.GBANDB+ "/" + userId + ".json", JSON.stringify(GBANDBs[userId]), async (error) => {
        if (error) logger.error("[dbManager.saveGBANDB] :" + error);
        logger.debug("DONE Save GBANDB " + userId);
    });
}
export const removeGBANDB = (userId: string): boolean => {
    if (!GBANDBs[userId]) return false;
    delete GBANDBs[userId];
    fs.unlink(config.path.GBANDB+ "/" + userId + ".json", async (error) => {
        if (error) logger.error("[dbManager.removeGBANDB] :" + error);
        logger.debug("DONE Remove GBANDB " + userId);
    });
    return true;
}



export const getGChatDB = (channelId: string): Types.GChatDB | null => {
    if (!GChatDBs[channelId]) return null;
    return GChatDBs[channelId];
}
export const saveGChatDB = async(channelId: string, GChatDB: Types.GChatDB | undefined = undefined): Promise<void> => {
    if (GChatDB) GChatDBs[channelId] = GChatDB;
    fs.writeFile(config.path.GChatDB+ "/" + channelId + ".json", JSON.stringify(GChatDBs[channelId]), async (error) => {
        if (error) logger.error("[dbManager.saveGChatDB] :" + error);
        logger.debug("DONE Save GChatDB " + channelId);
    });
}
export const removeGChatDB = (channelId: string): boolean => {
    if (!GChatDBs[channelId]) return false;
    delete GChatDBs[channelId];
    fs.unlink(config.path.GChatDB+ "/" + channelId + ".json", async (error) => {
        if (error) logger.error("[dbManager.removeGChatDB] :" + error);
        logger.debug("DONE Remove GChatDB " + channelId);
    });
    return true;
}