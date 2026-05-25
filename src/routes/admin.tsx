import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  adminLogin,
  adminLogout,
  adminMe,
  adminListOrders,
  adminUpdateOrder,
  adminGetSettings,
  adminUpdateSetting,
  adminListCategories,
  adminImportProducts,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  LogOut,
  Lock,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Order = {
  id: string;
  freepay_id: string;
  amount_cents: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  comprovante_url: string | null;
  comprovante_uploaded_at: string | null;
  flagged: string | null;
  notes: string | null;
  created_at: string;
};

type Stats = {
  paid_today: number;
  paid_today_amount_cents: number;
  pending_total: number;
  alert_count: number;
};

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function AdminPage() {
  const me = useServerFn(adminMe);
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    me().then((r) => setAuth(r.authenticated));
  }, [me]);

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-safety-orange" />
      </div>
    );
  }

  return auth ? <Dashboard onLogout={() => setAuth(false)} /> : <Login onIn={() => setAuth(true)} />;
}

function Login({ onIn }: { onIn: () => void }) {
  const login = useServerFn(adminLogin);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await login({ data: { password: pw } });
            onIn();
          } catch (err) {
            toast.error((err as Error).message || "Falha no login");
          } finally {
            setBusy(false);
          }
        }}
        className="w-full max-w-sm bg-white border rounded-2xl shadow-sm p-8 space-y-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-xl bg-industrial-blue flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-black">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-black">Senha</Label>
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="h-11"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          disabled={busy || !pw}
          className="w-full h-11 bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
        >
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Entrar
        </Button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrder);
  const logout = useServerFn(adminLogout);
  const getSettings = useServerFn(adminGetSettings);
  const updateSetting = useServerFn(adminUpdateSetting);
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "alerts" | "pending" | "paid">("all");
  const [pixGateway, setPixGateway] = useState<string>("blackout");
  const [updatingGateway, setUpdatingGateway] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [r, settings] = await Promise.all([list(), getSettings()]);
      setOrders(r.orders as Order[]);
      setStats(r.stats);
      if (settings.pix_gateway) {
        setPixGateway(settings.pix_gateway);
      }
    } catch (e) {
      toast.error((e as Error).message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "alerts") return o.flagged === "ALERTA_DESVIO";
    if (filter === "pending") return o.status === "PENDING";
    if (filter === "paid") return o.status === "PAID";
    return true;
  });

  const doMarkPaid = async (id: string) => {
    await update({ data: { id, status: "PAID", clear_alert: true } });
    toast.success("Pedido marcado como PAGO");
    refresh();
  };
  const doClearAlert = async (id: string) => {
    await update({ data: { id, clear_alert: true } });
    toast.success("Alerta removido");
    refresh();
  };
  
  const handleGatewayChange = async (newGateway: string) => {
    setUpdatingGateway(true);
    try {
      await updateSetting({ data: { key: "pix_gateway", value: newGateway } });
      setPixGateway(newGateway);
      toast.success(`Gateway alterado para ${newGateway.toUpperCase()}`);
    } catch (e) {
      toast.error("Erro ao alterar gateway");
    } finally {
      setUpdatingGateway(false);
    }
  };
  const doCancel = async (id: string) => {
    await update({ data: { id, status: "CANCELED", clear_alert: true } });
    toast.success("Pedido cancelado");
    refresh();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-blue">
            Painel Atacadista Pneus
          </h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin-watermark" })}>
              ✨ Remover marca d'água
            </Button>
            <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await logout();
                onLogout();
                navigate({ to: "/admin" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pagos hoje"
            value={String(stats?.paid_today ?? 0)}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="emerald"
          />
          <StatCard
            label="Receita hoje"
            value={brl(stats?.paid_today_amount_cents ?? 0)}
            icon={<DollarSign className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            label="PIX pendentes"
            value={String(stats?.pending_total ?? 0)}
            icon={<Clock className="h-5 w-5" />}
            tone="amber"
          />
          <StatCard
            label="Alertas de desvio"
            value={String(stats?.alert_count ?? 0)}
            icon={<ShieldAlert className="h-5 w-5" />}
            tone="red"
          />
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-black">Gateway de Pagamento PIX</h3>
              <p className="text-sm text-muted-foreground">Selecione qual provedor será usado para gerar os códigos PIX.</p>
            </div>
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                disabled={updatingGateway}
                onClick={() => handleGatewayChange("blackout")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  pixGateway === "blackout" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-muted-foreground hover:text-black"
                }`}
              >
                Blackout
              </button>
              <button
                disabled={updatingGateway}
                onClick={() => handleGatewayChange("freepay")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  pixGateway === "freepay" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-muted-foreground hover:text-black"
                }`}
              >
                FreePay
              </button>
            </div>
          </div>
          {updatingGateway && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Atualizando configuração...
            </div>
          )}
        </div>

        <ImportProductsCard />

        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "Todos" },
            { id: "alerts", label: "Alertas de desvio" },
            { id: "pending", label: "Pendentes" },
            { id: "paid", label: "Pagos" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                filter === f.id
                  ? "bg-industrial-blue text-white border-industrial-blue"
                  : "bg-white text-muted-foreground border-border hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Comprovante</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      {loading ? "Carregando..." : "Nenhum pedido."}
                    </td>
                  </tr>
                )}
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-black">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-black whitespace-nowrap">
                      {brl(o.amount_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={o.status} />
                        {o.flagged === "ALERTA_DESVIO" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            <ShieldAlert className="h-3 w-3" />
                            Alerta de desvio
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {o.comprovante_url ? (
                        <a
                          href={o.comprovante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-industrial-blue hover:underline text-xs font-medium"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        {o.status !== "PAID" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => doMarkPaid(o.id)}
                          >
                            Marcar pago
                          </Button>
                        )}
                        {o.flagged === "ALERTA_DESVIO" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => doClearAlert(o.id)}
                          >
                            Limpar alerta
                          </Button>
                        )}
                        {o.status !== "CANCELED" && o.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600 hover:text-red-700"
                            onClick={() => doCancel(o.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-800",
    CANCELED: "bg-zinc-200 text-zinc-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };
  const cls = map[status] || "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "emerald" | "blue" | "amber" | "red";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-industrial-blue",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  } as const;
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-black text-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ImportProductsCard() {
  const listCats = useServerFn(adminListCategories);
  const importFn = useServerFn(adminImportProducts);
  const [cats, setCats] = useState<{ id: string; name: string; parent_id: string | null }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [json, setJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number; failed: number; errors: string[] } | null>(null);

  useEffect(() => {
    listCats().then((r) => setCats(r as any));
  }, [listCats]);

  const catTree = cats.map((c) => {
    const parent = cats.find((p) => p.id === c.parent_id);
    return { id: c.id, label: parent ? `${parent.name} › ${c.name}` : c.name };
  }).sort((a, b) => a.label.localeCompare(b.label));

  const handleFile = async (f: File) => {
    const text = await f.text();
    setJson(text);
  };

  const submit = async () => {
    if (!categoryId) { toast.error("Selecione uma categoria"); return; }
    let parsed: any;
    try { parsed = JSON.parse(json); } catch { toast.error("JSON inválido"); return; }
    const products = Array.isArray(parsed) ? parsed : [parsed];
    setBusy(true);
    setResult(null);
    try {
      const r = await importFn({ data: { categoryId, products } });
      setResult(r);
      toast.success(`${r.inserted} inseridos · ${r.updated} atualizados · ${r.failed} falhas`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="font-bold text-black">Adicionar produtos</h3>
        <p className="text-sm text-muted-foreground">Cole o JSON ou envie um arquivo .json para importar pneus em lote.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-black">Categoria</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Selecione...</option>
            {catTree.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-black">Arquivo .json</Label>
          <Input
            type="file"
            accept=".json,application/json"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-black">JSON</Label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={10}
          placeholder='[{"nome": "...", "preco": "...", "imagens": [...], "informacoesTecnicas": [...], ...}]'
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
        />
      </div>

      <Button
        onClick={submit}
        disabled={busy || !categoryId || !json.trim()}
        className="bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
      >
        {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Importar produtos
      </Button>

      {result && (
        <div className="text-sm space-y-1 border-t pt-3">
          <p><strong className="text-emerald-700">{result.inserted}</strong> inseridos · <strong className="text-blue-700">{result.updated}</strong> atualizados · <strong className="text-red-700">{result.failed}</strong> falhas</p>
          {result.errors.length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Ver erros</summary>
              <ul className="mt-2 space-y-1">
                {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
