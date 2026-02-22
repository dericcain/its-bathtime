"use client";

import { BarChart2, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Bathtime", icon: <Home size={24} /> },
    { href: "/kids", label: "Kids", icon: <Users size={24} /> },
    { href: "/stats", label: "Stats", icon: <BarChart2 size={24} /> },
  ];

  return (
    <nav className="nav">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <button className={`button ${pathname === item.href ? "button-yellow" : "button-red"}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {item.icon}
            {item.label}
          </button>
        </Link>
      ))}
    </nav>
  );
}
