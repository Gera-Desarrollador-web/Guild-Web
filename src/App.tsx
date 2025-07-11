import React, { useState, useEffect, useMemo, useRef } from "react";
import GuildManager from "./components/GuildManager";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import isEqual from "lodash.isequal";
import { GuildMember, CheckedItems } from "./types";
import LoginGate from "./components/LoginGate";

type BossEntry = { name: string; subItems: string[] };

const AUTH_KEY = "guildAppAuth";
const AUTH_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

const App: React.FC = () => {
  const guildName = "Twenty Thieves";

  const [allMembers, setAllMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [questFilter, setQuestFilter] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<GuildMember | null>(null);
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [originalCheckedItems, setOriginalCheckedItems] = useState<CheckedItems>({});
  const [skipSaveOnFirstLoad, setSkipSaveOnFirstLoad] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const previousAllMembersRef = useRef<GuildMember[]>([]);

  const saveDataToFirestore = async () => {
    try {
      await setDoc(doc(db, "guilds", guildName), {
        allMembers,
        checkedItems,
      });
      console.log("Datos guardados");
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const guildUrl = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(
        guildName
      )}`;
      const guildRes = await fetch(guildUrl);
      const guildData = await guildRes.json();
      const basicMembers = guildData.guild.members || [];

      const docRef = doc(db, "guilds", guildName);
      const snap = await getDoc(docRef);

      const emptyData = {
        bosses: [] as BossEntry[],
        quests: [] as BossEntry[],
        chares: [] as string[],
        notas: [] as string[],
      };

      const loadedData: Record<string, typeof emptyData> = {};
      let loadedCheckedItems: CheckedItems = {};

      let membersFromDb: GuildMember[] = [];

      if (snap.exists()) {
        const data = snap.data();
        loadedCheckedItems = data.checkedItems || {};
        membersFromDb = data.allMembers || [];

        membersFromDb.forEach((m: GuildMember) => {
          if (
            m.data &&
            Array.isArray(m.data.bosses) &&
            Array.isArray(m.data.quests) &&
            Array.isArray(m.data.chares) &&
            Array.isArray(m.data.notas)
          ) {
            const bosses: BossEntry[] = m.data.bosses.map((boss: any) =>
              typeof boss === "string"
                ? { name: boss, subItems: [] }
                : {
                  name: boss.name ?? "",
                  subItems: Array.isArray(boss.subItems) ? boss.subItems : [],
                }
            );
            const quests: BossEntry[] = m.data.quests.map((quest: any) =>
              typeof quest === "string"
                ? { name: quest, subItems: [] }
                : {
                  name: quest.name ?? "",
                  subItems: Array.isArray(quest.subItems) ? quest.subItems : [],
                }
            );

            loadedData[m.name] = {
              bosses,
              quests,
              chares: m.data.chares,
              notas: m.data.notas,
            };
          } else {
            loadedData[m.name] = emptyData;
          }
        });
      }

      const detailedMembers = await Promise.all(
        basicMembers.map(async (member: any) => {
          const memberFromDb = membersFromDb.find((m) => m.name === member.name);

          try {
            const characterUrl = `https://api.tibiadata.com/v4/character/${encodeURIComponent(
              member.name
            )}`;
            const characterRes = await fetch(characterUrl);
            const characterData = await characterRes.json();
            const char = characterData.character.character;
            const deaths = characterData.character.deaths || [];

            return {
              name: char.name,
              status: member.status,
              level: char.level || member.level,
              vocation: char.vocation || member.vocation,
              sex: char.sex?.toLowerCase() === "female" ? "female" : "male",
              deaths: deaths.map((d: any) => ({
                level: d.level,
                time: d.time,
                reason: d.reason,
              })),
              data: loadedData[member.name] ?? emptyData,
              timeZone: memberFromDb?.timeZone || "America/Mexico_City",
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
              data: loadedData[member.name] ?? emptyData,
              timeZone: memberFromDb?.timeZone || "America/Mexico_City",
            };
          }
        })
      );

      setAllMembers(detailedMembers);
      setCheckedItems(loadedCheckedItems);
      setOriginalCheckedItems(loadedCheckedItems);
      previousAllMembersRef.current = detailedMembers;
    } catch (error) {
      setError("Error al cargar los datos de la guild.");
      setAllMembers([]);
      setCheckedItems({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().then(() => setHasLoadedOnce(true));
  }, []);

  useEffect(() => {
    if (skipSaveOnFirstLoad) {
      setSkipSaveOnFirstLoad(false);
      return;
    }

    if (!hasLoadedOnce || allMembers.length === 0) return;

    const allMembersChanged = !isEqual(allMembers, previousAllMembersRef.current);
    const checkedItemsChanged = !isEqual(checkedItems, originalCheckedItems);

    if (allMembersChanged || checkedItemsChanged) {
      saveDataToFirestore();

      if (allMembersChanged) {
        previousAllMembersRef.current = allMembers;
      }
      if (checkedItemsChanged) {
        setOriginalCheckedItems(checkedItems);
      }
    }
  }, [allMembers, checkedItems, hasLoadedOnce]);

  const filteredMembers = useMemo(() => {
    let members = showOnlyOnline
      ? allMembers.filter((m) => m.status.toLowerCase() === "online")
      : [...allMembers];

    const filter = questFilter.trim().toLowerCase();
    if (filter) {
      members = members.filter((member) => {
        const nameMatches = member.name.toLowerCase().includes(filter);

        const data = member.data || {};
        const checks = checkedItems[member.name] || {};

        const sectionMatches = Object.entries(data).some(([sectionKey, items]) => {
          if (!["bosses", "quests", "chares", "notas"].includes(sectionKey)) return false;

          const section = sectionKey as keyof typeof checks;
          const markedItems = checks[section] || {};

          return (items as any[]).some((item) => {
            if (typeof item === "string") {
              return item.toLowerCase().includes(filter) && markedItems[item] === true;
            }

            if (typeof item === "object" && item.name) {
              const bossName = item.name.toLowerCase();
              const subItems: string[] = item.subItems || [];

              const bossMatch =
                bossName.includes(filter) && markedItems[item.name] === true;

              const subMatch = subItems.some((sub) => {
                const subLower = sub.toLowerCase();
                const combinedKey = `${item.name}::${sub}`;
                return subLower.includes(filter) && markedItems[combinedKey] === true;
              });

              return bossMatch || subMatch;
            }

            return false;
          });
        });

        return nameMatches || sectionMatches;
      });
    }

    members.sort((a, b) => {
      if (sortBy === "level") return b.level - a.level;
      if (sortBy === "vocation") return a.vocation.localeCompare(b.vocation);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.name.localeCompare(b.name);
    });

    return members;
  }, [allMembers, showOnlyOnline, questFilter, sortBy, checkedItems]);

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
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  };

  if (!isAuthenticated) {
    return <LoginGate onAuthenticated={handleAuthenticated} />;
  }
  return (
    <div className="min-h-screen bg-[#1a1008] bg-[url('https://www.tibia.com/images/global/content/background-texture.png')] bg-repeat px-2 py-1 sm:p-4">
      {/* Header optimizado para móviles */}
      <header className="max-w-7xl mx-auto mb-1 sm:mb-4 relative p-0 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Logo con tamaño reducido en móviles */}
         

          {/* Título con tamaño responsivo */}
          <div className="w-full sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:text-center mt-1 sm:mt-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#e8d8b0] font-tibia">
              {guildName}
            </h1>
          </div>

         
        </div>
      </header>

      {/* Contenido principal con espaciado ajustado */}
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
          />
        </div>
      </div>

      {/* Footer con tamaño de texto responsivo */}
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
