import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-dark-accent' : '';
  };

  return (
    <nav className="bg-dark-secondary p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-flup-orange">
            Budget Manager
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/budget-elements"
              className={`px-4 py-2 rounded-lg transition-colors ${isActive('/budget-elements')}`}
            >
              Budget
            </Link>
            <Link
              to="/savings"
              className={`px-4 py-2 rounded-lg transition-colors ${isActive('/savings')}`}
            >
              Épargnes
            </Link>
            <Link
              to="/holders"
              className={`px-4 py-2 rounded-lg transition-colors ${isActive('/holders')}`}
            >
              Titulaires
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
