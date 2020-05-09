import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 318 318"
    >
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g>
          <circle cx="159" cy="159" r="159" fill="#021950"></circle>
          <circle cx="36.5" cy="159.5" r="8.5" fill="#FFF"></circle>
          <circle cx="77.5" cy="179.5" r="8.5" fill="#FFF"></circle>
          <circle cx="118.5" cy="159.5" r="8.5" fill="#FFF"></circle>
          <circle cx="159.5" cy="139.5" r="8.5" fill="#FFF"></circle>
          <circle cx="200.5" cy="159.5" r="8.5" fill="#FFF"></circle>
          <circle cx="241.5" cy="179.5" r="8.5" fill="#FFF"></circle>
          <circle cx="282.5" cy="159.5" r="8.5" fill="#FFF"></circle>
          <path
            stroke="#FFF"
            strokeLinecap="square"
            strokeWidth="3"
            d="M36.5 159.5l41 20M118.5 159.5l-41 20M118.5 159.5l40.5-20M200.5 159.5l-41.5-20M200.5 159.5l41 20M282.5 159.5l-41 20"
          ></path>
        </g>
      </g>
    </svg>
  );
};

export default Logo;
