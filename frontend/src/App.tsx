import { Redirect, Route, Switch, useParams } from "wouter";
import Home from "./routes/home";
import CreateLobby from "./routes/createlobby";
import LobbiesId from "./routes/lobbiesid";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";

export default function App() {
  function ValidateLobby() {
    const [isValidId, setIsValidId] = useState(null);
    const params = useParams<{ id?: string }>();

    useEffect(() => {
      const serverUrl =
        process.env.NODE_ENV === "production"
          ? "https://werewolf-backend.onrender.com"
          : "http://localhost:10000";
      fetch(serverUrl + "/lobbies/" + params.id).then(async (result) => {
        const text = await result.text();
        setIsValidId(text === "true");
      });
    }, [params.id]);
    if (isValidId === null) {
      return <></>;
    } else if (isValidId) {
      return <LobbiesId />;
    } else {
      return <Redirect to="/?validId=false" replace />;
    }
  }
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/createlobby" component={CreateLobby} />
        <Route path="/lobbies/:id" component={ValidateLobby} />

        <Route>404: No such page!</Route>
      </Switch>
      <Footer />
    </>
  );
}
