import { Route, Switch } from "wouter";
import Page from "./routes/page";
import CreateLobby from "./routes/createlobby";
import Lobby from "./routes/lobby";
import lobbiesId from "./routes/lobbiesid";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Switch>
          <Route path="/" component={Page} />
          <Route path="/createlobby" component={CreateLobby} />
          <Route path="/lobbies/:id" component={lobbiesId} />

          <Route>404: No such page!</Route>
        </Switch>
        <Footer />
      </body>
    </html>
  );
}
