import { Route, Switch } from "wouter";
import Page from "./routes/page";
import CreateLobby from "./routes/createlobby";
import Lobby from "./routes/lobby";
import Servers from "./routes/servers";
import RootLayout from "./components/layout";
import ServersId from "./routes/serversid";

export default function App() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={Page} />
        <Route path="/createlobby" component={CreateLobby} />
        <Route path="/lobby" component={Lobby} />
        <Route path="/servers" component={Servers} />
        <Route path="/servers/:id" component={ServersId} />

        <Route>404: No such page!</Route>
      </Switch>
    </RootLayout>
  );
}
