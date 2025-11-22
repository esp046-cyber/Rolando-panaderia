export enum RecipeCategory {
  BREAD = 'Bread (Tinapay)',
  CAKE = 'Cake (Kakanin/Cake)',
  PASTRY = 'Pastry (Meryenda)',
  COOKIE = 'Cookie (Biskwit)',
  SAVORY = 'Savory Pastry'
}

export interface Ingredient {
  item: string;
  amount: string;
  note?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
}

export interface RecipeDetails {
  prepTime: string;
  cookTime: string;
  servings: string;
  description: string;
  ingredients: Ingredient[];
  instructions: RecipeStep[];
  chefTips: string[];
}

export interface RecipeSummary {
  id: string;
  name: string;
  category: RecipeCategory;
  isPopular: boolean;
  details?: RecipeDetails; // Populated by AI on demand
}