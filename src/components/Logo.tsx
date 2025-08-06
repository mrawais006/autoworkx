import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <img 
        src="/Autoworx.webp" 
        alt="AutoworkX Logo" 
        className="w-72 md:w-[28rem] h-auto object-contain"
      />
    </div>
  );
};

export default Logo;