import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const BEST_KEY = "shri-krishna-bhaago-bhai-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read the Bhaago Bhai Bhaago best score.", error);
    return 0;
  }
}

function newGame() {
  return {
    distance: 0,
    elapsed: 0,
    jumpY: 0,
    jumpVelocity: 0,
    jumpQueued: false,
    spawnTime: 0,
    lastFrame: 0,
    lastDraw: 0,
    score: 0,
    passed: 0,
    obstacles: [],
  };
}

export default function BhaagoBhaiGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame());
  const phaseRef = useRef("ready");
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  phaseRef.current = phase;

  const saveBest = useCallback((value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save the Bhaago Bhai Bhaago best score.", error);
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
    const pixelWidth = Math.round(bounds.width * ratio);
    const pixelHeight = Math.round(bounds.height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const style = getComputedStyle(canvas);
    const surface = style.getPropertyValue("--surface-color").trim() || "#fff";
    const soft = style.getPropertyValue("--secondary-background-color").trim() || "#e8f2ec";
    const primary = style.getPropertyValue("--primary-color").trim() || "#194d3e";
    const accent = style.getPropertyValue("--accent-color").trim() || "#e8c66a";
    const width = bounds.width;
    const height = bounds.height;
    const groundY = height - 34;

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, surface);
    sky.addColorStop(1, soft);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    context.fillStyle = `${primary}12`;
    context.beginPath();
    context.arc(width * 0.82, height * 0.2, 25, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = primary;
    context.fillRect(0, groundY, width, 4);
    context.fillStyle = accent;
    context.fillRect(0, groundY + 4, width, height - groundY - 4);
    context.fillStyle = `${primary}70`;
    const dashOffset = gameRef.current.distance % 42;
    for (let x = -dashOffset; x < width; x += 42) {
      context.fillRect(x, groundY + 17, 20, 3);
    }

    const playerX = width * 0.3;
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.font = '40px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("🏃", playerX, groundY + gameRef.current.jumpY);
    gameRef.current.obstacles.forEach((obstacle) => {
      context.font = `${obstacle.size}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
      context.fillText(obstacle.icon, obstacle.x + obstacle.width / 2, groundY);
    });
  }, []);

  const start = () => {
    gameRef.current = newGame();
    setScore(0);
    setPhase("playing");
  };

  const finish = useCallback(() => {
    saveBest(gameRef.current.score);
    setPhase("over");
  }, [saveBest]);

  const jump = useCallback(() => {
    if (phaseRef.current === "playing") gameRef.current.jumpQueued = true;
  }, []);

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
    let frameId = 0;

    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.distance += delta * (235 + Math.min(game.elapsed * 7, 250));
      const nextScore = Math.floor(game.distance / 115) + Math.floor(game.distance / 260) + game.passed;
      if (nextScore !== game.score) {
        game.score = nextScore;
        setScore(nextScore);
        saveBest(nextScore);
      }

      if (game.jumpQueued && game.jumpY === 0) {
        game.jumpVelocity = -520;
        game.jumpQueued = false;
      }
      game.jumpVelocity += 1420 * delta;
      game.jumpY = Math.min(0, game.jumpY + game.jumpVelocity * delta);
      if (game.jumpY === 0) game.jumpVelocity = 0;

      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      game.spawnTime += delta;
      const spawnEvery = Math.max(0.78, 1.35 - game.elapsed * 0.008);
      if (game.spawnTime >= spawnEvery) {
        game.spawnTime -= spawnEvery;
        const choices = [
          { icon: "📦", width: 28, height: 34, size: 31 },
          { icon: "🪨", width: 30, height: 25, size: 29 },
          { icon: "🚧", width: 34, height: 38, size: 34 },
        ];
        const choice = choices[Math.floor(Math.random() * choices.length)];
        game.obstacles.push({ ...choice, x: bounds.width + 25, passed: false });
      }
      const speed = 235 + Math.min(game.elapsed * 7, 250);
      const playerX = bounds.width * 0.3;
      const groundY = bounds.height - 34;
      const activeObstacles = [];
      for (const obstacle of game.obstacles) {
        obstacle.x -= speed * delta;
        const overlapsPlayer =
          obstacle.x < playerX + 22 &&
          obstacle.x + obstacle.width > playerX - 15;
        const playerBottom = groundY + game.jumpY;
        const obstacleTop = groundY - obstacle.height;
        if (overlapsPlayer && playerBottom > obstacleTop + 5) {
          finish();
          return;
        }
        if (!obstacle.passed && obstacle.x + obstacle.width < playerX) {
          obstacle.passed = true;
          game.passed += 1;
          game.score =
            Math.floor(game.distance / 115) +
            Math.floor(game.distance / 260) +
            game.passed;
          setScore(game.score);
          saveBest(game.score);
        }
        if (obstacle.x + obstacle.width > -10) activeObstacles.push(obstacle);
      }
      game.obstacles = activeObstacles;
      if (now - game.lastDraw >= 1000 / 30) {
        game.lastDraw = now;
        draw();
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [draw, finish, phase, saveBest]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const onKeyDown = (event) => {
      if (event.code === "Space" || event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [jump, phase]);

  return (
    <div className="mini-game runner-game" data-testid="runner-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Status</small><strong>{phase === "playing" ? "Running" : phase === "paused" ? "Paused" : phase === "over" ? "Game over" : "Ready"}</strong></div>
      </div>
      <p className="game-instruction">Jump with Space, ↑, screen tap, or the big button. कूदें और बचें!</p>
      <div className="runner-board-wrap">
        <canvas
          ref={canvasRef}
          className="runner-board"
          data-testid="runner-board"
          aria-label="Endless running game. Tap or press Space or Arrow Up to jump."
          onPointerDown={jump}
        />
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="runner-overlay game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>भाई, दौड़ने के लिए तैयार? 🏃</strong><span>बक्सों और पत्थरों से कूदकर बचें!</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>दौड़ रुकी हुई है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>अरे भाई, ठोकर लग गई! 😅</strong><span>Score: {score} · Best: {best}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-actions">
        {phase === "playing" && <button type="button" className="game-utility-button" onClick={() => setPhase("paused")}><Pause size={16} /> Pause</button>}
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
        {phase === "playing" && <button type="button" className="game-primary-button runner-jump-button" onClick={jump} aria-label="Jump"><span aria-hidden="true">⬆️</span> JUMP</button>}
      </div>
    </div>
  );
}
