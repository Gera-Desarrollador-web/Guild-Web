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
    bosses: string[];
    quests: string[];
    chares: string[];
    notas: string[];
  };
};



export type CheckedItems = {
  [playerName: string]: {
    bosses?: { [item: string]: boolean };
    quests?: { [item: string]: boolean };
    chares?: { [item: string]: boolean };
    notas?: { [item: string]: boolean };
  };
};
