import { SPREADSHEET_ID } from "@/data/centersConfig";

export interface PortInfo {
  port: number;
  reference: string;
  status: "ok" | "empty" | "issue";
  switchId?: string;
  patchPanelPort?: string;
}

export interface RackData {
  id: string;
  name: string;
  local: string;
  ip: string;
  rackName: string;
  switchPorts: number;
  hasPatchPanel: boolean;
  patchPanelPorts: number;
  ports: PortInfo[];
  patchPanelData: PortInfo[];
  lastUpdate: string;
}

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

function parseStatus(raw: string): PortInfo["status"] {
  const s = raw.trim().toUpperCase();
  if (s === "OK") return "ok";
  if (s === "***" || s === "" || s.includes("VAZIO") || s === "FALHA" || s === "X") {
     return (s === "FALHA" || s === "X") ? "issue" : "empty";
  }
  return "ok";
}

export async function fetchSheetData(gid: string): Promise<RackData> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());
  const rows = lines.map(parseCSVLine);

  // Metadados (Coluna A)
  let local = rows[1]?.[0] || "";
  let lastUpdate = rows[3]?.[0] || "";
  let ip = rows[5]?.[0] || "";
  let rackName = rows[7]?.[0] || "";

  // Busca de Colunas
  const header = rows[0];
  const refCol = header.findIndex(h => h.toUpperCase().includes("REFERÊNCIA"));
  const portCol = header.findIndex(h => h.toUpperCase().includes("PORTA") || h.toUpperCase().includes("NUN"));
  const statusCol = header.findIndex(h => h.toUpperCase().includes("STATU") || h.toUpperCase().includes("OK"));
  const typeCol = header.findIndex(h => h.toUpperCase().includes("SWITCH") || h.toUpperCase().includes("PATCH"));

  const allPorts: PortInfo[] = [];
  const patchPanelData: PortInfo[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Pula linhas de cabeçalho repetidas no meio da planilha
    if (row[refCol]?.toUpperCase().includes("REFERÊNCIA")) continue;

    const portNum = parseInt(row[portCol], 10);
    if (isNaN(portNum)) continue;

    const reference = row[refCol] || "VAZIO";
    const statusRaw = row[statusCol] || "";
    const deviceType = row[typeCol]?.toUpperCase() || ""; // Pega o texto da Coluna C (SWITCH DE CIMA / DE BAIXO)

    let status = parseStatus(statusRaw);
    if (reference.toUpperCase().includes("VAZIO")) status = "empty";

    const portObj: PortInfo = {
      port: portNum,
      reference: reference === '"""' ? "Repetição" : reference,
      status,
      switchId: deviceType, // Aqui guardamos se é "DE CIMA" ou "DE BAIXO"
    };

    // LOGICA DE DISTRIBUIÇÃO:
    // Se na coluna C (deviceType) aparecer "PATCH", vai para o patchPanelData
    // Caso contrário (se for SWITCH ou qualquer outra coisa), vai para ports
    if (deviceType.includes("PATCH") || deviceType.includes("PTCH")) {
      patchPanelData.push(portObj);
    } else {
      allPorts.push(portObj);
    }
  }

  // Se você tem duas switches de 24, o total de portas é 48 ou 52
  const totalPortsFound = allPorts.length;
  let visualSwitchPorts = 24;
  if (totalPortsFound > 24) visualSwitchPorts = 52; // Ajustado para o seu padrão de 52

  return {
    id: gid,
    name: rackName || local,
    local,
    ip,
    rackName,
    switchPorts: visualSwitchPorts,
    hasPatchPanel: patchPanelData.length > 0,
    patchPanelPorts: patchPanelData.length > 0 ? Math.max(...patchPanelData.map(p => p.port)) : 0,
    ports: allPorts, // Aqui estão as portas da Switch 1 + Switch 2
    patchPanelData: patchPanelData,
    lastUpdate,
  };
}