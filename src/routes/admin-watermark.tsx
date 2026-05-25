import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  removeWatermark,
  removeWatermarkBatch,
  listProductsForWatermark,
  listWatermarkHistory,
  saveCleanedImage,
} from "@/lib/watermark.functions";
import { inpaintImage, downloadDataUrl } from "@/lib/inpaint-client";
import { adminMe, adminLogin, adminListCategories } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Lock, ArrowLeft, Sparkles, Download } from "lucide-react";


export const Route = createFileRoute("/admin-watermark")({
  component: Page,
});

type Product = {
  id: string;
  name: string;
  sku: string | null;
  images: string[];
  category_id: string | null;
};

type DetectStatus = "unknown" | "marked" | "clean" | "checking" | "tainted";

function Page() {
  const me = useServerFn(adminMe);
  const [auth, setAuth] = useState<boolean | null>(null);
  useEffect(() => {
    me().then((r) => setAuth(r.authenticated));
  }, [me]);
  if (auth === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  return auth ? <Dashboard /> : <Login onIn={() => setAuth(true)} />;
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
          <h1 className="text-2xl font-black text-black">Painel Admin</h1>
        </div>
        <div className="space-y-1.5">
          <Label>Senha</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        </div>
        <Button
          type="submit"
          disabled={busy || !pw}
          className="w-full bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
        >
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Entrar
        </Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const listProducts = useServerFn(listProductsForWatermark);
  const listCats = useServerFn(adminListCategories);
  const removeOne = useServerFn(removeWatermark);
  const removeBatch = useServerFn(removeWatermarkBatch);
  const saveCleaned = useServerFn(saveCleanedImage);
  const listHistory = useServerFn(listWatermarkHistory);

  // Preview da imagem processada via API de inpaint
  const [preview, setPreview] = useState<{
    open: boolean;
    dataUrl: string;
    filename: string;
    productName: string;
  }>({ open: false, dataUrl: "", filename: "", productName: "" });



  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "marked" | "clean">("all");
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Detection cache: imageUrl -> status
  const [detect, setDetect] = useState<Map<string, DetectStatus>>(new Map());
  // Per-image processing state
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  // Selection: set of "productId|imageIndex"
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Batch state
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [batchStartTs, setBatchStartTs] = useState(0);
  const [batchResults, setBatchResults] = useState<
    Array<{ key: string; status: "ok" | "err" | "pending"; error?: string }>
  >([]);
  const [abortCtl, setAbortCtl] = useState<AbortController | null>(null);

  useEffect(() => {
    listCats().then((r: any) => setCats(r));
  }, [listCats]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listProducts({
        data: { page, pageSize, search: search || undefined, categoryId: categoryId || undefined },
      });
      setProducts(r.rows as Product[]);
      setTotal(r.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listProducts, page, search, categoryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Watermark detection via canvas
  const detectImage = useCallback(
    (url: string) => {
      if (detect.has(url)) return;
      setDetect((prev) => new Map(prev).set(url, "checking"));
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const W = 360,
            H = 360;
          const canvas = document.createElement("canvas");
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, W, H);
          // Atacadão watermark can sit near the lower center/right, not only in the
          // bottom-right quadrant. Detect saturated logo blue + red arrow pixels in
          // the lower band and require a small cluster so normal tire shadows don't match.
          const x0 = Math.floor(W * 0.22);
          const y0 = Math.floor(H * 0.48);
          const bandW = Math.floor(W * 0.76);
          const bandH = Math.floor(H * 0.46);
          const data = ctx.getImageData(x0, y0, bandW, bandH).data;
          let blueCount = 0;
          let redCount = 0;
          const blueRows = new Set<number>();
          const blueCols = new Set<number>();
          const redRows = new Set<number>();
          const redCols = new Set<number>();

          for (let y = 0; y < bandH; y++) {
            for (let x = 0; x < bandW; x++) {
              const i = (y * bandW + x) * 4;
              const r = data[i],
                g = data[i + 1],
                b = data[i + 2];
              const isLogoBlue = b > 125 && g > 55 && g < 175 && r < 95 && b - r > 55 && b - g > 15;
              const isArrowRed = r > 165 && g < 85 && b < 85 && r - Math.max(g, b) > 80;
              if (isLogoBlue) {
                blueCount++;
                blueRows.add(y);
                blueCols.add(x);
              }
              if (isArrowRed) {
                redCount++;
                redRows.add(y);
                redCols.add(x);
              }
            }
          }

          const hasBlueLogo = blueCount >= 28 && blueRows.size >= 4 && blueCols.size >= 10;
          const hasRedArrow = redCount >= 16 && redRows.size >= 8 && redCols.size >= 4;
          setDetect((prev) =>
            new Map(prev).set(url, hasBlueLogo || hasRedArrow ? "marked" : "clean"),
          );
        } catch {
          setDetect((prev) => new Map(prev).set(url, "tainted"));
        }
      };
      img.onerror = () => setDetect((prev) => new Map(prev).set(url, "tainted"));
      img.src = url;
    },
    [detect],
  );

  useEffect(() => {
    products.forEach((p) => p.images?.forEach((u) => detectImage(u)));
  }, [products, detectImage]);

  const isMarked = (url: string) => detect.get(url) === "marked";
  const keyFor = (pid: string, idx: number) => `${pid}|${idx}`;

  const filteredProducts = useMemo(() => {
    if (statusFilter === "all") return products;
    return products.filter((p) =>
      p.images?.some((u) => (statusFilter === "marked" ? isMarked(u) : detect.get(u) === "clean")),
    );
  }, [products, statusFilter, detect]);

  const selectedJobs = useMemo(() => {
    const jobs: { productId: string; imageUrl: string; imageIndex: number }[] = [];
    for (const k of selected) {
      const [pid, idxS] = k.split("|");
      const idx = Number(idxS);
      const p = products.find((x) => x.id === pid);
      const url = p?.images?.[idx];
      if (url) jobs.push({ productId: pid, imageUrl: url, imageIndex: idx });
    }
    return jobs;
  }, [selected, products]);

  const markedCountSelected = selectedJobs.length;
  const productsSelectedCount = new Set([...selected].map((k) => k.split("|")[0])).size;

  const toggleSel = (k: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  const selectAllMarkedOnPage = (checked: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      products.forEach((p) =>
        p.images?.forEach((u, i) => {
          if (isMarked(u)) {
            const k = keyFor(p.id, i);
            if (checked) n.add(k);
            else n.delete(k);
          }
        }),
      );
      return n;
    });
  };

  const handleRemoveOne = async (p: Product, idx: number, url: string) => {
    const k = keyFor(p.id, idx);
    setProcessing((prev) => new Set(prev).add(k));
    try {
      // 1) processa via API externa (client-side)
      const out = await inpaintImage(url);
      toast.success("Imagem processada");

      // 2) abre preview com botão de download
      setPreview({
        open: true,
        dataUrl: out.dataUrl,
        filename: `${p.sku || p.id}-${idx}.${out.mimeType.includes("jpeg") ? "jpg" : "png"}`,
        productName: p.name,
      });

      // 3) salva no storage e atualiza o produto no banco
      const saved = await saveCleaned({
        data: {
          productId: p.id,
          imageIndex: idx,
          originalUrl: url,
          base64: out.base64,
          mimeType: out.mimeType,
        },
      });
      setProducts((prev) =>
        prev.map((pp) => {
          if (pp.id !== p.id) return pp;
          const imgs = [...pp.images];
          imgs[idx] = saved.newUrl;
          return { ...pp, images: imgs };
        }),
      );
      setDetect((prev) => {
        const n = new Map(prev);
        n.delete(url);
        n.set(saved.newUrl, "checking");
        return n;
      });
      setTimeout(() => detectImage(saved.newUrl), 100);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProcessing((prev) => {
        const n = new Set(prev);
        n.delete(k);
        return n;
      });
    }
  };

  const startBatch = async () => {
    if (!selectedJobs.length) return;
    setBatchOpen(false);
    setBatchRunning(true);
    setBatchStartTs(Date.now());
    setBatchProgress({ done: 0, total: selectedJobs.length });
    setBatchResults(
      selectedJobs.map((j) => ({ key: keyFor(j.productId, j.imageIndex), status: "pending" })),
    );
    const ctl = new AbortController();
    setAbortCtl(ctl);

    let done = 0;
    const CONCURRENCY = 3;
    const queue = [...selectedJobs];

    async function worker() {
      while (queue.length && !ctl.signal.aborted) {
        const job = queue.shift()!;
        const k = keyFor(job.productId, job.imageIndex);
        try {
          const out = await inpaintImage(job.imageUrl);
          const saved = await saveCleaned({
            data: {
              productId: job.productId,
              imageIndex: job.imageIndex,
              originalUrl: job.imageUrl,
              base64: out.base64,
              mimeType: out.mimeType,
            },
          });
          done++;
          setBatchProgress({ done, total: selectedJobs.length });
          setBatchResults((prev) =>
            prev.map((r) => (r.key === k ? { key: k, status: "ok" } : r)),
          );
          setProducts((prev) =>
            prev.map((pp) => {
              if (pp.id !== job.productId) return pp;
              const imgs = [...pp.images];
              imgs[job.imageIndex] = saved.newUrl;
              return { ...pp, images: imgs };
            }),
          );
          setDetect((prev) => {
            const n = new Map(prev);
            n.delete(job.imageUrl);
            return n;
          });
        } catch (e: any) {
          done++;
          setBatchProgress({ done, total: selectedJobs.length });
          setBatchResults((prev) =>
            prev.map((r) =>
              r.key === k ? { key: k, status: "err", error: e.message } : r,
            ),
          );
        }
      }
    }

    try {
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      if (!ctl.signal.aborted) toast.success("Processamento concluído");
    } catch (e) {
      if ((e as any).name !== "AbortError") toast.error((e as Error).message);
    } finally {
      setBatchRunning(false);
      setAbortCtl(null);
    }
  };



  const cancelBatch = () => abortCtl?.abort();

  const downloadCsv = () => {
    const lines = ["productId,imageIndex,originalUrl,newUrl,status,error"];
    selectedJobs.forEach((j) => {
      const r = batchResults.find((x) => x.key === keyFor(j.productId, j.imageIndex));
      const p = products.find((x) => x.id === j.productId);
      const newUrl = p?.images[j.imageIndex] !== j.imageUrl ? p?.images[j.imageIndex] : "";
      lines.push(
        [
          j.productId,
          j.imageIndex,
          JSON.stringify(j.imageUrl),
          JSON.stringify(newUrl || ""),
          r?.status || "",
          JSON.stringify(r?.error || ""),
        ].join(","),
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `watermark-relatorio-${Date.now()}.csv`;
    a.click();
  };

  const elapsed = batchRunning ? Math.round((Date.now() - batchStartTs) / 1000) : 0;
  const eta =
    batchRunning && batchProgress.done > 0
      ? Math.round((elapsed / batchProgress.done) * (batchProgress.total - batchProgress.done))
      : 0;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/admin" })}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-lg sm:text-xl font-black text-industrial-blue">
              Remover Marca d'Água (IA)
            </h1>
          </div>
        </div>
      </header>

      <Tabs defaultValue="processar" className="container max-w-7xl mx-auto px-4 py-6">
        <TabsList>
          <TabsTrigger value="processar">Processar</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="processar" className="space-y-4">
          {/* Filtros */}
          <div className="bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Buscar nome/SKU"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas categorias</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos</option>
              <option value="marked">Só com marca</option>
              <option value="clean">Só limpos</option>
            </select>
          </div>

          {/* Sticky batch panel */}
          {markedCountSelected > 0 && (
            <div className="sticky top-[57px] z-10 bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="text-sm">
                <strong>{productsSelectedCount}</strong> produtos ·{" "}
                <strong>{markedCountSelected}</strong> imagens selecionadas
              </div>
              <AlertDialog open={batchOpen} onOpenChange={setBatchOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={batchRunning}
                    className="bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Remover marca de todos selecionados (IA)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar processamento em massa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Total: <strong>{markedCountSelected}</strong> imagens. Estimativa: ~
                      {Math.round(markedCountSelected * 3)}s (~3s/imagem).
                      <br />
                      <br />
                      As imagens originais na CDN externa não são alteradas. Apenas os links no
                      banco são atualizados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={startBatch}>Processar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Batch progress */}
          {batchRunning && (
            <div className="bg-white border rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>
                  {batchProgress.done} de {batchProgress.total}
                </span>
                <span>
                  decorrido {elapsed}s · ETA {eta}s
                </span>
              </div>
              <Progress value={(batchProgress.done / batchProgress.total) * 100} />
              <div className="flex justify-between items-center">
                <Button size="sm" variant="outline" onClick={cancelBatch}>
                  Cancelar
                </Button>
                <div className="text-xs text-muted-foreground">
                  ✅ {batchResults.filter((r) => r.status === "ok").length} · ❌{" "}
                  {batchResults.filter((r) => r.status === "err").length} · ⏳{" "}
                  {batchResults.filter((r) => r.status === "pending").length}
                </div>
              </div>
            </div>
          )}

          {!batchRunning && batchResults.length > 0 && (
            <div className="bg-white border rounded-xl p-4 flex justify-between items-center">
              <div className="text-sm">
                ✅ {batchResults.filter((r) => r.status === "ok").length} sucessos · ❌{" "}
                {batchResults.filter((r) => r.status === "err").length} erros
              </div>
              <Button size="sm" variant="outline" onClick={downloadCsv}>
                <Download className="h-4 w-4 mr-2" /> Baixar CSV
              </Button>
            </div>
          )}

          {/* Header check */}
          <div className="bg-white border rounded-xl p-3 flex items-center gap-2 text-sm">
            <Checkbox onCheckedChange={(c) => selectAllMarkedOnPage(!!c)} />
            <span>Selecionar todos com marca da página</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
          </div>

          {/* Lista de produtos */}
          <div className="space-y-3">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white border rounded-xl p-4">
                <div className="font-bold text-black mb-2">{p.name}</div>
                {p.sku && <div className="text-xs text-muted-foreground mb-3">SKU: {p.sku}</div>}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {p.images?.map((url, i) => {
                    const k = keyFor(p.id, i);
                    const status = detect.get(url);
                    const isProc = processing.has(k);
                    const marked = status === "marked";
                    return (
                      <div key={k} className="border rounded-lg overflow-hidden bg-muted/20">
                        <div className="relative aspect-square">
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-contain bg-white"
                            loading="lazy"
                          />
                          <div className="absolute top-1 left-1">
                            <Checkbox
                              checked={selected.has(k)}
                              onCheckedChange={() => toggleSel(k)}
                            />
                          </div>
                          <div className="absolute top-1 right-1">
                            {status === "marked" && (
                              <Badge variant="destructive" className="text-[10px]">
                                Com marca
                              </Badge>
                            )}
                            {status === "clean" && (
                              <Badge className="bg-emerald-600 text-white text-[10px]">Limpo</Badge>
                            )}
                            {status === "checking" && (
                              <Badge variant="outline" className="text-[10px]">
                                Verificando
                              </Badge>
                            )}
                            {status === "tainted" && (
                              <Badge variant="outline" className="text-[10px]">
                                ?
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-2">
                          <Button
                            size="sm"
                            variant={marked ? "default" : "outline"}
                            disabled={isProc}
                            className="w-full h-8 text-xs"
                            onClick={() => handleRemoveOne(p, i, url)}
                          >
                            {isProc ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Remover marca (IA)"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground">
                Nenhum produto encontrado.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico">
          <HistoryTab listHistory={listHistory} removeOne={removeOne} />
        </TabsContent>
      </Tabs>

      <Dialog open={preview.open} onOpenChange={(o) => setPreview((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">{preview.productName}</DialogTitle>
          </DialogHeader>
          {preview.dataUrl && (
            <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-center">
              <img
                src={preview.dataUrl}
                alt="Resultado"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreview((p) => ({ ...p, open: false }))}
            >
              Fechar
            </Button>
            <Button
              className="bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
              onClick={() => downloadDataUrl(preview.dataUrl, preview.filename)}
            >
              <Download className="h-4 w-4 mr-2" /> Baixar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function HistoryTab({ listHistory, removeOne }: { listHistory: any; removeOne: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listHistory());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listHistory]);
  useEffect(() => {
    load();
  }, [load]);

  const retry = async (r: any) => {
    try {
      await removeOne({
        data: { productId: r.product_id, imageUrl: r.original_url, imageIndex: r.image_index },
      });
      toast.success("Reprocessado");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {loading && (
        <div className="p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase">
          <tr>
            <th className="text-left px-3 py-2">Data</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Original</th>
            <th className="text-left px-3 py-2">Nova</th>
            <th className="text-left px-3 py-2">Erro</th>
            <th className="text-right px-3 py-2">Ação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2 text-xs whitespace-nowrap">
                {new Date(r.created_at).toLocaleString("pt-BR")}
              </td>
              <td className="px-3 py-2">
                {r.status === "success" ? (
                  <Badge className="bg-emerald-600 text-white">OK</Badge>
                ) : (
                  <Badge variant="destructive">Erro</Badge>
                )}
              </td>
              <td className="px-3 py-2">
                <a
                  className="text-industrial-blue underline"
                  href={r.original_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  ver
                </a>
              </td>
              <td className="px-3 py-2">
                {r.new_url ? (
                  <a
                    className="text-industrial-blue underline"
                    href={r.new_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ver
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-xs text-red-700 max-w-xs truncate">
                {r.error_message || "—"}
              </td>
              <td className="px-3 py-2 text-right">
                {r.status === "error" && (
                  <Button size="sm" variant="outline" onClick={() => retry(r)}>
                    Reprocessar
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-muted-foreground">
                Sem histórico.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
