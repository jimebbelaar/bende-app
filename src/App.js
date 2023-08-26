import { Layout, Button } from "antd";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { supabase } from "./supabaseConfig";
import Login from "./Login";
import TriviaBoard from "./TriviaBoard";
import Speurtocht from "./Speurtocht";
import "./App.css";
const { Header, Content, Footer } = Layout;

function App() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    setSession(supabase.auth.getSession());

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const fetchUsersAndTeams = async () => {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*");
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (usersError) console.error("Error fetching users:", usersError);
      if (teamsError) console.error("Error fetching teams:", teamsError);

      setUsers(usersData || []);
      setTeams(teamsData || []);
    };

    fetchUsersAndTeams();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
  };

  return (
    <Layout className="layout" style={{ overflow: "hidden" }}>
      <Router>
        <Content style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="site-layout-content">
            <Routes>
              <Route
                path="/trivia"
                element={
                  <TriviaBoard users={users} teams={teams} session={session} />
                }
              />
              <Route path="/speurtocht" element={<Speurtocht />} />
              <Route
                path="/"
                element={
                  session ? (
                    <TriviaBoard
                      users={users}
                      teams={teams}
                      session={session}
                    />
                  ) : (
                    <Login />
                  )
                }
              />
            </Routes>
            {session && (
              <Button
                danger
                onClick={handleLogout}
                style={{ marginTop: "2rem", marginBottom: "2rem" }}
              >
                Uitloggen
              </Button>
            )}
            <p>Operatie Bende © 2023 Bende van 10.5</p>
          </div>
        </Content>
      </Router>
    </Layout>
  );
}

export default App;
