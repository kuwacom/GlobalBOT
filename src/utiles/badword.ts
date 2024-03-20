import DBManager from "./dbManager"

export const addGChatBadWord = (text: string) => {
    if (DBManager.botDB.GChat.badWord.includes(text)) return false;
    DBManager.botDB.GChat.badWord.push(text);
    DBManager.saveBotDB();
    return true;
}

export const removeGChatBadWord = (text: string) => {
    if (!DBManager.botDB.GChat.badWord.includes(text)) return false;
    DBManager.botDB.GChat.badWord = DBManager.botDB.GChat.badWord.filter(badword => badword != text);
    DBManager.saveBotDB();
    return true;
}

export const checkBadWord = (text: string) => {
    if (DBManager.botDB.GChat.badWord.length == 0) return null;
    const result = DBManager.botDB.GChat.badWord.join('|');
    const regex = new RegExp(DBManager.botDB.GChat.badWord.length === 1 ? result : result[0], 'g');
    return text.match(regex);
}