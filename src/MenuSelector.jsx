import React, { useState, useEffect } from "react";
import { format, addDays, isWeekend } from "date-fns";

// Update this to your Google Apps Script URL
const endpoint = "https://script.google.com/macros/s/AKfycbzjIP0Mw5UTjHAcdxBXKD53GoFz4kpCdZ2vwmsJ3NWF49EqVOd0JQRlRYkoW0Z4qBNmRg/exec";

export function MenuSelector() {
  // State variables
  const [data, setData] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  /**
   * Compute today and the next 6 weekdays.
   * Skips Saturday and Sunday.
   */
  useEffect(() => {
    const futureWeekdays = [];
    let currentDate = new Date();

    while (futureWeekdays.length < 7) {
      if (!isWeekend(currentDate)) {
        // Format as "December 10, 2024"
        futureWeekdays.push(format(currentDate, "MMMM d, yyyy"));
      }
      currentDate = addDays(currentDate, 1); // Changed to add days (look forward)
    }
    // No need to reverse since we want chronological order
    setWeekdays(futureWeekdays);
  }, []);

  /**
   * Fetch menu data from Google Apps Script.
   */
  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
      });
  }, []);

  /**
   * Once a meal and a date are selected, figure out
   * which items to display from the fetched data.
   */
  let itemsToDisplay = [];
  if (data && data.menuItems && data.menuItems[selectedDate]) {
    itemsToDisplay = data.menuItems[selectedDate][selectedMeal] || [];
  }

  return (
    <div className="menu-selector">
      <h2 style={{ marginBottom: "1rem" }}>Menu</h2>

      <div className="selector-controls">
        <div className="select-group">
          <label htmlFor="date">Day</label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Select a day</option>
            {weekdays.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="select-group" style={{ marginTop: "1.5rem" }}>
          <label htmlFor="meal">Meal</label>
          <select
            id="meal"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            <option value="">Select a meal</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>

      {selectedMeal && selectedDate && (
        <div className="menu-display">
          <h3 style={{ marginBottom: "1rem" }}>
            Menu for {selectedDate} ({selectedMeal})
          </h3>
          {itemsToDisplay.length > 0 ? (
            <ul className="menu-items">
              {itemsToDisplay.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No data available for this day/meal.</p>
          )}
        </div>
      )}
    </div>
  );
}
