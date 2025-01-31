const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const { client } = require('../db/connect');
const { translateText } = require('../services/translate');

// Get all FAQs (with language support)
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const cacheKey = `faqs:${lang}`;

    // Check Redis cache
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from MongoDB
    const faqs = await FAQ.find();
    const translatedFAQs = faqs.map(faq => ({
      ...faq.getTranslatedFAQ(lang),
      id: faq._id,
    }));

    // Cache for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(translatedFAQs));
    res.json(translatedFAQs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new FAQ (with auto-translation)
router.post('/', async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = new FAQ({ question, answer });

    // Auto-translate to Hindi and Bengali
    const languages = ['hi', 'bn'];
    for (const lang of languages) {
      const translatedQuestion = await translateText(question, lang);
      const translatedAnswer = await translateText(answer, lang);
      faq.translations.push({ language: lang, question: translatedQuestion, answer: translatedAnswer });
    }

    await faq.save();

    // Invalidate cached FAQs for all languages
    const keys = await client.keys('faqs:*');
    if (keys.length > 0) await client.del(keys);

    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an FAQ
router.put('/:id', async (req, res) => {
    try {
      const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // Clear all cached FAQs
      const keys = await client.keys('faqs:*');
      if (keys.length > 0) await client.del(keys);
      
      res.json(faq);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete an FAQ
  router.delete('/:id', async (req, res) => {
    try {
      await FAQ.findByIdAndDelete(req.params.id);
      
      // Clear all cached FAQs
      const keys = await client.keys('faqs:*');
      if (keys.length > 0) await client.del(keys);
      
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;