import { useState } from "react";
import type { PortInfo, RackData } from "@/lib/googleSheets";
import { SPREADSHEET_ID } from "@/data/centersConfig";
import { cn } from "@/lib/utils";

interface SwitchVisualProps {
  rack: RackData;
  onBack: () => void;
}

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
  // Open the Google Sheet at the relevant sheet
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${rackGid}`;
  window.open(url, "_blank");
}

function PortGrid({ ports, totalPorts, label, rackGid }: { ports: PortInfo[]; totalPorts: number; label: string; rackGid: string }) {
  const [hoveredPort, setHoveredPort] = useState<PortInfo | null>(null);

  const topRow: PortInfo[] = [];
  const bottomRow: PortInfo[] = [];
  for (let i = 0; i < totalPorts; i++) {
    const p = ports.find((pp) => pp.port === i + 1) || {
      port: i + 1,
      reference: "VAZIO",
      status: "empty" as const,
    };
    if ((i + 1) % 2 !== 0) topRow.push(p);
    else bottomRow.push(p);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</h3>

      <div className="h-16 flex items-center justify-center">
        {hoveredPort ? (
          <div
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "shadow-lg border",
              hoveredPort.status === "ok" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
              hoveredPort.status === "issue" && "bg-amber-500/10 border-amber-500/30 text-amber-700",
              hoveredPort.status === "empty" && "bg-muted border-border text-muted-foreground"
            )}
          >
            <span className="font-bold">Porta {hoveredPort.port}</span>
            <span className="mx-2">—</span>
            <span>{hoveredPort.reference}</span>
            {hoveredPort.patchPanelPort && (
              <span className="ml-2 text-xs opacity-70">(Patch Panel: {hoveredPort.patchPanelPort})</span>
            )}
            {isLink(hoveredPort.reference) && (
              <span className="ml-2 text-xs font-bold text-blue-500">⚡ LINK</span>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground/50 text-sm">Passe o mouse sobre uma porta</p>
        )}
      </div>

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
                    "transition-all duration-150 cursor-pointer",
                    "ring-1",
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

      <div className="flex gap-4 text-xs text-muted-foreground justify-center pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Ativo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Problema
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted-foreground/30 inline-block" /> Vazio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm ring-2 ring-blue-400 bg-emerald-500 inline-block" /> Link
        </span>
      </div>
    </div>
  );
}

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

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{rack.name || rack.local}</h2>
        <p className="text-sm text-muted-foreground">
          Switch {rack.switchPorts} portas
          {rack.hasPatchPanel ? " • Patch Panel" : ""}
          {rack.ip ? ` • IP: ${rack.ip}` : ""}
          <span className="mx-2">•</span>
          Atualizado: {rack.lastUpdate}
        </p>
      </div>

      <PortGrid ports={rack.ports} totalPorts={rack.switchPorts} label="Switch" rackGid={rack.id} />

      {rack.hasPatchPanel && rack.patchPanelData.length > 0 && (
        <PortGrid ports={rack.patchPanelData} totalPorts={rack.patchPanelPorts} label="Patch Panel" rackGid={rack.id} />
      )}

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: "Ativas", value: rack.ports.filter((p) => p.status === "ok").length, color: "text-emerald-600" },
          { label: "Problemas", value: rack.ports.filter((p) => p.status === "issue").length, color: "text-amber-600" },
          { label: "Vazias", value: rack.ports.filter((p) => p.status === "empty").length, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-lg p-3 text-center shadow-sm">
            <div className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Ver tabela completa de portas
        </summary>
        <div className="mt-3 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Porta</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Referência</th>
                {rack.hasPatchPanel && <th className="px-3 py-2 text-left font-medium text-muted-foreground">Patch Panel</th>}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {rack.ports.map((p) => (
                <tr key={p.port} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-1.5 font-mono tabular-nums">{p.port}</td>
                  <td className="px-3 py-1.5">{p.reference}</td>
                  {rack.hasPatchPanel && <td className="px-3 py-1.5 font-mono">{p.patchPanelPort || "—"}</td>}
                  <td className="px-3 py-1.5">
                    <span
                      className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        p.status === "ok" && "bg-emerald-500",
                        p.status === "issue" && "bg-amber-500",
                        p.status === "empty" && "bg-muted-foreground/30"
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
