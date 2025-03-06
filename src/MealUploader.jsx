import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format, subDays } from "date-fns";
import frameImage from './assets/frame2-removebg-preview.png'; // Updated to use the new frame image

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/daopnlpn3/image/upload";
const UPLOAD_PRESET = "meal-uploads";

export function MealUploader() {
  const [image, setImage] = useState(null);
  const [mealType, setMealType] = useState("lunch");
  const [mealImages, setMealImages] = useState([]);
  const [previousImages, setPreviousImages] = useState([]);
  const fileInputRef = useRef(null);

  // 📸 Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      // Auto upload when file is selected
      handleUpload(e.target.files[0]);
    }
  };

  // 📤 Upload Image to Cloudinary
  const handleUpload = async (fileToUpload) => {
    const fileToUse = fileToUpload || image;
    if (!fileToUse) return;

    const formData = new FormData();
    formData.append("file", fileToUse);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = response.data.secure_url;

      // Store uploaded image URL with timestamp
      const today = format(new Date(), "yyyy-MM-dd");
      const newImage = { 
        url: imageUrl, 
        meal: mealType, 
        date: today, 
        timestamp: new Date().getTime(),
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Save to local storage
      const storedImages = JSON.parse(localStorage.getItem("mealImages")) || [];
      const updatedImages = [...storedImages, newImage];
      localStorage.setItem("mealImages", JSON.stringify(updatedImages));

      // Update UI
      setMealImages(updatedImages.filter(img => img.meal === mealType && img.date === today));
      loadPreviousImages(updatedImages);
      setImage(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Trigger file input click when empty state is clicked
  const handleEmptyStateClick = () => {
    fileInputRef.current.click();
  };

  // 🗑️ Delete image function
  const handleDeleteImage = (imageId) => {
    console.log("Deleting image with ID:", imageId);
    
    // Get all images from local storage
    const storedImages = JSON.parse(localStorage.getItem("mealImages")) || [];
    
    // Ensure all images have IDs
    const imagesWithIds = storedImages.map(img => {
      if (!img.id) {
        img.id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      return img;
    });
    
    // Filter out the image to delete
    const updatedImages = imagesWithIds.filter(img => img.id !== imageId);
    
    console.log("Before deletion:", storedImages.length, "After deletion:", updatedImages.length);
    
    // Update local storage
    localStorage.setItem("mealImages", JSON.stringify(updatedImages));
    
    // Update UI states
    const today = format(new Date(), "yyyy-MM-dd");
    setMealImages(updatedImages.filter(img => img.meal === mealType && img.date === today));
    loadPreviousImages(updatedImages);
  };

  // Load previous images from the past two days INCLUDING today
  const loadPreviousImages = (images) => {
    const today = new Date();
    const twoDaysAgo = subDays(today, 2);
    
    // Filter images from past 2 days, INCLUDING today
    const filtered = images.filter(img => {
      const imgDate = new Date(img.date);
      return imgDate <= new Date(format(today, 'yyyy-MM-dd')) && 
             imgDate >= new Date(format(twoDaysAgo, 'yyyy-MM-dd'));
    });
    
    // Sort by timestamp (newest first) and take the 3 most recent
    const recent = filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    setPreviousImages(recent);
  };

  // 🔄 Load today's meal images on component mount
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    let storedImages = JSON.parse(localStorage.getItem("mealImages")) || [];
    
    // Ensure all images have IDs
    const imagesWithIds = storedImages.map(img => {
      if (!img.id) {
        img.id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      return img;
    });
    
    // Save back to localStorage if we had to add IDs
    if (imagesWithIds.some((img, i) => !storedImages[i].id)) {
      localStorage.setItem("mealImages", JSON.stringify(imagesWithIds));
      storedImages = imagesWithIds;
    }
    
    // Filter today's images for the selected meal type
    const filteredImages = storedImages.filter(img => img.date === today && img.meal === mealType);
    setMealImages(filteredImages);
    
    // Load previous images
    loadPreviousImages(storedImages);
  }, [mealType]);

  // ⏳ Auto-delete all images at 11:59 PM
  useEffect(() => {
    const now = new Date();
    const msUntilReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) - now;

    const resetTimer = setTimeout(() => {
      localStorage.removeItem("mealImages"); // Clear all saved images
      setMealImages([]); // Reset UI
      setPreviousImages([]);
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
        <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)} Photos</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {mealImages.map((img, index) => (
            <div key={index} style={{ position: 'relative', margin: '5px' }}>
              <img 
                src={img.url} 
                alt={mealType} 
                style={{ width: "200px", borderRadius: "10px" }} 
              />
              <button 
                onClick={() => handleDeleteImage(img.id)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(255, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '25px',
                  height: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Empty state with plus sign */}
          <div 
            onClick={handleEmptyStateClick}
            style={{ 
              width: "200px", 
              height: "200px", 
              borderRadius: "10px",
              border: "2px dashed #000000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "5px",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.5)"
            }}
          >
            <div style={{ 
              fontSize: "48px", 
              fontWeight: "bold", 
              color: "#000000" 
            }}>
              +
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }}
      />

      {/* Previous Food Pics Gallery */}
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <h3>Previous Food Pics</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
          {previousImages.length > 0 ? (
            previousImages.map((img, index) => (
              <div 
                key={index}
                style={{
                  position: 'relative',
                  width: '220px',
                  height: '220px',
                  transform: `rotate(${index % 2 === 0 ? '5deg' : '-5deg'})`, // Alternate slanting
                  margin: '10px',
                }}
              >
                {/* Golden Frame */}
                <img 
                  src={frameImage}
                  alt="frame"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 1
                  }}
                />
                
                {/* Actual Food Photo */}
                <img 
                  src={img.url} 
                  alt={`Previous ${img.meal}`}
                  style={{
                    position: 'absolute',
                    width: '78%',  // Adjust to fit inside the frame
                    height: '78%', // Adjust to fit inside the frame
                    top: '11%',     // Center within frame
                    left: '11%',    // Center within frame
                    objectFit: 'cover',
                    zIndex: 0
                  }}
                />
                
                {/* Delete button for framed photos */}
                <button 
                  onClick={() => handleDeleteImage(img.id)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(255, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    padding: 0,
                    zIndex: 2
                  }}
                >
                  ×
                </button>
                
                {/* Meal and date label */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 2
                }}>
                  {img.meal} - {img.date}
                </div>
              </div>
            ))
          ) : (
            <p>No previous food pics available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
