import { useEffect, useState } from 'react';

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;

    // Simple CSS-based confetti effect
    const confetti = document.createElement('div');
    confetti.className = 'pointer-events-none';
    confetti.innerHTML = Array.from({ length: 50 })
      .map((_, i) => `
        <div
          style="
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -10px;
            width: 10px;
            height: 10px;
            background: ${['#8b5cf6', '#ec4899', '#fbbf24', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            animation: fall ${2 + Math.random() * 1}s linear;
            z-index: 9999;
          "
        ></div>
      `)
      .join('');

    document.body.appendChild(confetti);

    // Add CSS animation
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const timer = setTimeout(() => confetti.remove(), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return null;
}
