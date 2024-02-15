import DBManager from "./dbManager";

namespace RoleManager {
    export const addConfigRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.editableRoles) serverDB.editableRoles = [];
        if (serverDB.editableRoles.includes(roleId)) return false;
        serverDB.editableRoles.push(roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }
    export const addGBANRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.GBAN.editableRoles) serverDB.GBAN.editableRoles = [];
        if (serverDB.GBAN.editableRoles.includes(roleId)) return false;
        serverDB.GBAN.editableRoles.push(roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }
    export const addGChatRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.GChat.editableRoles) serverDB.GChat.editableRoles = [];
        if (serverDB.GChat.editableRoles.includes(roleId)) return false;
        serverDB.GChat.editableRoles.push(roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }


    export const removeConfigRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.editableRoles || !(serverDB.editableRoles.includes(roleId))) return false;
        serverDB.editableRoles = serverDB.editableRoles.filter(roleId => roleId != roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }
    export const removeGBANRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.GBAN.editableRoles || !(serverDB.GBAN.editableRoles.includes(roleId))) return false;
        serverDB.GBAN.editableRoles = serverDB.GBAN.editableRoles.filter(roleId => roleId != roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }
    export const removeGChatRole = (roleId: string, guildId: string): boolean => {
        const serverDB = DBManager.getServerDB(guildId);
        if (!serverDB.GChat.editableRoles || !(serverDB.GChat.editableRoles.includes(roleId))) return false;
        serverDB.GChat.editableRoles = serverDB.GChat.editableRoles.filter(roleId => roleId != roleId);
        DBManager.saveServerDB(guildId);
        return true;
    }


    export const getConfigRoles = (guildId: string): string[] | null => {
        const serverDB = DBManager.getServerDB(guildId);
        return serverDB.editableRoles;
    }
    export const getGBANRoles = (guildId: string): string[] | null => {
        const serverDB = DBManager.getServerDB(guildId);
        return serverDB.GBAN.editableRoles;
    }
    export const getGChatRoles = (guildId: string): string[] | null => {
        const serverDB = DBManager.getServerDB(guildId);
        return serverDB.GChat.editableRoles;
    }
}

export default RoleManager;