import { useState, useEffect } from "react";
import type { CenterConfig } from "@/data/centersConfig";
import { fetchSheetData, type RackData } from "@/lib/googleSheets";
import { cn } from "@/lib/utils";
import rackSecretaria from "@/assets/rack-secretaria.jpeg";
import rackCoordenacao from "@/assets/rack-coordenacao.jpeg";
import rackDirecao from "@/assets/rack-direcao.jpeg";

//ccs
import nitccs from "@/assets/nti-css.jpg";
import coordenacao from "@/assets/coordenacao-ccs.jpg";
import clinicafisiocss from "@/assets/clinica-fisio-ccs.jpg";
import labinfo from "@/assets/lab-info-ccs.jpg";
import secretatia from "@/assets/secretaria-css.jpg";
import sala1 from "@/assets/LabSala01.jpg"
//import anatomia from "@/assets/"

//ccsa 
import nticcsa from "@/assets/nti-ccsa.jpg";
import nedji from "@/assets/neddij.jpg";
import cozinha from "@/assets/cozinha-ccsa.jpg";
import escmodelo from "@/assets/escritoriomodelo-cssa.jpg";
import numape from "@/assets/numape-ccsa.jpg"
import redondo from "@/assets/redondo-ccsa.jpg";
import permanencia from "@/assets/permanencia.jpg";
import nutrab from "@/assets/nutrab-ccsa.jpg";


//cche - clca

import nticche from "@/assets/nti-cche.jpg";
import sala1bloco1 from "@/assets/sala01-cche.jpg";
import bloco4 from "@/assets/bloco4-cche.jpg";
import biblioteca from "@/assets/bibliotecacche.jpg";
import nip from "@/assets/nip-cche.jpg";
import bloco3 from "@/assets/bloco3-cche.jpg";
import lephis from "@/assets/lephis-cche.jpg";
import lablinguas from "@/assets/labdelinguas-cche.jpg";
import protocolo from "@/assets/protocolo-cche.jpg";
import pde from "@/assets/pde-cche.jpg";


 //fisio nova adicionar 

// Rack images only available for Odonto currently
const rackImages: Record<string, string> = {
  //odonto
  "143893557": rackSecretaria,
  "978649700": rackCoordenacao,
  "746902921": rackDirecao,
//ccs
  "1204722652": nitccs,
  "1655472860": coordenacao,
  "767634641": clinicafisiocss,
  "1087906177": labinfo,
  "1399751983": secretatia,
  "1533163405": sala1,
//ccsa
  "789149736": nticcsa,
  "331673426": nedji,
  "174695111": cozinha,
  "539395034": escmodelo,
  "362502791": numape,
  "592217742": redondo,
  "1296308199": permanencia,
  "1740321488": nutrab,
//cche
  "1420631301": nticche,
  "2000761443": sala1bloco1,
  "1451969730": bloco4,
  "2035284198" : biblioteca,
  "299908453": nip,
  "1433182245" : bloco3,
  "1847526576" : lephis,
  "34946942": lablinguas,
  "421707565": protocolo,
  "1364729471": pde

  //fisioterapia

};

interface RackOverviewProps {
  center: CenterConfig;
  onSelectRack: (rack: RackData) => void;
  onBack: () => void;
}

export default function RackOverview({ center, onSelectRack, onBack }: RackOverviewProps) {
  const [racks, setRacks] = useState<RackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(center.sheets.map((s) => fetchSheetData(s.gid)))
      .then((data) => {
        if (!cancelled) {
          // Use sheet labels as fallback names
          const named = data.map((r, i) => ({
            ...r,
            name: r.name || r.local || center.sheets[i].label,
          }));
          setRacks(named);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError("Erro ao carregar dados da planilha");
          setLoading(false);
          console.error(err);
        }
      });

    return () => { cancelled = true; };
  }, [center]);

  const activeCount = (r: RackData) => r.ports.filter((p) => p.status === "ok").length;
  const issueCount = (r: RackData) => r.ports.filter((p) => p.status === "issue").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar aos centros
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
          {center.name}
        </h1>
        <p className="text-muted-foreground text-sm">{center.description}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {center.sheets.map((s) => (
            <div key={s.gid} className="bg-card border rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {racks.map((rack, i) => (
              <RackCard
                key={rack.id}
                rack={rack}
                label={center.sheets[i]?.label || rack.name}
                image={rackImages[rack.id]}
                active={activeCount(rack)}
                issues={issueCount(rack)}
                onClick={() => onSelectRack(rack)}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <SummaryCard label="Total Portas" value={racks.reduce((s, r) => s + r.ports.length, 0)} />
            <SummaryCard label="Ativas" value={racks.reduce((s, r) => s + activeCount(r), 0)} color="text-emerald-600" />
            <SummaryCard label="Problemas" value={racks.reduce((s, r) => s + issueCount(r), 0)} color="text-amber-600" />
          </div>
        </>
      )}
    </div>
  );
}

function RackCard({
  rack,
  label,
  image,
  active,
  issues,
  onClick,
}: {
  rack: RackData;
  label: string;
  image?: string;
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
        "active:scale-[0.97] cursor-pointer w-full text-left"
      )}
    >
      {image ? (
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-muted flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <line x1="2" y1="8" x2="22" y2="8" />
            <line x1="2" y1="14" x2="22" y2="14" />
            <circle cx="6" cy="5" r="1" fill="currentColor" />
            <circle cx="6" cy="11" r="1" fill="currentColor" />
            <circle cx="6" cy="17" r="1" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="p-3 space-y-1.5">
        <h3 className="font-bold text-sm text-foreground">{label}</h3>
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
