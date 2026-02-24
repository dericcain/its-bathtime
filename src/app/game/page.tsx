"use client";

import { RotateCcw, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Obstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
};

const ARENA_WIDTH = 640;
const ARENA_HEIGHT = 220;
const GROUND_HEIGHT = 32;
const RUNNER_X = 52;
const RUNNER_SIZE = 34;
const GRAVITY = 0.95;
const JUMP_VELOCITY = 13.5;

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [runnerY, setRunnerY] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speed, setSpeed] = useState(6);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const runnerYRef = useRef(0);
  const runnerVRef = useRef(0);
  const speedRef = useRef(6);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleIdRef = useRef(1);
  const runningRef = useRef(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("bathtime-game-best") || "0");
      if (Number.isFinite(saved) && saved > 0) setBest(saved);
    } catch {}
  }, []);

  const syncState = () => {
    setRunnerY(runnerYRef.current);
    setObstacles([...obstaclesRef.current]);
    setSpeed(speedRef.current);
    setScore(Math.floor(scoreRef.current));
  };

  const stopLoop = () => {
    runningRef.current = false;
    setRunning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleCollision = () => {
    stopLoop();
    setGameOver(true);
    const finalScore = Math.floor(scoreRef.current);
    if (finalScore > best) {
      setBest(finalScore);
      try {
        localStorage.setItem("bathtime-game-best", String(finalScore));
      } catch {}
    }
  };

  const tick = (ts: number) => {
    if (!runningRef.current) return;

    if (!lastTsRef.current) lastTsRef.current = ts;
    const dtMs = Math.min(32, ts - lastTsRef.current);
    lastTsRef.current = ts;
    const dt = dtMs / 16.6667;

    runnerVRef.current -= GRAVITY * dt;
    runnerYRef.current = Math.max(0, runnerYRef.current + runnerVRef.current * dt);
    if (runnerYRef.current > 0 && runnerYRef.current < 2 && runnerVRef.current < 0) {
      runnerYRef.current = 0;
      runnerVRef.current = 0;
    }

    speedRef.current = Math.min(13, 6 + scoreRef.current / 180);

    spawnTimerRef.current -= dtMs;
    if (spawnTimerRef.current <= 0) {
      const height = Math.random() > 0.8 ? 44 : 34;
      const width = Math.random() > 0.65 ? 22 : 18;
      obstaclesRef.current = [
        ...obstaclesRef.current,
        { id: nextObstacleIdRef.current++, x: ARENA_WIDTH + 8, width, height },
      ];
      const spacing = 900 - Math.min(380, scoreRef.current * 2.2);
      spawnTimerRef.current = spacing + Math.random() * 450;
    }

    obstaclesRef.current = obstaclesRef.current
      .map((ob) => ({ ...ob, x: ob.x - speedRef.current * dt }))
      .filter((ob) => ob.x + ob.width > -10);

    const runnerBottom = GROUND_HEIGHT + runnerYRef.current;
    const runnerTop = runnerBottom + RUNNER_SIZE;
    const runnerLeft = RUNNER_X;
    const runnerRight = RUNNER_X + RUNNER_SIZE;

    for (const ob of obstaclesRef.current) {
      const obLeft = ob.x;
      const obRight = ob.x + ob.width;
      const obBottom = GROUND_HEIGHT;
      const obTop = GROUND_HEIGHT + ob.height;
      const overlapX = runnerRight > obLeft && runnerLeft < obRight;
      const overlapY = runnerTop > obBottom && runnerBottom < obTop;
      if (overlapX && overlapY) {
        syncState();
        handleCollision();
        return;
      }
    }

    scoreRef.current += dt;

    syncState();

    rafRef.current = requestAnimationFrame(tick);
  };

  const jump = () => {
    if (!runningRef.current) {
      startGame();
      return;
    }
    if (runnerYRef.current === 0) {
      runnerVRef.current = JUMP_VELOCITY;
    }
  };

  const startGame = () => {
    stopLoop();
    setGameOver(false);
    setRunning(true);
    runningRef.current = true;
    lastTsRef.current = 0;
    spawnTimerRef.current = 700;
    scoreRef.current = 0;
    runnerYRef.current = 0;
    runnerVRef.current = 0;
    speedRef.current = 6;
    obstaclesRef.current = [];
    nextObstacleIdRef.current = 1;
    syncState();
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runnerBottomPx = GROUND_HEIGHT + runnerY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ textAlign: "center" }}>Bath Dash</h2>
        <p style={{ textAlign: "center", marginTop: "-0.5rem" }}>
          Chrome dino-style mini game. Tap the arena or press Space to jump.
        </p>

        <div className="game-score-row">
          <span>Score: {score}</span>
          <span>Best: {best}</span>
          <span>Speed: {speed.toFixed(1)}x</span>
        </div>

        <button
          type="button"
          className="game-arena"
          onClick={jump}
          aria-label="Game arena. Tap to jump."
          style={{ cursor: "pointer" }}
        >
          <div className="game-ground-line" />

          <div
            className="game-runner"
            style={{
              bottom: `${runnerBottomPx}px`,
              left: `${(RUNNER_X / ARENA_WIDTH) * 100}%`,
              width: `${(RUNNER_SIZE / ARENA_WIDTH) * 100}%`,
              height: `${RUNNER_SIZE}px`,
              transform: running && !gameOver ? "skewX(-6deg)" : "none",
              background: gameOver ? "var(--comic-red)" : "var(--comic-blue)",
            }}
          />

          {obstacles.map((ob) => (
            <div
              key={ob.id}
              className="game-obstacle"
              style={{
                left: `${(ob.x / ARENA_WIDTH) * 100}%`,
                width: `${(ob.width / ARENA_WIDTH) * 100}%`,
                height: `${(ob.height / ARENA_HEIGHT) * 100}%`,
              }}
            />
          ))}

          {!running && !gameOver && (
            <div
              className="comic-font"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                fontSize: "2rem",
                color: "var(--comic-black)",
              }}
            >
              Tap To Start
            </div>
          )}

          {gameOver && (
            <div
              className="comic-font"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                fontSize: "2rem",
                color: "var(--comic-red)",
                textShadow: "2px 2px 0 white",
                background: "rgba(255,255,255,0.45)",
              }}
            >
              Game Over!
            </div>
          )}
        </button>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="button button-yellow" onClick={startGame}>
            {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
            <span style={{ marginLeft: "0.5rem" }}>{gameOver ? "Restart" : running ? "Reset" : "Start"}</span>
          </button>
        </div>

        <p className="game-help">
          Tip: You can jump only when on the ground. Speed increases as your score climbs.
        </p>
      </div>
    </div>
  );
}
