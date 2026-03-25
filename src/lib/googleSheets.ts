import { SPREADSHEET_ID } from "@/data/centersConfig";

// --- Interfaces ---

export interface PortInfo {
  port: number;
  reference: string;
  status: "ok" | "empty" | "issue";
  switchId?: string;
  patchPanelPort?: string;
}

export interface NetworkDevice {
  id: string;
  type: "SWITCH" | "PATCH_PANEL";
  name: string;
  ports: PortInfo[];
  totalPorts: number;
}

export interface RackData {
  id: string;
  name: string;
  local: string;
  ip: string;
  lastUpdate: string;
  devices: NetworkDevice[];
  ports?: PortInfo[]; 
}

// --- Funções de Tratamento de Dados ---

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Define a cor da porta baseado no texto da planilha
 */
function parseStatus(raw: string): PortInfo["status"] {
  const s = raw.trim().toUpperCase();

  // VERDE: OK
  if (s === "OK") return "ok";

  // AMARELO: X, Problema, Falha ou Cortado
  if (s === "X" || s.includes("PROBLEMA") || s.includes("FALHA") || s.includes("CORTADO")) {
    return "issue";
  }

  // CINZA: Vazio, ***, Inutilizado ou campo em branco
  if (s === "***" || s === "" || s.includes("VAZIO") || s === "INUTILIZADO") {
    return "empty";
  }

  // Padrão: Se tiver texto e não for erro, assume Ativo (Verde)
  return s.length > 0 ? "ok" : "empty";
}

// --- Função Principal de Busca ---

export async function fetchSheetData(gid: string): Promise<RackData> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.split("\n").map(parseCSVLine);

  const devicesByColumn: Map<number, { name: string; ports: PortInfo[] }> = new Map();
  const header = rows[0] || [];

  // 1. Identifica as colunas de Switch/Patch Panel
  const deviceColumnIndices: number[] = [];
  header.forEach((colName, index) => {
    const name = colName.toUpperCase();
    if (name.includes("SWITCH") || name.includes("PATCH") || name.includes("PAINEL")) {
      deviceColumnIndices.push(index);
    }
  });

  // 2. Coleta os dados de cada linha
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    deviceColumnIndices.forEach((colIndex) => {
      const portNum = parseInt(row[colIndex + 1], 10);
      const statusRaw = row[colIndex + 2]?.trim();
      const referenceRaw = row[colIndex - 1]?.trim() || "VAZIO";

      if (!isNaN(portNum)) {
        if (!devicesByColumn.has(colIndex)) {
          devicesByColumn.set(colIndex, { 
            name: header[colIndex] || "Dispositivo", 
            ports: [] 
          });
        }

        const device = devicesByColumn.get(colIndex)!;
        
        // --- AQUI ESTÁ A LÓGICA DE VALIDAÇÃO QUE VOCÊ PEDIU ---
        let finalStatus = parseStatus(statusRaw || "");
        let finalReference = referenceRaw;

        // Se a referência for estrelas ou a palavra VAZIO, força o status para cinza
        if (finalReference === "***" || finalReference.toUpperCase() === "VAZIO") {
          finalStatus = "empty";
        }

        device.ports.push({
          port: portNum,
          reference: finalReference,
          status: finalStatus,
        });
      }
    });
  }

  // 3. Formata os dispositivos para o componente visual
  const devices: NetworkDevice[] = Array.from(devicesByColumn.values()).map((dev) => {
    const maxPort = Math.max(...dev.ports.map(p => p.port));
    // Define layout: se passar de 24, assume padrão de 48/52 portas
    const totalPorts = maxPort > 24 ? 52 : 24;

    return {
      id: dev.name,
      name: dev.name,
      type: dev.name.toUpperCase().includes("PATCH") ? "PATCH_PANEL" : "SWITCH",
      ports: dev.ports.sort((a, b) => a.port - b.port),
      totalPorts: totalPorts
    };
  });

  return {
    id: gid,
    name: rows[7]?.[0] || rows[1]?.[0] || "Rack",
    local: rows[1]?.[0] || "",
    ip: rows[5]?.[0] || "",
    lastUpdate: rows[3]?.[0] || "",
    devices: devices
  };
}