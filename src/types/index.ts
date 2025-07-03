export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
  status: string;
  categories: {
    [categoryName: string]: string[];
  };
};
