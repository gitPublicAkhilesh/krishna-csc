import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const BEST_KEY = "shri-krishna-bhai-ka-balance-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read Bhai Ka Balance's best score.", error);
    return 0;
  }
}

function newGame() {
  return {
    elapsed: 0,
    lastFrame: 0,
    lastHud: 0,
    tilt: 0,
    tiltVelocity: 0,
    balance: 100,
    wind: 0,
    windRemaining: 0,
    nextWind: 3.5,
    score: 0,
    ended: false,
  };
}

export default function BhaiBalanceGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame());
  const phaseRef = useRef("ready");
  const controlsRef = useRef({ left: false, right: false });
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [balance, setBalance] = useState(100);
  const [windy, setWindy] = useState(false);

  phaseRef.current = phase;

  const saveBest = useCallback((value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save Bhai Ka Balance's best score.", error);
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
    context.fillStyle = `${primary}10`;
    context.beginPath();
    context.arc(width * 0.82, height * 0.2, 28, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = accent;
    context.fillRect(0, height - 27, width, 27);
    context.fillStyle = primary;
    context.fillRect(0, height - 29, width, 3);

    const centerX = width / 2;
    const ground = height - 30;
    const bodyY = ground - 48;
    const bodyX = centerX + Math.sin(game.tilt) * 20;
    context.save();
    context.translate(bodyX, bodyY);
    context.rotate(game.tilt * 0.5);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '46px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("🧍", 0, 0);
    context.font = '27px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    context.fillText("📦", 0, -50);
    context.fillText("🪴", 0, -78);
    context.restore();

    if (game.windRemaining > 0) {
      context.fillStyle = primary;
      context.font = '600 13px Poppins,sans-serif';
      context.textAlign = "center";
      context.fillText("💨 हवा चल रही है!", centerX, 30);
    }
  }, []);

  const finish = useCallback(() => {
    if (gameRef.current.ended) return;
    gameRef.current.ended = true;
    saveBest(gameRef.current.score);
    setPhase("over");
  }, [saveBest]);

  const start = () => {
    gameRef.current = newGame();
    controlsRef.current = { left: false, right: false };
    setScore(0);
    setBalance(100);
    setWindy(false);
    setPhase("playing");
  };

  const setControl = (direction, pressed) => {
    controlsRef.current[direction] = pressed;
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
      controlsRef.current = { left: false, right: false };
      draw();
      return undefined;
    }
    const game = gameRef.current;
    game.lastFrame = performance.now();
    let frame = 0;
    const animate = (now) => {
      const delta = Math.min((now - game.lastFrame) / 1000, 0.05);
      game.lastFrame = now;
      game.elapsed += delta;
      game.nextWind -= delta;
      if (game.nextWind <= 0 && game.windRemaining <= 0) {
        game.wind = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.min(game.elapsed * 0.035, 1.8));
        game.windRemaining = 0.8 + Math.random() * 0.55;
        game.nextWind = Math.max(2.3, 4.8 - game.elapsed * 0.025);
        setWindy(true);
      }
      if (game.windRemaining > 0) {
        game.windRemaining -= delta;
        if (game.windRemaining <= 0) {
          game.wind = 0;
          setWindy(false);
        }
      }

      const control = Number(controlsRef.current.right) - Number(controlsRef.current.left);
      const wobble = Math.sin(game.elapsed * 2.3) * (0.22 + Math.min(game.elapsed * 0.012, 0.45));
      game.tiltVelocity += (game.wind + wobble - control * 3.2 - game.tilt * 1.35) * delta;
      game.tilt += game.tiltVelocity * delta;
      game.balance = Math.min(
        100,
        game.balance + (Math.abs(game.tilt) < 0.22 ? 4 : 0) * delta -
          Math.max(0, Math.abs(game.tilt) - 0.12) * delta * (11 + game.elapsed * 0.13),
      );
      game.balance = Math.max(0, game.balance);
      const nextScore = Math.floor(game.elapsed);
      if (nextScore !== game.lastHud) {
        game.lastHud = nextScore;
        game.score = nextScore;
        setScore(nextScore);
        saveBest(nextScore);
      }
      setBalance((current) => Math.abs(current - game.balance) >= 1 ? Math.round(game.balance) : current);
      if (Math.abs(game.tilt) > 1.05 || game.balance <= 0) {
        finish();
        return;
      }
      draw();
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
        setControl("left", true);
        event.preventDefault();
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        setControl("right", true);
        event.preventDefault();
      }
    };
    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") setControl("left", false);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") setControl("right", false);
    };
    const clear = () => { controlsRef.current = { left: false, right: false }; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clear);
    };
  }, [phase]);

  const holdProps = (direction) => ({
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setControl(direction, true);
    },
    onPointerUp: () => setControl(direction, false),
    onPointerCancel: () => setControl(direction, false),
    onLostPointerCapture: () => setControl(direction, false),
  });

  return (
    <div className="mini-game balance-game" data-testid="balance-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}s</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}s</strong></div>
        <div className="score-box"><small>Balance</small><strong>{balance}%</strong></div>
      </div>
      <div className="balance-meter" role="progressbar" aria-label="Balance meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={balance}>
        <span style={{ width: `${balance}%` }} />
      </div>
      <p className="game-instruction">{windy ? "तेज़ हवा! जल्दी संतुलन बनाएँ 💨" : "बाएँ-दाएँ दबाकर भाई का संतुलन बनाए रखें।"}</p>
      <div className="balance-board-wrap">
        <canvas ref={canvasRef} className="balance-board" data-testid="balance-board" aria-label="Keep the balancing character upright using left and right controls." />
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>सामान संभालो भाई! 🥴</strong><span>हवा और डगमगाहट का जवाब उल्टी दिशा में बटन दबाकर दें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>भाई, थोड़ा आराम कर लो</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>Bhai, gym nahi balance class join karo! 🤣</strong><span>Score: {score}s · Best: {best}s</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="balance-controls">
        <button type="button" aria-label="Balance left" disabled={phase !== "playing"} {...holdProps("left")}>← Left</button>
        <button type="button" aria-label="Balance right" disabled={phase !== "playing"} {...holdProps("right")}>Right →</button>
      </div>
      <div className="game-actions">
        {phase === "playing" && <button type="button" className="game-utility-button" onClick={() => setPhase("paused")}><Pause size={16} /> Pause</button>}
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
