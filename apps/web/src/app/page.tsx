"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Monitor,
  Package,
  Bike,
  FileText,
  Star,
  Check,
  ArrowRight,
  Menu,
  X,
  Zap,
  MessageCircle,
  BarChart2,
  TrendingUp,
  Users,
  Clock,
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Play,
  CircleDollarSign,
  ChefHat,
  Headphones,
  Quote,
} from "lucide-react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const solutions = [
  {
    icon: Monitor,
    title: "Salão e PDV",
    desc: "Frente de caixa ágil e gestão visual de mesas. Abra, transfira e feche comandas em segundos.",
    color: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Package,
    title: "Estoque Inteligente",
    desc: "Ficha técnica automatizada. Baixa automática a cada venda. Dê adeus ao desperdício.",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: Bike,
    title: "Delivery Integrado",
    desc: "iFood, Rappi e WhatsApp centralizados na mesma tela. Um painel para tudo.",
    color: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: FileText,
    title: "Gestão Fiscal",
    desc: "Emissão de NFC-e / NF-e com um clique e envio direto para o contador.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
];

const testimonials = [
  {
    name: "Carlos Mendonça",
    role: "Sócio-proprietário — Forneria Mendonça",
    avatar: "CM",
    bg: "bg-orange-100",
    text: "O fechamento de caixa que levava 40 minutos agora leva 5. A integração com a cozinha zerou os erros de pedido. Simplesmente transformador.",
    stars: 5,
  },
  {
    name: "Mariana Fontes",
    role: "Gestora — Burger & Co.",
    avatar: "MF",
    bg: "bg-blue-100",
    text: "Conectei o iFood e o WhatsApp em minutos. Os pedidos já chegam direto na tela da cozinha. Nunca mais perdi pedido por erro humano.",
    stars: 5,
  },
  {
    name: "Rafael Saturnino",
    role: "Diretor — Rede Sushi Prime (3 unidades)",
    avatar: "RS",
    bg: "bg-green-100",
    text: "Gerencio as 3 unidades de um único painel. O controle de estoque e as fichas técnicas me salvaram de um prejuízo enorme que eu nem sabia que tinha.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Standard",
    price: "149",
    desc: "Para balcões e deliverys em crescimento",
    featured: false,
    items: [
      "PDV completo",
      "Delivery integrado (1 plataforma)",
      "Controle de estoque básico",
      "Emissão de NFC-e",
      "Suporte via chat",
      "1 usuário operador",
    ],
  },
  {
    name: "Premium",
    price: "299",
    desc: "Para restaurantes com salão, cozinha e fiscal",
    featured: true,
    items: [
      "Tudo do Standard",
      "Gestão de mesas e salão",
      "KDS — Tela da Cozinha",
      "Delivery integrado (ilimitado)",
      "Emissão NF-e + NFC-e",
      "Até 5 usuários",
      "Relatórios avançados",
      "Suporte prioritário 24/7",
    ],
  },
  {
    name: "Expert",
    price: "499",
    desc: "Para redes, franquias e operações avançadas",
    featured: false,
    items: [
      "Tudo do Premium",
      "Múltiplos CNPJs / unidades",
      "API de integração",
      "Usuários ilimitados",
      "Ficha técnica com custo de prato",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
  },
];

const navLinks = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Planos", href: "#planos" },
  { label: "Contato", href: "#contato" },
];

// ─────────────────────────────────────────────
// HOOK: animação ao scroll
// ─────────────────────────────────────────────

