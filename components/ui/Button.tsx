import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-primary rounded-lg shadow-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
