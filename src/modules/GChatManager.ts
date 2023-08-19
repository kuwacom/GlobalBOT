import Discord, { Attachment } from "discord.js";
import { logger, config, client } from "../bot";
import * as Types from "./types";
import * as dbManager from "./dbManager";
import { sleep } from "./utiles";

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

export const broadcastMessage = async (message: Discord.Message) => {
    message.delete();
    client.guilds.cache.forEach((guild) => {
        const serverDB = dbManager.getServerDB(guild.id);
        if (!serverDB.GChat.enabled) return;
        guild.channels.cache.forEach(async(channel) => {
            if (!(channel.id in dbManager.GChatDBs) || channel.type != Discord.ChannelType.GuildText) return;
            
            const files = message.attachments.map(attachment => attachment.url);
            const embed = new Discord.EmbedBuilder()
                .setColor(Types.embedCollar.info)
                .setAuthor({
                    iconURL: message.author.avatarURL() as string,
                    name: message.author.username
                })
                .setDescription(message.content + "\n\n" + files.join("\n"))
                .setFooter({
                    iconURL: message.guild?.iconURL() as string, text: message.guild?.name + "\n" +
                    config.embed.footerText
                })
                .setTimestamp(new Date());
            channel.send({
                files: files,
                embeds: [ embed ]
            })
        });
    });
} 