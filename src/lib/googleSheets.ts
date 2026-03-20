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
  if (s === "***" || s === "" || s.includes("VAZIO")) return "empty";
  return "issue";
}

export async function fetchSheetData(gid: string): Promise<RackData> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());

  // Parse all lines
  const rows = lines.map(parseCSVLine);

  // Extract metadata from column A (rows 1-7, 0-indexed after header)
  let local = "";
  let lastUpdate = "";
  let ip = "";
  let rackName = "";

  // Row 0 is header, rows 1+ are data
  // Col A metadata pattern: LOCAL_VALUE, "ULTIMA ATUALIZAÇÃO...", date, "IP", ip, "NOME DO RACK", rackName
  if (rows.length > 1) local = rows[1][0] || "";
  if (rows.length > 3) lastUpdate = rows[3][0] || "";
  if (rows.length > 5) ip = rows[5][0] || "";
  if (rows.length > 7) rackName = rows[7][0] || "";

  // Determine column layout from header
  const header = rows[0];
  const refCol = header.findIndex((h) => h.toUpperCase().includes("REFERÊNCIA"));
  const portCol = header.findIndex((h) => h.toUpperCase().includes("NUN_PORTA") || h.toUpperCase().includes("PORTA"));
  const statusCol = header.findIndex((h) => h.toUpperCase().includes("STATUS"));
  const switchCol = header.findIndex((h) => h.toUpperCase().includes("SWITCH"));
  const patchCol = header.findIndex((h) => h.toUpperCase().includes("PATCH") || h.toUpperCase().includes("CABO"));

  const ports: PortInfo[] = [];
  const patchPanelData: PortInfo[] = [];
  let isPatchPanelSection = false;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Detect second header (patch panel section)
    if (row[0]?.toUpperCase().includes("LOCAL") && i > 1) {
      isPatchPanelSection = true;
      continue;
    }

    const portNum = parseInt(row[portCol >= 0 ? portCol : 3], 10);
    if (isNaN(portNum)) continue;

    const reference = row[refCol >= 0 ? refCol : 1] || "VAZIO";
    const switchId = row[switchCol >= 0 ? switchCol : 2] || "";
    const statusRaw = row[statusCol >= 0 ? statusCol : 4] || "";
    const patchPanelPort = !isPatchPanelSection && patchCol >= 0 ? row[patchCol] || "" : "";

    // Determine status
    let status = parseStatus(statusRaw);
    if (reference.toUpperCase() === "VAZIO" && status === "ok") status = "empty";
    if (reference.toUpperCase() === "VAZIO") status = "empty";

    const port: PortInfo = {
      port: portNum,
      reference,
      status,
      switchId,
      ...(patchPanelPort ? { patchPanelPort } : {}),
    };

    if (isPatchPanelSection) {
      patchPanelData.push(port);
    } else {
      ports.push(port);
    }
  }

  // Determine switchPorts from max port number (round up to 24 or 48)
  const maxPort = ports.reduce((m, p) => Math.max(m, p.port), 0);
  const switchPorts = maxPort <= 24 ? 24 : 48;

  return {
    id: gid,
    name: rackName || local,
    local,
    ip,
    rackName,
    switchPorts,
    hasPatchPanel: patchPanelData.length > 0,
    patchPanelPorts: patchPanelData.length > 0 ? Math.max(...patchPanelData.map((p) => p.port), 24) : 0,
    ports,
    patchPanelData,
    lastUpdate,
  };
}
