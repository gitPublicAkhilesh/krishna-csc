import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

const GAME_SECONDS = 30;
const BEST_KEY = "shri-krishna-catch-samosa-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read the Catch the Samosa best score.", error);
    return 0;
  }
}

function initialGame() {
  return { elapsed: 0, spawn: 0, lastFrame: 0, basket: 0.5, items: [], score: 0, misses: 0 };
}

export default function CatchSamosaGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(initialGame());
  const statusRef = useRef("ready");
  const dragRef = useRef(false);
  const keysRef = useRef({ left: false, right: false });
  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [seconds, setSeconds] = useState(GAME_SECONDS);
  const [best, setBest] = useState(readBest);

  statusRef.current = status;

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
    const primary = style.getPropertyValue("--primary-color").trim() || "#194d3e";
    const surface = style.getPropertyValue("--surface-color").trim() || "#fff";
    const soft = style.getPropertyValue("--secondary-background-color").trim() || "#e8f2ec";
    const gradient = context.createLinearGradient(0, 0, 0, bounds.height);
    gradient.addColorStop(0, surface);
    gradient.addColorStop(1, soft);
    context.fillStyle = gradient;
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.fillStyle = style.getPropertyValue("--accent-color").trim() || "#e8c66a";
    context.fillRect(0, bounds.height - 8, bounds.width, 8);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '32px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    gameRef.current.items.forEach((item) => context.fillText("🥟", item.x * bounds.width, item.y));
    context.font = '48px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("🧺", gameRef.current.basket * bounds.width, bounds.height - 36);
    context.fillStyle = `${primary}12`;
    for (let x = 18; x < bounds.width; x += 34) {
      context.beginPath();
      context.arc(x, 18, 1.5, 0, Math.PI * 2);
      context.fill();
    }
  }, []);

  const saveBest = useCallback((value) => {
    setBest((previous) => {
      if (value <= previous) return previous;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save the Catch the Samosa best score.", error);
      }
      return value;
    });
  }, []);

  const start = () => {
    gameRef.current = initialGame();
    keysRef.current = { left: false, right: false };
    setScore(0);
    setMisses(0);
    setSeconds(GAME_SECONDS);
    setStatus("playing");
  };

  const pause = () => {
    keysRef.current = { left: false, right: false };
    dragRef.current = false;
    setStatus("paused");
  };

  const finish = useCallback(() => {
    saveBest(gameRef.current.score);
    setStatus("over");
  }, [saveBest]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    if (status !== "playing") {
      draw();
      return undefined;
    }
    const game = gameRef.current;
    game.lastFrame = performance.now();
    let frameId = 0;
    let lastSecond = GAME_SECONDS;
    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.spawn += delta;
      const remaining = Math.max(0, GAME_SECONDS - Math.floor(game.elapsed));
      if (remaining !== lastSecond) {
        lastSecond = remaining;
        setSeconds(remaining);
      }
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      const basketSpeed = 0.78 * delta;
      if (keysRef.current.left) game.basket = Math.max(0.08, game.basket - basketSpeed);
      if (keysRef.current.right) game.basket = Math.min(0.92, game.basket + basketSpeed);
      const spawnEvery = Math.max(0.32, 0.85 - game.elapsed * 0.014);
      if (game.spawn >= spawnEvery) {
        game.spawn -= spawnEvery;
        game.items.push({ x: 0.08 + Math.random() * 0.84, y: -20, speed: 135 + Math.min(game.elapsed * 5, 180) });
      }
      const basketY = bounds.height - 36;
      const remainingItems = [];
      game.items.forEach((item) => {
        item.y += item.speed * delta;
        if (item.y >= basketY - 20 && Math.abs(item.x * bounds.width - game.basket * bounds.width) < 48) {
          game.score += 1;
          setScore(game.score);
          saveBest(game.score);
        } else if (item.y > bounds.height + 18) {
          game.misses += 1;
          setMisses(game.misses);
        } else {
          remainingItems.push(item);
        }
      });
      game.items = remainingItems;
      draw();
      if (remaining === 0) {
        finish();
        return;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [draw, finish, saveBest, status]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") {
        pause();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const down = (event) => {
      if (statusRef.current !== "playing") return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keysRef.current.left = true;
        event.preventDefault();
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keysRef.current.right = true;
        event.preventDefault();
      }
    };
    const up = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = false;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const moveBasket = (direction) => {
    gameRef.current.basket = Math.max(0.08, Math.min(0.92, gameRef.current.basket + direction * 0.12));
    draw();
  };
  const onPointerDown = (event) => {
    dragRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerMove(event);
  };
  const onPointerMove = (event) => {
    if (!dragRef.current && event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    gameRef.current.basket = Math.max(0.08, Math.min(0.92, (event.clientX - bounds.left) / bounds.width));
    draw();
  };
  const resultText = score >= 20
    ? "समोसे पकड़ने में आप उस्ताद निकले! 🏆"
    : score >= 10
      ? "शानदार! चटनी आपकी तरफ़ से! 😄"
      : score > 0
        ? "अच्छी कोशिश! अगली बार और समोसे पकड़ें 😋"
        : "समोसे तो फिसल गए! एक और कोशिश करें 😄";

  return (
    <div className="mini-game samosa-game" data-testid="samosa-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Missed</small><strong>{misses}</strong></div>
      </div>
      <p className="game-instruction">Basket ko move karein aur girte hue samose pakdein!</p>
      <div className="samosa-board-wrap">
        <canvas
          ref={canvasRef}
          className="samosa-board"
          aria-label="Catch the Samosa board. Drag the basket to catch samosas."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => { dragRef.current = false; }}
          onPointerCancel={() => { dragRef.current = false; }}
        />
        {(status === "ready" || status === "paused" || status === "over") && (
          <div className="game-overlay" role={status === "over" ? "status" : undefined}>
            {status === "ready" && <><strong>तैयार हैं? 🥟</strong><span>30 सेकंड में ज़्यादा से ज़्यादा समोसे पकड़ें!</span><button className="game-primary-button" onClick={start} type="button"><Play size={18} /> Start Game</button></>}
            {status === "paused" && <><strong>गेम रुका हुआ है</strong><button className="game-primary-button" onClick={() => setStatus("playing")} type="button"><Play size={18} /> Resume</button></>}
            {status === "over" && <><strong>Final score: {score}</strong><span>Best: {best} · Missed: {misses}</span><span className="game-funny-result">{resultText}</span><button className="game-primary-button" onClick={start} type="button"><RotateCcw size={18} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-touch-controls">
        <button type="button" aria-label="Move basket left" onClick={() => moveBasket(-1)}><ArrowLeft /> Left</button>
        <button type="button" aria-label="Move basket right" onClick={() => moveBasket(1)}>Right <ArrowRight /></button>
      </div>
      <div className="game-actions">
        {status === "playing" && <button type="button" className="game-utility-button" onClick={pause}><Pause size={16} /> Pause</button>}
        {status !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
