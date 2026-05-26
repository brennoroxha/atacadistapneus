import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Trash2, Plus, Minus, Loader2 } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, setOpen, closeCart, removeItem, updateQuantity, getTotal } = useCart();
  const total = getTotal();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (navigating && pathname.startsWith("/checkout")) {
      setNavigating(false);
    }
  }, [pathname, navigating]);

  const handleCheckout = () => {
    setNavigating(true);
    closeCart();
    navigate({ to: "/checkout" });
  };

  return (
    <>
    {navigating && (
      <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-safety-orange animate-spin" />
        <p className="text-sm font-black tracking-widest text-industrial-blue">CARREGANDO CHECKOUT...</p>
      </div>
    )}
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-industrial-blue font-black tracking-tighter">
            <ShoppingBag className="h-5 w-5 text-safety-orange" />
            Meu Carrinho ({items.reduce((a, i) => a + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center opacity-60">
              <ShoppingBag className="h-10 w-10 text-industrial-blue" />
            </div>
            <p className="text-muted-foreground text-sm">Seu carrinho está vazio.</p>
            <Link to="/products" onClick={closeCart}>
              <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-black">
                Ver Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border rounded-lg p-3 bg-card">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0 border">
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain" loading="lazy" width="64" height="64" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2">{item.name}</h3>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center border rounded h-8">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 hover:bg-muted h-full"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 hover:bg-muted h-full"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-black text-safety-orange tracking-tight">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-red-500 self-start"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-3 bg-background">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-muted-foreground">SUBTOTAL</span>
                <span className="text-2xl font-black tracking-tighter text-safety-orange">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black tracking-widest h-12"
                >
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  onClick={closeCart}
                  className="w-full font-bold border-gray-300 text-gray-500 hover:text-gray-700 h-12"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}
