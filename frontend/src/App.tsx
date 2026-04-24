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
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      );
    } else if (isValidId) {
      return <LobbiesId />;
    } else {
      return <Redirect to="/?validId=false" replace />;
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="navbar h-[8vh] bg-base-100/80 backdrop-blur-md border-b border-base-300 shadow-lg">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <Link className="btn btn-ghost text-xl font-bold hover:bg-primary/10 transition-colors" href="/">
            🌙 ONE NIGHT WEREWOLF
          </Link>
        </div>
        <div className="navbar-end"></div>
      </div>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/createlobby" component={CreateLobby} />
        <Route path="/lobbies/:id" component={ValidateLobby} />
        <Route>
          <div className="flex flex-col items-center justify-center min-h-[84vh] text-center">
            <h1 className="text-6xl font-bold text-error mb-4">404</h1>
            <p className="text-xl text-base-content/70 mb-8">Page not found</p>
            <Link href="/" className="btn btn-primary btn-lg">
              Return Home
            </Link>
          </div>
        </Route>
      </Switch>
      <footer className="footer footer-center p-4 h-[8vh] bg-base-300/50 backdrop-blur-sm text-base-content/70 border-t border-base-300">
        <aside>
          <p className="text-sm">© 2024 Jaden Edwards • Built with React & TypeScript</p>
        </aside>
      </footer>
    </div>
  );
}
