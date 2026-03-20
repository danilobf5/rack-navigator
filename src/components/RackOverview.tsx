import { allRacks, rackConnections, type RackData } from "@/data/networkData";
import { cn } from "@/lib/utils";
import rackSecretaria from "@/assets/rack-secretaria.jpeg";
import rackCoordenacao from "@/assets/rack-coordenacao.jpeg";
import rackDirecao from "@/assets/rack-direcao.jpeg";

const rackImages: Record<string, string> = {
  secretaria: rackSecretaria,
  coordenacao: rackCoordenacao,
  direcao: rackDirecao,
};

interface RackOverviewProps {
  onSelectRack: (rack: RackData) => void;
}

export default function RackOverview({ onSelectRack }: RackOverviewProps) {
  const activeCount = (r: RackData) => r.ports.filter((p) => p.status === "ok").length;
  const issueCount = (r: RackData) => r.ports.filter((p) => p.status === "issue").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
          Mapa de Rede — Odontologia
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Clique em um rack para visualizar as portas do switch e suas conexões
        </p>
      </div>

      {/* Topology diagram */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Coordenação on top */}
        <RackCard rack={allRacks[1]} image={rackImages.coordenacao} active={activeCount(allRacks[1])} issues={issueCount(allRacks[1])} onClick={() => onSelectRack(allRacks[1])} />

        {/* Connection lines */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-16 h-px bg-blue-400" />
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium border border-blue-200 whitespace-nowrap">
            PT 1 ↔ PT 2
          </span>
          <div className="w-16 h-px bg-blue-400" />
        </div>

        {/* Bottom row: Secretaria and Direção */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start w-full justify-center">
          <RackCard rack={allRacks[0]} image={rackImages.secretaria} active={activeCount(allRacks[0])} issues={issueCount(allRacks[0])} onClick={() => onSelectRack(allRacks[0])} />

          {/* Connection between Secretaria and Direção */}
          <div className="flex sm:flex-col items-center justify-center gap-1 self-center">
            <div className="w-px h-8 sm:w-12 sm:h-px bg-blue-400" />
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">
              PT 8 ↔ PT 24
            </span>
            <div className="w-px h-8 sm:w-12 sm:h-px bg-blue-400" />
          </div>

          <RackCard rack={allRacks[2]} image={rackImages.direcao} active={activeCount(allRacks[2])} issues={issueCount(allRacks[2])} onClick={() => onSelectRack(allRacks[2])} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
        <SummaryCard label="Total Portas" value={allRacks.reduce((s, r) => s + r.switchPorts, 0)} />
        <SummaryCard label="Ativas" value={allRacks.reduce((s, r) => s + activeCount(r), 0)} color="text-emerald-600" />
        <SummaryCard label="Problemas" value={allRacks.reduce((s, r) => s + issueCount(r), 0)} color="text-amber-600" />
      </div>
    </div>
  );
}

function RackCard({
  rack,
  image,
  active,
  issues,
  onClick,
}: {
  rack: RackData;
  image: string;
  active: number;
  issues: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative bg-card border rounded-xl overflow-hidden shadow-md",
        "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        "active:scale-[0.97] cursor-pointer w-full sm:w-56 text-left"
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img src={image} alt={`Rack ${rack.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-bold text-sm text-foreground">{rack.name}</h3>
        <p className="text-xs text-muted-foreground">
          {rack.switchPorts} portas{rack.hasPatchPanel ? " + Patch Panel" : ""}
        </p>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-600 font-medium">{active} ativas</span>
          {issues > 0 && <span className="text-amber-600 font-medium">{issues} problemas</span>}
        </div>
      </div>
    </button>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-card border rounded-lg p-3 text-center shadow-sm">
      <div className={cn("text-xl font-bold tabular-nums", color || "text-foreground")}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
