import React, { useState, useEffect } from "react";
import { Form, Input, Button } from "antd";
import { supabase } from "./supabaseConfig";

const Badkamer = ({ nextQuestion, session, currentUser, users }) => {
  const [userInput, setUserInput] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0); // Start from 0 seconds

  const correctAnswer = "badkamer"; // Replace with the actual hardcoded answer

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(timeElapsed + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeElapsed]);

  const handleSubmit = async () => {
    if (userInput.toLowerCase() === correctAnswer.toLowerCase()) {
      if (!currentUser || !currentUser.team_id) {
        console.error("Current user or user's team ID not found");
        return;
      }

      // Update score in Supabase
      const { error } = await supabase
        .from("scores")
        .upsert([{ team_id: currentUser.team_id, score: 10 }]); // assuming 10 points for a correct answer
      if (error) console.error("Error updating score:", error);
    } else {
      alert("Wrong answer, try again.");
    }
  };

  return (
    <div>
      <h3>
        Hint: "In 't sanctum van Narcissus' laatste zucht, Waar water zich mengt
        met etherische lucht. Daar vind je, verborgen, het volgende spel, In het
        hart van een spiegel, wees dan snel."
      </h3>
      <div>Time elapsed: {timeElapsed} seconds</div>
      <Form onFinish={handleSubmit}>
        <Form.Item name="answer">
          <Input
            placeholder="Antwoord"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Badkamer;
