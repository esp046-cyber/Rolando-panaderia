import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_RECIPES } from './constants';
import { RecipeSummary, RecipeCategory, RecipeDetails } from './types';
import { generateRecipeDetails } from './services/geminiService';

// --- Components ---

const Header = () => (
  <header className="bg-brand-600 text-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🥖</span>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-wide">Rolando Panaderia</h1>
          <p className="text-xs text-brand-200 hidden sm:block">100 Authentic Filipino Recipes</p>
        </div>
      </div>
      
      </div>
    </div>
  </header>
);

const CategoryFilter = ({ 
  activeCategory, 
  onSelect 
}: { 
  activeCategory: string | null, 
  onSelect: (c: string | null) => void 
}) => (
  <div className="flex flex-wrap gap-2 justify-center py-6 px-2 bg-brand-50 sticky top-[72px] z-40 shadow-sm border-b border-brand-200">
    <button
      onClick={() => onSelect(null)}
      className={`px-4 py-1.5 rounded-full text-sm transition-colors font-medium ${
        activeCategory === null
          ? 'bg-brand-600 text-white shadow-md'
          : 'bg-white text-brand-800 hover:bg-brand-100 border border-brand-200'
      }`}
    >
      All
    </button>
    {Object.values(RecipeCategory).map((cat) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`px-4 py-1.5 rounded-full text-sm transition-colors font-medium ${
          activeCategory === cat
            ? 'bg-brand-600 text-white shadow-md'
            : 'bg-white text-brand-800 hover:bg-brand-100 border border-brand-200'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

interface RecipeCardProps {
  recipe: RecipeSummary;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-brand-200 overflow-hidden hover:shadow-xl hover:border-brand-400 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="h-32 bg-brand-100 relative overflow-hidden flex items-center justify-center text-brand-300">
        <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
           {recipe.category.includes('Bread') ? '🥖' : 
            recipe.category.includes('Cake') ? '🍰' : 
            recipe.category.includes('Cookie') ? '🍪' : '🥐'}
        </span>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/10 to-transparent h-8" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-500">
            {recipe.category.split(' ')[0]}
          </span>
          {recipe.isPopular && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
              Popular
            </span>
          )}
        </div>
        <h3 className="font-serif text-lg font-bold text-brand-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">
          {recipe.name}
        </h3>
        <div className="mt-auto pt-3 border-t border-brand-100">
          <span className="text-xs text-brand-400 font-medium flex items-center gap-1">
            <span>Tap for Recipe</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ 
  recipe, 
  details, 
  loading, 
  onClose 
}: { 
  recipe: RecipeSummary, 
  details: RecipeDetails | null, 
  loading: boolean, 
  onClose: () => void 
}) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-brand-50 p-6 border-b border-brand-100 flex justify-between items-start shrink-0">
          <div>
            <span className="text-xs font-bold text-brand-500 tracking-widest uppercase mb-1 block">
              {recipe.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-900">
              {recipe.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-200 text-brand-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-400 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium animate-pulse">Baking details with Gemini AI...</p>
            </div>
          ) : details ? (
            <div className="space-y-8">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                <div className="text-center">
                  <span className="block text-xs text-brand-400 font-bold uppercase">Prep Time</span>
                  <span className="font-serif text-lg text-brand-800">{details.prepTime}</span>
                </div>
                <div className="text-center border-l border-brand-200">
                  <span className="block text-xs text-brand-400 font-bold uppercase">Cook Time</span>
                  <span className="font-serif text-lg text-brand-800">{details.cookTime}</span>
                </div>
                <div className="text-center border-l border-brand-200">
                  <span className="block text-xs text-brand-400 font-bold uppercase">Yields</span>
                  <span className="font-serif text-lg text-brand-800">{details.servings}</span>
                </div>
              </div>

              <p className="text-brand-700 italic text-center px-4 leading-relaxed">
                "{details.description}"
              </p>

              {/* Ingredients */}
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-800 mb-4 border-b border-brand-100 pb-2 flex items-center gap-2">
                  <span>🥣</span> Ingredients
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {details.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-brand-900 text-sm p-2 rounded-lg hover:bg-brand-50 transition-colors">
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1.5 shrink-0" />
                      <span>
                        <span className="font-bold">{ing.amount}</span> {ing.item} 
                        {ing.note && <span className="text-brand-400 italic"> ({ing.note})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-800 mb-4 border-b border-brand-100 pb-2 flex items-center gap-2">
                  <span>👨‍🍳</span> Instructions
                </h3>
                <div className="space-y-6">
                  {details.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold font-serif shadow-sm">
                        {step.stepNumber}
                      </div>
                      <p className="text-brand-800 leading-relaxed pt-1">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {details.chefTips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
                  <h4 className="text-yellow-800 font-bold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Chef's Tips
                  </h4>
                  <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                    {details.chefTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSummary | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);

  const filteredRecipes = useMemo(() => {
    return INITIAL_RECIPES.filter(r => {
      const matchesCat = activeCategory ? r.category === activeCategory : true;
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  // Handle recipe click
  const handleRecipeClick = async (recipe: RecipeSummary) => {
    setSelectedRecipe(recipe);
    setRecipeDetails(null);
    setLoadingDetails(true);
    
    try {
      // In a real app, we might cache this in a context or local storage to save API calls
      const details = await generateRecipeDetails(recipe.name);
      setRecipeDetails(details);
    } catch (err) {
      console.error(err);
      alert("Failed to load recipe details. Please try again.");
      setSelectedRecipe(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-brand-900 font-sans selection:bg-brand-200">
      <Header />
      
      <main className="container mx-auto px-4 pb-20">
        {/* Hero Section */}
        <div className="py-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-800 mb-4">
            Discover the Taste of Home
          </h2>
          <p className="text-brand-600 mb-8">
            From morning Pandesal to festive Bibingka. Browse 100 authentic recipes curated for the modern Filipino kitchen.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-brand-400 group-focus-within:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border-2 border-brand-100 rounded-full leading-5 bg-white placeholder-brand-300 focus:outline-none focus:border-brand-500 focus:ring-0 transition-all shadow-sm"
              placeholder="Search for ensaymada, buko pie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <CategoryFilter 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />

        {/* Grid */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-6">
             <h3 className="text-xl font-serif font-bold text-brand-700">
              {activeCategory ? activeCategory : 'All Recipes'}
              <span className="ml-2 text-sm font-sans font-normal text-brand-400">
                ({filteredRecipes.length} found)
              </span>
            </h3>
          </div>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-brand-200">
              <p className="text-brand-400">No recipes found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredRecipes.slice(0, displayedCount).map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          )}

          {/* Load More / Pagination placeholder */}
          {filteredRecipes.length > displayedCount && (
            <div className="mt-12 text-center">
              <button 
                onClick={() => setDisplayedCount(prev => prev + 20)}
                className="bg-white border border-brand-300 text-brand-600 px-8 py-3 rounded-full hover:bg-brand-50 font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Show More Recipes
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-brand-100 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h4 className="font-serif text-2xl mb-4 font-bold">Rolando Panaderia</h4>
          <p className="max-w-md mx-auto text-sm opacity-70 mb-8">
            Celebrating the rich heritage of Filipino baking.
            <br />Powered by Google Gemini.
          </p>
          <p className="text-xs opacity-40">&copy; {new Date().getFullYear()} Rolando Panaderia. All rights reserved.</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedRecipe && (
        <Modal 
          recipe={selectedRecipe} 
          details={recipeDetails}
          loading={loadingDetails}
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
}