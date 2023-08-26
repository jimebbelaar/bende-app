import React, { useState, useEffect } from "react";
import { Input, Button, message } from "antd";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "./supabaseConfig";

const PasswordPage = () => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [currentPasswordInfo, setCurrentPasswordInfo] = useState(null);
  const [extraEnteredPassword, setExtraEnteredPassword] = useState("");
  const [extraPasswordCorrect, setExtraPasswordCorrect] = useState(false); // New state variable

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const round = searchParams.get("round");
  const teamId = searchParams.get("teamId");

  // Hardcoded password information
  const passwordsByRound = {
    10: {
      password: "gulden",
      points: 10,
      hint: `
      In 't hart van 't oude koninkrijk,
      Bij 't licht van kaars en maan,
      Daar ligt verborgen, stil en rijk,
      Waar spinrag sierlijk hangt vooraan.
  
      Niet zilver, goud, noch edelsteen,
      Hij glanst in inkt en lijn,
      Een fenomeen, haast overzeen,
      Op vliering schuilt hij fijn.
  
      Met vijf en twintig aan zijn zij,
      Een cijfer en een naam,
      Hij ruilt met jou, maar maakt niet vrij;
      Een circulair fantoom.
  
      Hoog boven grond en lage lucht,
      Waar tijd haast stil lijkt staan,
      Daar houdt hij zich in schaduw vlucht,
      En zal niet snel vergaan.
  
      Een adelaar, een kroon, een leeuw,
      Zijn tekens op zijn huid,
      Maar zelden ligt hij in de eeuw
      Waar men zijn waarde duidt.
  
      Hij reist van hand tot klamme hand,
      Verweerd maar immer puur,
      Geboren in een lage land,
      Verloren in het uur.
  
      Dus raad de schat, een stille hint,
      Verhuld in oud gewaad.
      Wie zoekt en peinst en diep bezint,
      Vindt sporen van zijn staat.
      `,
    },
    20: {
      password: "X28",
      points: 20,
      hint: `
      In 't derde daluniversum, ver en groot,
      Woont Betty Cirkel, man met geheimen, oh zo groot.
      Hij voelt zich hier niet thuis, in dit aardse tranendal,
      Verstopt hij iets kostbaars, een mysterie, een verhaal.
      
      Zilveren middelbaren, een schittering in het duister,
      Verborgen ergens veilig, in het domein van de huismeester.
      Betty spreekt een raadsel, diep en ondoorgrondelijk,
      "Vind dit object, en jouw vreugde is onbegrensd en onvermijdelijk."
      
      "Zoek in het hof van smaken, waar warm en koud elkaar treffen,
      Waar geur en kleur in harmonie hun vormen schetsen,"
      Zegt hij met een blik vol sterren, een raadsel in zijn oog,
      "Daar is iets verstopt, het blijft voorlopig omhoog."
      
      Een aanwijzing, een zinspeling, een suggestie zo klein,
      "Denk aan geometrie, cirkel en lijn."
      Betty Cirkel lacht, zijn ogen als kometen zo fel,
      Voor de zilveren middelbaren, blijft het geheim evenwel.
      
      Raad en peins, doorgrond het hier en daar,
      In Betty's mysterieuze domein, wees aandachtig, wees klaar.
      De zilveren middelbaren, een raadsel uit een ver universum,
      Zullen onthuld worden, bij het kraken van de code, het vinden van het juiste serum.
        `,
    },
    30: {
      password: "xnaughtynicolex",
      points: 30,
      hint: `
      In 't domein van rust, waar dromen zachtjes gaan,
      Daar is een mysterie, onder het hoofd van de maan.
      Een voorwerp verhuld, een puzzelelement,
      Verborgen waar je minstens verwacht, een moment.
      
      "Zoek in het koninkrijk van de nachtvlinder en mot,
      Waar 't geluid van de stilte soms lijkt als een complot."
      Een tip, zo subtiel, als de schaduw van een draad,
      "Daar waar 't einde is van de dag, maar ook waar 't begint, inderdaad."
      
      De tijd houdt de adem in, de lucht is dik en dicht,
      Wie zal ontrafelen dit ingewikkeld, dubbelzijdig dicht?
      Het raadsel ligt in weefsel, en in hout zo fijn,
      In het rijk van de nacht, kan het enkel daar zijn.
      
      Dus graaf en peins, duik diep in het zacht,
      Ontdek wat verborgen is, in de mantel van de nacht.
      De onbenoemde dingen, een sleutel en een stee,
      Worden pas ontdekt, als jij begrijpt deze twee.
        `,
    },
    40: {
      password: "jacuzzitijd",
      points: 40,
      hint: `
      In het rijk van spiegels, mist en schuim,
      Staat iemand daar, in een kleine ruim'.
      Met een geheime last, verborgen maar zwaar,
      En dan klinkt het geluid, van een deurbel klaar.
      
      Betrapt en beklemd, nu wat te doen?
      De buurvrouw wacht, en er is geen fatsoen.
      "Een ogenblik!" roept men, het gezicht zo rood,
      Een dilemma groot, als een schip in nood.
      
      Een tik, een tok, de klok telt af,
      En daar sta je dan, een keuze zo laf.
      De ruimte gevuld met geheim en zeep,
      De waarheid verborgen, in een stille greep.
      
      De buurvrouw wacht, geduldig en stil,
      Onwetend van 't geheim, dat niemand weten wil.
      De tijd dringt aan, het moment is daar,
      Om te kiezen snel, met een gebaar.
      
      Zo leert men weer, in dit kleine verhaal,
      Dat een kamer van stilte, heeft soms een ander verhaal.
      Een geheim verborgen, in schuim en mist,
      Dat blijft onbenoemd, maar wel degelijk is.
        `,
    },
  };

  const extraPassword = "operatiebende";

  useEffect(() => {
    // Directly use hardcoded data based on the round
    const passwordInfo = passwordsByRound[round];
    setCurrentPasswordInfo(passwordInfo);
  }, [round]);

  const handleExtraPasswordSubmit = () => {
    if (extraEnteredPassword === extraPassword) {
      message.success("Extra password correct. You may proceed.");
      setExtraPasswordCorrect(true); // Update the state variable
    } else {
      message.error("Incorrect extra password.");
    }
  };

  const handlePasswordSubmit = async () => {
    const correctPassword = currentPasswordInfo?.password;

    if (enteredPassword === correctPassword) {
      // Add points from currentPasswordInfo
      const { error } = await supabase
        .from("scores")
        .upsert([{ team_id: teamId, score: currentPasswordInfo.points }]);

      if (error) {
        console.error("Error updating score:", error);
      } else {
        message.success(
          `Correct password! ${currentPasswordInfo.points} points added.`
        );
        setEnteredPassword("");
      }
    } else {
      message.error("Incorrect password.");
    }
  };

  return (
    <div className="password-page">
      {/* Conditionally display the hint based on extraPasswordCorrect */}
      {extraPasswordCorrect && currentPasswordInfo && (
        <div>
          <pre>{`${currentPasswordInfo.hint}`}</pre>{" "}
          <Input
            type="password"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
            placeholder="Enter puzzle password"
          />
          <Button onClick={handlePasswordSubmit}>Wachtwoord proberen</Button>
        </div>
      )}
      {/* Extra Password Input */}
      <Input
        type="password"
        value={extraEnteredPassword}
        onChange={(e) => setExtraEnteredPassword(e.target.value)}
        placeholder="Enter extra password"
      />
      <Button onClick={handleExtraPasswordSubmit}>Start speurtocht</Button>
      {/* Regular Password Input */}
    </div>
  );
};

export default PasswordPage;
