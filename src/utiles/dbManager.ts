import fs from "fs";
import path from "path";

import { GBANDB, GChatDB, ServerDB } from "../types/db";
import env from "../config/env";
import logger from "./logger";

namespace DBManager {

    export const botDB = {
        GChatBAN: {
            users: [] as string[],
            servers: [] as string[]
        }
    };
    export const serverDBs: { [serverId: string]: ServerDB} = {};
    export const GBANDBs: { [userId: string]: GBANDB} = {};
    export const GChatDBs: { [channelId: string]: GChatDB} = {};


    export const initialize = async(): Promise<void> => {
        fs.readdir(env.path.serverDB, (error, files) => { // serverDB
            if (error) logger.error("dbManager-serverDB" + error);
            files.filter((file) => {
                return path.extname(file).toLowerCase() == '.json';
            }).forEach(async (dir: any) => {
                logger.info("load serverdb: " + dir);
                
                try {
                    const serverId = path.basename(dir, ".json");
                    serverDBs[serverId] = JSON.parse(fs.readFileSync(env.path.serverDB +"/"+ dir).toString());
                } catch (error) {
                    logger.error("ERROR DB:" + dir + "\n" + error);
                }
            });
        });

        fs.readdir(env.path.GBANDB, (error, files) => { // GBAN DB
            if (error) logger.error("dbManager-GBANDB" + error);
            files.filter((file) => {
                return path.extname(file).toLowerCase() == '.json';
            }).forEach(async (dir: any) => {
                logger.info("load GBANDB: " + dir);
                
                try {
                    const userId = path.basename(dir, ".json");
                    GBANDBs[userId] = JSON.parse(fs.readFileSync(env.path.GBANDB +"/"+ dir).toString());
                } catch (error) {
                    logger.error("ERROR DB:" + dir + "\n" + error);
                }
            });
        });

        fs.readdir(env.path.GChatDB, (error, files) => { // GChat DB
            if (error) logger.error("dbManager-GChatDB" + error);
            files.filter((file) => {
                return path.extname(file).toLowerCase() == '.json';
            }).forEach(async (dir: any) => {
                logger.info("load GChatDB: " + dir);
                
                try {
                    const channelId = path.basename(dir, ".json");
                    GChatDBs[channelId] = JSON.parse(fs.readFileSync(env.path.GChatDB +"/"+ dir).toString());
                } catch (error) {
                    logger.error("ERROR DB:" + dir + "\n" + error);
                }
            });
        });

        { // BOTDB
            logger.info("load BOTDB");
            try {
                const botDB_ = JSON.parse(fs.readFileSync(env.path.botDB).toString());
                botDB.GChatBAN = botDB_.GChatBAN;
            logger.info("load BOTDB Done");
            } catch (error) {
                logger.error("ERROR BOTDB");
            }
        }
    }



    export const saveBotDB = (): boolean => {
        fs.writeFile(env.path.botDB, JSON.stringify(botDB), async (error) => {
            if (error) logger.error("[DBManager.saveBotDB] :" + error);
            logger.debug("DONE Save botDB");
        });
        return true;
    }


    export const getServerDB = (guildId: string): ServerDB => {
        if (!serverDBs[guildId]) serverDBs[guildId] = {
            id: guildId,
            editableRoles: null,
            GBAN: {
                enabled: true,
                editableRoles: null
            },
            GChat: {
                enabled: false,
                editableRoles: null
            }
        };
        return serverDBs[guildId];
    }
    export const saveServerDB = async(guildId: string, serverDB: ServerDB | undefined = undefined): Promise<void> => {
        if (serverDB) serverDBs[guildId] = serverDB;
        fs.writeFile(env.path.serverDB+ "/" + guildId + ".json", JSON.stringify(serverDBs[guildId]), async (error) => {
            if (error) logger.error("[DBManager.saveServerDB] :" + error);
            logger.debug("DONE Save ServerDB " + guildId);
        });
    }


    export const getGBANDB = (userId: string): GBANDB | null => {
        if (!GBANDBs[userId]) return null;
        return GBANDBs[userId];
    }
    export const saveGBANDB = async(userId: string, GBANDB: GBANDB | undefined = undefined): Promise<void> => {
        if (GBANDB) GBANDBs[userId] = GBANDB;
        fs.writeFile(env.path.GBANDB+ "/" + userId + ".json", JSON.stringify(GBANDBs[userId]), async (error) => {
            if (error) logger.error("[DBManager.saveGBANDB] :" + error);
            logger.debug("DONE Save GBANDB " + userId);
        });
    }
    export const removeGBANDB = (userId: string): boolean => {
        if (!GBANDBs[userId]) return false;
        delete GBANDBs[userId];
        fs.unlink(env.path.GBANDB+ "/" + userId + ".json", async (error) => {
            if (error) logger.error("[DBManager.removeGBANDB] :" + error);
            logger.debug("DONE Remove GBANDB " + userId);
        });
        return true;
    }



    export const getGChatDB = (channelId: string): GChatDB | null => {
        if (!GChatDBs[channelId]) return null;
        return GChatDBs[channelId];
    }
    export const saveGChatDB = async(channelId: string, GChatDB: GChatDB | undefined = undefined): Promise<void> => {
        if (GChatDB) GChatDBs[channelId] = GChatDB;
        fs.writeFile(env.path.GChatDB+ "/" + channelId + ".json", JSON.stringify(GChatDBs[channelId]), async (error) => {
            if (error) logger.error("[DBManager.saveGChatDB] :" + error);
            logger.debug("DONE Save GChatDB " + channelId);
        });
    }
    export const removeGChatDB = (channelId: string): boolean => {
        if (!GChatDBs[channelId]) return false;
        delete GChatDBs[channelId];
        fs.unlink(env.path.GChatDB+ "/" + channelId + ".json", async (error) => {
            if (error) logger.error("[DBManager.removeGChatDB] :" + error);
            logger.debug("DONE Remove GChatDB " + channelId);
        });
        return true;
    }

}

export default DBManager;