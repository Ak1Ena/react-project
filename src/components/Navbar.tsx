import { type FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, ListChecks, PlusCircle, Home } from 'lucide-react';

const Navbar: FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Gamepad2 size={32} />
          <span>GameLib</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Home size={20} />
            <span>Browse</span>
          </NavLink>
          <NavLink to="/my-list/playing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <ListChecks size={20} />
            <span>My Lists</span>
          </NavLink>
          <NavLink to="/add-game" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <PlusCircle size={20} />
            <span>Add Game</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
