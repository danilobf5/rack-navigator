import { useState } from "react";
import type { CenterConfig } from "@/data/centersConfig";
import type { RackData } from "@/lib/googleSheets";
import CenterSelection from "@/components/CenterSelection";
import RackOverview from "@/components/RackOverview";
import SwitchVisual from "@/components/SwitchVisual";

export default function Index() {
  const [selectedCenter, setSelectedCenter] = useState<CenterConfig | null>(null);
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {selectedRack ? (
          <SwitchVisual rack={selectedRack} onBack={() => setSelectedRack(null)} />
        ) : selectedCenter ? (
          <RackOverview
            center={selectedCenter}
            onSelectRack={setSelectedRack}
            onBack={() => setSelectedCenter(null)}
          />
        ) : (
          <CenterSelection onSelectCenter={setSelectedCenter} />
        )}
      </div>
    </div>
  );
}
