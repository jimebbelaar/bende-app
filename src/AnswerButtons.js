import React, { useEffect, useState, useRef } from "react";
import { Button, message, Typography, Progress, Alert } from "antd";
import { supabase } from "./supabaseConfig";

const { Text } = Typography;

const AnswerButtons = ({
  users,
  teams,
  question,
  timeRemaining,
  nextQuestion,
  session,
  completedQuestionsCount,
}) => {
  const currentUserId = session.user.id;

  const [attemptCount, setAttemptCount] = useState(0);
  const [correctAnswerSelected, setCorrectAnswerSelected] = useState(false);

  // A ref to keep track of the current question
  const currentQuestionRef = useRef();

  useEffect(() => {
    // Reset state when the question changes
    setAttemptCount(0);
    setCorrectAnswerSelected(false);
    currentQuestionRef.current = question;
  }, [question]);

  const handleAnswerClick = async (clickedUserId) => {
    if (attemptCount >= 3) {
      message.warning("Geen pogingen meer sukkols.");
      return;
    }

    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser || !currentUser.team_id) {
      console.error("Current user or user's team ID not found");
      return;
    }

    if (clickedUserId === question.user_id) {
      let points = 0;
      if (newAttemptCount === 1) {
        points = 10;
      } else if (newAttemptCount === 2) {
        points = 5;
      } else if (newAttemptCount === 3) {
        points = 3;
      }
      message.success("Correct answer!");
      setCorrectAnswerSelected(true);
      setAttemptCount(0);

      // Update the score
      const { error } = await supabase
        .from("scores")
        .upsert([{ team_id: currentUser.team_id, score: points }]);
      if (error) console.error("Error updating score:", error);
    } else {
      message.error("Helaas pindakaas.");
    }
  };

  const getColor = (count) => {
    if (count === 0) return "grey";
    if (count === 1) return "green";
    if (count === 2) return "orange";
    return "red";
  };

  return (
    <div>
      <Alert
        message={`Nog ${3 - attemptCount} poging(en) over.`}
        type="info"
        showIcon
      />
      <Progress
        percent={(attemptCount / 3) * 100}
        status="active"
        strokeColor={getColor(attemptCount)}
      />
      {users.map((user, index) => (
        <Button
          key={index}
          onClick={() => handleAnswerClick(user.id)}
          disabled={
            correctAnswerSelected || attemptCount >= 3 || timeRemaining <= 0
          }
          primary={correctAnswerSelected}
          danger={timeRemaining <= 0}
        >
          {user.username}
        </Button>
      ))}
    </div>
  );
};

export default AnswerButtons;
