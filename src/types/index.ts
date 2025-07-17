export type BossEntry = {
  name: string;
  subItems: string[];
};

export type DeathEntry = {
  level: number;
  time: number;
  reason: string;
};

type LevelHistoryEntry = {
  date: string;
  level: number;
};

export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
  sex: string;
  status: string;
  imageUrl?: string;
  deaths?: DeathEntry[];
  data: {  // Quitamos el ? para hacerlo obligatorio
    bosses: BossEntry[];
    quests: BossEntry[];
    chares: string[];
    notas: string[];
  };
  levelHistory: LevelHistoryEntry[]; // Añadir esta línea
  timeZone?: string;

};


export type CheckedItems = {
  [playerName: string]: {
    bosses?: { [itemOrSubitem: string]: boolean };
    quests?: { [itemOrSubitem: string]: boolean };
    chares?: { [item: string]: boolean };
    notas?: { [item: string]: boolean };
  };
};

export type TimeZoneOption = {
  code: string;
  label: string;
  timeZone: string;
};

export type Tab = "bosses" | "quests" | "chares" | "notas";