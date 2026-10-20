import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 30;
const STARTING_LIVES = 3;
const BEST_KEY = "shri-krishna-murgi-chor-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read Murgi Chor Pakdo's best score.", error);
    return 0;
  }
}

function makeBird(type, width, height, speedScale = 1) {
  const radius = type === "thief" ? 23 : 21;
  const angle = Math.random() * Math.PI * 2;
  const speed = (30 + Math.random() * 35) * speedScale;
  return {
    type,
    x: radius + Math.random() * Math.max(1, width - radius * 2),
    y: radius + Math.random() * Math.max(1, height - radius * 2),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
  };
}

function newGame(width, height) {
  return {
    birds: Array.from({ length: 5 }, () => makeBird("chicken", width, height)),
    elapsed: 0,
    lastFrame: 0,
    spawnElapsed: 0,
    score: 0,
    lives: STARTING_LIVES,
    seconds: ROUND_SECONDS,
    ended: false,
  };
}

export default function MurgiChorGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame(420, 300));
  const phaseRef = useRef("ready");
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [lives, setLives] = useState(STARTING_LIVES);

  phaseRef.current = phase;

  const saveBest = useCallback((value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save Murgi Chor Pakdo's best score.", error);
      }
      return value;
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bounds?.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * ratio);
    const height = Math.round(bounds.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const style = getComputedStyle(canvas);
    const surface = style.getPropertyValue("--surface-color").trim() || "#fff";
    const soft = style.getPropertyValue("--secondary-background-color").trim() || "#e8f2ec";
    const accent = style.getPropertyValue("--accent-color").trim() || "#e8c66a";
    const gradient = context.createLinearGradient(0, 0, 0, bounds.height);
    gradient.addColorStop(0, surface);
    gradient.addColorStop(1, soft);
    context.fillStyle = gradient;
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.strokeStyle = `${accent}75`;
    context.lineWidth = 2;
    context.setLineDash([8, 10]);
    context.strokeRect(9, 9, bounds.width - 18, bounds.height - 18);
    context.setLineDash([]);
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const bird of gameRef.current.birds) {
      context.font = `${bird.type === "thief" ? 40 : 38}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
      context.fillText(bird.type === "thief" ? "🦹" : "🐔", bird.x, bird.y);
    }
  }, []);

  const finish = useCallback(() => {
    const game = gameRef.current;
    if (game.ended) return;
    game.ended = true;
    saveBest(game.score);
    setPhase("over");
  }, [saveBest]);

  const start = () => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    gameRef.current = newGame(bounds?.width || 420, bounds?.height || 300);
    setScore(0);
    setLives(STARTING_LIVES);
    setSeconds(ROUND_SECONDS);
    setPhase("playing");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    if (phase !== "playing") {
      draw();
      return undefined;
    }
    const game = gameRef.current;
    game.lastFrame = performance.now();
    let frame = 0;
    let hudSecond = Math.ceil(game.seconds);

    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.seconds = Math.max(0, ROUND_SECONDS - game.elapsed);
      game.spawnElapsed += delta;
      const nextSecond = Math.ceil(game.seconds);
      if (nextSecond !== hudSecond) {
        hudSecond = nextSecond;
        setSeconds(nextSecond);
      }

      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const difficulty = 1 + Math.min(game.score * 0.035, 1.8);
      const margin = 24;
      game.birds.forEach((bird) => {
        bird.x += bird.vx * difficulty * delta;
        bird.y += bird.vy * difficulty * delta;
        if (bird.x < margin || bird.x > bounds.width - margin) bird.vx *= -1;
        if (bird.y < margin || bird.y > bounds.height - margin) bird.vy *= -1;
        bird.x = Math.max(margin, Math.min(bounds.width - margin, bird.x));
        bird.y = Math.max(margin, Math.min(bounds.height - margin, bird.y));
      });
      if (game.elapsed > 5 && game.spawnElapsed > Math.max(2, 5 - game.score * 0.08)) {
        game.spawnElapsed = 0;
        if (!game.birds.some((bird) => bird.type === "thief")) {
          game.birds.push(makeBird("thief", bounds.width, bounds.height, difficulty));
        }
      }
      draw();
      if (game.seconds <= 0 || game.lives <= 0) {
        finish();
        return;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [draw, finish, phase]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const tapBoard = (event) => {
    if (phase !== "playing") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const game = gameRef.current;
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    game.birds.forEach((bird, index) => {
      const distance = Math.hypot(bird.x - x, bird.y - y);
      if (distance <= bird.radius + 14 && distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    if (nearestIndex < 0) return;
    const [bird] = game.birds.splice(nearestIndex, 1);
    if (bird.type === "thief") {
      game.score = Math.max(0, game.score - 2);
      game.lives -= 1;
      setScore(game.score);
      setLives(game.lives);
      if (game.lives <= 0) finish();
    } else {
      game.score += 1;
      setScore(game.score);
      saveBest(game.score);
      game.birds.push(makeBird("chicken", bounds.width, bounds.height, 1 + game.score * 0.035));
    }
    draw();
  };

  return (
    <div className="mini-game murgi-game" data-testid="murgi-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Lives</small><strong>{"❤️".repeat(lives)}</strong></div>
      </div>
      <p className="game-instruction">मुर्गी पर टैप करें, चोर से बचें! · Tap chickens, avoid the thief.</p>
      <div className="murgi-board-wrap">
        <canvas
          ref={canvasRef}
          className="murgi-board"
          data-testid="murgi-board"
          aria-label="Moving chickens and a thief. Tap chickens to score and avoid tapping the thief."
          onPointerDown={tapBoard}
        />
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>मुर्गी पकड़ो, चोर से बचो! 🐔</strong><span>30 सेकंड में मुर्गियों पर टैप करें। चोर पर टैप करने से अंक और जान कम होगी।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>{lives ? "Arre bhai, murgi chor bhaag gaya! 😂" : "चोर ने चालाकी कर दी! 😅"}</strong><span>Final score: {score} · Best: {best}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-actions">
        {phase === "playing" && <button type="button" className="game-utility-button" onClick={() => setPhase("paused")}><Pause size={16} /> Pause</button>}
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
