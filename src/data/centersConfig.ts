import centroOdonto from "@/assets/centro-odonto.jpg";
import centroCcs from "@/assets/centro-ccs.jpg";
import centroCcsa from "@/assets/centro-ccsa.jpg";
import centroCcheClca from "@/assets/centro-cche-clca.jpg";
import centroFisioterapia from "@/assets/centro-fisioterapia.jpg";
import sede from "@/assets/sede.png";

export interface SheetConfig {
  gid: string;
  label: string;
}

export interface CenterConfig {
  id: string;
  name: string;
  description: string;
  image: string;
  sheets: SheetConfig[];
}

export const SPREADSHEET_ID = "1KITKmW1e1PKFJ9KS51zylDxryo6pqY30Qfra8n9yjUQ";

export const centers: CenterConfig[] = [
  {
    id: "odonto",
    name: "Odontologia",
    description: "Faculdade de Odontologia",
    image: centroOdonto,
    sheets: [
      { gid: "143893557", label: "Secretaria" },
      { gid: "978649700", label: "Coordenação" },
      { gid: "746902921", label: "Direção" },
    ],
  },
  {
    id: "ccs",
    name: "CCS",
    description: "Centro de Ciências da Saúde",
    image: centroCcs,
    sheets: [
      { gid: "1204722652", label: "NTI" },
      { gid: "1655472860", label: "Coordenação" },
      { gid: "767634641", label: "Clínica Fisio" },
      { gid: "1087906177", label: "Lab. Informática" },
      { gid: "1399751983", label: "Secretaria" },
      { gid: "1533163405", label: "Lab. Sala 01" },
      { gid: "612549628", label: "Lab. Anatomia" },
    ],
  },
  {
    id: "ccsa",
    name: "CCSA",
    description: "Centro de Ciências Sociais Aplicadas",
    image: centroCcsa,
    sheets: [
      { gid: "789149736", label: "NTI" },
      { gid: "331673426", label: "NEDDIJ" },
      { gid: "174695111", label: "Cozinha" },
      { gid: "539395034", label: "Esc. Modelo" },
      { gid: "362502791", label: "NUMAPE" },
      { gid: "592217742", label: "Redondo" },
      { gid: "1296308199", label: "Permanência" },
      { gid: "1740321488", label: "NUTRAAB" },
    ],
  },
  {
    id: "cche-clca",
    name: "CCHE / CLCA",
    description: "Centro de Ciências Humanas e Educação",
    image: centroCcheClca,
    sheets: [
      { gid: "1420631301", label: "NTI" },
      { gid: "2000761443", label: "Bloco 01 - Sala 01" },
      { gid: "1451969730", label: "Bloco 04" },
      { gid: "2035284198", label: "Biblioteca" },
      { gid: "299908453", label: "NIP" },
      { gid: "1433182245", label: "Bloco 3" },
      { gid: "1847526576", label: "LEPHIS" },
      { gid: "34946942", label: "Lab. Línguas" },
      { gid: "421707565", label: "Protocolo" },
      { gid: "1364729471", label: "PDE" },
    ],
  },
  {
    id: "fisioterapia",
    name: "Fisioterapia",
    description: "Clínica de Fisioterapia",
    image: centroFisioterapia,
    sheets: [
      { gid: "1046557767", label: "Recepção / Arquivo" },
      { gid: "737043596", label: "Corredor Direita" },
      { gid: "1350824137", label: "Corredor Piscina" },
    ],
  },
  {
    id: "sede",
    name: "Sede Administrativa",
    description: "Sede Administrativa Campus Jacarezinho",
    image: sede,
    sheets: [
      { gid: "946111247", label: "NTI" },
      { gid: "1086219491", label: "Sala Nae Atendimento" },
      { gid: "1168579562", label: "Direção" },
      { gid: "1537915055", label: "Sala de Reunião" },
      { gid: "97456296", label: "Patrimônio" },
    ],
  },
];
