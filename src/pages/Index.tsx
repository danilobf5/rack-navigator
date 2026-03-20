import { useState } from "react";
import type { RackData } from "@/data/networkData";
import RackOverview from "@/components/RackOverview";
import SwitchVisual from "@/components/SwitchVisual";

export default function Index() {
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {selectedRack ? (
          <SwitchVisual rack={selectedRack} onBack={() => setSelectedRack(null)} />
        ) : (
          <RackOverview onSelectRack={setSelectedRack} />
        )}
      </div>
    </div>
  );
}
