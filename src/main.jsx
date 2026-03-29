import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { MealPlanProvider } from './context/MealPlanContext.jsx'
import { Toaster } from "./components/ui/sonner.jsx"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FavoritesProvider>
      <MealPlanProvider>
        <App />
        <Toaster />
      </MealPlanProvider>
    </FavoritesProvider>
  </React.StrictMode>,
)
