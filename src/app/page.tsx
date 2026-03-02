"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Dices } from "lucide-react";
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

export default function Home() {
  const kids = useLiveQuery(() => db.kids.orderBy('createdAt').toArray()) || [];
  const state = useLiveQuery(() => db.state.get('singleton'));
  
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [luckyUsed, setLuckyUsed] = useState(false);
  const [luckyByKidId, setLuckyByKidId] = useState<string | undefined>();
  const [manuallyReordered, setManuallyReordered] = useState(false);
  
  // Calculate default order
  useEffect(() => {
    if (!kids.length || !state) return;
    
    // If we have an existing session order saved in state, use it
    if (state.currentOrder && state.currentOrder.length === kids.length) {
      const order = state.currentOrder.map(id => kids.find(k => k.id === id)!).filter(Boolean);
      if (order.length === kids.length) {
        setCurrentOrder(order);
        setLuckyUsed(state.currentLuckyUsed || false);
        setLuckyByKidId(state.currentLuckyByKidId);
        // Restore badge: a saved custom order means it was manually or lucky-reordered
        setManuallyReordered(true);
        return;
      }
    }
    
    // Otherwise calculate default
    const order = [];
    const rotationIndex = state.rotationIndex || 0;
    for (let i = 0; i < kids.length; i++) {
        order[i] = kids[(rotationIndex + i) % kids.length];
    }
    setCurrentOrder(order);
    setLuckyUsed(false);
    setLuckyByKidId(undefined);
    setManuallyReordered(false);
  }, [kids, state?.rotationIndex, state?.currentOrder, state?.currentLuckyUsed]);

  // Move a kid up or down in the manual order and persist to DB
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!state) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    const newOrderIds = newOrder.map(k => k.id);
    await db.state.update('singleton', {
      currentOrder: newOrderIds,
      currentLuckyUsed: luckyUsed,
      currentLuckyByKidId: luckyByKidId,
    });
    setManuallyReordered(true);
  };
  
  const handleLucky = async (kidId: string) => {
    if (luckyUsed || !state) return;
    
    // Shuffle all kids
    const shuffled = shuffleArray(currentOrder);
    
    const newOrderIds = shuffled.map(k => k.id);
    await db.state.update('singleton', {
      currentOrder: newOrderIds,
      currentLuckyUsed: true,
      currentLuckyByKidId: kidId
    });
    
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

    // Log session
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
      currentOrder: undefined,
      currentLuckyUsed: false,
      currentLuckyByKidId: undefined
    });
    setManuallyReordered(false);
    
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

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
      
      {/* Action Text Overlay */}
      <div id="action-text" className="action-text comic-font" style={{ display: "none", position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%) rotate(-10deg) scale(2)", zIndex: 100 }}>
        POW!
      </div>

      {/* Manual reorder hint */}
      {manuallyReordered && (
        <div className="manual-order-badge comic-font">
          ✏️ Custom Order!
        </div>
      )}
      
      <div className="home-list">
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

                {/* Up/Down reorder buttons */}
                <div className="reorder-btns">
                  <button
                    className="button button-yellow reorder-btn"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    aria-label={`Move ${kid.name} up`}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button
                    className="button button-yellow reorder-btn"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === currentOrder.length - 1}
                    aria-label={`Move ${kid.name} down`}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
                
                {canRoll && (
                    <button className="button button-yellow icon-circle-btn" onClick={() => handleLucky(kid.id)} aria-label={`Lucky splash for ${kid.name}`}>
                        <Dices size={32} />
                    </button>
                )}
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
