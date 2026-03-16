import { useState } from 'react';
import axios from 'axios';
import RecipeCard from './components/RecipeCard';

function App() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  const searchRecipes = async () => {
    const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
    const res = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=8&apiKey=${API_KEY}`
    );
    setRecipes(res.data.results);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Recipe Finder</h1>
          <div className="mt-6 flex justify-center gap-2">
            <input 
              className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Search for pasta, chicken, vegan..."
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              onClick={searchRecipes}
              className="rounded-lg bg-orange-500 px-6 py-2 font-bold text-white hover:bg-orange-600"
            >
              Search
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </div>
    </div>
  );
}

export default App;