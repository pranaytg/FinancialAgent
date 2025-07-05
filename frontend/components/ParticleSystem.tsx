'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
}

export default function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];
    let animationId: number;
    let particleId = 0;

    const createParticle = (): Particle => ({
      id: particleId++,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 10,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: -Math.random() * 3 - 1,
      },
      life: 1,
    });

    const updateParticles = () => {
      setParticles(prevParticles => {
        const updated = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            life: particle.life - 0.01,
          }))
          .filter(particle => particle.life > 0 && particle.y > -10);

        // Add new particles occasionally
        if (Math.random() < 0.1 && updated.length < 20) {
          updated.push(createParticle());
        }

        return updated;
      });
      
      animationId = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-sparkle"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            filter: `blur(${1 - particle.life}px)`,
          }}
        />
      ))}
    </div>
  );
}
