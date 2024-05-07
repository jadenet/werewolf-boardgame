import { Route, Switch } from "wouter";
import Page from "./routes/page";
import CreateLobby from "./routes/createlobby";
import Lobby from "./routes/lobby";
import Servers from "./routes/servers";
import ServersId from "./routes/serversid";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <html lang="en" data-theme="dracula">
      <body>
        <Navbar />
        <Switch>
          <Route path="/" component={Page} />
          <Route path="/createlobby" component={CreateLobby} />
          <Route path="/lobby" component={Lobby} />
          <Route path="/servers" component={Servers} />
          <Route path="/servers/:id" component={ServersId} />

          <Route>404: No such page!</Route>
        </Switch>
        <Footer />
      </body>
    </html>
  );
}
