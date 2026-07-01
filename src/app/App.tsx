import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Calculator, Layers, BarChart3, FolderOpen,
  FileText, Settings, ChevronLeft, ChevronRight, Bell, Search,
  Moon, Sun, Plus, X, Download, TrendingUp, Recycle, Leaf,
  Package, CheckCircle, AlertCircle, Info, ArrowRight, Activity,
  Users, Zap, RefreshCw, Eye, Trash2, Save, Upload, Maximize2,
  LayoutGrid, Move, MapPin, Filter
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

type Page = "dashboard" | "calculator" | "floor-types" | "simulation" | "analytics" | "projects" | "reports" | "settings";
type FloorType = "direcional" | "alerta" | "misto";
type SimCell = 0 | 1 | 2 | 3;

interface CalcInputs {
  length: string;
  width: string;
  thickness: string;
  density: string;
  pvcPct: string;
  recycledPct: string;
  lossFactor: string;
  materialCost: string;
  floorType: FloorType;
}

interface CalcResults {
  area: number;
  volume: number;
  mass: number;
  pvcQty: number;
  recycledQty: number;
  numPlates: number;
  totalMass: number;
  waste: number;
  cost: number;
  fabTime: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  type: FloorType;
  area: number;
  status: "concluido" | "em_andamento" | "planejado";
  date: string;
  cost: number;
}

// ── Static Data ──────────────────────────────────────────────────────────────

const monthlyData = [
  { mes: "Jan", pvc: 180, reciclado: 75, projetos: 4 },
  { mes: "Fev", pvc: 220, reciclado: 92, projetos: 5 },
  { mes: "Mar", pvc: 195, reciclado: 81, projetos: 4 },
  { mes: "Abr", pvc: 280, reciclado: 117, projetos: 6 },
  { mes: "Mai", pvc: 310, reciclado: 129, projetos: 7 },
  { mes: "Jun", pvc: 265, reciclado: 110, projetos: 6 },
  { mes: "Jul", pvc: 340, reciclado: 142, projetos: 8 },
  { mes: "Ago", pvc: 295, reciclado: 123, projetos: 7 },
  { mes: "Set", pvc: 380, reciclado: 158, projetos: 9 },
  { mes: "Out", pvc: 420, reciclado: 175, projetos: 10 },
  { mes: "Nov", pvc: 395, reciclado: 165, projetos: 9 },
  { mes: "Dez", pvc: 455, reciclado: 190, projetos: 11 },
];

const locationPieData = [
  { name: "Calçadas", value: 31, color: "#00C98A" },
  { name: "Hospitais", value: 23, color: "#0B7A5E" },
  { name: "Escolas", value: 18, color: "#00E5A0" },
  { name: "Estações", value: 12, color: "#047857" },
  { name: "Aeroportos", value: 8, color: "#34D399" },
  { name: "Shoppings", value: 5, color: "#6EE7B7" },
  { name: "Públicos", value: 3, color: "#A7F3D0" },
];

const brazilRegions = [
  { name: "Norte", projetos: 8, pvc: 1240, uf: "AM, PA, RR, AP, AC, RO, TO", color: "#00C98A" },
  { name: "Nordeste", projetos: 15, pvc: 2180, uf: "MA, PI, CE, RN, PB, PE, AL, SE, BA", color: "#0B7A5E" },
  { name: "Centro-Oeste", projetos: 6, pvc: 870, uf: "MT, MS, GO, DF", color: "#047857" },
  { name: "Sudeste", projetos: 28, pvc: 4320, uf: "SP, RJ, MG, ES", color: "#00E5A0" },
  { name: "Sul", projetos: 12, pvc: 1850, uf: "PR, SC, RS", color: "#34D399" },
];

const regionalBarData = brazilRegions.map(r => ({ regiao: r.name, projetos: r.projetos, pvc: r.pvc }));

