import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

interface ChaosLogoProps {
  variant?: 'main' | 'glitch' | 'watermark' | 'national' | 'yo-mama';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChaosLogo({ variant = 'main', size = 'md', className = '' }: ChaosLogoProps) {
  const { locale, currency } = useApp();
  
  // Get country from locale
  const countryCode = useMemo(() => {
    const mapping: Record<string, string> = {
      'cs-CZ': 'cz',
      'fil-PH': 'ph',
      'de-DE': 'de',
      'en-US': 'us',
    };
    return mapping[locale] || 'main';
  }, [locale]);

  // Get leaderboard to check who's #1
  const { data: leaderboard } = useQuery({
    queryKey: ['/api/national-chaos-league'],
    queryFn: () => fetch('/api/national-chaos-league').then(r => r.json()),
  });

  const topCountry = leaderboard?.leaderboard?.[0]?.countryCode?.toLowerCase() || 'ph';

  // Determine logo based on variant
  const getLogoPath = () => {
    if (variant === 'national') {
      // Use top country's national logo
      const countryLogoMap: Record<string, string> = {
        'cz': '/logo-cz.png',
        'ph': '/logo-ph.png',
      };
      return countryLogoMap[topCountry] || '/logo-main.png';
    }
    if (variant === 'glitch') return '/logo-glitch.png';
    if (variant === 'yo-mama') return '/logo-main.png';
    if (variant === 'watermark') return '/logo-main.png';
    return '/logo-main.png';
  };

  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

  const logoPath = getLogoPath();

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        ${sizeMap[size]}
        ${variant === 'glitch' ? 'animate-pulse' : ''}
        ${variant === 'yo-mama' ? 'ring-4 ring-yellow-300 rounded-lg' : ''}
        ${className}
      `}
      data-testid={`logo-${variant}`}
    >
      <img
        src={logoPath}
        alt={variant === 'yo-mama' ? "Yo Mama's Canvas" : 'ChaosCanvas'}
        className={`
          w-full h-full object-contain
          ${variant === 'glitch' ? '[filter:drop-shadow(0_0_20px_#FF006E)]' : 'drop-shadow-lg'}
          ${variant === 'main' ? '[filter:drop-shadow(0_0_10px_#FF006E)]' : ''}
          ${variant === 'yo-mama' ? '[filter:hue-rotate(45deg)_saturate(1.5)]' : ''}
        `}
      />

      {/* Glitch effect overlay */}
      {variant === 'glitch' && (
        <>
          <div
            className="absolute inset-0 opacity-30 mix-blend-screen"
            style={{
              backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 0, 110, .05) 25%, rgba(255, 0, 110, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 110, .05) 75%, rgba(255, 0, 110, .05) 76%, transparent 77%, transparent)`,
              backgroundSize: '100% 4px',
              animation: 'glitch 0.15s infinite',
            }}
          />
          <style>{`
            @keyframes glitch {
              0% { transform: translate(0); }
              20% { transform: translate(-2px, 2px); }
              40% { transform: translate(-2px, -2px); }
              60% { transform: translate(2px, 2px); }
              80% { transform: translate(2px, -2px); }
              100% { transform: translate(0); }
            }
          `}</style>
        </>
      )}

      {/* Yo Mama Mode glow */}
      {variant === 'yo-mama' && (
        <div
          className="absolute inset-0 rounded-lg opacity-50 blur-sm"
          style={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.4) 0%, transparent 70%)',
            animation: 'yo-mama-glow 2s ease-in-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes yo-mama-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
