import React, { useState } from "react";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwStnFHW5Pgew_DW9ZcWHgvpKPXv80GwwUJz_esp8LFLC0xmQCV4NSyIq4z3U74pK2WoQ/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, feedback }),
        mode: "no-cors",
      });
  
      console.log("Response received:", response);

      setMessage("Feedback submitted successfully!");
      setName("");
      setFeedback("");
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>KUDOS!!!</h2>

      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="name">Name (Optional):</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="feedback">Feedback:</label>
        <textarea
          id="feedback"
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Credit where credit is due"
          required
          rows="5"
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
