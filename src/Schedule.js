import React from "react";
import { Card, List, Typography, Divider } from "antd";
import Login from "./Login";
import { QuestionSubmissionForm } from "./QuestionSubmissionForm";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseConfig";

const { Title, Paragraph, Text } = Typography;

export function Schedule({ session }) {
  const agenda = [
    {
      time: "15:00",
      title: "De Bende's Bubbelstart",
      icon: "🍾",
      description:
        "Welkom, avonturiers! We trappen af met bubbels, het eerste ontgrendelde agendapunt dankzij jullie bijdragen. Hier proosten we op nieuwe avonturen en oude vriendschappen.",
    },
    {
      time: "16:00 - 18:30",
      title: "De Bende's Drankmeer",
      icon: "🍻",
      description:
        "Op naar het volgende level! Dit agendapunt is ontgrendeld door jullie mysterieuze feitjes en vragen. Of je nu een liefhebber van bier of wijn bent, we hebben voor elk wat wils.",
    },
    {
      time: "18:30",
      title: "Mysterie Moment",
      icon: "🎭",
      description:
        "Dit agendapunt is zo geheimzinnig als sommige van jullie ingediende feitjes. We verklappen nog niets, maar bereid je voor op iets spectaculairs.",
    },
    {
      time: "19:00",
      title: "De Bende in Sushi Haven",
      icon: "🍣",
      description:
        "Ook dit culinaire intermezzo is een beloning voor jullie creatieve inbreng. Laat de sushi rollen en geniet!",
    },
    {
      time: "20:00",
      title: "Het Grote Avontuur",
      icon: "🗺️",
      description:
        "Het moment is daar! Dit agendapunt is het kroonjuweel, ontgrendeld door jullie talrijke en ingewikkelde raadsels. Trek je avontuurlijke schoenen aan en zet je zinnen op scherp!",
    },
    {
      time: "22:00",
      title: "Secret Party",
      icon: "💦",
      description:
        "De laatste uitdaging, het finale agendapunt, is iets waar je alleen maar van kunt dromen. Dit hebben we allemaal te danken aan jullie geweldige vragen en feitjes. Houd je ogen open en je geest gereed; dit wordt magisch.",
    },
  ];

  const [questions, setQuestions] = useState([]);
  const userId = session?.user?.id;

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

  useEffect(() => {
    fetchQuestions();
  }, [session]); // Re-fetch when the session changes

  const visibleAgenda = agenda.slice(0, questions.length);

  return (
    <div>
      <Title level={3}>Operatie Bende, wilde schattenjacht 🏴‍☠️</Title>
      <Paragraph>
        Stel je voor: een zomerse avond, de lucht gevuld met het geluid van
        tjilpende krekels en het zachte ruisen van de bladeren. Een groep
        vrienden, De Bende, verzamelt zich, hun ogen glinsteren van opwinding en
        nieuwsgierigheid. Dit is het moment waar we allemaal op hebben gewacht -
        de start van onze schattenjacht. Alleen dan anders; we hebben een twist
        die jullie zal verbazen en vermaken.
      </Paragraph>
      <Title level={4}>🗺️ Voorbereidingen voor het Grote Avontuur 🗺️</Title>
      <Paragraph>
        De kaart naar de schat is niet zomaar een kaart; het is een spiegel van
        onszelf, vol raadsels en aanwijzingen die alleen kunnen worden opgelost
        met de unieke kennis die we over elkaar hebben. En dat is waar jullie
        binnenkomen. We vragen elk Bende-lid om geheime feitjes, spreuken,
        bijgeloven of welk mysterie dan ook te delen via een speciaal voor dit
        evenement ontwikkelde app. Hoe? Volg deze richtlijnen:
      </Paragraph>
      <Title level={5}>Instructies voor het invoeren van je feitjes:</Title>
      <List bordered>
        <List.Item>
          <Text strong>1. Anonimiteit is de sleutel:</Text> Schrijf zó dat het
          raadselachtig blijft. In plaats van te zeggen "Ik heb ooit op een
          dooie gans gesprongen," zeg je bijvoorbeeld: "Iemand in de groep heeft
          een ongewone sprong op gevogelte gewaagd die hij of zij waarschijnlijk
          nooit meer zal vergeten."
        </List.Item>
        <List.Item>
          <Text strong>2. Complexiteit:</Text> Maak het niet makkelijk voor ons.
          De schat wordt alleen gevonden als we diep graven, zowel letterlijk
          als figuurlijk. Kies raadsels die ons dwingen om goed na te denken.
        </List.Item>
        <List.Item>
          <Text strong>3. Maak het Intrigerend:</Text> Dit is het podium voor al
          die verborgen talenten en vreemde feitjes. Voel je vooral vrij om
          jezelf te laten gaan; schaamte is hier niet op zijn plaats. En maak je
          geen zorgen, je kunt je vragen of feitjes altijd later aanpassen in de
          app. Dus als je denkt dat je een beetje bent uitgeschoten, geen
          probleem, je kunt altijd terug en het aanpassen.
        </List.Item>
      </List>
      <br></br>
      <Paragraph>
        We kunnen niet wachten om deze epische reis met jullie te beginnen. Hier
        komt de sleutel tot nog meer avontuur: ieder Bende-lid wordt verzocht om
        minimaal zes vragen of feitjes toe te voegen aan de app. En ja, er zit
        een extraatje aan vast. Voor elke vraag of feitje dat je invoert,
        ontgrendel je een nieuw agenda-item voor het evenement. Je kunt je
        vragen op elk moment opslaan en later wijzigen, dus wees niet te bang om
        uit te schieten. Zes vragen betekent dus zes nieuwe, opwindende items
        die aan onze schattenjacht worden toegevoegd! Tot heel snel, en onthoud:
        bij De Bende is niets zoals het lijkt.
      </Paragraph>

      <Paragraph>Liefs,</Paragraph>

      <Paragraph>🪱</Paragraph>

      <Divider />
      {session ? (
        <QuestionSubmissionForm
          session={session}
          onQuestionSubmitted={fetchQuestions}
        />
      ) : (
        <Login />
      )}
      <List
        dataSource={visibleAgenda}
        renderItem={(item) => (
          <List.Item>
            <Card style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text strong style={{ marginRight: "16px" }}>
                  {item.time}
                </Text>
                <Text strong style={{ flex: 1 }}>
                  {item.title}
                </Text>
                <Text>{item.icon}</Text>
              </div>
              <Text type="secondary">{item.description}</Text>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Schedule;
