import React, { useEffect, useState } from 'react';

const EncounterCard = ({ encounter }) => {
  const [glitch, setGlitch] = useState(false);

  // Trigger glitch effect when a new encounter arrives
  useEffect(() => {
    if (encounter) {
      setGlitch(true);
      const timer = setTimeout(() => setGlitch(false), 500); // Glitch for 500ms
      return () => clearTimeout(timer);
    }
  }, [encounter]);

  if (!encounter) return null;

  return (
    <div className={`parchment-container ${glitch ? 'animate-glitch' : ''}`}>
      {/* Pocket Bard Badge */}
      <div className="audio-badge">
        <span>🔊 Station: {encounter.audio_vibe}</span>
      </div>

      <h2 className="scroll-title">{encounter.name}</h2>
      
      <div className="stats-body">
        {encounter.stats.map((line, index) => (
          <p key={index} className="stat-line">{line}</p>
        ))}
      </div>

      <style jsx>{`
        .parchment-container {
          background: #f4e4bc; /* Aged paper color */
          background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png');
          border: 10px solid #3d2b1f;
          padding: 2rem;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          font-family: 'Crimson Text', serif;
          color: #2b1e16;
          max-width: 500px;
          position: relative;
        }

        .animate-glitch {
          animation: glitch-anim 0.2s infinite;
          filter: hue-rotate(90deg) contrast(150%);
        }

        @keyframes glitch-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }

        .audio-badge {
          position: absolute;
          top: -15px;
          right: 20px;
          background: #8b0000; /* Blood red */
          color: gold;
          padding: 5px 10px;
          font-size: 0.8rem;
          border: 2px solid gold;
          border-radius: 4px;
        }

        .scroll-title {
          text-align: center;
          text-transform: uppercase;
          border-bottom: 2px solid #2b1e16;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default EncounterCard;
