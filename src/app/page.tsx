"use client";

import { db, type AppState, type Kid } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Dices, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function shuffleToDifferentOrder<T>(array: T[]): T[] {
  if (array.length < 2) return [...array];

  const shuffled = shuffleArray(array);
  const unchanged = shuffled.every((item, index) => item === array[index]);

  if (!unchanged) {
    return shuffled;
  }

  return [...array.slice(1), array[0]];
}

export default function Home() {
  const kids = useLiveQuery(() => db.kids.orderBy("createdAt").toArray()) || [];
  const state = useLiveQuery(() => db.state.get("singleton")) as AppState | undefined;
  
  const [currentOrder, setCurrentOrder] = useState<Kid[]>([]);
  const [luckyUsed, setLuckyUsed] = useState(false);
  const [luckyByKidId, setLuckyByKidId] = useState<string | undefined>();

  const computeDefaultOrder = (kidsList: Kid[], rotationIndex: number) => {
    if (kidsList.length === 0) return [];
    const order: Kid[] = [];
    for (let i = 0; i < kidsList.length; i++) {
      order[i] = kidsList[(rotationIndex + i) % kidsList.length];
    }
    return order;
  };
  
  // Calculate default order
  useEffect(() => {
    if (!kids.length || !state) return;
    
    // If we have an existing session order saved in state, use it
    if (state.currentOrder && state.currentOrder.length === kids.length) {
      const order = state.currentOrder.map((id) => kids.find((k) => k.id === id)).filter(Boolean) as Kid[];
      if (order.length === kids.length) {
        setCurrentOrder(order);
        setLuckyUsed(state.currentLuckyUsed || false);
        setLuckyByKidId(state.currentLuckyByKidId);
        return;
      }
    }
    
    // Otherwise calculate default
    setCurrentOrder(computeDefaultOrder(kids, state.rotationIndex || 0));
    setLuckyUsed(false);
    setLuckyByKidId(undefined);
  }, [kids, state?.rotationIndex, state?.currentOrder, state?.currentLuckyUsed, state?.currentLuckyByKidId]);
  
  const handleLucky = async (kidId: string) => {
    if (luckyUsed || !state) return;
    
    // Shuffle all kids
    const shuffled = shuffleToDifferentOrder(currentOrder);

    // Update UI immediately (dexie update can be async / slightly delayed)
    setCurrentOrder(shuffled);
    setLuckyUsed(true);
    setLuckyByKidId(kidId);
    
    const newOrderIds = shuffled.map(k => k.id);
    db.state.update("singleton", {
      currentOrder: newOrderIds,
      currentLuckyUsed: true,
      currentLuckyByKidId: kidId
    }).catch(console.error);
    
    // Animate a bit by showing a SPLASH
    const actionText = document.getElementById("action-text");
    if (actionText) {
      actionText.style.display = "block";
      actionText.innerText = "SPLASH!";
      setTimeout(() => {
         actionText.style.display = "none";
      }, 1000);
    }
  };

  const handleLogSession = async () => {
    if (!state || currentOrder.length === 0) return;

    // Logsession
    await db.sessions.add({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      kidOrder: currentOrder.map(k => k.id),
      luckyUsed,
      luckyByKidId
    });

    // Advance rotation, reset nightly state
    await db.state.update('singleton', {
      rotationIndex: (state.rotationIndex + 1) % kids.length,
      currentOrder: undefined, // ensure this is undefined to trigger default next time
      currentLuckyUsed: false,
      currentLuckyByKidId: undefined
    });
    
    const actionText = document.getElementById("action-text");
    if (actionText) {
      actionText.style.display = "block";
      actionText.innerText = "BAM!";
      setTimeout(() => {
         actionText.style.display = "none";
      }, 1000);
    }
  };

  if (!kids.length || !state) {
      return (
          <div className="panel" style={{ textAlign: "center" }}>
              <AlertTriangle size={48} color="var(--comic-red)" style={{ margin: "0 auto" }} />
              <h2>Need More Kids!</h2>
              <p>Go to the Kids tab and add at least two sidekicks.</p>
          </div>
      );
  }

  const persistOrderIds = (order: Kid[]) => {
    if (!state) return;
    db.state
      .update("singleton", { currentOrder: order.map((k) => k.id) })
      .catch(console.error);
  };

  const moveKid = (index: number, direction: -1 | 1) => {
    setCurrentOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      persistOrderIds(next);
      return next;
    });
  };

  const resetOrder = async () => {
    const next = computeDefaultOrder(kids, state.rotationIndex || 0);
    setCurrentOrder(next);
    setLuckyUsed(false);
    setLuckyByKidId(undefined);
    await db.state.update("singleton", {
      currentOrder: undefined,
      currentLuckyUsed: false,
      currentLuckyByKidId: undefined,
    });
  };

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
      
      {/* Action Text Overlay */}
      <div id="action-text" className="action-text comic-font" style={{ display: "none", position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%) rotate(-10deg) scale(2)", zIndex: 100 }}>
        POW!
      </div>
      
      <div className="home-list">
          <div className="order-toolbar">
            <div className="comic-font order-hint">Tap arrows to set tonight&apos;s order</div>
            <button className="button button-yellow order-reset" onClick={resetOrder} aria-label="Reset order to default">
              <RotateCcw size={20} />
              <span style={{ marginLeft: "0.5rem" }}>Reset</span>
            </button>
          </div>
          {currentOrder.map((kid, index) => {
            const isSecond = index === 1;
            const canRoll = isSecond && !luckyUsed;
            
            return (
              <div key={kid.id} className="panel kid-order-card">
                <div className="comic-font kid-rank">
                    #{index + 1}
                </div>
                {kid.avatarBlob ? (
                    <img src={URL.createObjectURL(kid.avatarBlob)} alt={kid.name} className="avatar-preview" style={{ flex: "0 0 auto" }} />
                ) : (
                    <div className="avatar-preview" style={{ width: "72px", height: "72px", borderWidth: "3px", flex: "0 0 auto" }} />
                )}
                
                <h3 className="kid-name">
                    {kid.name}
                </h3>

                <div className="order-controls">
                  {canRoll && (
                      <button className="button button-yellow icon-circle-btn order-btn" onClick={() => handleLucky(kid.id)} aria-label={`I'm feeling lucky for ${kid.name}`}>
                          <Dices size={28} />
                      </button>
                  )}
                  <button
                    className="button button-yellow icon-circle-btn order-btn"
                    onClick={() => moveKid(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${kid.name} up`}
                    title="Move up"
                  >
                    <ArrowUp size={22} />
                  </button>
                  <button
                    className="button button-yellow icon-circle-btn order-btn"
                    onClick={() => moveKid(index, 1)}
                    disabled={index === currentOrder.length - 1}
                    aria-label={`Move ${kid.name} down`}
                    title="Move down"
                  >
                    <ArrowDown size={22} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      
      <button 
        className="button button-red hero-cta"
        onClick={handleLogSession}
      >
          <CheckCircle size={32} />
          Baths Done
      </button>
      
    </div>
  );
}
