import React from 'react';
import { Link } from '@reach/router';
import Logo from './Logo';
import c from '../utils/c';

const NavLink = ({ children, ...props }) => {
  if (props.href) {
    return (
      <a
        {...props}
        className="ml-6 mr-6 text-sm font-medium hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      {...props}
      getProps={({ isCurrent }) => {
        return {
          className: c('ml-6 mr-6 text-sm font-medium hover:underline', isCurrent && 'underline'),
        };
      }}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  return (
    <header className="w-full max-w-5xl flex items-center justify-between mt-6">
      <NavLink to="/">
        <Logo className="w-10 h-10" />
      </NavLink>
      <nav className="hidden sm:block">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink href="https://github.com/DemianD/ugent-master-thesis-matrix-profile">
          GitHub
        </NavLink>
      </nav>
      <div className="w-10"></div>
    </header>
  );
};

export default Header;
