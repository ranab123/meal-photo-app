import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/daopnlpn3/image/upload";
const UPLOAD_PRESET = "meal-uploads";

export function MealUploader() {
  const [image, setImage] = useState(null);
  const [mealType, setMealType] = useState("lunch");
  const [mealImages, setMealImages] = useState([]);

  // 📸 Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // 📤 Upload Image to Cloudinary
  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = response.data.secure_url;

      // Store uploaded image URL with timestamp
      const today = format(new Date(), "yyyy-MM-dd");
      const newImage = { url: imageUrl, meal: mealType, date: today, timestamp: new Date().getTime() };

      // Save to local storage
      const storedImages = JSON.parse(localStorage.getItem("mealImages")) || [];
      const updatedImages = [...storedImages, newImage];
      localStorage.setItem("mealImages", JSON.stringify(updatedImages));

      // Update UI
      setMealImages(updatedImages.filter(img => img.meal === mealType));
      setImage(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // 🔄 Load today's meal images on component mount
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const storedImages = JSON.parse(localStorage.getItem("mealImages")) || [];
    const filteredImages = storedImages.filter(img => img.date === today && img.meal === mealType);
    setMealImages(filteredImages);
  }, [mealType]);

  // ⏳ Auto-delete all images at 11:59 PM
  useEffect(() => {
    const now = new Date();
    const msUntilReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) - now;

    const resetTimer = setTimeout(() => {
      localStorage.removeItem("mealImages"); // Clear all saved images
      setMealImages([]); // Reset UI
    }, msUntilReset);

    return () => clearTimeout(resetTimer); // Cleanup
  }, []);

  return (
    <div className="menu-selector">
      <h2>Food Pics</h2>

      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="mealType">Select Meal: </label>
        <select 
          id="mealType"
          value={mealType} 
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      {/* Display Meal Images */}
      <div style={{ marginBottom: "10px" }}>
        <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)} Pics</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {mealImages.length > 0 ? (
            mealImages.map((img, index) => (
              <img 
                key={index} 
                src={img.url} 
                alt={mealType} 
                style={{ width: "200px", borderRadius: "10px" }} 
              />
            ))
          ) : (
            <p>No pictures uploaded yet.</p>
          )}
        </div>
      </div>

      {/* Upload Input */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Upload a New Picture</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!image}
      >
        Upload Photo
      </button>
    </div>
  );
}