const projects: Project[] = [
  { id: "P001", name: "Hospital das Clínicas — Ala Norte", client: "HCFMUSP", location: "São Paulo, SP", type: "alerta", area: 245, status: "concluido", date: "2024-11-15", cost: 18750 },
  { id: "P002", name: "Estação Sé — Mezzanino", client: "Metrô SP", location: "São Paulo, SP", type: "direcional", area: 380, status: "concluido", date: "2024-10-22", cost: 29400 },
  { id: "P003", name: "E.E. Prof. Rui Barbosa", client: "SEE-SP", location: "Campinas, SP", type: "misto", area: 120, status: "em_andamento", date: "2024-12-01", cost: 9200 },
  { id: "P004", name: "Terminal Rodoviário de Curitiba", client: "Urbs", location: "Curitiba, PR", type: "direcional", area: 520, status: "em_andamento", date: "2024-12-10", cost: 40100 },
  { id: "P005", name: "Aeroporto de Confins — Embarque", client: "BH Airport", location: "Confins, MG", type: "misto", area: 890, status: "planejado", date: "2025-02-15", cost: 68500 },
  { id: "P006", name: "Calçadão Av. Paulista", client: "Prefeitura SP", location: "São Paulo, SP", type: "direcional", area: 1240, status: "planejado", date: "2025-03-01", cost: 95600 },
  { id: "P007", name: "Shopping Iguatemi — Piso L1", client: "Iguatemi SA", location: "Porto Alegre, RS", type: "alerta", area: 340, status: "concluido", date: "2024-09-18", cost: 26200 },
  { id: "P008", name: "Prefeitura Municipal — Entrada", client: "Pref. Fortaleza", location: "Fortaleza, CE", type: "misto", area: 85, status: "concluido", date: "2024-08-30", cost: 6550 },
];

const sysNotifications = [
  { id: 1, type: "success", msg: "Cálculo P003 concluído com sucesso", time: "2 min atrás" },
  { id: 2, type: "info", msg: "Novo projeto P004 iniciado em Curitiba", time: "1h atrás" },
  { id: 3, type: "warning", msg: "Estoque de PVC abaixo do mínimo", time: "3h atrás" },
  { id: 4, type: "info", msg: "Relatório mensal disponível para download", time: "5h atrás" },
];

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  calculator: "Calculadora",
  "floor-types": "Tipos de Piso",
  simulation: "Simulação",
  analytics: "Analytics BI",
  projects: "Projetos",
  reports: "Relatórios",
  settings: "Configurações",
};

// ── Utilities ────────────────────────────────────────────────────────────────

function computeResults(inputs: CalcInputs): CalcResults {
  const l = parseFloat(inputs.length) || 0;
  const w = parseFloat(inputs.width) || 0;
  const t = parseFloat(inputs.thickness) || 0;
  const d = parseFloat(inputs.density) || 0;
  const pvcP = parseFloat(inputs.pvcPct) || 0;
  const recP = parseFloat(inputs.recycledPct) || 0;
  const loss = parseFloat(inputs.lossFactor) || 0;
  const costKg = parseFloat(inputs.materialCost) || 0;
  const area = l * w;
  const volume = area * (t / 1000);
  const mass = volume * d;
  const lossMult = 1 + loss / 100;
  const totalMass = mass * lossMult;
  const pvcQty = totalMass * (pvcP / 100);
  const recycledQty = totalMass * (recP / 100);
  const numPlates = Math.ceil((area * lossMult) / 0.25);
  const waste = totalMass * (loss / 100);
  const cost = totalMass * costKg;
  const fabTime = numPlates * 0.5;
  return { area, volume, mass, pvcQty, recycledQty, numPlates, totalMass, waste, cost, fabTime };
}

function fmt(n: number, dec = 2): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Shared components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Project["status"] }) {
  const cls = {
    concluido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    em_andamento: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    planejado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  }[status];
  const label = { concluido: "Concluído", em_andamento: "Em Andamento", planejado: "Planejado" }[status];
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function TypeBadge({ type }: { type: FloorType }) {
  const cls = {
    direcional: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    alerta: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    misto: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  }[type];
  const label = { direcional: "Direcional", alerta: "Alerta", misto: "Misto" }[type];
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  accent: string;
}

function KPICard({ title, value, unit, change, positive, icon, accent }: KPICardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center`}>{icon}</div>
        <span className={`text-xs font-medium ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-foreground font-mono leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{unit}</div>
      <div className="text-sm text-foreground/70 mt-1.5 font-medium">{title}</div>
    </div>
  );
}

// ── Floor Illustrations ──────────────────────────────────────────────────────

