"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, CheckCircle, Dices } from "lucide-react";
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
  }, [kids, state?.rotationIndex, state?.currentOrder, state?.currentLuckyUsed]);
  
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

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
      
      {/* Action Text Overlay */}
      <div id="action-text" className="action-text comic-font" style={{ display: "none", position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%) rotate(-10deg) scale(2)", zIndex: 100 }}>
        POW!
      </div>
      
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentOrder.map((kid, index) => {
            const isSecond = index === 1;
            const canRoll = isSecond && !luckyUsed;
            
            return (
              <div key={kid.id} className="panel" style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "white" }}>
                <div className="comic-font" style={{ backgroundColor: "var(--comic-red)", color: "white", padding: "10px 20px", borderRadius: "50%", fontSize: "2rem", border: "3px solid black", transform: "rotate(-5deg)" }}>
                    #{index + 1}
                </div>
                {kid.avatarBlob ? (
                    <img src={URL.createObjectURL(kid.avatarBlob)} alt={kid.name} className="avatar-preview" />
                ) : (
                    <div className="avatar-preview" style={{width: '60px', height: '60px', borderWidth: '3px'}}></div>
                )}
                
                <h3 style={{ flex: 1, margin: 0, fontSize: "2.5rem", color: "var(--comic-blue)", textShadow: "2px 2px 0 var(--comic-yellow)" }}>
                    {kid.name}
                </h3>
                
                {canRoll && (
                    <button className="button button-yellow" style={{ padding: "1rem", borderRadius: "50%" }} onClick={() => handleLucky(kid.id)}>
                        <Dices size={32} />
                    </button>
                )}
              </div>
            );
          })}
      </div>
      
      <button 
        className="button button-red" 
        style={{ fontSize: "2rem", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}
        onClick={handleLogSession}
      >
          <CheckCircle size={32} />
          Baths Done
      </button>
      
    </div>
  );
}
