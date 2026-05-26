import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  Truck,
  QrCode,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  Lock,
  Star,
  Upload,
} from "lucide-react";
import logo from "@/assets/logo.webp";
import pixLogo from "@/assets/pix-logo.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createBlackoutPixPayment, getBlackoutStatus } from "@/lib/blackout.functions";
import { createPixPayment, getPixStatus as getFreepayStatus } from "@/lib/freepay.functions";
import { getPixGateway } from "@/lib/settings.functions";
import { createIronPayPixPayment, getIronPayStatus } from "@/lib/ironpay.functions";
import {
  registerPixOrder,
  getPixOrderStatus,
  uploadComprovante,
} from "@/lib/pix-orders.functions";

function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

function isValidBRPhone(value: string): boolean {
  const p = value.replace(/\D/g, "");
  if (p.length !== 10 && p.length !== 11) return false;
  const ddd = parseInt(p.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  // celular tem 11 dígitos e o terceiro é 9
  if (p.length === 11 && p[2] !== "9") return false;
  return true;
}

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const personalSchema = z.object({
  fullName: z.string().trim().min(5, "Nome completo é obrigatório").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  phone: z.string().refine(isValidBRPhone, "Celular inválido"),
});

const addressSchema = z.object({
  cep: z.string().trim().min(8, "CEP inválido").max(9),
  street: z.string().trim().min(2, "Rua é obrigatória").max(120),
  number: z.string().trim().min(1, "Número é obrigatório").max(10),
  complement: z.string().trim().max(60).optional().or(z.literal("")),
  neighborhood: z.string().trim().min(2, "Bairro é obrigatório").max(80),
  city: z.string().trim().min(2, "Cidade é obrigatória").max(80),
  state: z.string().trim().min(2, "Estado é obrigatório").max(2),
});

type PersonalForm = z.infer<typeof personalSchema>;
type AddressForm = z.infer<typeof addressSchema>;

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

type Step = 1 | 2 | 3;

function Stepper({ step }: { step: Step }) {
  const items = [
    { id: 1, icon: User },
    { id: 2, icon: Truck },
    { id: 3, icon: QrCode },
  ] as const;
  return (
    <div className="flex items-center justify-between max-w-md mx-auto py-6">
      {items.map((it, idx) => {
        const Icon = it.icon;
        const active = step >= (it.id as Step);
        return (
          <div key={it.id} className="flex items-center flex-1 last:flex-none">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                active ? "bg-safety-orange text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > it.id ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            {idx < items.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-2 ${
                  step > it.id ? "bg-safety-orange" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSummary({
  total,
  itemsCount,
}: {
  total: number;
  itemsCount: number;
}) {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="text-left">
          <p className="text-xs text-muted-foreground">
            Resumo do pedido ({itemsCount} {itemsCount === 1 ? "item" : "itens"})
          </p>
          <p className="font-black text-lg text-industrial-blue">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t">
          <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-14 w-14 rounded border bg-muted overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" width="56" height="56" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-black line-clamp-2 leading-snug">
                    {item.name}
                  </p>
                  <div className="flex items-end justify-between gap-2 mt-1">
                    <p className="text-[11px] text-muted-foreground">
                      Qtd {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-black whitespace-nowrap">
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-black font-medium">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frete</span>
              <span className="text-emerald-600 font-bold">Grátis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrustSignals() {
  const items = [
    "Garantia de Devolução de 100% do Dinheiro",
    "Devoluções Sem Complicações",
    "Transações Seguras",
    "Atendimento ao Cliente 24/7",
  ];
  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center gap-2 justify-center text-xs text-black font-medium -mt-7">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Garantia de Devolução do Dinheiro em <strong>14 dias</strong>
      </div>
      <h3 className="font-semibold text-lg text-black">Compre com confiança!</h3>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <hr className="border-t border-border my-4" />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-semibold text-sm text-black">5000+ Avaliações de Clientes</p>
          <div className="flex items-center gap-1">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-black ml-1">5/5</span>
          </div>
        </div>
        <p className="text-sm italic text-muted-foreground">
          "Fiquei encantada com o atendimento! A entrega foi rápida e o processo de compra, super fácil. Recomendo a todos!"
        </p>
        <p className="text-sm font-medium text-black">— Isabela Marcondes</p>
      </div>
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();
  const itemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [addressFilled, setAddressFilled] = useState(false);

  const personalForm = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    mode: "onTouched",
  });

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    mode: "onTouched",
    defaultValues: { state: "SP" },
  });

  if (items.length === 0) {
    return (
      <div className="container px-4 mx-auto py-32 text-center">
        <h1 className="text-2xl font-bold mb-8">Seu carrinho está vazio.</h1>
        <Link to="/products">
          <Button className="bg-safety-orange text-white font-bold">Ver Produtos</Button>
        </Link>
      </div>
    );
  }

  const handleCepBlur = async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      setCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        setAddressFilled(false);
        return;
      }
      addressForm.setValue("street", data.logradouro || "", { shouldValidate: true });
      addressForm.setValue("neighborhood", data.bairro || "", { shouldValidate: true });
      addressForm.setValue("city", data.localidade || "", { shouldValidate: true });
      addressForm.setValue("state", data.uf || "", { shouldValidate: true });
      setAddressFilled(true);
    } catch {
      toast.error("Não foi possível buscar o CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmitPersonal = (_data: PersonalForm) => {
    setStep(2);
  };

  const onSubmitAddress = (_data: AddressForm) => {
    setStep(3);
  };

  const callBlackoutCreate = useServerFn(createBlackoutPixPayment);
  const callBlackoutStatus = useServerFn(getBlackoutStatus);
  const callFreepayCreate = useServerFn(createPixPayment);
  const callFreepayStatus = useServerFn(getFreepayStatus);
  const callIronPayCreate = useServerFn(createIronPayPixPayment);
  const callIronPayStatus = useServerFn(getIronPayStatus);
  const getSettings = useServerFn(getPixGateway);
  
  const registerOrder = useServerFn(registerPixOrder);
  const uploadComp = useServerFn(uploadComprovante);

  const [pix, setPix] = useState<{
    id: string;
    qrCode: string;
    expiresAt: string | null;
  } | null>(null);
  const [paid, setPaid] = useState(false);
  const [pixRequested, setPixRequested] = useState(false);
  const [comprovanteSent, setComprovanteSent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPix = () => {
    if (pix || submitting) return;
    const personal = personalForm.getValues();
    if (!personal.fullName) {
      toast.error("Preencha seus dados antes de gerar o PIX");
      setStep(1);
      return;
    }
    setPixRequested(true);
    setSubmitting(true);

    const performCreation = async () => {
      try {
        const settings = await getSettings();
        const gateway = settings.gateway || "blackout";
        
        const payload = {
          data: {
            amount: Math.round(total * 100),
            customer: {
              name: personal.fullName,
              email: personal.email,
              phone: personal.phone,
              document: personal.cpf,
            },
            items: items.map((i) => ({
              title: i.name.slice(0, 120),
              unit_price: Math.round(i.price * 100),
              quantity: i.quantity,
            })),
          },
        };

        let res;
        if (gateway === "freepay") {
          res = await callFreepayCreate(payload);
        } else if (gateway === "ironpay") {
          res = await callIronPayCreate(payload);
        } else {
          res = await callBlackoutCreate(payload);
        }

        setPix(res);
        registerOrder({
          data: {
            blackout_id: gateway === "blackout" ? res.id : undefined,
            freepay_id: gateway === "freepay" ? res.id : undefined,
            ironpay_id: gateway === "ironpay" ? res.id : undefined,
            amount_cents: Math.round(total * 100),
            customer: {
              name: personal.fullName,
              email: personal.email,
              phone: personal.phone,
              document: personal.cpf,
            },
            items: items.map((i) => ({
              title: i.name.slice(0, 120),
              unit_price: Math.round(i.price * 100),
              quantity: i.quantity,
            })),
          },
        }).catch(() => {});
      } catch (e: any) {
        toast.error(e.message || "Erro ao gerar PIX");
        setPixRequested(false);
      } finally {
        setSubmitting(false);
      }
    };

    performCreation();
  };

  useEffect(() => {
    if (!pix || paid) return;
    pollRef.current = setInterval(async () => {
      try {
        const settings = await getSettings();
        const gateway = settings.gateway || "blackout";
        
        let statusRes;
        if (gateway === "freepay") {
          statusRes = await callFreepayStatus({ data: { id: pix.id } });
        } else if (gateway === "ironpay") {
          statusRes = await callIronPayStatus({ data: { id: pix.id } });
        } else {
          statusRes = await callBlackoutStatus({ data: { id: pix.id } });
        }

        const { status } = statusRes;
        if (["PAID", "APPROVED", "CONFIRMED", "COMPLETED"].includes(status.toUpperCase())) {
          setPaid(true);
          toast.success("Pagamento confirmado!");
          clearCart();
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => navigate({ to: "/" }), 2500);
        }
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pix, paid, callBlackoutStatus, callFreepayStatus, callIronPayStatus, getSettings, clearCart, navigate]);

  const copyPix = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.qrCode);
    toast.success("Código PIX copiado!");
  };

  const onComprovanteFile = async (file: File) => {
    if (!pix) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 8MB)");
      return;
    }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const b64 = btoa(binary);
      const settings = await getSettings();
      const gateway = settings.gateway || "blackout";
      
      await uploadComp({
        data: {
          blackout_id: gateway === "blackout" ? pix.id : undefined,
          freepay_id: gateway === "freepay" ? pix.id : undefined,
          ironpay_id: gateway === "ironpay" ? pix.id : undefined,
          file_base64: b64,
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
        },
      });
      setComprovanteSent(true);
      toast.success("Comprovante enviado! Aguarde a liberação.");
    } catch (e) {
      toast.error((e as Error).message || "Falha ao enviar comprovante");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background border-b text-foreground">
        <div className="container max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center" aria-label="Atacadista Pneus">
            <img src={logo} alt="Atacadista Pneus" className="h-[3.125rem] w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Lock className="h-4 w-4" />
            Ambiente 100% seguro
          </div>
        </div>
      </header>


      <div className="container max-w-xl mx-auto px-4 py-6">
        <button
          onClick={() => (step === 1 ? navigate({ to: "/" }) : setStep((s) => (s - 1) as Step))}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-industrial-blue mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Voltar ao carrinho" : "Voltar"}
        </button>

        <Stepper step={step} />

        <div className="mb-4">
          <OrderSummary total={total} itemsCount={itemsCount} />
        </div>

        {step === 1 && (
          <form
            onSubmit={personalForm.handleSubmit(onSubmitPersonal)}
            className="bg-white border rounded-xl p-6 shadow-sm space-y-5"
          >
            <h2 className="font-black text-xl text-black">Dados pessoais</h2>

            <Field
              label="Nome completo"
              error={personalForm.formState.errors.fullName?.message}
            >
              <Input
                placeholder="Seu nome"
                {...personalForm.register("fullName")}
                className="h-11"
              />
            </Field>
            <Field label="E-mail" error={personalForm.formState.errors.email?.message}>
              <Input
                type="email"
                placeholder="voce@email.com"
                {...personalForm.register("email")}
                className="h-11"
              />
            </Field>
            <Field label="CPF" error={personalForm.formState.errors.cpf?.message}>
              <Input
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                {...personalForm.register("cpf", {
                  onChange: (e) => {
                    e.target.value = maskCPF(e.target.value);
                  },
                })}
                className="h-11"
              />
            </Field>
            <Field label="Celular" error={personalForm.formState.errors.phone?.message}>
              <Input
                placeholder="(00) 00000-0000"
                inputMode="tel"
                maxLength={15}
                {...personalForm.register("phone", {
                  onChange: (e) => {
                    e.target.value = maskPhone(e.target.value);
                  },
                })}
                className="h-11"
              />
            </Field>

            <Button
              type="submit"
              className="w-full h-12 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold"
            >
              Continuar para entrega
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={addressForm.handleSubmit(onSubmitAddress)}
            className="bg-white border rounded-xl p-6 shadow-sm space-y-5"
          >
            <h2 className="font-black text-xl text-black">Endereço de entrega</h2>

            <Field label="CEP" error={addressForm.formState.errors.cep?.message}>
              <Input
                placeholder="00000-000"
                {...addressForm.register("cep", {
                  onBlur: (e) => handleCepBlur(e.target.value),
                })}
                className="h-11"
              />
              {cepLoading && (
                <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>
              )}
            </Field>

            <Field label="Rua / Avenida" error={addressForm.formState.errors.street?.message}>
              <Input
                placeholder="Ex: Av. Brasil"
                {...addressForm.register("street")}
                className="h-11"
              />
            </Field>

            <Field label="Número" error={addressForm.formState.errors.number?.message}>
              <Input
                placeholder="123"
                {...addressForm.register("number")}
                className="h-11"
              />
            </Field>

            <Field label="Complemento (opcional)">
              <Input
                placeholder="Apto, bloco, referência"
                {...addressForm.register("complement")}
                className="h-11"
              />
            </Field>

            <Field
              label="Bairro"
              error={addressForm.formState.errors.neighborhood?.message}
            >
              <Input {...addressForm.register("neighborhood")} className="h-11" />
            </Field>

            <Field label="Cidade" error={addressForm.formState.errors.city?.message}>
              <Input {...addressForm.register("city")} className="h-11" />
            </Field>

            <Field label="Estado" error={addressForm.formState.errors.state?.message}>
              <Input {...addressForm.register("state")} className="h-11 uppercase" maxLength={2} />
            </Field>

            {addressFilled && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-sm text-black">Formas de envio</h3>
                <label className="flex items-start gap-3 p-3 border-2 border-safety-orange rounded-lg cursor-pointer bg-safety-orange/5">
                  <input
                    type="radio"
                    name="shipping"
                    defaultChecked
                    className="mt-1 accent-safety-orange"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Frete grátis</span>
                      <span className="text-emerald-600 font-bold text-sm">R$ 0,00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Entrega via transportadora 3 a 6 dias úteis
                    </p>
                  </div>
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold"
            >
              Ir para pagamento
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
          </form>
        )}

        {step === 3 && !pixRequested && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-black text-xl text-black">Formas de Pagamento</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as transações são seguras e criptografadas.
              </p>
            </div>

            <label className="flex items-center gap-3 p-4 border-2 border-safety-orange rounded-lg cursor-pointer bg-safety-orange/5">
              <input type="radio" name="paymethod" defaultChecked className="accent-safety-orange" />
              <img src={pixLogo} alt="PIX" className="h-5 w-5" />
              <span className="font-bold text-sm text-black flex-1">PIX</span>
              <QrCode className="h-5 w-5 text-safety-orange" />
            </label>

            <div className="border rounded-lg p-4 bg-muted/30 text-xs text-muted-foreground text-center">
              Pague com PIX usando QR Code ou código copia e cola
            </div>

            <Button
              type="button"
              onClick={startPix}
              disabled={submitting}
              className="w-full h-12 bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Finalizar Compra
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => setStep(2)}
            >
              Voltar para envio
            </Button>
          </div>
        )}

        {step === 3 && pixRequested && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-center gap-3">
              <img src={pixLogo} alt="PIX" className="h-8 w-8" />
              <h2 className="font-black text-xl text-black">Pagamento via PIX</h2>
            </div>

            {paid ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="font-bold text-lg text-emerald-700">Pagamento confirmado!</p>
                <p className="text-sm text-muted-foreground">Redirecionando...</p>
              </div>
            ) : !pix ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
                <p className="text-sm text-muted-foreground">Gerando código PIX...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Escaneie o QR Code abaixo ou copie o código no seu app do banco.
                </p>

                <div className="flex justify-center">
                  <div className="p-4 bg-white border rounded-lg">
                    <QRCodeSVG value={pix.qrCode} size={220} level="M" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black">Código copia e cola</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={pix.qrCode}
                      className="h-11 text-xs font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      type="button"
                      onClick={copyPix}
                      className="h-11 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shrink-0"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Aguardando confirmação do pagamento...
                </div>

                <div className="border-2 border-safety-orange/30 rounded-xl p-5 bg-safety-orange/5 text-center space-y-3">
                  <div className="h-11 w-11 mx-auto rounded-lg bg-safety-orange flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-black">
                    Já pagou? Envie o comprovante
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Se o sistema demorar para confirmar, anexe aqui o print/PDF do Pix para agilizar a liberação do seu pedido.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onComprovanteFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || comprovanteSent}
                    className="w-full h-11 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : comprovanteSent ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {comprovanteSent ? "COMPROVANTE ENVIADO" : "ANEXAR COMPROVANTE"}
                  </Button>
                </div>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                setPixRequested(false);
                setPix(null);
              }}
              disabled={paid}
            >
              Voltar
            </Button>
          </div>
        )}

        <TrustSignals />
      </div>

      <footer className="bg-[#02050b] text-white mt-10 py-6 px-4 text-center text-xs leading-relaxed">
        © 2026 R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA.
        <br />
        CNPJ: 04.610.006/0004-84
        <br />
        Avenida Jose Falcao, 75 A, Loja — Queimadinha — Feira de Santana/BA — CEP 44026-100
      </footer>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-black">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
