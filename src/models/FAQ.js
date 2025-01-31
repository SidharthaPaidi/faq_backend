const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: ['en', 'hi', 'be']
    },
    questions: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
}, { _id: false });

const faqSchema = new mongoose.Schema({
    // Default English fields
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    // Array of translations
    translations: [translationSchema]

});

faqSchema.methods.getTranslatedFAQ = function (lang = 'en') {
    const translation = this.translations.find(t => t.language === lang);

    return translation || {
        question: this.question,
        answer: this.answer
    }
};

module.exports = mongoose.model('FAQ',faqSchema);
