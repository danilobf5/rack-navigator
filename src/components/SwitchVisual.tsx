import { useState } from "react";
import type { PortInfo, RackData } from "@/lib/googleSheets";
import { SPREADSHEET_ID } from "@/data/centersConfig";
import { cn } from "@/lib/utils";

interface SwitchVisualProps {
  rack: RackData;
  onBack: () => void;
}

// --- Funções Auxiliares (Mantidas iguais) ---
function portColor(status: PortInfo["status"]) {
  if (status === "ok") return "bg-emerald-500 hover:bg-emerald-400";
  if (status === "issue") return "bg-amber-500 hover:bg-amber-400";
  return "bg-muted-foreground/30 hover:bg-muted-foreground/50";
}

function portRingColor(status: PortInfo["status"]) {
  if (status === "ok") return "ring-emerald-400/60";
  if (status === "issue") return "ring-amber-400/60";
  return "ring-muted-foreground/20";
}

function isLink(ref: string) {
  const lower = ref.toLowerCase();
  return lower.includes("link") || lower.includes("envia");
}

function openSpreadsheetCell(port: PortInfo, rackGid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${rackGid}`;
  window.open(url, "_blank");
}

// --- Componente de Grid de Portas (Ajustado para ser genérico) ---
function PortGrid({ ports, totalPorts, label, rackGid }: { ports: PortInfo[]; totalPorts: number; label: string; rackGid: string }) {
  const [hoveredPort, setHoveredPort] = useState<PortInfo | null>(null);

  const topRow: PortInfo[] = [];
  const bottomRow: PortInfo[] = [];
  
  // Lógica de distribuição das portas em 2 fileiras (Ímpar em cima, Par embaixo)
  for (let i = 1; i <= totalPorts; i++) {
    const p = ports.find((pp) => pp.port === i) || {
      port: i,
      reference: "VAZIO",
      status: "empty" as const,
    };
    if (i % 2 !== 0) topRow.push(p);
    else bottomRow.push(p);
  }

  return (
    <div className="space-y-3 mt-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">{label}</h3>

      {/* Tooltip de Hover */}
      <div className="h-16 flex items-center justify-center">
        {hoveredPort ? (
          <div className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg border",
              hoveredPort.status === "ok" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
              hoveredPort.status === "issue" && "bg-amber-500/10 border-amber-500/30 text-amber-700",
              hoveredPort.status === "empty" && "bg-muted border-border text-muted-foreground"
          )}>
            <span className="font-bold">Porta {hoveredPort.port}</span>
            <span className="mx-2">—</span>
            <span>{hoveredPort.reference}</span>
            {isLink(hoveredPort.reference) && (
              <span className="ml-2 text-xs font-bold text-blue-500">⚡ LINK</span>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground/50 text-sm">Passe o mouse sobre uma porta</p>
        )}
      </div>

      {/* Desenho do Switch/PatchPanel */}
      <div className="bg-primary/95 rounded-xl p-4 shadow-xl border border-primary/80 overflow-x-auto">
        <div className="flex flex-col gap-1.5 min-w-fit">
          {[topRow, bottomRow].map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((p) => (
                <button
                  key={p.port}
                  onMouseEnter={() => setHoveredPort(p)}
                  onMouseLeave={() => setHoveredPort(null)}
                  onClick={() => openSpreadsheetCell(p, rackGid)}
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center",
                    "text-[9px] sm:text-[10px] font-bold text-white",
                    "transition-all duration-150 cursor-pointer ring-1",
                    portColor(p.status),
                    portRingColor(p.status),
                    "active:scale-95",
                    isLink(p.reference) && "ring-2 ring-blue-400 animate-pulse"
                  )}
                  title={`${p.port}: ${p.reference}`}
                >
                  {p.port}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function SwitchVisual({ rack, onBack }: SwitchVisualProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar aos racks
      </button>

      {/* Cabeçalho do Rack */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{rack.name || rack.local}</h2>
        <p className="text-sm text-muted-foreground">
          {rack.ip ? `IP: ${rack.ip} • ` : ""}
          Atualizado em: {rack.lastUpdate}
        </p>
      </div>

      {/* Botão de Acesso ao Switch (se houver IP) */}
      {rack.ip && /^\d+\.\d+\.\d+\.\d+$/.test(rack.ip.trim()) && (
        <div className="flex justify-center">
          <button
            onClick={() => window.open(`http://${rack.ip.trim()}`, "_blank")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Acessar Interface do Switch
          </button>
        </div>
      )}

      {/* --- AQUI ESTÁ A MUDANÇA: LOOP PELOS DISPOSITIVOS --- */}
      {rack.devices.map((device) => (
        <div key={device.id} className="pb-4">
          <PortGrid 
            ports={device.ports} 
            totalPorts={device.totalPorts} 
            label={device.name} 
            rackGid={rack.id} 
          />
          
          {/* Tabela detalhada específica de cada dispositivo logo abaixo dele */}
          <details className="group mt-4">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Ver lista de portas de: {device.name}
            </summary>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Porta</th>
                    <th className="px-3 py-2 text-left">Referência</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {device.ports.map((p) => (
                    <tr key={p.port} className="border-t hover:bg-muted/50">
                      <td className="px-3 py-1.5 font-mono">{p.port}</td>
                      <td className="px-3 py-1.5">{p.reference}</td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={cn(
                          "inline-block w-2 h-2 rounded-full",
                          p.status === "ok" && "bg-emerald-500",
                          p.status === "issue" && "bg-amber-500",
                          p.status === "empty" && "bg-muted-foreground/30"
                        )} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      ))}

      {/* Legenda Geral (Mantida) */}
      <div className="flex gap-4 text-xs text-muted-foreground justify-center pt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Ativo</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Problema</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted-foreground/30" /> Vazio</span>
      </div>
    </div>
  );
}