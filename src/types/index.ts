export type BossEntry = {
  name: string;
  subItems: string[];
};

export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
  sex: string;
  status: string;
  deaths?: {
    level: number;
    time: number;
    reason: string;
  }[];
  data?: {
    bosses: BossEntry[];   // Cambia bosses a array de objetos
    quests: BossEntry[];
    chares: string[];
    notas: string[];
  };
  levelHistory?: { date: string; level: number }[]; // <-- aquí el historial de niveles con fechas ISO
  timeZone?: string; 
};

export type CheckedItems = {
  [playerName: string]: {
    bosses?: { [itemOrSubitem: string]: boolean }; // las keys pueden ser "BossName" o "BossName::SubItemName"
    quests?: { [item: string]: boolean };
    chares?: { [item: string]: boolean };
    notas?: { [item: string]: boolean };
  };
};
