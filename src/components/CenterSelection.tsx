import { centers, type CenterConfig } from "@/data/centersConfig";
import { cn } from "@/lib/utils";

interface CenterSelectionProps {
  onSelectCenter: (center: CenterConfig) => void;
}

export default function CenterSelection({ onSelectCenter }: CenterSelectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ lineHeight: "1.1" }}
        >
          Centros
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Selecione um centro para visualizar seus racks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {centers.map((center, i) => (
          <button
            key={center.id}
            onClick={() => onSelectCenter(center)}
            className={cn(
              "group relative bg-card border rounded-xl overflow-hidden shadow-md text-left",
              "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
              "active:scale-[0.97] cursor-pointer"
            )}
            style={{
              animationDelay: `${i * 80}ms`,
              animationFillMode: "backwards",
            }}
          >
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={center.image}
                alt={center.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-0.5">
              <h3 className="font-bold text-foreground">{center.name}</h3>
              <p className="text-sm text-muted-foreground">{center.description}</p>
              <p className="text-xs text-muted-foreground/60 pt-1">
                {center.sheets.length} rack{center.sheets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
