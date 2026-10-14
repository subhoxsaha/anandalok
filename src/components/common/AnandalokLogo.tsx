import React from 'react';

interface AnandalokLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTextLabel?: boolean;
}

export const AnandalokLogo: React.FC<AnandalokLogoProps> = ({
  className = '',
  size = 'md',
  showTextLabel = true
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Exact Yellow Circular Anandalok Durgapur Emblem Badge */}
      <div className={`${sizeMap[size]} shrink-0 relative rounded-full shadow-xs hover:scale-105 transition-transform overflow-hidden bg-[#FEDC00]`}>
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bright Yellow Background Circle */}
          <circle cx="150" cy="150" r="150" fill="#FEDC00" />

          {/* Top Curved Text Arc */}
          <path
            id="topArcPath"
            d="M 32 150 A 118 118 0 0 1 268 150"
            fill="none"
            stroke="transparent"
          />

          <text
            fill="#0f172a"
            fontSize="14.5"
            fontWeight="800"
            letterSpacing="2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            <textPath href="#topArcPath" startOffset="50%" textAnchor="middle">
              SPREADING HAPPINESS BY HOLDING HANDS
            </textPath>
          </text>

          {/* Center Title: "anandalok" */}
          {/* Top Headline Shirorekha Bar */}
          <rect x="52" y="122" width="196" height="5.5" fill="#0f172a" rx="2" />

          <text
            x="150"
            y="158"
            fill="#0f172a"
            fontSize="42"
            fontWeight="900"
            letterSpacing="-0.5"
            textAnchor="middle"
            fontFamily="'Comfortaa', 'Quicksand', system-ui, sans-serif"
          >
            anandalok
          </text>

          {/* Subtitle: "DURGAPUR" */}
          <text
            x="150"
            y="180"
            fill="#0f172a"
            fontSize="16"
            fontWeight="800"
            letterSpacing="6"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            DURGAPUR
          </text>

          {/* Bottom Botanical Branch Leaf Wreath */}
          <g fill="#0f172a" stroke="#0f172a">
            {/* Left Branch Curve */}
            <path
              d="M 28 132 C 18 190, 48 248, 144 285"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Left Leaves */}
            <path d="M 27 138 C 12 135, 10 148, 25 150 Z" />
            <path d="M 25 162 C 8 162, 8 174, 23 174 Z" />
            <path d="M 27 186 C 10 190, 14 204, 28 200 Z" />
            <path d="M 35 210 C 20 216, 26 230, 39 223 Z" />
            <path d="M 48 232 C 34 242, 44 254, 56 244 Z" />
            <path d="M 66 252 C 55 264, 69 273, 78 261 Z" />
            <path d="M 90 268 C 82 281, 98 288, 104 274 Z" />
            <path d="M 118 278 C 114 291, 131 294, 133 280 Z" />

            {/* Right Branch Curve */}
            <path
              d="M 272 132 C 282 190, 252 248, 156 285"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Right Leaves */}
            <path d="M 273 138 C 288 135, 290 148, 275 150 Z" />
            <path d="M 275 162 C 292 162, 292 174, 277 174 Z" />
            <path d="M 273 186 C 290 190, 286 204, 272 200 Z" />
            <path d="M 265 210 C 280 216, 274 230, 261 223 Z" />
            <path d="M 252 232 C 266 242, 256 254, 244 244 Z" />
            <path d="M 234 252 C 245 264, 231 273, 222 261 Z" />
            <path d="M 210 268 C 218 281, 202 288, 196 274 Z" />
            <path d="M 182 278 C 186 291, 169 294, 167 280 Z" />
          </g>
        </svg>
      </div>

      {showTextLabel && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-amber-800 transition-colors">
              Anandalok
            </span>
            <span className="text-[10px] bg-[#FEDC00] text-slate-950 font-black px-1.5 py-0.2 rounded-md border border-amber-300 shadow-2xs">
              Durgapur
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-tight">
            Spreading Happiness By Holding Hands
          </p>
        </div>
      )}
    </div>
  );
};

