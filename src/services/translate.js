const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

async function translateText(text, tagetLang) {
    try {
        const [translation] = await translate.translate(text, targetLang);
        return translation;
    } catch (error) {
        console.log("error while translating , falling back to english",error);
        return text;
    }
}

module.exports = { translateText };