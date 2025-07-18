import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import GuildManager from "./components/GuildManager";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GuildMember, CheckedItems } from "./types";
import LoginGate from "./components/LoginGate";

type BossEntry = { name: string; subItems: string[] };

const AUTH_KEY = "guildAppAuth";
const AUTH_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
const MAX_HISTORY_ENTRIES = 100; // Límite de entradas en el historial

const App: React.FC = () => {
  const guildName = "Twenty Thieves";

  // Estados
  const [allMembers, setAllMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [questFilter, setQuestFilter] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<GuildMember | null>(null);
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [, setOriginalCheckedItems] = useState<CheckedItems>({});
  const [skipSaveOnFirstLoad, setSkipSaveOnFirstLoad] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [levelRange, setLevelRange] = useState<string>("");
  const [minLevel, setMinLevel] = useState<number>(0);
  const [maxLevel, setMaxLevel] = useState<number>(1000);
  const previousAllMembersRef = useRef<GuildMember[]>([]);

  // Función para guardar datos en Firebase
  const saveDataToFirestore = useCallback(async () => {
    try {
      await setDoc(doc(db, "guilds", guildName), {
        allMembers: allMembers.map(member => ({
          ...member,
          levelHistory: member.levelHistory?.slice(-MAX_HISTORY_ENTRIES) || []
        })),
        checkedItems
      }, { merge: true });
      console.log("Datos guardados en Firebase");
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  }, [allMembers, checkedItems, guildName]);

  // Efecto para guardar datos cuando cambian
  useEffect(() => {
    if (skipSaveOnFirstLoad) {
      setSkipSaveOnFirstLoad(false);
      return;
    }

    if (!hasLoadedOnce || allMembers.length === 0) return;

    const timer = setTimeout(() => {
      saveDataToFirestore();
    }, 1000); // Debounce para evitar múltiples guardados

    return () => clearTimeout(timer);
  }, [allMembers, checkedItems, hasLoadedOnce, skipSaveOnFirstLoad, saveDataToFirestore]);

  // Función para cargar datos
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // Cargar datos de la API de Tibia
      const guildUrl = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
      const guildRes = await fetch(guildUrl);
      const guildData = await guildRes.json();
      const basicMembers = guildData.guild.members || [];

      // Cargar datos de Firebase
      const docRef = doc(db, "guilds", guildName);
      const snap = await getDoc(docRef);

      const emptyData = {
        bosses: [] as BossEntry[],
        quests: [] as BossEntry[],
        chares: [] as string[],
        notas: [] as string[],
      };

      let loadedCheckedItems: CheckedItems = {};
      let membersFromDb: GuildMember[] = [];

      if (snap.exists()) {
        const data = snap.data();
        loadedCheckedItems = data.checkedItems || {};
        membersFromDb = data.allMembers || [];
      }

      // Procesar miembros
      const detailedMembers = await Promise.all(
        basicMembers.map(async (member: any) => {
          const memberFromDb = membersFromDb.find((m) => m.name === member.name);
          const currentDate = new Date().toISOString();

          try {
            const characterUrl = `https://api.tibiadata.com/v4/character/${encodeURIComponent(member.name)}`;
            const characterRes = await fetch(characterUrl);
            const characterData = await characterRes.json();
            const char = characterData.character.character;
            const deaths = characterData.character.deaths || [];
            const currentLevel = char.level || member.level;

            // Manejar historial de niveles
            const existingHistory = memberFromDb?.levelHistory?.slice(-MAX_HISTORY_ENTRIES + 1) || [];
            const shouldAddToHistory = existingHistory.length === 0 ||
              existingHistory[existingHistory.length - 1].level !== currentLevel;

            const levelHistory = shouldAddToHistory
              ? [...existingHistory, { date: currentDate, level: currentLevel }]
              : existingHistory;

            return {
              name: char.name,
              status: member.status,
              level: currentLevel,
              vocation: char.vocation || member.vocation,
              sex: char.sex?.toLowerCase() === "female" ? "female" : "male",
              deaths: deaths.map((d: any) => ({
                level: d.level,
                time: d.time,
                reason: d.reason,
              })),
              data: memberFromDb?.data || emptyData,
              timeZone: memberFromDb?.timeZone || "America/Mexico_City",
              levelHistory,
            };
          } catch (e) {
            console.warn(`Error cargando personaje ${member.name}`, e);
            return {
              name: member.name,
              status: member.status,
              level: member.level,
              vocation: member.vocation,
              sex: "unknown",
              deaths: [],
              data: memberFromDb?.data || emptyData,
              timeZone: memberFromDb?.timeZone || "America/Mexico_City",
              levelHistory: memberFromDb?.levelHistory || [{ date: currentDate, level: member.level }],
            };
          }
        })
      );

      setAllMembers(detailedMembers);
      setCheckedItems(loadedCheckedItems);
      setOriginalCheckedItems(loadedCheckedItems);
      previousAllMembersRef.current = detailedMembers;
      setHasLoadedOnce(true);
    } catch (error) {
      setError("Error al cargar los datos de la guild.");
      setAllMembers([]);
      setCheckedItems({});
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const authDataRaw = localStorage.getItem(AUTH_KEY);
    if (authDataRaw) {
      try {
        const authData = JSON.parse(authDataRaw);
        if (authData.timestamp && Date.now() - authData.timestamp < AUTH_DURATION_MS) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ timestamp: Date.now() }));
  };

  // Filtrar miembros
  const filteredMembers = useMemo(() => {
    let members = showOnlyOnline
      ? allMembers.filter((m) => m.status.toLowerCase() === "online")
      : [...allMembers];

    // 1. Filtro por rango de niveles
    members = members.filter(member =>
      member.level >= maxLevel && member.level <= minLevel
    );

    // 2. Ordenar SIEMPRE de mayor a menor nivel después del filtro
    members.sort((a, b) => b.level - a.level);

    // 3. Filtro por búsqueda (quest/nombre)
    const filter = questFilter.trim().toLowerCase();
    if (filter) {
      members = members.filter((member) => {
        const nameMatches = member.name.toLowerCase().includes(filter);
        const data = member.data || {};
        const checks = checkedItems[member.name] || {};

        return nameMatches || Object.entries(data).some(([sectionKey, items]) => {
          if (!["bosses", "quests", "chares", "notas"].includes(sectionKey)) return false;

          const section = sectionKey as keyof typeof checks;
          const markedItems = checks[section] || {};

          return (items as any[]).some((item) => {
            if (typeof item === "string") {
              return item.toLowerCase().includes(filter) && markedItems[item];
            }
            if (typeof item === "object" && item.name) {
              const bossMatch = item.name.toLowerCase().includes(filter) && markedItems[item.name];
              const subMatch = (item.subItems || []).some((sub: string) =>
                sub.toLowerCase().includes(filter) && markedItems[`${item.name}::${sub}`]
              );
              return bossMatch || subMatch;
            }
            return false;
          });
        });
      });
    }

    // 4. Si hay un criterio de ordenamiento adicional (diferente a nivel), aplicarlo
    //    pero manteniendo el orden principal por nivel
    if (sortBy && sortBy !== "level") {
      members.sort((a, b) => {
        // Si tienen el mismo nivel, aplica el orden secundario
        if (a.level === b.level) {
          if (sortBy === "vocation") return a.vocation.localeCompare(b.vocation);
          if (sortBy === "status") return a.status.localeCompare(b.status);

          if (["Druid", "Paladin", "Sorcerer", "Knight", "Monk"].includes(sortBy)) {
            const getPriority = (vocation: string) => {
              switch (sortBy) {
                case "Druid":
                  if (vocation === "Elder Druid") return 1;
                  if (vocation.includes("Druid")) return 2;
                  return 3;
                case "Paladin":
                  if (vocation === "Royal Paladin") return 1;
                  if (vocation.includes("Paladin")) return 2;
                  return 3;
                case "Sorcerer":
                  if (vocation === "Master Sorcerer") return 1;
                  if (vocation.includes("Sorcerer")) return 2;
                  return 3;
                case "Knight":
                  if (vocation === "Elite Knight") return 1;
                  if (vocation.includes("Knight")) return 2;
                  return 3;
                case "Monk":
                  if (vocation === "Exalted Monk") return 1;
                  if (vocation.includes("Monk")) return 2;
                  return 3;
                default:
                  return 3;
              }
            };

            const aPriority = getPriority(a.vocation);
            const bPriority = getPriority(b.vocation);

            if (aPriority !== bPriority) return aPriority - bPriority;
          }
          return a.name.localeCompare(b.name);
        }
        // Si tienen diferente nivel, mantiene el orden por nivel (0 porque ya está ordenado)
        return 0;
      });
    }

    return members;
  }, [allMembers, showOnlyOnline, questFilter, sortBy, checkedItems, minLevel, maxLevel]);

  if (!isAuthenticated) {
    return <LoginGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#1a1008] bg-[url('https://www.tibia.com/images/global/content/background-texture.png')] bg-repeat px-2 py-1 sm:p-4">
      <header className="max-w-7xl mx-auto mb-1 sm:mb-4 relative p-0 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-full sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:text-center mt-1 sm:mt-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#e8d8b0] font-tibia">
              {guildName}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-[#2d1a0f] rounded-xl border-2 border-[#5a2800] shadow-lg overflow-hidden">
          <div className="p-2 sm:p-3 bg-[#5a2800] border-b-2 border-[#3a1800]">
            <h2 className="text-base sm:text-lg font-bold text-[#e8d8b0] font-tibia">Gestión del gremio</h2>
          </div>

          <GuildManager
            allMembers={allMembers}
            setAllMembers={setAllMembers}
            loading={loading}
            error={error}
            showOnlyOnline={showOnlyOnline}
            setShowOnlyOnline={setShowOnlyOnline}
            sortBy={sortBy}
            setSortBy={setSortBy}
            questFilter={questFilter}
            setQuestFilter={setQuestFilter}
            filteredMembers={filteredMembers}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            levelRange={levelRange}
            setLevelRange={setLevelRange}
            minLevel={minLevel}
            setMinLevel={setMinLevel}
            maxLevel={maxLevel}
            setMaxLevel={setMaxLevel}
          />
        </div>
      </div>

      <footer className="max-w-7xl mx-auto mt-2 sm:mt-4 text-center text-[#e8d8b0] text-xs sm:text-sm">
        <div className="border-t-2 border-[#5a2800] pt-2 sm:pt-3">
          <p>© {new Date().getFullYear()} {guildName} Guild Manager</p>
          <p className="mt-0 sm:mt-1">Not affiliated with Tibia or CipSoft GmbH</p>
        </div>
      </footer>
    </div>
  );
};

export default App;