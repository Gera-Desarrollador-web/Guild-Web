/**
 * TYPES FOR TIBIA GUILD MANAGEMENT APPLICATION
 * Comprehensive type definitions for guild members, tracking, and API responses
 */

// ==================== BASIC TYPES ====================
export type BossEntry = {
  name: string;
  subItems: string[];
};

export type DeathEntry = {
  level: number;
  time: string; // ISO 8601 format
  reason: string;
};

export type LevelHistoryEntry = {
  date: string; // ISO 8601
  level: number;
};

export type MemberStatus = 'online' | 'offline';

export type Vocation =
  | 'Druid' | 'Elder Druid'
  | 'Sorcerer' | 'Master Sorcerer'
  | 'Paladin' | 'Royal Paladin'
  | 'Knight' | 'Elite Knight'
  | 'None'
  | 'Unknown'; // Añade esto

export type Sex = 'male' | 'female' | 'unknown';

// ==================== DATA STRUCTURES ====================
export type GuildMemberData = {
  bosses?: BossEntry[];
  quests?: BossEntry[];
  chares?: string[];
  notas?: string[];
};

export type CheckedItemsCategory = {
  [itemOrSubitem: string]: boolean;
};

export type PlayerCheckedItems = {
  bosses: CheckedItemsCategory;
  quests: CheckedItemsCategory;
  chares: CheckedItemsCategory;
  notas: CheckedItemsCategory;
};

// ==================== CORE ENTITIES ====================
export type GuildMember = {
  name: string;
  level: number;
  vocation: Vocation;
  sex: Sex;
  status: MemberStatus;
  imageUrl?: string;
  deaths?: DeathEntry[];
  data?: GuildMemberData;
  levelHistory: LevelHistoryEntry[];
  timeZone?: string;
  joinDate: string;
  rank?: string;
  title?: string;
  lastLogin?: string;
};

export type MemberChange = {
  name: string;
  date: string;
  type: 'joined' | 'left' | 'invited';
  level: number;
  vocation: Vocation;
  status: MemberStatus | 'pending' | 'accepted' | 'rejected'; // <-- Añade estos estados
  expiresAt?: string; // Opcional: para manejar expiración
  rank?: string;
  invitedBy?: string;
  previousGuild?: string;
};

// ==================== APPLICATION STATE ====================
export type CheckedItems = {
  [playerName: string]: PlayerCheckedItems;
};

export type GuildStats = {
  totalMembers: number;
  onlineCount: number;
  offlineCount: number;
  newMembers: number;
  departedMembers: number;
  invitesCount: number;
  applicationsOpen: boolean;
  lastUpdated: string;
  weeklyGrowth: number;
};

// ==================== UI & CONFIGURATION ====================
export type Tab = "bosses" | "quests" | "chares" | "notas" | "history";

export type TimeZoneOption = {
  code: string;
  label: string;
  timeZone: string;
  offset: string;
};

export type FilterOptions = {
  showOnlyOnline: boolean;
  minLevel: number;
  maxLevel: number;
  vocationFilter?: Vocation[];
  searchTerm: string;
  activeTab: Tab;
};

// ==================== API RESPONSE TYPES ====================
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
  cache?: {
    expires: string;
    source: 'database' | 'live';
  };
};

export type GuildApiResponse = {
  name: string;
  world: string;
  members: Array<{
    name: string;
    level: number;
    vocation: Vocation;
    status: MemberStatus;
    joined: string;
    rank?: string;
  }>;
  invites: Array<{
    name: string;
    date: string;
    invitedBy: string;
    level?: number;
    status?: 'pending' | 'accepted' | 'rejected'; // Nuevo campo

  }>;
  open_applications: boolean;
  guildhalls?: Array<{
    name: string;
    world: string;
    paid_until: string;
  }>;
};

export type CharacterApiResponse = {
  name: string;
  level: number;
  vocation: Vocation;
  sex: Sex;
  last_login?: string;
  account_status?: string;
  deaths?: DeathEntry[];
  guild?: {
    name: string;
    rank: string;
  };
};

// ==================== EVENT TYPES ====================
export type GuildEvent = {
  id: string;
  type: 'member_joined' | 'member_left' | 'level_up' | 'death';
  playerName: string;
  date: string;
  details: {
    level?: number;
    vocation?: Vocation;
    deathReason?: string;
    invitedBy?: string;
  };
};

// ==================== FIREBASE SCHEMA ====================
export type GuildDocument = {
  name: string;
  world: string;
  members: GuildMember[];
  checkedItems: CheckedItems;
  recentChanges: MemberChange[];
  stats: GuildStats;
  config: {
    timeZone: string;
    requiredLevel: number;
    publicInfo: boolean;
  };
  lastUpdated: string;
};

// ==================== COMPONENT PROPS ====================
export type MemberTableProps = {
  members: GuildMember[];
  checkedItems: CheckedItems;
  onMemberSelect: (member: GuildMember) => void;
  onChangeStatus: (memberName: string, newStatus: MemberStatus) => void;
};

export type MemberChangesProps = {
  changes: MemberChange[];
  onRevertChange?: (changeId: string) => void;
  showFilters?: boolean;
};
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
