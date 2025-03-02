import React from "react"
import { MenuSelector } from "./MenuSelector"
import { FeedbackForm } from "./FeedbackForm"
import { MealUploader } from "./MealUploader";
import './App.css' // Import the CSS file

function App() {
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
