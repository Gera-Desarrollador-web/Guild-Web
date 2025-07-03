type DeathEntry = {
  level: number;
  time: string;
  reason: string;
};

export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
  status: string;
  sex: "male" | "female";
  deaths?: DeathEntry[];
  categories?: {
    [categoryName: string]: string[];
  };
};