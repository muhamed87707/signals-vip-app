const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    console.log("1. Starting AI Debugger...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ No API Key found");
        return;
    }

    const modelsToTest = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];

    for (const modelName of modelsToTest) {
        try {
            console.log(`\n👉 Testing Model: ${modelName}...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Ping");
            console.log(`✅ SUCCESS! Model '${modelName}' is working.`);
            console.log("Response:", result.response.text());

            // If success, we found our winner
            console.log(`\n🏆 RECOMMENDED ACTION: Use '${modelName}'`);
            return;
        } catch (error) {
            console.error(`❌ FAILED '${modelName}':`, error.message);
            if (error.message.includes("404")) console.log("   (Model not found)");
            if (error.message.includes("429")) console.log("   (Rate limited)");
        }
    }
    console.log("\n❌ All models failed.");
}

testGemini();
