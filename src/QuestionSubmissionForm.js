import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  List,
  Input,
  Button,
  Form,
  Popconfirm,
  message,
  Modal,
  Card,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { supabase } from "./supabaseConfig";

const { TextArea } = Input;

const hints = [
  "Wat is het gekste dat je ooit hebt gedaan op een impuls?",
  "Heb je ooit iets gestolen, zelfs als het iets kleins was? Wat was het?",
  "Wat is je grootste ongegronde angst of fobie?",
  "Als je één dag van je leven opnieuw zou kunnen beleven, welke dag zou dat dan zijn en waarom?",
  "Welk talent of vaardigheid heb je dat de meesten niet van je weten?",
  "Wat is je meest gênante moment?",
  "Welk land of welke stad wil je ooit nog bezoeken en waarom?",
  "Welke hobby of interesse heb je waar de meeste mensen verrast over zouden zijn?",
  "Heb je een bizar talent, zoals een tongrol of het bewegen van je oren?",
  "Wat is het meest onvolwassen ding dat je recentelijk hebt gedaan?",
  "Is er een liedje dat je altijd laat huilen of diepe emoties in je opwekt? Welke?",
  "Heb je ooit een leugen verteld om onder iets uit te komen? Wat was het?",
  "Welk boek heeft het meest invloed gehad op je leven of je denken veranderd?",
  "Wat is een ding dat je altijd al hebt willen proberen, maar te bang was om te doen?",
  "Heb je ooit iets gedaan waarvan je dacht dat je het nooit zou doen? Wat was het?",
  "Welke kinderlijke gewoonte heb je nog steeds als volwassene?",
  "Is er een droom of nachtmerrie die je nog steeds herinnert uit je kindertijd?",
  "Heb je ooit een crush gehad op een tekenfilm- of fictief karakter? Wie was het?",
  "Wat was je stoutste jeugdherinnering?",
  "Als je drie dingen uit je verleden kon veranderen, wat zou je dan kiezen?",
  "Is er een specifieke geur die sterke herinneringen bij je oproept? Wat is het en waarom?",
  "Heb je ooit geloofd in een bijgeloof of stedelijke legende?",
];

const getRandomHint = () => {
  const randomIndex = Math.floor(Math.random() * hints.length);
  return hints[randomIndex];
};

export function QuestionSubmissionForm({ session, onQuestionSubmitted }) {
  const [currentHint, setCurrentHint] = useState(getRandomHint());
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const refreshHint = () => {
    setCurrentHint(getRandomHint());
  };

  const userId = session ? session.user.id : null;

  const showHint = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    if (!userId) {
      console.error("No user found. Please log in first.");
      return;
    }
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("user_id", userId);

    if (error) console.error("Error fetching questions:", error);
    else setQuestions(data);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    if (questions.length >= 6) {
      message.error("Maximum aantal vragen bereikt");
      return;
    }

    const { data, error } = await supabase.from("questions").insert([
      {
        question_text: question,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Error submitting question:", error);
    } else {
      setQuestion("");
      fetchQuestions();
      // Fetch the updated list of questions
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    }
  };

  const handleEditQuestion = async (id, updatedQuestion) => {
    const { data, error } = await supabase
      .from("questions")
      .update({ question_text: updatedQuestion })
      .eq("id", id);

    if (error) {
      console.error("Error updating question:", error);
    } else {
      fetchQuestions();
    }
  };

  const handleDeleteQuestion = async (id) => {
    const { data, error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting question:", error);
    } else {
      fetchQuestions();
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={24}>
          <Form onFinish={handleSubmit} style={{ width: "100%" }}>
            <Form.Item style={{ width: "100%" }}>
              <TextArea
                value={question}
                onChange={handleQuestionChange}
                rows={4}
                placeholder="Feitje, spreuk, vraag, gekke gewoonte of wat dan ook over jezelf toevoegen..."
                style={{ borderRadius: "4px" }}
              />
            </Form.Item>
            <Form.Item>
              <Button onClick={showHint} default>
                Inspireer me met een hint
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                style={{ marginTop: "1rem" }}
              >
                Toevoegen
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <List
        dataSource={questions}
        renderItem={(item) => (
          <List.Item style={{ marginBottom: "15px" }}>
            <Card
              hoverable
              style={{ width: "100%", borderRadius: "8px" }}
              bodyStyle={{ padding: "12px 16px" }}
              actions={[
                <Popconfirm
                  title="Are you sure?"
                  onConfirm={() => handleDeleteQuestion(item.id)}
                >
                  <DeleteOutlined />
                </Popconfirm>,
                <EditOutlined
                  onClick={() =>
                    setEditingId(editingId === item.id ? null : item.id)
                  }
                />,
              ]}
            >
              {editingId === item.id ? (
                <TextArea
                  rows={1}
                  defaultValue={item.question_text}
                  onBlur={(e) => {
                    handleEditQuestion(item.id, e.target.value);
                    setEditingId(null);
                  }}
                  autoFocus
                  style={{ width: "100%", borderRadius: "4px" }}
                />
              ) : (
                <div
                  style={{
                    cursor: "pointer",
                    wordBreak: "break-word",
                  }}
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                >
                  {item.question_text}
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Hint"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="refresh" onClick={refreshHint}>
            Nieuw hintje
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => setIsModalVisible(false)}
          >
            OK
          </Button>,
        ]}
      >
        <p>{currentHint}</p>
      </Modal>
    </div>
  );
}
