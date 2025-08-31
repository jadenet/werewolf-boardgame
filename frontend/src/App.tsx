import { Redirect, Route, Switch, useParams } from "wouter";
import Home from "./routes/home";
import CreateLobby from "./routes/createlobby";
import LobbiesId from "./routes/lobbiesid";
import { Link } from "wouter";
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
      <div className="navbar h-[8vh] bg-base-100">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <Link className="btn btn-ghost text-xl font-bold" href="/">
            ONE NIGHT WEREWOLF
          </Link>
        </div>
        <div className="navbar-end"></div>
      </div>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/createlobby" component={CreateLobby} />
        <Route path="/lobbies/:id" component={ValidateLobby} />

        <Route>404: No such page!</Route>
      </Switch>
      <footer className="footer footer-center p-4 h-[8vh] bg-base-300 text-base-content">
        <aside>
          <p>Jaden Edwards © 2024</p>
        </aside>
      </footer> 
    </>
    // TODO: fix overflow scrolling
  );
}
