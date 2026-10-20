import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 30;
const STARTING_LIVES = 3;
const BEST_KEY = "shri-krishna-pakdo-paisa-best";

function readBestScore() {
  try {
    const score = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(score) && score > 0 ? score : 0;
  } catch (error) {
    console.warn("Could not read Pakdo Pakdo Paisa's best score.", error);
    return 0;
  }
}

function newGame() {
  return {
    elapsed: 0,
    spawnElapsed: 0,
    lastFrame: 0,
    basketX: 0.5,
    score: 0,
    misses: 0,
    lives: STARTING_LIVES,
    items: [],
    ended: false,
  };
}

export default function PakdoPaisaGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame());
  const phaseRef = useRef("ready");
  const keysRef = useRef({ left: false, right: false });
  const pointerRef = useRef(false);
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBestScore);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [misses, setMisses] = useState(0);

  phaseRef.current = phase;

  const saveBest = useCallback((value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save Pakdo Pakdo Paisa's best score.", error);
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
    const game = gameRef.current;
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, surface);
    gradient.addColorStop(1, soft);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.fillStyle = `${primary}12`;
    for (let x = 16; x < width; x += 36) {
      context.beginPath();
      context.arc(x, 18, 1.5, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = accent;
    context.fillRect(0, height - 9, width, 9);
    context.textAlign = "center";
    context.textBaseline = "middle";
    game.items.forEach((item) => {
      context.font = item.fake ? '31px "Apple Color Emoji","Segoe UI Emoji",sans-serif' : '32px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      context.fillText(item.icon, item.x * width, item.y);
    });
    context.font = '48px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("🧺", game.basketX * width, height - 35);
  }, []);

  const finish = useCallback(() => {
    if (gameRef.current.ended) return;
    gameRef.current.ended = true;
    saveBest(gameRef.current.score);
    setPhase("over");
  }, [saveBest]);

  const start = () => {
    gameRef.current = newGame();
    keysRef.current = { left: false, right: false };
    setScore(0);
    setMisses(0);
    setLives(STARTING_LIVES);
    setSeconds(ROUND_SECONDS);
    setPhase("playing");
  };

  const pause = () => {
    keysRef.current = { left: false, right: false };
    pointerRef.current = false;
    setPhase("paused");
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
    let frameId = 0;
    let lastSecond = ROUND_SECONDS;

    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.spawnElapsed += delta;
      const remaining = Math.max(0, ROUND_SECONDS - Math.floor(game.elapsed));
      if (remaining !== lastSecond) {
        lastSecond = remaining;
        setSeconds(remaining);
      }

      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const moveSpeed = 0.78 * delta;
      if (keysRef.current.left) game.basketX = Math.max(0.08, game.basketX - moveSpeed);
      if (keysRef.current.right) game.basketX = Math.min(0.92, game.basketX + moveSpeed);
      const spawnInterval = Math.max(0.28, 0.8 - game.score * 0.012);
      if (game.spawnElapsed >= spawnInterval) {
        game.spawnElapsed -= spawnInterval;
        const fake = Math.random() < Math.min(0.12 + game.score * 0.005, 0.3);
        const money = [
          { icon: "💵", points: 1 },
          { icon: "💰", points: 2 },
          { icon: "🪙", points: 1 },
        ];
        const prize = money[Math.floor(Math.random() * money.length)];
        game.items.push({
          x: 0.08 + Math.random() * 0.84,
          y: -22,
          speed: 120 + Math.min(game.elapsed * 5 + game.score * 1.5, 190),
          icon: fake ? "🧱" : prize.icon,
          points: fake ? 0 : prize.points,
          fake,
          clicked: false,
        });
      }

      const basketY = bounds.height - 35;
      const basketX = game.basketX * bounds.width;
      const nextItems = [];
      for (const item of game.items) {
        item.y += item.speed * delta;
        const closeToBasket = item.y >= basketY - 24 && item.y <= basketY + 12;
        const closeHorizontally = Math.abs(item.x * bounds.width - basketX) < 45;
        if (closeToBasket && closeHorizontally && !item.fake) {
          game.score += item.points;
          setScore(game.score);
          saveBest(game.score);
        } else if (closeToBasket && closeHorizontally && item.fake) {
          game.lives -= 1;
          game.misses += 1;
          setLives(game.lives);
          setMisses(game.misses);
        } else if (item.y > bounds.height + 20) {
          if (!item.fake) {
            game.lives -= 1;
            game.misses += 1;
            setLives(game.lives);
            setMisses(game.misses);
          }
        } else {
          nextItems.push(item);
        }
      }
      game.items = nextItems;
      draw();

      if (remaining === 0 || game.lives <= 0) {
        finish();
        return;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [draw, finish, phase, saveBest]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (phaseRef.current !== "playing") return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keysRef.current.left = true;
        event.preventDefault();
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keysRef.current.right = true;
        event.preventDefault();
      }
    };
    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = false;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const moveBasket = (direction) => {
    const width = canvasRef.current?.getBoundingClientRect().width || 1;
    gameRef.current.basketX = Math.max(0.08, Math.min(0.92, gameRef.current.basketX + (direction * 42) / width));
    draw();
  };

  const onPointerDown = (event) => {
    pointerRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerMove(event);
  };

  const onPointerMove = (event) => {
    if (!pointerRef.current && event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const game = gameRef.current;
    game.basketX = Math.max(0.08, Math.min(0.92, (event.clientX - bounds.left) / bounds.width));

    const hit = game.items.find((item) =>
      !item.clicked &&
      Math.hypot((item.x * bounds.width) - event.clientX + bounds.left, item.y - (event.clientY - bounds.top)) < 30,
    );
    if (hit) {
      hit.clicked = true;
      if (hit.fake) {
        game.lives -= 1;
        game.misses += 1;
        setLives(game.lives);
        setMisses(game.misses);
      } else {
        game.score += hit.points;
        setScore(game.score);
        saveBest(game.score);
      }
      game.items = game.items.filter((item) => item !== hit);
    }
    draw();
  };

  const resultMessage = score >= 20
    ? "Wah bhai, aaj toh lottery lag gayi! 😂"
    : score > 0
      ? "वाह! जेब में कुछ तो आया 😄"
      : "नकली ईंटों से बचना था भाई! फिर खेलें 😂";

  return (
    <div className="mini-game paisa-game" data-testid="paisa-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Lives</small><strong>{"❤️".repeat(lives)}</strong></div>
      </div>
      <p className="game-instruction">पैसे पकड़ें, नकली ईंट से बचें! · Catch rupees and dodge fake objects.</p>
      <div className="paisa-board-wrap">
        <canvas
          ref={canvasRef}
          className="paisa-board"
          data-testid="paisa-board"
          aria-label="Falling money game. Drag to move the basket or tap money to collect it."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => { pointerRef.current = false; }}
          onPointerCancel={() => { pointerRef.current = false; }}
        />
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>पैसे पकड़ने के लिए तैयार? 💸</strong><span>30 सेकंड में पैसे पकड़ें और नकली चीज़ों से बचें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>Final score: {score} · Best: {best}</strong><span>Missed: {misses}</span><span className="game-funny-result">{resultMessage}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-touch-controls">
        <button type="button" aria-label="Move basket left" onClick={() => moveBasket(-1)}><ArrowLeft /> Left</button>
        <button type="button" aria-label="Move basket right" onClick={() => moveBasket(1)}>Right <ArrowRight /></button>
      </div>
      <div className="game-actions">
        {phase === "playing" && <button type="button" className="game-utility-button" onClick={pause}><Pause size={16} /> Pause</button>}
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
