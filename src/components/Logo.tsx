export default function Logo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "2rem 0" }}>
      <svg
        viewBox="0 0 500 200"
        width="100%"
        height="100%"
        style={{ maxWidth: "400px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="6" dy="6" stdDeviation="0" floodColor="#1a1a1a" />
          </filter>
        </defs>

        {/* Burst Background */}
        <path
          d="M250 10 L280 40 L340 30 L350 70 L400 80 L380 120 L420 150 L370 160 L350 190 L290 170 L250 195 L210 170 L150 190 L130 160 L80 150 L120 120 L100 80 L150 70 L160 30 L220 40 Z"
          fill="#f2e32e"
          stroke="#1a1a1a"
          strokeWidth="6"
          filter="url(#shadow)"
          strokeLinejoin="round"
        />

        {/* Speech Bubble Tail */}
        <polygon points="120,150 70,190 140,170" fill="#f2e32e" />
        <path d="M120 150 L70 190 L140 170" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinejoin="round" />

        {/* Water Splashes */}
        <circle cx="80" cy="50" r="10" fill="#2a62a6" stroke="#1a1a1a" strokeWidth="4" filter="url(#shadow)" />
        <circle cx="410" cy="50" r="15" fill="#2a62a6" stroke="#1a1a1a" strokeWidth="4" filter="url(#shadow)" />
        <circle cx="430" cy="180" r="8" fill="#2a62a6" stroke="#1a1a1a" strokeWidth="4" filter="url(#shadow)" />

        {/* Lettering Setup: IT'S BATHTIME! */}
        <g fontFamily="Bangers, cursive" fontWeight="bold">
          {/* Main text Outline */}
          <text x="250" y="90" fontSize="50" textAnchor="middle" fill="#d92525" stroke="#1a1a1a" strokeWidth="15" strokeLinejoin="round">IT'S</text>
          <text x="250" y="150" fontSize="70" textAnchor="middle" fill="#2a62a6" stroke="#1a1a1a" strokeWidth="15" strokeLinejoin="round">BATHTIME!</text>

          {/* Main text Fill (3D Offset effect manually by drawing again slightly offset if needed, or just overlapping) */}
          {/* Drop shadow style using the SVG filter */}
          
          <text x="250" y="90" fontSize="50" textAnchor="middle" fill="#d92525">IT'S</text>
          <text x="250" y="150" fontSize="70" textAnchor="middle" fill="#ffffff">BATHTIME!</text>
        </g>
      </svg>
    </div>
  );
}
