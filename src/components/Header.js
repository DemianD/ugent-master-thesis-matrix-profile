import React from 'react';
import { Link } from '@reach/router';
import Logo from './Logo';
import c from '../utils/c';

const NavLink = ({ children, ...props }) => {
  if (props.href) {
    return (
      <a {...props} className="ml-6 mr-6 text-sm font-medium hover:underline">
        {children}
      </a>
    );
  }

  return (
    <Link
      {...props}
      getProps={({ isCurrent }) => {
        // the object returned here is passed to the
        // anchor element's props
        return {
          className: c('ml-6 mr-6 text-sm font-medium hover:underline', isCurrent && 'underline')
        };
      }}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  return (
    <header className="mt-6 flex items-center justify-between w-5/6">
      <NavLink to="/">
        <Logo className="w-10 h-10" />
      </NavLink>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/query">Query</NavLink>
        <NavLink href="#">GitHub</NavLink>
      </nav>
      <div className="w-10"></div>
    </header>
  );
};

export default Header;
