import React from "react"
import { MenuSelector } from "./MenuSelector"
import { FeedbackForm } from "./FeedbackForm"
import { MealUploader } from "./MealUploader"
import './App.css'
import barryLeft from './assets/Barry-B-Benson.webp'
import barryRight from './assets/Barry_B._Benson.png'

function App() {
  // Set the CSS variables with the imported image URLs
  document.documentElement.style.setProperty('--barry-left', `url(${barryLeft})`);
  document.documentElement.style.setProperty('--barry-right', `url(${barryRight})`);

  return (
    <div className="app-container">
      <header>
        <h1><span>warehaus food</span></h1>
      </header>
      <main>
        <MenuSelector />
        <MealUploader />
        <FeedbackForm />
      </main>
    </div>
  )
}

export default App