function useScrollAnimation() {
  useEffect(() => {
    const elements = document.querySelectorAll(".section-animate");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 select-none">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-orange-500">
              <ChefHat size={17} className="text-white" />
            </span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Nexo<span className="text-orange-500">Foods</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
            >
              Testar Grátis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-5">
          <nav className="flex flex-col gap-1 py-3">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link href="/sign-in" className="text-center py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700">
              Entrar
            </Link>
            <Link href="/sign-up" className="text-center py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl">
              Testar Grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0">
      {/* Glow */}
      <div className="absolute -inset-4 bg-orange-400/20 rounded-3xl blur-2xl" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Topbar mockup */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 rounded bg-slate-700 w-36" />
          </div>
          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
            <ChefHat size={12} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-5 min-h-[320px]">
          {/* Sidebar */}
          <div className="col-span-1 bg-slate-900 p-3 flex flex-col gap-2">
            {[BarChart2, Monitor, Package, Bike, FileText, CircleDollarSign].map((Icon, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                  i === 0 ? "bg-orange-500" : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <Icon size={14} className={i === 0 ? "text-white" : "text-slate-400"} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="col-span-4 p-4 bg-slate-50 flex flex-col gap-3">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Faturamento", value: "R$ 4.870", color: "text-green-600", icon: TrendingUp },
                { label: "Mesas abertas", value: "12 / 20", color: "text-orange-500", icon: Users },
                { label: "Pedidos hoje", value: "87", color: "text-blue-600", icon: BarChart2 },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <k.icon size={10} className={k.color} />
                    <p className="text-[9px] text-slate-500 font-medium">{k.label}</p>
                  </div>
                  <p className={`text-xs font-bold truncate ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] font-semibold text-slate-600 mb-2">Vendas por hora</p>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 95, 70, 88, 60, 72, 85, 55, 78].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-t ${i === 4 ? "bg-orange-500" : "bg-slate-200"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Orders list */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] font-semibold text-slate-600 mb-2">Últimos pedidos</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { mesa: "Mesa 4", item: "Pizza Margherita ×2", status: "Pronto", color: "bg-green-100 text-green-700" },
                  { mesa: "Mesa 7", item: "Burger Clássico ×1", status: "Cozinha", color: "bg-orange-100 text-orange-700" },
                  { mesa: "Delivery", item: "Combo Família ×1", status: "Entrega", color: "bg-blue-100 text-blue-700" },
                ].map((o, i) => (
                  <div key={i} className="flex items-center justify-between text-[8px]">
                    <span className="font-bold text-slate-700 w-14 shrink-0">{o.mesa}</span>
                    <span className="text-slate-500 flex-1 truncate">{o.item}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[7px] ml-1 ${o.color}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
          <TrendingUp size={16} className="text-green-600" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500">Lucro este mês</p>
          <p className="text-sm font-bold text-slate-900">+R$ 12.340</p>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
          <Zap size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500">Pedidos / hora</p>
          <p className="text-sm font-bold text-slate-900">38 pedidos</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Copy com animações de entrada sequenciais */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold mb-6 animate-fade-up">
              <Zap size={12} />
              Sistema completo para Food Service
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 animate-fade-up-delay-1">
              O sistema inteligente para{" "}
              <span className="text-orange-500">restaurantes e deliverys</span>{" "}
              que querem lucrar mais.
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up-delay-2">
              Controle salão, cozinha, delivery, estoque e emita notas em uma
              única plataforma. Tudo em tempo real, à prova de erros.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 animate-fade-up-delay-3">
              <a
                href="#contato"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-base shadow-lg shadow-orange-200"
              >
                <MessageCircle size={16} />
                Falar com um Especialista
              </a>
              <a
                href="#solucoes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-white transition-colors text-base"
              >
                <Play size={16} className="text-orange-500" />
                Ver Demonstração
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start text-sm text-slate-500 animate-fade-up-delay-4">
              {["Sem fidelidade", "Setup em 24 horas", "Suporte 24/7"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none pb-8 lg:pb-0">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SOCIAL PROOF
// ─────────────────────────────────────────────

function Metrics() {
  const metrics = [
    { icon: Users, value: "500+", label: "Operações Ativas" },
    { icon: ShieldCheck, value: "98%", label: "de Satisfação" },
    { icon: Headphones, value: "24/7", label: "Suporte Humanizado" },
  ];

  return (
    <section className="bg-slate-900 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-700">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`flex flex-col items-center text-center sm:px-8 section-animate`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4">
                <m.icon size={22} className="text-orange-400" />
              </div>
              <p className="text-4xl font-extrabold text-white mb-1">{m.value}</p>
              <p className="text-slate-400 font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SOLUTIONS
// ─────────────────────────────────────────────

function Solutions() {
  return (
    <section id="solucoes" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 section-animate">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-semibold mb-4 border border-orange-100">
            Soluções
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Tudo que sua operação precisa{" "}
            <span className="text-orange-500">em um só lugar</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base">
            Módulos integrados que se conversam em tempo real — do pedido ao
            fechamento, sem planilhas e sem retrabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200 cursor-pointer section-animate"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center mb-5`}
                >
                  <Icon size={22} className={s.iconColor} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {s.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Saiba mais <ChevronRight size={13} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// DIFERENCIAIS
// ─────────────────────────────────────────────

function Diferenciais() {
  const items = [
    {
      icon: Zap,
      title: "Implantação em 24 horas",
      desc: "Nossa equipe configura tudo para você. No dia seguinte, sua operação já está no ar.",
    },
    {
      icon: ShieldCheck,
      title: "Dados 100% seguros",
      desc: "Infraestrutura em nuvem com backup automático. Seus dados nunca se perdem.",
    },
    {
      icon: Clock,
      title: "Suporte 24/7 de verdade",
      desc: "Fale com humanos reais via WhatsApp, chat ou telefone. Sem bot, sem espera.",
    },
    {
      icon: TrendingUp,
      title: "Relatórios que geram decisões",
      desc: "Dashboards com CMV, ticket médio, DRE simplificado e muito mais.",
    },
  ];

  return (
    <section id="diferenciais" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: text */}
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-semibold mb-4 border border-orange-100">
              Por que o Nexo Foods?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
              Não é só um sistema.
              <br />
              <span className="text-orange-500">É um parceiro de operação.</span>
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed max-w-md">
              Construímos o Nexo Foods junto com donos de restaurantes reais.
              Cada funcionalidade resolve um problema de verdade do dia a dia da cozinha e do salão.
            </p>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Ver planos <ArrowRight size={15} />
            </a>
          </div>

          {/* Right: grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-orange-500" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1.5 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 section-animate">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-semibold mb-4 border border-orange-100">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Quem usa, não troca.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow section-animate`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <Quote size={28} className="text-orange-200 mb-4" />

              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">
                "{t.text}"
              </p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={13} className="fill-orange-400 text-orange-400" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${t.bg} flex items-center justify-center text-sm font-bold text-slate-700 shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────

function Pricing() {
  return (
    <section id="planos" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-semibold mb-4 border border-orange-100">
            Planos e Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Planos que{" "}
            <span className="text-orange-500">crescem com o seu negócio</span>
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Cancele quando quiser. Sem multa, sem burocracia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.featured
                  ? "bg-white border-2 border-orange-500 shadow-2xl shadow-orange-100 md:-mt-4 md:pb-12"
                  : "bg-white border border-slate-200 shadow-sm"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-md">
                    <Star size={10} className="fill-white" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-sm font-semibold mb-1 ${
                    plan.featured ? "text-orange-500" : "text-slate-500"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xs text-slate-400">R$</span>
                  <span className="text-5xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{plan.desc}</p>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check
                      size={15}
                      className={`shrink-0 mt-0.5 ${
                        plan.featured ? "text-orange-500" : "text-green-500"
                      }`}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.featured
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {plan.featured ? "Começar agora" : "Contratar"}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Todos os planos incluem 7 dias grátis. Não é necessário cartão de crédito.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CTA FINAL
// ─────────────────────────────────────────────

function CtaFinal() {
  return (
    <section id="contato" className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl px-8 py-16 text-center">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-700/30 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-6">
              ✨ Comece ainda hoje
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight max-w-2xl mx-auto">
              Transforme a gestão do seu restaurante agora.
            </h2>
            <p className="text-orange-100 mb-10 max-w-lg mx-auto leading-relaxed">
              Junte-se a mais de 500 operações que já eliminaram o caos do papel,
              reduziram desperdício e aumentaram o lucro com o Nexo Foods ERP.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors text-base shadow-lg"
              >
                Testar grátis por 7 dias <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base"
              >
                <MessageCircle size={16} />
                Falar no WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 justify-center mt-8 text-sm text-orange-100">
              {["Sem cartão de crédito", "Setup em 24h", "Suporte incluso"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-white" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <ChefHat size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Nexo<span className="text-orange-400">Foods</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Sistema ERP completo para restaurantes, bares e deliverys. Gerencie tudo em um só lugar.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {["Soluções", "Diferenciais", "Planos", "Demonstração", "Blog"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {["Sobre nós", "Carreiras", "Termos de uso", "Privacidade", "Contato"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: "São Paulo, SP — Brasil" },
                { icon: Phone, text: "(11) 99999-9999" },
                { icon: Mail, text: "contato@nexofoods.com.br" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  <Icon size={14} className="text-orange-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <MessageCircle size={15} />
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {year} Nexo Foods ERP. Desenvolvido por{" "}
            <span className="text-orange-400 font-semibold">GRX Intelligence</span>.
            Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Termos de uso
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function LandingPage() {
  useScrollAnimation();
  return (
    <div className="bg-slate-50 antialiased" style={{ fontFamily: "var(--font-inter)" }}>
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Solutions />
        <Diferenciais />
        <Testimonials />
        <Pricing />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  );
}
