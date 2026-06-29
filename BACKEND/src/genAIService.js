import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function explainNoiseWithAI(features, context = "") {
  const prompt = `
You are the Home Noise Interpreter AI.

Audio features:
- Duration: ${features.durationSeconds}s
- Sample rate: ${features.sampleRate}
- Channels: ${features.channels}
- Loudness: ${features.loudness}

User context: "${context}"

Decide the risk level based on the sound itself, the household context, and the category it falls into.
Respond using exactly these five headings, with no extra introduction or closing:
What it likely is:
Why it happens:
Is it dangerous?:
Next step:
Risk:
Use one of these values for Risk: low, medium, high.
- low: normal household sound, no danger, minor issue only.
- medium: possible problem, inspect or monitor.
- high: urgent hazard, leak, electrical danger, or immediate damage.
Keep each heading one or two sentences only.
Avoid filler phrases like "Based on the audio features" or "I can make an educated interpretation".
If the noise is likely a real issue, recommend a technician only when Risk is high.
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0].message.content;
  } catch (err) {
    return "AI error: unable to analyze noise.";
  }
}
