"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTick = (props: any) => {
  const { x, y, payload, kidsMap } = props;
  const kid = kidsMap[payload.value];
  
  if (!kid) return null;
  
  const avatarUrl = kid.avatarBlob ? URL.createObjectURL(kid.avatarBlob) : null;
  
  return (
    <g transform={`translate(${x},${y})`}>
      {avatarUrl ? (
        <image href={avatarUrl} x={-20} y={10} height="40" width="40" style={{ clipPath: "circle(50% at 50% 50%)" }} />
      ) : (
        <circle cx={0} cy={30} r={20} fill="var(--comic-blue)" stroke="black" strokeWidth={3} />
      )}
      <text x={0} y={70} dy={16} textAnchor="middle" fill="var(--comic-black)" fontFamily="Bangers, cursive" fontSize="1.2rem">
        {kid.name}
      </text>
    </g>
  );
};

export default function StatsPage() {
  const kids = useLiveQuery(() => db.kids.toArray()) || [];
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  if (!kids.length || !sessions.length) {
    return (
      <div className="panel" style={{ textAlign: "center" }}>
        <h2>No Stats Yet!</h2>
        <p>Complete some bath sessions to see the leaderboard.</p>
      </div>
    );
  }

  // Compute counts
  const kidsMap = kids.reduce((acc, kid) => {
    acc[kid.name] = kid; // payload.value from XAxis will be kid.name
    return acc;
  }, {} as Record<string, any>);

  const statMap: Record<string, any> = {};
  
  kids.forEach(kid => {
    statMap[kid.name] = { name: kid.name, total: 0 };
    for (let i = 0; i < kids.length; i++) {
        statMap[kid.name][`pos${i+1}`] = 0;
    }
  });

  sessions.forEach(session => {
    session.kidOrder.forEach((kidId, idx) => {
      const kid = kids.find(k => k.id === kidId);
      if (kid) {
        statMap[kid.name][`pos${idx+1}`]++;
        statMap[kid.name].total++;
      }
    });
  });

  const chartData = Object.values(statMap).sort((a, b) => b.total - a.total); // basic descending order
  const maxPositions = kids.length;

  const COMIC_COLORS = ["var(--comic-red)", "var(--comic-blue)", "var(--comic-yellow)", "#4caf50", "#9c27b0"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="panel" style={{ height: "500px", paddingBottom: "4rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Leaderboard</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <XAxis dataKey="name" tick={<CustomTick kidsMap={kidsMap} />} interval={0} />
            <YAxis tick={{ fontFamily: "Bangers", fontSize: "1.2rem", fill: "var(--comic-black)" }} />
            <Tooltip contentStyle={{ fontFamily: "Inter", fontWeight: "bold", border: "4px solid black", borderRadius: "4px", boxShadow: "4px 4px 0 black" }} />
            <Legend wrapperStyle={{ fontFamily: "Bangers", fontSize: "1.2rem", paddingTop: "60px" }} />
            {Array.from({ length: maxPositions }).map((_, i) => (
               <Bar key={i} dataKey={`pos${i+1}`} name={`#${i+1} Baths`} stackId="a" fill={COMIC_COLORS[i % COMIC_COLORS.length]} stroke="black" strokeWidth={3} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Totals Table</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontFamily: "Inter", fontWeight: "600" }}>
          <thead>
            <tr style={{ background: "var(--comic-blue)", color: "white" }}>
              <th style={{ padding: "10px", border: "3px solid black" }}>Kid</th>
              {Array.from({ length: maxPositions }).map((_, i) => (
                 <th key={i} style={{ padding: "10px", border: "3px solid black" }}>Position #{i+1}</th>
              ))}
              <th style={{ padding: "10px", border: "3px solid black", background: "var(--comic-red)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((data, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f1f1f1" }}>
                <td style={{ padding: "10px", border: "3px solid black" }}>{data.name}</td>
                {Array.from({ length: maxPositions }).map((_, i) => (
                   <td key={i} style={{ padding: "10px", border: "3px solid black" }}>{data[`pos${i+1}`]}</td>
                ))}
                <td style={{ padding: "10px", border: "3px solid black", fontWeight: "bold" }}>{data.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
