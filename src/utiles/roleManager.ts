import Discord from "discord.js";
import { logger, config, client } from "../bot";
import * as Types from "../types/types";
import * as dbManager from "./dbManager";

export const addConfigRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.editableRoles) serverDB.editableRoles = [];
    if (serverDB.editableRoles.includes(roleId)) return false;
    serverDB.editableRoles.push(roleId);
    dbManager.saveServerDB(guildId);
    return true;
}
export const addGBANRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.GBAN.editableRoles) serverDB.GBAN.editableRoles = [];
    if (serverDB.GBAN.editableRoles.includes(roleId)) return false;
    serverDB.GBAN.editableRoles.push(roleId);
    dbManager.saveServerDB(guildId);
    return true;
}
export const addGChatRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.GChat.editableRoles) serverDB.GChat.editableRoles = [];
    if (serverDB.GChat.editableRoles.includes(roleId)) return false;
    serverDB.GChat.editableRoles.push(roleId);
    dbManager.saveServerDB(guildId);
    return true;
}


export const removeConfigRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.editableRoles || !(serverDB.editableRoles.includes(roleId))) return false;
    serverDB.editableRoles = serverDB.editableRoles.filter(roleId => roleId != roleId);
    dbManager.saveServerDB(guildId);
    return true;
}
export const removeGBANRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.GBAN.editableRoles || !(serverDB.GBAN.editableRoles.includes(roleId))) return false;
    serverDB.GBAN.editableRoles = serverDB.GBAN.editableRoles.filter(roleId => roleId != roleId);
    dbManager.saveServerDB(guildId);
    return true;
}
export const removeGChatRole = (roleId: string, guildId: string): boolean => {
    const serverDB = dbManager.getServerDB(guildId);
    if (!serverDB.GChat.editableRoles || !(serverDB.GChat.editableRoles.includes(roleId))) return false;
    serverDB.GChat.editableRoles = serverDB.GChat.editableRoles.filter(roleId => roleId != roleId);
    dbManager.saveServerDB(guildId);
    return true;
}


export const getConfigRoles = (guildId: string): string[] | null => {
    const serverDB = dbManager.getServerDB(guildId);
    return serverDB.editableRoles;
}
export const getGBANRoles = (guildId: string): string[] | null => {
    const serverDB = dbManager.getServerDB(guildId);
    return serverDB.GBAN.editableRoles;
}
export const getGChatRoles = (guildId: string): string[] | null => {
    const serverDB = dbManager.getServerDB(guildId);
    return serverDB.GChat.editableRoles;
}