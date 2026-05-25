import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, LogIn } from "lucide-react";
import { generateMetadata } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => generateMetadata({ title: "Minha Conta", description: "Gerencie sua conta.", url: "/account" }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-7 w-7 text-safety-orange" />
        <h1 className="text-3xl font-black tracking-tighter text-industrial-blue dark:text-primary">
          Minha Conta
        </h1>
      </div>

      <div className="bg-muted/30 border border-dashed rounded-2xl p-8 text-center mb-8">
        <LogIn className="h-12 w-12 mx-auto opacity-30 mb-4" />
        <h2 className="text-xl font-bold mb-2">Entre na sua conta</h2>
        <p className="text-muted-foreground mb-6">Acesse pedidos e endereços.</p>
        <div className="flex gap-3 justify-center">
          <Button className="bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold">Entrar</Button>
          <Button variant="outline" className="font-bold">Criar conta</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/" className="flex items-center gap-4 p-5 bg-white dark:bg-card border rounded-xl hover:shadow-md transition">
          <Package className="h-6 w-6 text-safety-orange" />
          <div>
            <h3 className="font-bold">Meus Pedidos</h3>
            <p className="text-sm text-muted-foreground">Histórico de compras</p>
          </div>
        </Link>
        <Link to="/contact" className="flex items-center gap-4 p-5 bg-white dark:bg-card border rounded-xl hover:shadow-md transition">
          <MapPin className="h-6 w-6 text-safety-orange" />
          <div>
            <h3 className="font-bold">Endereços</h3>
            <p className="text-sm text-muted-foreground">Locais de entrega</p>
          </div>
        </Link>
        <Link to="/faq" className="flex items-center gap-4 p-5 bg-white dark:bg-card border rounded-xl hover:shadow-md transition">
          <User className="h-6 w-6 text-safety-orange" />
          <div>
            <h3 className="font-bold">Ajuda</h3>
            <p className="text-sm text-muted-foreground">FAQ e contato</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
