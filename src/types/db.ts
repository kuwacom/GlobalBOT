export type ServerDB = {
    id: string;
    editableRoles: string[] | null;
    // GBANable: boolean; // globalBAN の有効無効
    // GChatable: boolean; // globalChat の有効無効
    GBAN: {
        enabled: boolean;
        editableRoles: string[] | null;
    };
    GChat: {
        enabled: boolean;
        editableRoles: string[] | null;
    }
}


export type GBANDB = {
    userId: string;
    userName: string | null;
    reason: string | null;
    sourceUserId: string; // BANをしたユーザー
    serverId: string; // BANされたサーバー
    time: Date;
}

export type GChatDB = {
    channelId: string;
    sourceUserId: string; // GChatへ追加したユーザー
    time: Date;
}