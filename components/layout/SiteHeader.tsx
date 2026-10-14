"use client";

import { useState } from "react";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/components/store/cart/CartProvider";

/**
 * Fixed site header. Owns overlay state (menu + cart) for the home page and
 * reads the shared cart count so the badge stays in sync everywhere.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Navbar
        cartCount={count}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onCartOpen={() => setCartOpen(true)}
      />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
