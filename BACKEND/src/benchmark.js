import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prompt = `
Explain this household noise: A short metallic clicking sound that repeats every 10 seconds near the kitchen.
`;

async function benchmarkGroq() {
  const start = Date.now();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const end = Date.now();
  return {
    model: "Groq LLaMA‑3 8B",
    latencyMs: end - start,
    output: response.choices[0].message.content,
  };
}

async function benchmarkGemini() {
  const start = Date.now();

  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  const result = await model.generateContent(prompt);

  const end = Date.now();
  return {
    model: "Gemini 3.5 Flash",
    latencyMs: end - start,
    output: result.response.text(),
  };
}

async function run() {
  console.log("Running GENAI Benchmark...\n");

  const groqResult = await benchmarkGroq();
  const geminiResult = await benchmarkGemini();

  console.log("=== RESULTS ===");
  console.log(groqResult);
  console.log(geminiResult);
}

run();
