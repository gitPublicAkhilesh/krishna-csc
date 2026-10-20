import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 30;
const BEST_KEY = "shri-krishna-tap-chappal-best";

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read the Tap the Chappal best score.", error);
    return 0;
  }
}

function nextTarget() {
  return {
    x: 12 + Math.random() * 76,
    y: 12 + Math.random() * 76,
    id: `${Date.now()}-${Math.random()}`,
  };
}

export default function TapChappalGame() {
  const [phase, setPhase] = useState("ready");
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(readBest);
  const [target, setTarget] = useState(nextTarget);
  const [feedback, setFeedback] = useState(false);
  const phaseRef = useRef(phase);
  const secondsRef = useRef(seconds);
  const feedbackTimeout = useRef(null);
  phaseRef.current = phase;
  secondsRef.current = seconds;

  const start = () => {
    setScore(0);
    setMisses(0);
    setSeconds(ROUND_SECONDS);
    setFeedback(false);
    setTarget(nextTarget());
    setPhase("playing");
  };

  const recordScore = (nextScore) => {
    setScore(nextScore);
    setBest((current) => {
      if (nextScore <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(nextScore));
      } catch (error) {
        console.warn("Could not save the Tap the Chappal best score.", error);
      }
      return nextScore;
    });
  };

  useEffect(() => {
    if (phase !== "playing") return undefined;
    let remaining = secondsRef.current;
    const timer = window.setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setSeconds(remaining);
      if (remaining === 0) setPhase("over");
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => window.clearTimeout(feedbackTimeout.current), []);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timeout = window.setTimeout(() => {
      setMisses((current) => current + 1);
      setTarget(nextTarget());
    }, Math.max(450, 1300 - score * 30));
    return () => window.clearTimeout(timeout);
  }, [phase, score, target]);

  const hitTarget = (event) => {
    event.stopPropagation();
    if (phase !== "playing") return;
    setFeedback(true);
    recordScore(score + 1);
    setTarget(nextTarget());
    window.clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = window.setTimeout(() => setFeedback(false), 160);
  };

  const missBoard = () => {
    if (phase === "playing") setMisses((current) => current + 1);
  };

  return (
    <div className="mini-game tap-game" data-testid="tap-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Missed</small><strong>{misses}</strong></div>
      </div>
      <p className="game-instruction">Tap the chappal as quickly as you can! जल्दी टैप करें!</p>
      <div className="tap-board" data-testid="tap-board" onClick={missBoard}>
        {phase === "playing" && (
          <button
            type="button"
            className={`chappal-target${feedback ? " is-tapped" : ""}`}
            aria-label="Tap the chappal target"
            onClick={hitTarget}
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
          >
            🩴
          </button>
        )}
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>तैयार? चप्पल पर टैप करें! 🩴</strong><span>30 सेकंड में जितने हो सकें, पकड़ें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>Time up! Score: {score}</strong><span>Best: {best} · Missed: {misses}</span><span className="game-funny-result">{score >= 20 ? "वाह! आपकी उँगलियाँ बिजली जैसी तेज़ हैं! ⚡" : "चप्पल भाग गई! फिर से कोशिश करें 😄"}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
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
