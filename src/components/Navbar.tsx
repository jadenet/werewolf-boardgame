export default function Navbar() {
  return (
    <div className="navbar h-[8vh] bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-ghost" href="/servers">Lobbies</a>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl font-bold" href="/">WEREWOLF</a>
      </div>
      <div className="navbar-end">
      </div>
    </div>
  );
}
