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
    quests: string[];
    chares: string[];
    notas: string[];
  };
};

export type CheckedItems = {
  [playerName: string]: {
    bosses?: { [itemOrSubitem: string]: boolean }; // las keys pueden ser "BossName" o "BossName::SubItemName"
    quests?: { [item: string]: boolean };
    chares?: { [item: string]: boolean };
    notas?: { [item: string]: boolean };
  };
};
