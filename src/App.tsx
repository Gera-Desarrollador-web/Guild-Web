import React, { useState, useEffect, useMemo } from "react";
import GuildManager from "./components/GuildManager"; // Ajusta la ruta según tu estructura
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import isEqual from "lodash.isequal";
import { GuildMember } from "./types"; 



const App: React.FC = () => {
  const guildName = "Twenty Thieves";

  const [allMembers, setAllMembers] = useState<GuildMember[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [questFilter, setQuestFilter] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<GuildMember | null>(null);
  const [checkedItems, setCheckedItems] = useState<{
    [playerName: string]: {
      [categoryName: string]: {
        [itemName: string]: boolean;
      };
    };
  }>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [originalCategories, setOriginalCategories] = useState<Record<string, GuildMember["categories"]>>({});
  const [originalCheckedItems, setOriginalCheckedItems] = useState<typeof checkedItems>({});
  const [skipSaveOnFirstLoad, setSkipSaveOnFirstLoad] = useState(true);



  const saveDataToFirestore = async () => {
    try {
      const categoriesToSave: any = {};
      allMembers.forEach((member) => {
        categoriesToSave[member.name] = member.categories || {};
      });

      await setDoc(doc(db, "guilds", guildName), {
        categoriesData: categoriesToSave,
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
      // 1. Obtener miembros de la guild
      const guildUrl = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
      const guildRes = await fetch(guildUrl);
      const guildData = await guildRes.json();
      const basicMembers = guildData.guild.members || [];

      // 2. Obtener categorías y checkedItems desde Firestore
      const docRef = doc(db, "guilds", guildName);
      const snap = await getDoc(docRef);
      let loadedCategories: Record<string, GuildMember["categories"]> = {};
      let loadedCheckedItems: typeof checkedItems = {};

      if (snap.exists()) {
        const data = snap.data();
        loadedCategories = data.categoriesData || {};
        loadedCheckedItems = data.checkedItems || {};
      }

      // 3. Obtener detalles individuales por personaje
      const detailedMembers = await Promise.all(
        basicMembers.map(async (member: any) => {
          try {
            const characterUrl = `https://api.tibiadata.com/v4/character/${encodeURIComponent(member.name)}`;
            const characterRes = await fetch(characterUrl);
            const characterData = await characterRes.json();
            const char = characterData.character.character;

            return {
              name: char.name,
              status: member.status,
              level: char.level || member.level,
              vocation: char.vocation || member.vocation,
              sex: char.sex || "unknown", // 👈 aquí añadimos sex
              categories: loadedCategories[member.name] || {},
            };
          } catch (e) {
            console.warn(`Error cargando personaje ${member.name}`, e);
            return {
              ...member,
              sex: "unknown", // fallback si falla
              categories: loadedCategories[member.name] || {},
            };
          }
        })
      );

      // 4. Guardar estado
      setAllMembers(detailedMembers);
      setCheckedItems(loadedCheckedItems);
      setOriginalCategories(loadedCategories);
      setOriginalCheckedItems(loadedCheckedItems);
    } catch (error) {
      setError("Error al cargar los datos de la guild.");
      setAllMembers([]);
      setCheckedItems({});
    } finally {
      setLoading(false);
    }
  };

  function deepEqual(obj1: any, obj2: any): boolean {
    return isEqual(obj1, obj2);
  }


  useEffect(() => {
    if (skipSaveOnFirstLoad) {
      setSkipSaveOnFirstLoad(false);
      return; // 👈 evita guardar justo después de cargar
    }

    if (!hasLoadedOnce || allMembers.length === 0) return;

    const currentCategories = allMembers.reduce((acc, member) => {
      acc[member.name] = member.categories || {};
      return acc;
    }, {} as Record<string, GuildMember["categories"]>);

    const categoriesChanged = !deepEqual(currentCategories, originalCategories);
    const checkedItemsChanged = !deepEqual(checkedItems, originalCheckedItems);

    if (categoriesChanged || checkedItemsChanged) {
      saveDataToFirestore();

      setOriginalCategories(currentCategories);
      setOriginalCheckedItems(checkedItems);
    }
  }, [allMembers, checkedItems, hasLoadedOnce]);


  useEffect(() => {
    loadData().then(() => setHasLoadedOnce(true));
  }, []);


  const filteredMembers = useMemo(() => {
    let members = showOnlyOnline
      ? allMembers.filter((m) => m.status.toLowerCase() === "online")
      : [...allMembers];

    if (questFilter.trim()) {
      const filter = questFilter.toLowerCase();
      members = members.filter((member) => {
        const nameMatches = member.name.toLowerCase().includes(filter);

        const itemsMatch = Object.entries(member.categories || {}).some(
          ([cat, items]) =>
            items.some((item) => {
              const matchesFilter = item.toLowerCase().includes(filter);
              const isChecked = checkedItems[member.name]?.[cat]?.[item] === true;
              return matchesFilter && isChecked;
            })
        );

        return nameMatches || itemsMatch;
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
    <div className="p-4 max-w-7xl mx-auto">

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
