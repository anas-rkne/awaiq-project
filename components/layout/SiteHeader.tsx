"use client";

import { useState } from "react";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Fixed site header. Owns overlay state (menu + cart) and
 * keeps `page.tsx` free of client logic.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Navbar
        menuOpen={menuOpen}
        cartCount={0}
        onMenuToggle={() => setMenuOpen((value) => !value)}
        onCartOpen={() => setCartOpen(true)}
      />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
