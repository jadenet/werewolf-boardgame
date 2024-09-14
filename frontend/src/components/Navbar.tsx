import { Link } from "wouter";

export default function Navbar() {
  return (
    <div className="navbar h-[8vh] bg-base-100">
      <div className="navbar-start">
      </div>
      <div className="navbar-center">
        <Link className="btn btn-ghost text-xl font-bold" href="/">WEREWOLF</Link>
      </div>
      <div className="navbar-end">
      </div>
    </div>
  );
}
