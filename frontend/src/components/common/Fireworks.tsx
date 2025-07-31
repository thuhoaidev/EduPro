import React, { useEffect, useRef } from 'react';
import './Fireworks.css';

interface FireworksProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const Fireworks: React.FC<FireworksProps> = ({ isVisible, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Firework particles
    const particles: any[] = [];
    const fireworks: any[] = [];

    // Colors for fireworks
    const colors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', 
      '#00ffff', '#ff8800', '#8800ff', '#ff0088', '#88ff00'
    ];

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;

      constructor(x: number, y: number, vx: number, vy: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
        this.maxLife = Math.random() * 100 + 50;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.vx *= 0.99; // air resistance
        this.life++;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = 1 - (this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      isDead() {
        return this.life >= this.maxLife;
      }
    }

    // Firework class
    class Firework {
      x: number;
      y: number;
      targetY: number;
      speed: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * canvas.height * 0.6;
        this.speed = Math.random() * 3 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speed;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      explode() {
        const particleCount = Math.floor(Math.random() * 50) + 30;
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount;
          const speed = Math.random() * 5 + 2;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          particles.push(new Particle(this.x, this.y, vx, vy, this.color));
        }
      }

      shouldExplode() {
        return this.y <= this.targetY;
      }
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(245, 245, 245, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create new fireworks
      if (Math.random() < 0.05) {
        fireworks.push(new Firework());
      }

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        firework.update();
        firework.draw(ctx);

        if (firework.shouldExplode()) {
          firework.explode();
          fireworks.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw(ctx);

        if (particle.isDead()) {
          particles.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fireworks-container">
      <canvas ref={canvasRef} className="fireworks-canvas" />
      <div className="fireworks-overlay" onClick={onComplete}>
        <div className="celebration-text" onClick={(e) => e.stopPropagation()}>
          <h2>Bạn đã hoàn thành khóa học!</h2>
          <p>Bạn đã hoàn thành 100% khóa học này!</p>
          <div className="celebration-actions">
            <button 
              className="close-button"
              onClick={onComplete}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fireworks; 