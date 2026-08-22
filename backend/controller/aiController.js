import Product from "../model/productModel.js";
import axios from "axios";

export const handleAiQuery = async (req, res) => {
    try {
        const { messages, message } = req.body;
        const queryMessage = message || (Array.isArray(messages) ? messages[messages.length - 1]?.text : messages);

        if (!queryMessage) {
            return res.status(400).json({ success: false, response: "Please provide a query message." });
        }

        // Fetch live product context from database
        const products = await Product.find({});
        const productContext = products.map(p => 
            `[NAME]: ${p.name} | [PRICE]: ₹${p.price} | [CATEGORY]: ${p.category} | [SUBCATEGORY]: ${p.subCategory} | [BESTSELLER]: ${p.bestseller ? "YES" : "NO"} | [DESCRIPTION]: ${p.description}`
        ).join("\n");

        const apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;

        async function main() {
            try {
                if (!apiKey) throw new Error("GEMINI_KEY not configured");

                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                        contents: [{ role: "user", parts: [{ text: queryMessage }] }],
                        systemInstruction: {
                            parts: [{
                                text: `
You are an expert E-Commerce Customer Support & Product Recommendation Assistant for OneCart online shopping store. Your role is strictly limited to helping users with OneCart e-commerce queries.

## LIVE PRODUCT CATALOG CONTEXT:
${productContext}

## STORE DETAILS:
- Standard Delivery: 3 to 5 business days across India.
- Shipping Fee: ₹40.

## YOUR CAPABILITIES:
1. **Product Recommender**: Suggest top hoodies, t-shirts, jackets, and fashion items based on user preferences.
2. **Delivery & Order Helper**: Answer questions about delivery duration (e.g. 3 to 5 business days for hoodies and all products).
3. **Bestseller Guide**: Highlight Bestseller items like Hoodies and explain their key features and prices.

## INTERACTION GUIDELINES:
- When user asks "in how many days hoodie will be delivered", state standard delivery takes 3 to 5 business days and highlight that the Hoodie is a Bestseller on OneCart! ⭐
- If user asks non-ecommerce topics (weather, age, politics, protest, etc.), ALWAYS answer: "Sorry sir, I am here only to assist with OneCart e-commerce website queries like products, orders, cart, and shopping recommendations!"

## STRICT LIMITATIONS:
- ONLY answer OneCart e-commerce website queries.
- DO NOT answer unrelated non-ecommerce topics.
`
                            }]
                        }
                    }
                );

                const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                const lower = queryMessage.toLowerCase();
                const matchedProducts = products.filter(p => 
                    lower.includes(p.name.toLowerCase()) || 
                    lower.includes(p.category.toLowerCase()) || 
                    (lower.includes("hoodie") && p.name.toLowerCase().includes("hoodie")) ||
                    (lower.includes("bestseller") && p.bestseller)
                );

                return res.status(200).json({
                    success: true,
                    response: responseText,
                    products: matchedProducts.length > 0 ? matchedProducts.slice(0, 4) : (lower.includes("hoodie") ? products.filter(p => p.name.toLowerCase().includes("hoodie")) : [])
                });

            } catch (err) {
                // System Instruction Fallback Engine
                const lower = queryMessage.toLowerCase();
                let text = "";
                let matched = [];

                const offTopicTerms = ["weather", "age", "protest", "politics", "president", "math", "code", "python", "joke", "neet", "exam", "thought about"];
                const isOffTopic = offTopicTerms.some(t => lower.includes(t)) || (!lower.includes("hoodie") && !lower.includes("product") && !lower.includes("cart") && !lower.includes("order") && !lower.includes("delivery") && !lower.includes("days") && !lower.includes("men") && !lower.includes("women") && !lower.includes("hi") && !lower.includes("hello") && !lower.includes("bestseller"));

                if (isOffTopic) {
                    text = "Sorry sir, I am here only to assist with OneCart e-commerce website queries like products, orders, cart, and shopping recommendations!";
                    matched = [];
                } else if ((lower.includes("delivery") || lower.includes("days") || lower.includes("when")) && lower.includes("hoodie")) {
                    text = "🚚 Orders on OneCart are usually delivered within 3 to 5 business days across India! Also, our Hoodie is one of our Bestsellers on OneCart! ⭐";
                    matched = products.filter(p => p.name.toLowerCase().includes("hoodie"));
                } else if (lower.includes("delivery") || lower.includes("days") || lower.includes("shipping")) {
                    text = "🚚 Standard delivery on OneCart takes 3 to 5 business days across India with a flat shipping fee of ₹40!";
                } else if (lower.includes("hoodie")) {
                    matched = products.filter(p => p.name.toLowerCase().includes("hoodie"));
                    const best = matched[0] || products[0];
                    text = `🔥 Our top recommended hoodie on OneCart is **${best?.name || "Hoodie"}** priced at ₹${best?.price || 999}. ⭐ It is an official Bestseller!`;
                } else if (lower.includes("bestseller") || lower.includes("best")) {
                    matched = products.filter(p => p.bestseller);
                    text = "🌟 Here are the top Bestselling items on OneCart right now:";
                } else {
                    text = "👋 Welcome to OneCart! How can I assist you with products, orders, or bestsellers today?";
                    matched = products.filter(p => p.bestseller).slice(0, 3);
                }

                return res.status(200).json({
                    success: true,
                    response: text,
                    products: matched.slice(0, 4)
                });
            }
        }

        main();

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
