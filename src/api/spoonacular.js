import axios from 'axios';

const BASE_URL = 'https://api.spoonacular.com';
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY
  }
});

// Generic error handler
const handleError = (error) => {
  if (error.response) {
    console.error(`Spoonacular API Error: ${error.response.status}`, error.response.data);
    if (error.response.status === 402) {
      throw new Error("API Limit Exhausted. Please check your Spoonacular API quota.");
    }
  }
  throw error;
};

// Search recipes with filters
export const searchRecipes = async (params) => {
  try {
    const response = await api.get('/recipes/complexSearch', { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get single recipe details by ID
export const getRecipeById = async (id) => {
  try {
    const response = await api.get(`/recipes/${id}/information`, {
      params: { includeNutrition: true }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get random featured recipes
export const getRandomRecipes = async (tags, number = 6) => {
  try {
    const response = await api.get('/recipes/random', {
      params: { tags, number }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get similar recipes
export const getSimilarRecipes = async (id, number = 4) => {
  try {
    const response = await api.get(`/recipes/${id}/similar`, {
      params: { number }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Search by ingredients (fallback/alternative)
export const searchByIngredients = async (ingredients, number = 12) => {
  try {
    const response = await api.get('/recipes/findByIngredients', {
      params: { ingredients, number }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
