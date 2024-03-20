import Discord from "discord.js";
import DBManager from "./dbManager";
import { embedConfig } from "../config/discord";
import client from "../discord";
import { checkBadWord } from "./badword";

namespace GChatManager {
    
    export const banUser = (userId: string): boolean => {
        if (DBManager.botDB.GChatBAN.users.includes(userId)) return false;
        DBManager.botDB.GChatBAN.users.push(userId);
        DBManager.saveBotDB();
        return true;
    }
    export const banServer = (serverId: string): boolean => {
        if (DBManager.botDB.GChatBAN.servers.includes(serverId)) return false;
        DBManager.botDB.GChatBAN.servers.push(serverId);
        DBManager.saveBotDB();
        return true;
    }

    export const unbanUser = (userId: string): boolean => {
        if (!DBManager.botDB.GChatBAN.users.includes(userId)) return false;
        DBManager.botDB.GChatBAN.users = DBManager.botDB.GChatBAN.users.filter(user => user != userId);
        DBManager.saveBotDB();
        return true;
    }
    export const unbanServer = (serverId: string): boolean => {
        if (!DBManager.botDB.GChatBAN.servers.includes(serverId)) return false;
        DBManager.botDB.GChatBAN.servers = DBManager.botDB.GChatBAN.servers.filter(server => server != serverId);
        DBManager.saveBotDB();
        return true;
    }



    export const linkGchat = (channelId: string, sourceUserId: string): boolean => {
        let GChatDB = DBManager.getGChatDB(channelId);
        if (GChatDB) return false;

        GChatDB = {
            channelId: channelId,
            sourceUserId: sourceUserId,
            time: new Date()
        }
        DBManager.saveGChatDB(channelId, GChatDB);
        return true;
    }

    export const unLinkGchat = (channelId: string) => {
        const GChatDB = DBManager.getGChatDB(channelId);
        if (!GChatDB) return false;

        DBManager.removeGChatDB(channelId);
        return true;
    }

    export const broadcastMessage = async (message: Discord.Message) => {
        message.delete();
        if (checkBadWord(message.content) != null) return;
        client.guilds.cache.forEach((guild) => {
            const serverDB = DBManager.getServerDB(guild.id);
            if (!serverDB.GChat.enabled) return;
            guild.channels.cache.forEach(async(channel) => {
                if (!(channel.id in DBManager.GChatDBs) || channel.type != Discord.ChannelType.GuildText) return;
                
                const files = message.attachments.map(attachment => attachment.url);
                const embed = new Discord.EmbedBuilder()
                    .setColor(embedConfig.colors.info)
                    .setAuthor({
                        iconURL: message.author.avatarURL() as string,
                        name: message.author.username + "|" + message.author.id
                    })
                    .setDescription(message.content + "\n\n" + files.join("\n"))
                    .setFooter({
                        iconURL: message.guild?.iconURL() as string, text: message.guild?.name + "\n" +
                        embedConfig.footerText
                    })
                    .setTimestamp(new Date());
                channel.send({
                    files: files,
                    embeds: [ embed ]
                })
            });
        });
    } 
}

export default GChatManager;