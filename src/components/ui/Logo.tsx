import React from 'react';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

const Logo = ({ size = 40, className, ...props }: LogoProps) => {
  return (
    <img
      src="/icon_without_bg(v).png"
      alt="ShowLi Logo"
      width={size}
      height={size}
      className={`object-contain rounded-xl ${className || ''}`}
      {...props}
    />
  );
};

export default Logo;
