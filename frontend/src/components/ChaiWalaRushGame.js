import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 45;
const STARTING_LIVES = 3;
const BEST_KEY = "shri-krishna-chai-wala-rush-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read Chai Wala Rush's best score.", error);
    return 0;
  }
}

function newGame() {
  return {
    elapsed: 0,
    spawnElapsed: 0,
    lastFrame: 0,
    lane: 1,
    score: 0,
    lives: STARTING_LIVES,
    seconds: ROUND_SECONDS,
    items: [],
    ended: false,
  };
}

export default function ChaiWalaRushGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame());
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
        console.warn("Could not save Chai Wala Rush's best score.", error);
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
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, surface);
    gradient.addColorStop(1, soft);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const roadWidth = width * 0.78;
    const roadLeft = (width - roadWidth) / 2;
    context.fillStyle = `${primary}18`;
    context.fillRect(roadLeft, 0, roadWidth, height);
    context.setLineDash([12, 12]);
    context.strokeStyle = `${primary}65`;
    context.lineWidth = 2;
    for (let lane = 1; lane < 3; lane += 1) {
      const x = roadLeft + (roadWidth * lane) / 3;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    context.setLineDash([]);
    context.fillStyle = accent;
    context.fillRect(0, height - 8, width, 8);

    const laneX = (lane) => roadLeft + roadWidth * ((lane + 0.5) / 3);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '42px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("🧔🏻‍♂️", laneX(gameRef.current.lane), height - 46);
    context.font = '31px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    gameRef.current.items.forEach((item) => {
      context.fillText(item.icon, laneX(item.lane), item.y);
    });
  }, []);

  const finish = useCallback(() => {
    const game = gameRef.current;
    if (game.ended) return;
    game.ended = true;
    saveBest(game.score);
    setPhase("over");
  }, [saveBest]);

  const start = () => {
    gameRef.current = newGame();
    setScore(0);
    setLives(STARTING_LIVES);
    setSeconds(ROUND_SECONDS);
    setPhase("playing");
  };

  const moveLane = (direction) => {
    gameRef.current.lane = Math.max(0, Math.min(2, gameRef.current.lane + direction));
    draw();
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
    let hudSecond = ROUND_SECONDS;
    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.seconds = Math.max(0, ROUND_SECONDS - game.elapsed);
      game.spawnElapsed += delta;
      const displayedSecond = Math.ceil(game.seconds);
      if (displayedSecond !== hudSecond) {
        hudSecond = displayedSecond;
        setSeconds(displayedSecond);
      }
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const spawnEvery = Math.max(0.42, 0.96 - game.score * 0.009);
      if (game.spawnElapsed >= spawnEvery) {
        game.spawnElapsed -= spawnEvery;
        const isCup = Math.random() < 0.62;
        const cupIcons = ["☕", "🍵", "🥤"];
        const hazards = ["🕳️", "🐕", "🚧"];
        game.items.push({
          lane: Math.floor(Math.random() * 3),
          y: -28,
          speed: 145 + Math.min(game.elapsed * 5 + game.score * 1.6, 210),
          type: isCup ? "cup" : "hazard",
          icon: isCup ? cupIcons[Math.floor(Math.random() * cupIcons.length)] : hazards[Math.floor(Math.random() * hazards.length)],
        });
      }
      const playerY = bounds.height - 46;
      const activeItems = [];
      for (const item of game.items) {
        item.y += item.speed * delta;
        if (item.y >= playerY - 22 && item.y <= playerY + 18) {
          if (item.lane === game.lane) {
            if (item.type === "cup") {
              game.score += 2;
              setScore(game.score);
              saveBest(game.score);
            } else {
              game.lives -= 1;
              game.score = Math.max(0, game.score - 1);
              setLives(game.lives);
              setScore(game.score);
              if (game.lives <= 0) {
                game.items = activeItems;
                finish();
                return;
              }
            }
          } else if (item.type === "cup") {
            game.score = Math.max(0, game.score - 1);
            setScore(game.score);
          }
        } else if (item.y <= bounds.height + 24) {
          activeItems.push(item);
        }
      }
      game.items = activeItems;
      draw();
      if (game.seconds <= 0) {
        finish();
        return;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
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
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        moveLane(-1);
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        moveLane(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  const chooseLaneFromPointer = (event) => {
    if (phase !== "playing") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const roadLeft = bounds.width * 0.11;
    const relative = Math.max(0, Math.min(0.999, (event.clientX - bounds.left - roadLeft) / (bounds.width * 0.78)));
    gameRef.current.lane = Math.floor(relative * 3);
    draw();
  };

  const resultMessage = score >= 30
    ? "Garam chai, jaldi bhai! आज तो सबकी डिलीवरी हो गई! ☕😂"
    : score > 0
      ? "चाय पहुँच गई, अब टिप का इंतज़ार करो! 😄"
      : "सारी चाय रास्ते में ठंडी हो गई! फिर कोशिश करें 😅";

  return (
    <div className="mini-game chai-rush-game" data-testid="chai-rush-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Lives</small><strong>{"❤️".repeat(lives)}</strong></div>
      </div>
      <p className="game-instruction">चाय के कप लें, गड्ढों और कुत्तों से बचें! · Use ← → or tap a lane.</p>
      <div className="chai-rush-board-wrap">
        <canvas
          ref={canvasRef}
          className="chai-rush-board"
          data-testid="chai-rush-board"
          aria-label="Chai delivery game. Move between lanes to collect cups and avoid obstacles."
          onPointerDown={chooseLaneFromPointer}
        />
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>Garam chai, jaldi bhai! ☕😂</strong><span>45 सेकंड में चाय पहुँचाएँ और रास्ते से बचें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>चाय थोड़ी देर रुकी है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>{lives === 0 ? "कुत्ते ने डिलीवरी रोक दी! 🐕" : "Time's up! चाय की छुट्टी ☕"}</strong><span>Final score: {score} · Best: {best}</span><span className="game-funny-result">{resultMessage}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="chai-lane-controls">
        <button type="button" aria-label="Move chai seller left" disabled={phase !== "playing"} onClick={() => moveLane(-1)}><ArrowLeft /> Left</button>
        <button type="button" aria-label="Move chai seller right" disabled={phase !== "playing"} onClick={() => moveLane(1)}>Right <ArrowRight /></button>
      </div>
      <div className="game-actions">
        {phase === "playing" && <button type="button" className="game-utility-button" onClick={() => setPhase("paused")}><Pause size={16} /> Pause</button>}
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
