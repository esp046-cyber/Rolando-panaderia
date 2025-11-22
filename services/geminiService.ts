import { GoogleGenAI, Type } from '@google/genai';
import { RecipeDetails } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRecipeDetails = async (recipeName: string): Promise<RecipeDetails> => {
  if (!apiKey) {
    // Mock response if no API key to prevent app crash during demo without key
    console.warn("No API Key provided. Using mock data.");
    return mockRecipe(recipeName);
  }

  const model = 'gemini-2.5-flash';
  const prompt = `Generate a detailed, authentic Filipino baking or pastry recipe for: "${recipeName}". 
  Include preparation time, cooking time, servings, ingredients with metric measurements, step-by-step instructions, and professional chef tips.
  Ensure the recipe is authentic to Filipino cuisine/bakery style.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  note: { type: Type.STRING, nullable: true },
                },
                required: ['item', 'amount'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                },
                required: ['stepNumber', 'instruction'],
              },
            },
            chefTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['prepTime', 'cookTime', 'ingredients', 'instructions', 'description'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    return JSON.parse(text) as RecipeDetails;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate recipe. Please check your API key or connection.");
  }
};

const mockRecipe = (name: string): RecipeDetails => ({
  prepTime: "30 mins",
  cookTime: "20 mins",
  servings: "12 pcs",
  description: `This is a simulated recipe for ${name} because a valid API Key was not detected. In production, Gemini would generate specific details here.`,
  ingredients: [
    { item: "All-purpose flour", amount: "4 cups", note: "Sifted" },
    { item: "Sugar", amount: "1 cup" },
    { item: "Yeast", amount: "2 tsp" },
    { item: "Warm Water", amount: "1.5 cups" }
  ],
  instructions: [
    { stepNumber: 1, instruction: "Mix dry ingredients in a bowl." },
    { stepNumber: 2, instruction: "Add wet ingredients and knead until smooth." },
    { stepNumber: 3, instruction: "Let rise for 1 hour." },
    { stepNumber: 4, instruction: "Bake at 350F for 20 minutes." }
  ],
  chefTips: [
    "Ensure your yeast is active before mixing.",
    "Don't over-knead the dough to keep it fluffy."
  ]
});