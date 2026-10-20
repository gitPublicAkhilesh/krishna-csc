import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 30;
const STARTING_LIVES = 3;
const BEST_KEY = "shri-krishna-dont-tap-red-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read the Don't Tap Red best score.", error);
    return 0;
  }
}

function createTarget(score = 0, forceGreen = false) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    color: forceGreen || Math.random() >= Math.min(0.22 + score * 0.012, 0.48) ? "green" : "red",
    x: 12 + Math.random() * 76,
    y: 13 + Math.random() * 72,
  };
}

export default function DontTapRedGame() {
  const [phase, setPhase] = useState("ready");
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [best, setBest] = useState(readBest);
  const [target, setTarget] = useState(() => createTarget());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const saveBest = (value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save the Don't Tap Red best score.", error);
      }
      return value;
    });
  };

  const start = () => {
    setSeconds(ROUND_SECONDS);
    setScore(0);
    setMistakes(0);
    setLives(STARTING_LIVES);
    setTarget(createTarget(0, true));
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timer = window.setInterval(() => setSeconds((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && seconds === 0) setPhase("over");
  }, [phase, seconds]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timeout = window.setTimeout(() => setTarget(createTarget(score)), Math.max(420, 1100 - score * 22));
    return () => window.clearTimeout(timeout);
  }, [phase, score, target]);

  const tapTarget = () => {
    if (phase !== "playing") return;
    if (target.color === "red") {
      setMistakes((current) => current + 1);
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) setPhase("over");
    } else {
      const nextScore = score + 1;
      setScore(nextScore);
      saveBest(nextScore);
    }
    setTarget(createTarget(score + (target.color === "green" ? 1 : 0)));
  };

  return (
    <div className="mini-game red-game" data-testid="red-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Mistakes</small><strong>{mistakes}</strong></div>
        <div className="score-box"><small>Lives</small><strong>{"❤️".repeat(lives)}</strong></div>
      </div>
      <p className="game-instruction">Tap green. Don't tap red! हरे पर टैप करें, लाल से बचें!</p>
      <div className="red-board" data-testid="red-board">
        {phase === "playing" && (
          <button
            type="button"
            aria-label={`Tap ${target.color} target`}
            className={`red-target ${target.color}-target`}
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            onClick={tapTarget}
          >
            {target.color === "green" ? "✓" : "✕"}
          </button>
        )}
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>लाल को मत छूना! 🔴</strong><span>हरे लक्ष्य पर टैप करें और लाल से बचें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>{lives === 0 ? "लाल ने पकड़ लिया! 😅" : "Time's up! शानदार खेल!"}</strong><span>Score: {score} · Mistakes: {mistakes} · Best: {best}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
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
