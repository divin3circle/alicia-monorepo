"use client";

import { Home, Sparkles, Image as ImageIcon, CreditCard } from "lucide-react";
import { NavBar } from "@/components/ui/navbar";

export function AliciaNav() {
  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "Compare", url: "#comparison", icon: ImageIcon },
    { name: "Pricing", url: "#pricing", icon: CreditCard },
  ];

  return <NavBar items={navItems} />;
}
