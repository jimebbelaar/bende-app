import React, { useEffect, useState } from "react";
import AnswerButtons from "./AnswerButtons";
import { supabase } from "./supabaseConfig";
import { message } from "antd";
import { Button, Progress } from "antd";
import { Link } from "react-router-dom";

const TriviaBoard = ({ users, teams, session }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [completedQuestionsCount, setCompletedQuestionsCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [teamScore, setTeamScore] = useState(0);
  const [teamId, setTeamId] = useState(null);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const shouldShowPasswordLink = [1, 20, 30, 40].includes(
    completedQuestionsCount
  );

  const passwordLink = `/speurtocht?round=${completedQuestionsCount}&teamId=${teamId}`;

  useEffect(() => {
    const fetchTeamId = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("team_id")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Error fetching team_id:", userError);
        return;
      }

      setTeamId(userData.team_id);
    };

    fetchTeamId();
  }, [session]);

  // Fetch completed questions count
  useEffect(() => {
    const fetchCompletedQuestions = async () => {
      const { data, error } = await supabase
        .from("answered_questions")
        .select("id") // Or any other field, doesn't matter as you are going to count.
        .eq("team_id", teamId);

      if (error) {
        console.error("Error fetching completed questions:", error);
        return;
      }

      const count = data.length;
      setCompletedQuestionsCount(count);
    };

    if (teamId) {
      fetchCompletedQuestions();
    }
  }, [teamId, questions]);

  // Fetch questions
  useEffect(() => {
    if (teamId === null) return; // Don't proceed if teamId is null

    const fetchQuestions = async () => {
      const { data, error } = await supabase.rpc("fetch_unanswered_questions", {
        team_id_param: teamId,
      });

      if (error) {
        console.error("Error fetching questions:", error);
        return;
      }

      setQuestions(data);
    };

    fetchQuestions();
  }, [teamId]); // Dependency updated

  // Handle timing logic
  useEffect(() => {
    if (timeRemaining > 0 && currentQuestion) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentQuestion) {
      // Log to the 'answered_questions' table
      const logAnsweredQuestion = async () => {
        const currentUser = users.find((u) => u.id === session.user.id);
        if (!currentUser || !currentUser.team_id) {
          console.error("Current user or user's team ID not found");
          return;
        }

        const { error: answeredError } = await supabase
          .from("answered_questions")
          .insert([
            { team_id: currentUser.team_id, question_id: currentQuestion.id },
          ]);
        if (answeredError)
          console.error("Error updating answered questions:", answeredError);
      };

      logAnsweredQuestion();

      // Move to next question when the timer reaches zero
      message.warning("En de tijd is om.");
      setShowNextQuestionButton(true);
    }
  }, [timeRemaining, currentQuestion, teamId, showNextQuestionButton]);

  const fetchFinalScore = async () => {
    const { data, error } = await supabase.rpc("fetch_total_team_score", {
      team_id_param: teamId,
    });

    console.log("Fetch final score called, Data:", data, "Error:", error); // Log 3

    if (error) {
      console.error("Error fetching final score:", error);
      return;
    }

    if (data !== null) {
      console.log("Setting team score:", data); // Log 4
      setTeamScore(data);
    }
  };

  const nextQuestion = async () => {
    if (questions.length > 0) {
      // Generate a random index between 0 and questions.length - 1
      const randomIndex = Math.floor(Math.random() * questions.length);

      // Use the random index to pick a question from the array
      const next = questions[randomIndex];

      if (next) {
        console.log(next.duration);
        setCurrentQuestion(next);
        setTimeRemaining(60); // Assuming 'duration' property contains time in seconds

        // Remove the selected question from the array to avoid picking it again
        questions.splice(randomIndex, 1);

        // Refresh the count of completed questions
        await refreshCompletedQuestionsCount();

        if (questions.length === 0 && teamId !== null) {
          fetchFinalScore();
        }
      }
    }
  };

  const handleNextQuestionClick = () => {
    setShowNextQuestionButton(false); // Hide the button
    nextQuestion(); // Go to next question
  };

  const refreshCompletedQuestionsCount = async () => {
    const { data, error } = await supabase
      .from("answered_questions")
      .select("id") // Or any other field, doesn't matter as you are going to count.
      .eq("team_id", teamId);

    if (error) {
      console.error("Error refreshing completed questions:", error);
      return;
    }

    const count = data.length;
    setCompletedQuestionsCount(count);
  };

  useEffect(() => {
    nextQuestion();
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0 && teamId !== null) {
      fetchFinalScore();
    }
  }, [questions, teamId]);

  // Determine timer color
  const getTimerColor = () => {
    if (timeRemaining <= 5) return "red";
    if (timeRemaining <= 10) return "orange";
    return "green";
  };

  return (
    <div className="trivia-board">
      <h1>Operatie bende</h1>
      <div className="question-container">
        {/* This will show the password link without hiding the rest */}
        {shouldShowPasswordLink && (
          <Button>
            <Link to={passwordLink}>START SPEURTOCHT</Link>
          </Button>
        )}

        {currentQuestion ? (
          <>
            <h2>{currentQuestion.question_text}</h2>
            <div className="timer">
              <Progress
                type="circle"
                percent={(timeRemaining / 30) * 100}
                width={50}
                format={() => timeRemaining}
                strokeColor={getTimerColor()}
              />
            </div>
            <AnswerButtons
              users={users}
              teams={teams}
              question={currentQuestion}
              timeRemaining={timeRemaining}
              nextQuestion={nextQuestion}
              session={session}
            />
          </>
        ) : (
          <h1>Teamscore: {teamScore}</h1>
        )}
        {showNextQuestionButton && !showPasswordInput && (
          <Button
            type="primary"
            style={{ marginTop: "2rem" }}
            onClick={handleNextQuestionClick}
          >
            Volgende vraag
          </Button>
        )}
      </div>
    </div>
  );
};

export default TriviaBoard;
