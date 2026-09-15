import { Link, Route, Switch } from "wouter";
import Home from "./routes/home";
import PageNotFound from "./routes/pagenotfound";
import ValidateLobby from "./routes/validatelobby";

export default function App() {
  return (
    <div className="min-h-screen md:max-h-screen bg-base-100 flex flex-col justify-between">
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <Link
            className="text-xl font-bold tracking-wide hover:bg-transparent focus:bg-transparent"
            href="/"
          >
            ONE NIGHT WEREWOLF
          </Link>
        </div>
        <div className="navbar-end"></div>
      </div>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/lobbies/:id" component={ValidateLobby} />
        <Route component={PageNotFound} />
      </Switch>
      <footer className="footer footer-center p-4 bg-base-200 text-base-content/70 border-t border-base-300">
        <aside>
          <p className="text-sm">
            © 2024 Jaden Edwards · Built with React, TypeScript, and Node.js.
          </p>
        </aside>
      </footer>
    </div>
  );
}
