import { Route, Switch } from "wouter";
import Home from "./routes/home";
import CreateLobby from "./routes/createlobby";
import lobbiesId from "./routes/lobbiesid";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/createlobby" component={CreateLobby} />
          <Route path="/lobbies/:id" component={lobbiesId} />

          <Route>404: No such page!</Route>
        </Switch>
        <Footer />
      </body>
    </html>
  );
}