function DirecionalIllustration({ large }: { large?: boolean }) {
  const h = large ? "h-48" : "h-28";
  return (
    <div className={`w-full ${h} rounded-lg bg-teal-50 dark:bg-teal-900/20 relative overflow-hidden flex items-center justify-center`}>
      <div className="absolute inset-0 flex flex-col justify-evenly py-3 px-3 gap-1.5">
        {Array.from({ length: large ? 12 : 7 }).map((_, i) => (
          <div key={i} className="w-full h-1.5 rounded-full bg-teal-400/70 dark:bg-teal-500/70" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-teal-600/5 rounded-lg" />
    </div>
  );
}

function AlertaIllustration({ large }: { large?: boolean }) {
  const h = large ? "h-48" : "h-28";
  const cols = large ? 10 : 7;
  const rows = large ? 8 : 4;
  return (
    <div className={`w-full ${h} rounded-lg bg-orange-50 dark:bg-orange-900/20 relative overflow-hidden flex items-center justify-center p-3`}>
      <div
        className="grid gap-1.5 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} className="aspect-square rounded-full bg-orange-400/60 dark:bg-orange-500/60 border border-orange-500/30" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/5 rounded-lg" />
    </div>
  );
}

function MistoIllustration({ large }: { large?: boolean }) {
  const h = large ? "h-48" : "h-28";
  return (
    <div className={`w-full ${h} rounded-lg bg-violet-50 dark:bg-violet-900/20 relative overflow-hidden grid grid-cols-2`}>
      <div className="flex flex-col justify-evenly py-3 px-2 gap-1">
        {Array.from({ length: large ? 10 : 6 }).map((_, i) => (
          <div key={i} className="w-full h-1 rounded-full bg-violet-400/70" />
        ))}
      </div>
      <div className="flex items-center justify-center p-2">
        <div className="grid grid-cols-4 gap-1 w-full">
          {Array.from({ length: large ? 32 : 16 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-full bg-violet-400/60 border border-violet-500/30" />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-violet-600/5 rounded-lg pointer-events-none" />
    </div>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const kpis: KPICardProps[] = [
    { title: "Projetos Realizados", value: "47", unit: "projetos no total", change: "12%", positive: true, icon: <CheckCircle size={18} className="text-teal-600" />, accent: "bg-teal-100 dark:bg-teal-900/40" },
    { title: "Área Calculada", value: "3.842", unit: "m² computados", change: "8,3%", positive: true, icon: <Maximize2 size={18} className="text-blue-600" />, accent: "bg-blue-100 dark:bg-blue-900/40" },
    { title: "PVC Utilizado", value: "2.156", unit: "kg totais", change: "15,1%", positive: true, icon: <Package size={18} className="text-violet-600" />, accent: "bg-violet-100 dark:bg-violet-900/40" },
    { title: "Material Reciclado", value: "891", unit: "kg de caixa cartonada", change: "22,4%", positive: true, icon: <Recycle size={18} className="text-emerald-600" />, accent: "bg-emerald-100 dark:bg-emerald-900/40" },
    { title: "Economia Gerada", value: "R$ 45.230", unit: "vs. PVC virgem", change: "18,7%", positive: true, icon: <TrendingUp size={18} className="text-amber-600" />, accent: "bg-amber-100 dark:bg-amber-900/40" },
    { title: "Redução de CO₂", value: "1.247", unit: "kg estimados evitados", change: "19,5%", positive: true, icon: <Leaf size={18} className="text-green-600" />, accent: "bg-green-100 dark:bg-green-900/40" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral dos projetos de piso tátil — dezembro 2024</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={() => setPage("calculator")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
            <Plus size={14} /> Novo Projeto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-foreground font-display">Evolução Mensal</h3>
              <p className="text-xs text-muted-foreground">PVC utilizado vs. material reciclado (kg)</p>
            </div>
            <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gPVC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C98A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C98A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B7A5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B7A5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="pvc" name="PVC (kg)" stroke="#00C98A" fill="url(#gPVC)" strokeWidth={2} />
              <Area type="monotone" dataKey="reciclado" name="Reciclado (kg)" stroke="#0B7A5E" fill="url(#gRec)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground font-display mb-1">Por Tipo de Local</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribuição dos projetos</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={locationPieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={2}>
                {locationPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {locationPieData.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-mono font-medium text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Projetos Recentes</h3>
          <button onClick={() => setPage("projects")} className="text-xs text-primary flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Projeto", "Tipo", "Área", "Status", "Data", "Custo"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((p, i) => (
                <tr key={p.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-sm text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.client} · {p.location}</div>
                  </td>
                  <td className="px-5 py-3"><TypeBadge type={p.type} /></td>
                  <td className="px-5 py-3 text-sm font-mono text-foreground">{p.area} m²</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3 text-sm font-mono text-foreground">{fmtBRL(p.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Calculator Page ──────────────────────────────────────────────────────────

function CalculatorPage() {
  const defaultInputs: CalcInputs = {
    length: "10", width: "8", thickness: "25", density: "1350",
    pvcPct: "60", recycledPct: "40", lossFactor: "5", materialCost: "8.50",
    floorType: "direcional",
  };
  const [inputs, setInputs] = useState<CalcInputs>(defaultInputs);
  const [results, setResults] = useState<CalcResults>(computeResults(defaultInputs));
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => { setResults(computeResults(inputs)); }, [inputs]);

  const handleInput = (field: keyof CalcInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    setCalculating(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 22;
      setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(iv); setTimeout(() => { setCalculating(false); setResults(computeResults(inputs)); }, 200); }
    }, 90);
  };

  const tooltips: Record<string, string> = {
    length: "Comprimento total da área a instalar, em metros lineares.",
    width: "Largura total da área a instalar, em metros lineares.",
    thickness: "Espessura da placa de piso tátil (normalmente 5–30 mm).",
    density: "Densidade do composto PVC + reciclado (tipicamente 1.200–1.500 kg/m³).",
    pvcPct: "Percentual de PVC flexível na composição da placa.",
    recycledPct: "Percentual de caixa cartonada reciclada na composição.",
    lossFactor: "Perda estimada por cortes e ajustes na instalação (%).",
    materialCost: "Custo médio do material por quilograma (R$/kg).",
  };

  const fields = [
    { key: "length", label: "Comprimento", unit: "m" },
    { key: "width", label: "Largura", unit: "m" },
    { key: "thickness", label: "Espessura", unit: "mm" },
    { key: "density", label: "Densidade", unit: "kg/m³" },
    { key: "pvcPct", label: "% PVC Flexível", unit: "%" },
    { key: "recycledPct", label: "% Caixa Cartonada", unit: "%" },
    { key: "lossFactor", label: "Fator de Perda", unit: "%" },
    { key: "materialCost", label: "Custo do Material", unit: "R$/kg" },
  ];

  const floorTypes: { id: FloorType; label: string; desc: string; col: string }[] = [
    { id: "direcional", label: "Direcional", desc: "Linhas paralelas — orientação de caminhamento", col: "border-teal-500 bg-teal-50 dark:bg-teal-900/20" },
    { id: "alerta", label: "Alerta", desc: "Pontos em grade — sinalização de risco", col: "border-orange-500 bg-orange-50 dark:bg-orange-900/20" },
    { id: "misto", label: "Misto", desc: "Combinação direcional + alerta", col: "border-violet-500 bg-violet-50 dark:bg-violet-900/20" },
  ];

  const r = results;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Calculadora Inteligente</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Calcule a composição e quantidade de materiais para seu projeto</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
            <Save size={14} /> Salvar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-3">Tipo de Piso Tátil</h3>
            <div className="grid grid-cols-3 gap-3">
              {floorTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleInput("floorType", t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${inputs.floorType === t.id ? t.col : "border-border hover:border-primary/30 bg-background"}`}
                >
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-4">Parâmetros do Projeto</h3>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, unit }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground">{label}</label>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setTooltip(key)}
                        onMouseLeave={() => setTooltip(null)}
                        className="flex"
                      >
                        <Info size={12} className="text-muted-foreground" />
                      </button>
                      {tooltip === key && (
                        <div className="absolute bottom-full left-0 mb-2 w-52 bg-foreground text-background text-xs rounded-xl p-2.5 shadow-xl z-50 leading-relaxed">
                          {tooltips[key]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs[key as keyof CalcInputs]}
                      onChange={e => handleInput(key as keyof CalcInputs, e.target.value)}
                      className="w-full px-3 py-2 pr-14 text-sm border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 relative overflow-hidden"
          >
            {calculating ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display">Processando cálculo... {progress}%</span>
                <div className="w-full h-1 bg-primary-foreground/20 rounded-full overflow-hidden absolute bottom-0 left-0">
                  <div
                    className="h-full bg-primary-foreground/70 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2 font-display">
                <Zap size={16} /> Calcular Agora
              </span>
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-4 flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              Resultados
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Área Total", value: `${fmt(r.area)} m²`, bold: false },
                { label: "Volume", value: `${fmt(r.volume, 4)} m³`, bold: false },
                { label: "Massa Base", value: `${fmt(r.mass)} kg`, bold: false },
                { label: "PVC Flexível", value: `${fmt(r.pvcQty)} kg`, bold: true, color: "text-teal-600 dark:text-teal-400" },
                { label: "Caixa Cartonada", value: `${fmt(r.recycledQty)} kg`, bold: true, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Nº de Placas (500×500mm)", value: `${r.numPlates} un`, bold: false },
                { label: "Peso Total (c/ perda)", value: `${fmt(r.totalMass)} kg`, bold: false },
                { label: "Desperdício", value: `${fmt(r.waste)} kg`, bold: false },
                { label: "Custo Estimado", value: fmtBRL(r.cost), bold: true, color: "text-amber-600 dark:text-amber-400" },
                { label: "Tempo de Fabricação", value: `${fmt(r.fabTime)} h`, bold: false },
              ].map(({ label, value, bold, color }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-mono ${bold ? "font-bold" : "font-medium"} ${color || "text-foreground"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {r.area > 0 && (
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-xl p-4 border border-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={14} className="text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-400 font-display">Impacto Ambiental</span>
              </div>
              <div className="space-y-1 text-xs text-teal-700 dark:text-teal-300">
                <div>CO₂ evitado estimado: <strong className="font-mono">{fmt(r.recycledQty * 0.8)} kg</strong></div>
                <div>Caixas reutilizadas: <strong className="font-mono">~{Math.round(r.recycledQty / 0.35)} unidades</strong></div>
                <div>Economia vs. PVC virgem: <strong className="font-mono">{fmtBRL(r.recycledQty * 3.2)}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Floor Types Page ─────────────────────────────────────────────────────────

function FloorTypesPage() {
  const [selected, setSelected] = useState<FloorType>("direcional");

  const types = [
    {
      id: "direcional" as FloorType,
      name: "Piso Tátil Direcional",
      norm: "NBR 9050:2020",
      desc: "Relevos longitudinais (linhas paralelas) que indicam o sentido do caminhamento para pessoas com deficiência visual. Guia o usuário ao longo de um percurso seguro e contínuo.",
      specs: [
        { label: "Dimensões padrão", value: "500 × 500 mm" },
        { label: "Espessura do relevo", value: "5 mm" },
        { label: "Largura das barras", value: "5 mm" },
        { label: "Espaçamento", value: "6,5 mm entre barras" },
        { label: "Cor padrão ABNT", value: "Amarelo" },
        { label: "Contraste mínimo", value: "70% de diferença" },
      ],
      apps: ["Calçadas e passeios públicos", "Corredores de hospitais", "Estações de metrô e ônibus", "Aeroportos e terminais", "Corredores de escolas"],
      illustration: <DirecionalIllustration large />,
      tabColor: "bg-teal-500",
      borderColor: "border-teal-500",
      badgeCls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    },
    {
      id: "alerta" as FloorType,
      name: "Piso Tátil de Alerta",
      norm: "NBR 9050:2020",
      desc: "Relevos em forma de tronco de cone (pontos) dispostos em grade quadrada. Indica situações de risco, mudança de direção ou proximidade de obstáculos e desníveis.",
      specs: [
        { label: "Dimensões padrão", value: "500 × 500 mm" },
        { label: "Diâmetro da base", value: "25 mm" },
        { label: "Diâmetro do topo", value: "20 mm" },
        { label: "Altura do relevo", value: "5 mm" },
        { label: "Cor padrão ABNT", value: "Amarelo" },
        { label: "Espaçamento", value: "6,7 mm entre relevos" },
      ],
      apps: ["Bordas de plataformas", "Início e fim de escadas", "Travessias de pedestres", "Portas de elevadores", "Rampas de acessibilidade"],
      illustration: <AlertaIllustration large />,
      tabColor: "bg-orange-500",
      borderColor: "border-orange-500",
      badgeCls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      id: "misto" as FloorType,
      name: "Piso Tátil Misto",
      norm: "NBR 9050:2020",
      desc: "Combina elementos do piso direcional e do piso de alerta em uma única placa. Ideal para locais que requerem simultaneamente orientação de percurso e sinalização de risco.",
      specs: [
        { label: "Dimensões padrão", value: "500 × 500 mm" },
        { label: "Composição", value: "50% direcional + 50% alerta" },
        { label: "Espessura do relevo", value: "5 mm" },
        { label: "Aplicação ideal", value: "Interseções e cruzamentos" },
        { label: "Cor padrão ABNT", value: "Amarelo" },
        { label: "Contraste mínimo", value: "70% de diferença" },
      ],
      apps: ["Interseções de corredores", "Cruzamentos de percursos", "Áreas de transição", "Entradas principais", "Plataformas com múltiplos fluxos"],
      illustration: <MistoIllustration large />,
      tabColor: "bg-violet-500",
      borderColor: "border-violet-500",
      badgeCls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
  ];

  const active = types.find(t => t.id === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Tipos de Piso Tátil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Especificações técnicas conforme ABNT NBR 9050:2020</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-150 ${selected === t.id ? `${t.tabColor} text-white shadow-sm` : "bg-card border border-border text-foreground hover:bg-muted"}`}
          >
            {t.name.replace("Piso Tátil ", "")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground font-display">{active.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${active.badgeCls}`}>{active.norm}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{active.desc}</p>
              </div>
            </div>
            {active.illustration}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-3">Aplicações Recomendadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {active.apps.map(app => (
                <div key={app} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0" />
                  {app}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-4">Especificações Técnicas</h3>
            <div className="space-y-3">
              {active.specs.map(({ label, value }) => (
                <div key={label} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground font-mono mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl p-4 border-2 ${active.borderColor} bg-card`}>
            <div className="text-xs text-muted-foreground font-display font-semibold uppercase tracking-wide mb-2">Composição PolySmart</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: "60%" }} />
                </div>
                <span className="text-sm font-mono font-bold text-foreground w-16 text-right">60% PVC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }} />
                </div>
                <span className="text-sm font-mono font-bold text-foreground w-16 text-right">40% Rec.</span>
              </div>
            </div>
            <div className="text-xs text-primary mt-3 font-medium">↑ 22% mais econômico que PVC 100% virgem</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simulation Page ──────────────────────────────────────────────────────────

function SimulationPage() {
  const ROWS = 10, COLS = 16;
  const [grid, setGrid] = useState<SimCell[][]>(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0) as SimCell[]));
  const [activeTool, setActiveTool] = useState<SimCell>(1);
  const [painting, setPainting] = useState(false);

  const paint = useCallback((r: number, c: number) => {
    setGrid(g => g.map((row, ri) =>
      ri === r ? row.map((cell, ci) => ci === c ? activeTool : cell) : row
    ));
  }, [activeTool]);

  const counts = useMemo(() => {
    let d = 0, a = 0, m = 0;
    grid.forEach(row => row.forEach(cell => { if (cell === 1) d++; else if (cell === 2) a++; else if (cell === 3) m++; }));
    return { d, a, m, total: d + a + m };
  }, [grid]);

  const totalArea = counts.total * 0.25;
  const totalMass = totalArea * (25 / 1000) * 1350;
  const pvcQty = totalMass * 0.6;
  const recycledQty = totalMass * 0.4;

  const cellBg = (cell: SimCell) => {
    if (cell === 1) return "bg-teal-400 dark:bg-teal-500";
    if (cell === 2) return "bg-orange-400 dark:bg-orange-500";
    if (cell === 3) return "bg-violet-400 dark:bg-violet-500";
    return "bg-muted/40 hover:bg-muted/70";
  };

  const tools: { id: SimCell; label: string; color: string }[] = [
    { id: 1, label: "Direcional", color: "bg-teal-400 text-white" },
    { id: 2, label: "Alerta", color: "bg-orange-400 text-white" },
    { id: 3, label: "Misto", color: "bg-violet-400 text-white" },
    { id: 0, label: "Apagar", color: "bg-card border border-border text-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Simulação Interativa</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Desenhe o layout dos pisos e veja os cálculos em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0) as SimCell[]))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
          >
            <Trash2 size={14} /> Limpar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
            <Save size={14} /> Salvar Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground font-display uppercase tracking-wide">Ferramenta:</span>
            {tools.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border-2 ${activeTool === t.id ? `${t.color} border-foreground scale-105 shadow-sm` : `${t.color} border-transparent opacity-60 hover:opacity-90`}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="bg-card rounded-xl border border-border p-4 overflow-x-auto select-none"
            onMouseLeave={() => setPainting(false)}
            onMouseUp={() => setPainting(false)}
          >
            <div
              className="inline-grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${COLS}, 2.25rem)` }}
            >
              {grid.map((row, ri) =>
                row.map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    onMouseDown={() => { setPainting(true); paint(ri, ci); }}
                    onMouseEnter={() => { if (painting) paint(ri, ci); }}
                    className={`w-9 h-9 rounded-sm cursor-crosshair transition-colors duration-75 ${cellBg(cell)}`}
                  />
                ))
              )}
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
              <span>Grade {ROWS} × {COLS} — cada célula representa 500 × 500 mm</span>
              <span className="opacity-50">·</span>
              <span>Clique e arraste para pintar</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-3 flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              Cálculo em Tempo Real
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center mb-4 pb-4 border-b border-border">
              {[
                { n: counts.d, label: "Direcional", color: "bg-teal-400" },
                { n: counts.a, label: "Alerta", color: "bg-orange-400" },
                { n: counts.m, label: "Misto", color: "bg-violet-400" },
              ].map(({ n, label, color }) => (
                <div key={label}>
                  <div className={`w-4 h-4 rounded-sm ${color} mx-auto mb-1`} />
                  <div className="text-lg font-bold font-mono text-foreground">{n}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Total de Placas", value: `${counts.total} un` },
                { label: "Área Total", value: `${fmt(totalArea)} m²` },
                { label: "Massa Total", value: `${fmt(totalMass)} kg` },
                { label: "PVC (60%)", value: `${fmt(pvcQty)} kg` },
                { label: "Reciclado (40%)", value: `${fmt(recycledQty)} kg` },
                { label: "Custo Estimado", value: fmtBRL(totalMass * 8.5) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-xs border-b border-border/40 pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-dashed border-border">
            <div className="text-center">
              <Upload size={22} className="text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-semibold text-foreground font-display">Importar Planta Baixa</div>
              <div className="text-xs text-muted-foreground mt-1">PNG, JPG ou DXF</div>
              <div className="text-xs text-muted-foreground">Arraste o arquivo aqui</div>
              <button className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                Selecionar Arquivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Page ───────────────────────────────────────────────────────────

function AnalyticsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [period, setPeriod] = useState("2024");
  const selectedData = selectedRegion ? brazilRegions.find(r => r.name === selectedRegion) : null;

  const statCards = [
    { label: "PcD Visual no Brasil", value: "6,5M", sub: "Fonte: IBGE 2022", icon: <Users size={16} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Locais Sem Piso Tátil", value: "~73%", sub: "dos espaços públicos", icon: <AlertCircle size={16} className="text-red-500" />, bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Potencial de Mercado", value: "R$ 2,4B", sub: "estimativa nacional", icon: <TrendingUp size={16} className="text-amber-500" />, bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "CO₂ Evitado Total", value: "12,4t", sub: "com reciclagem PolySmart", icon: <Leaf size={16} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Business Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Análise de dados, tendências e visualizações interativas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground"
          >
            {["2024", "2023", "2022"].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon, bg }) => (
          <div key={label} className="bg-card rounded-xl p-4 border border-border">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>{icon}</div>
            <div className="text-xl font-bold text-foreground font-mono">{value}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground font-display mb-1">Consumo de PVC por Mês</h3>
          <p className="text-xs text-muted-foreground mb-4">PVC vs. material reciclado em kg — {period}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pvc" name="PVC (kg)" fill="#00C98A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="reciclado" name="Reciclado (kg)" fill="#0B7A5E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground font-display mb-1">Projetos por Mês</h3>
          <p className="text-xs text-muted-foreground mb-4">Evolução mensal — {period}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="projetos" name="Projetos" stroke="#00C98A" strokeWidth={2.5} dot={{ r: 3, fill: "#00C98A" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground font-display mb-1 flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            Regiões do Brasil
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Clique em uma região para ver detalhes</p>
          <div className="space-y-2">
            {brazilRegions.map(region => {
              const pct = Math.round((region.projetos / 28) * 100);
              const isActive = selectedRegion === region.name;
              return (
                <button
                  key={region.name}
                  onClick={() => setSelectedRegion(isActive ? null : region.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${isActive ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}
                >
                  <div
                    className="w-10 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono flex-shrink-0"
                    style={{ background: region.color }}
                  >
                    {region.projetos}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{region.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{region.uf}</div>
                  </div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
          {selectedData && (
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="font-semibold text-primary text-sm font-display">{selectedData.name}</div>
              <div className="text-xs mt-1.5 space-y-1 text-muted-foreground">
                <div>Projetos: <span className="font-mono font-bold text-foreground">{selectedData.projetos}</span></div>
                <div>PVC Total: <span className="font-mono font-bold text-foreground">{selectedData.pvc} kg</span></div>
                <div className="pt-0.5 text-foreground">{selectedData.uf}</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-1">Projetos por Região</h3>
            <p className="text-xs text-muted-foreground mb-4">Número de projetos por região do Brasil</p>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={regionalBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="regiao" type="category" tick={{ fontSize: 10 }} width={85} />
                <Tooltip />
                <Bar dataKey="projetos" name="Projetos" fill="#00C98A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground font-display mb-3">Distribuição por Tipo de Local</h3>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={locationPieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2}>
                      {locationPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {locationPieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-mono font-semibold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Projects Page ────────────────────────────────────────────────────────────

function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const matchType = filterType === "todos" || p.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} projetos cadastrados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
          <Plus size={14} /> Novo Projeto
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, cliente ou local..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground"
        >
          <option value="todos">Todos os Status</option>
          <option value="concluido">Concluído</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="planejado">Planejado</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="direcional">Direcional</option>
          <option value="alerta">Alerta</option>
          <option value="misto">Misto</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["ID", "Projeto", "Tipo", "Área", "Status", "Data", "Custo", ""].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                    Nenhum projeto encontrado para os filtros selecionados
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{p.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-sm text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.client} · {p.location}</div>
                  </td>
                  <td className="px-5 py-3.5"><TypeBadge type={p.type} /></td>
                  <td className="px-5 py-3.5 text-sm font-mono text-foreground">{p.area} m²</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-foreground">{fmtBRL(p.cost)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye size={13} className="text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Download size={13} className="text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} de {projects.length} projetos</span>
          <div className="flex gap-1">
            <button className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Anterior</button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ page, setPage, collapsed, setCollapsed }: {
  page: Page; setPage: (p: Page) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const nav: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "calculator", label: "Calculadora", icon: <Calculator size={18} /> },
    { id: "floor-types", label: "Tipos de Piso", icon: <Layers size={18} /> },
    { id: "simulation", label: "Simulação", icon: <LayoutGrid size={18} /> },
    { id: "analytics", label: "Analytics BI", icon: <BarChart3 size={18} /> },
    { id: "projects", label: "Projetos", icon: <FolderOpen size={18} /> },
    { id: "reports", label: "Relatórios", icon: <FileText size={18} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
      <div className={`flex items-center gap-3 h-16 border-b border-sidebar-border flex-shrink-0 ${collapsed ? "px-4 justify-center" : "px-5"}`}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Leaf size={15} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sidebar-foreground text-sm font-display leading-none">PolySmart</div>
            <div className="text-xs text-muted-foreground leading-none mt-0.5 font-mono">v2.4.1</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 text-sm transition-all duration-150 relative group ${collapsed ? "justify-center px-4" : "px-5"} ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground hover:bg-sidebar-accent/60"}`}
            >
              {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />}
              <span className={`flex-shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-foreground text-background text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 font-display">MA</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-sidebar-foreground truncate">Marco Antunes</div>
              <div className="text-xs text-muted-foreground">Engenheiro Sênior</div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[4.5rem] w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

function Header({ darkMode, setDarkMode, page, notifOpen, setNotifOpen }: {
  darkMode: boolean; setDarkMode: (v: boolean) => void;
  page: Page; notifOpen: boolean; setNotifOpen: (v: boolean) => void;
}) {
  return (
    <header className="h-16 border-b border-border flex items-center px-6 gap-4 bg-background flex-shrink-0">
      <div className="text-sm text-muted-foreground hidden sm:block">
        PolySmart <span className="mx-1.5 opacity-40">/</span>
        <span className="text-foreground font-semibold">{PAGE_TITLES[page]}</span>
      </div>
      <div className="flex-1" />

      <div className="relative hidden sm:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Pesquisa instantânea..."
          className="pl-9 pr-4 py-1.5 text-sm border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors relative"
        >
          <Bell size={17} className="text-muted-foreground" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-background" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm text-foreground font-display">Notificações</span>
              <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sysNotifications.map(n => (
                <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1">
                    <div className="text-xs text-foreground">{n.msg}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        {darkMode
          ? <Sun size={17} className="text-muted-foreground" />
          : <Moon size={17} className="text-muted-foreground" />
        }
      </button>

      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer font-display">
        MA
      </div>
    </header>
  );
}

// ── Placeholder pages ────────────────────────────────────────────────────────

function ComingSoonPage({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
      <div className="text-muted-foreground/30">{icon}</div>
      <div>
        <div className="font-semibold text-foreground font-display">{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{desc}</div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const content: Record<Page, React.ReactNode> = {
    dashboard: <DashboardPage setPage={setPage} />,
    calculator: <CalculatorPage />,
    "floor-types": <FloorTypesPage />,
    simulation: <SimulationPage />,
    analytics: <AnalyticsPage />,
    projects: <ProjectsPage />,
    reports: (
      <ComingSoonPage
        icon={<FileText size={52} />}
        title="Geração de Relatórios"
        desc="Exportação em PDF e Excel disponível na versão 2.5 — em desenvolvimento."
      />
    ),
    settings: (
      <ComingSoonPage
        icon={<Settings size={52} />}
        title="Configurações do Sistema"
        desc="Gerencie usuários, permissões, integrações e preferências da plataforma."
      />
    ),
  };

  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen overflow-hidden bg-background`}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          page={page}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {content[page]}
          </div>
        </main>
      </div>
    </div>
  );
}
