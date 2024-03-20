import Discord from "discord.js";
import env from "./env";

export const embedConfig = {
    footerText: env.embed.footerText,
    colors: {
        info: env.embed.colors.info as Discord.ColorResolvable,
        success: env.embed.colors.success as Discord.ColorResolvable,
        warning: env.embed.colors.warning as Discord.ColorResolvable,
        error: env.embed.colors.error as Discord.ColorResolvable,
    }
}

// 元 Commands
export const slashCommandsConfig = {
    gban: {
        ban: {
            user: "/gban ban user",
            userId: "/gban ban userid"
        },
        unban: {
            user: "/gban unban user",
            userId: "/gban unban userid"
        }
    },
    gchat: {
        link: "/gchat link",
        unlink: "/gchat link",
        badWord: {
            add: '/gchat badword add',
            remove: '/gchat badword remove'
        },
        ban: {
            user: "/gchat ban user",
            server: "/gchat ban server"
        },
        unban: {
            user: "/gchat unban user",
            server: "/gchat unban server"
        }
    },
    config: {
        editable: "/config-editable",
        gban: {
            editable: "/gban-editable",
            enabled: "/config gban enabled",
        },
        gchat: {
            editable: "/gchat-editable",
            enabled: "/config gchat enabled",
        }
    }
}
