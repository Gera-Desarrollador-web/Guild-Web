import React, { useState, useEffect, useMemo, useRef } from "react";
import GuildManager from "./components/GuildManager";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import isEqual from "lodash.isequal";
import { GuildMember, CheckedItems } from "./types";

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
      const guildUrl = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
      const guildRes = await fetch(guildUrl);
      const guildData = await guildRes.json();
      const basicMembers = guildData.guild.members || [];

      const docRef = doc(db, "guilds", guildName);
      const snap = await getDoc(docRef);

      type BossEntry = { name: string; subItems: string[] };

      const emptyData = {
        bosses: [] as BossEntry[],
        quests: [] as string[],
        chares: [] as string[],
        notas: [] as string[],
      };

      const loadedData: Record<
        string,
        { bosses: BossEntry[]; quests: string[]; chares: string[]; notas: string[] }
      > = {};


      let loadedCheckedItems: CheckedItems = {};

      if (snap.exists()) {
        const data = snap.data();
        loadedCheckedItems = data.checkedItems || {};
        const membersFromDb = data.allMembers || [];
        membersFromDb.forEach((m: GuildMember) => {
          if (
            m.data &&
            Array.isArray(m.data.bosses) &&
            Array.isArray(m.data.quests) &&
            Array.isArray(m.data.chares) &&
            Array.isArray(m.data.notas)
          ) {
            // Convert bosses if they're strings
            const bosses: BossEntry[] = m.data.bosses.map((boss: any) => {
              if (typeof boss === "string") {
                return { name: boss, subItems: [] };
              }
              return boss;
            });

            loadedData[m.name] = {
              bosses,
              quests: m.data.quests,
              chares: m.data.chares,
              notas: m.data.notas,
            };
          }
          else {
            loadedData[m.name] = emptyData;
          }
        });
      }

      const detailedMembers = await Promise.all(
        basicMembers.map(async (member: any) => {
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

  // CORRECCIÓN: Validamos claves válidas para evitar error TS7053
  const validSections = ["bosses", "quests", "chares", "notas"] as const;

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
              return (
                item.toLowerCase().includes(filter) &&
                markedItems[item] === true
              );
            }

            if (typeof item === "object" && item.name) {
              const bossName = item.name.toLowerCase();
              const subItems: string[] = item.subItems || [];

              // Boss marcado y coincide con filtro
              const bossMatch =
                bossName.includes(filter) && markedItems[item.name] === true;

              // Subitem marcado y coincide con filtro (usando clave combinada)
              const subMatch = subItems.some((sub) => {
                const subLower = sub.toLowerCase();
                const combinedKey = `${item.name}::${sub}`;
                return (
                  subLower.includes(filter) &&
                  markedItems[combinedKey] === true
                );
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



  return (
    <div className="p-4 max-w-7xl mx-auto ">

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
  );
};

export default App;
