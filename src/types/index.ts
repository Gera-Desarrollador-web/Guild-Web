export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
   sex: string; 
  status: string;
  categories: {
    [categoryName: string]: string[];
  };
};
