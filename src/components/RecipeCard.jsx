export default function RecipeCard({ recipe }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg">
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{recipe.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
            {recipe.readyInMinutes} mins
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500 uppercase">{recipe.dishTypes?.[0] || 'Main'}</span>
        </div>
        <button className="mt-4 w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          View Recipe
        </button>
      </div>
    </div>
  );
}