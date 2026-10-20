import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./diwali-effects.css";

const COLORS = ["#ffd45c", "#ff9f43", "#ff6b35", "#ffcf70", "#f34f45"];
const MAX_PARTICLES = 100;

function makeParticle(x, y, angle, speed, type, life, color, size) {
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    type,
    life,
    age: 0,
    color,
    size,
    gravity: type === "fall" ? 8 : 110,
    spin: Math.random() * Math.PI * 2,
  };
}

export default function DiwaliEffects() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;
    let lastScroll = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const scheduleFrame = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(animate);
    };

    const addClickBurst = (x, y) => {
      const particles = particlesRef.current;
      const count = 17 + Math.floor(Math.random() * 7);
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.35;
        const speed = 45 + Math.random() * 125;
        particles.push(
          makeParticle(
            x,
            y,
            angle,
            speed,
            Math.random() < 0.32 ? "sparkle" : "burst",
            0.65 + Math.random() * 0.5,
            COLORS[Math.floor(Math.random() * COLORS.length)],
            1.5 + Math.random() * 2,
          ),
        );
      }
      if (Math.random() < 0.12) {
        particles.push(makeParticle(x, y, -Math.PI / 2, 20, "diya", 1.15, "#ffd45c", 16));
      }
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
      scheduleFrame();
    };

    const onPointerDown = (event) => {
      if (!event.isPrimary) return;
      addClickBurst(event.clientX, event.clientY);
    };

    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll < 220) return;
      lastScroll = now;
      const particles = particlesRef.current;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let index = 0; index < count; index += 1) {
        particles.push(
          makeParticle(
            Math.random() * width,
            -4 - Math.random() * 18,
            Math.PI / 2 + (Math.random() - 0.5) * 0.45,
            13 + Math.random() * 22,
            "fall",
            0.85 + Math.random() * 0.55,
            COLORS[Math.floor(Math.random() * 3)],
            1.3 + Math.random() * 1.5,
          ),
        );
      }
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
      scheduleFrame();
    };

    const disableEffects = () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      particlesRef.current = [];
      context.clearRect(0, 0, width, height);
    };

    const onMotionPreferenceChange = (event) => {
      if (event.matches) {
        disableEffects();
      } else {
        window.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    };

    function drawParticle(particle, opacity) {
      context.save();
      context.globalAlpha = opacity;
      context.shadowColor = particle.color;
      context.shadowBlur = particle.type === "fall" ? 9 : 12;
      context.fillStyle = particle.color;
      if (particle.type === "diya") {
        context.font = `${particle.size}px serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("🪔", particle.x, particle.y);
      } else if (particle.type === "sparkle") {
        const radius = particle.size * 2.8;
        context.translate(particle.x, particle.y);
        context.rotate(particle.spin + particle.age * 2.5);
        context.fillRect(-radius / 2, -0.65, radius, 1.3);
        context.fillRect(-0.65, -radius / 2, 1.3, radius);
      } else {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    function animate(timestamp) {
      frameRef.current = 0;
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0.016;
      lastFrame = timestamp;
      context.clearRect(0, 0, width, height);
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.age += delta;
        if (particle.age >= particle.life) return false;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vy += particle.gravity * delta;
        const fade = Math.min(1, (particle.life - particle.age) * 2.5);
        drawParticle(particle, fade);
        return true;
      });
      if (particlesRef.current.length) frameRef.current = window.requestAnimationFrame(animate);
      else lastFrame = 0;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (!motionPreference.matches) {
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    motionPreference.addEventListener("change", onMotionPreferenceChange);
    return () => {
      window.removeEventListener("resize", resize);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      disableEffects();
    };
  }, []);

  return createPortal(
    <div className="diwali-effects" aria-hidden="true" data-testid="diwali-effects">
      <canvas ref={canvasRef} className="diwali-effects-canvas" />
      <span className="diwali-edge-light diwali-edge-light-one" />
      <span className="diwali-edge-light diwali-edge-light-two" />
      <span className="diwali-edge-light diwali-edge-light-three" />
      <span className="diwali-edge-light diwali-edge-light-four" />
      <span className="diwali-edge-light diwali-edge-light-five" />
      <span className="diwali-edge-light diwali-edge-light-six" />
    </div>,
    document.body,
  );
}
