import React, { useState, useEffect, useMemo } from "react";
import GuildManager from "./components/GuildManager"; // Ajusta la ruta según tu estructura
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type GuildMember = {
  name: string;
  level: number;
  vocation: string;
  status: string;
  categories: {
    [categoryName: string]: string[];
  };
};

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
    // 1. Obtener miembros de la API
    const url = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
    const res = await fetch(url);
    const data = await res.json();
    const membersFromAPI: GuildMember[] = data.guild.members || [];

    // 2. Obtener categorías y checkedItems desde Firestore
    const docRef = doc(db, "guilds", guildName);
    const snap = await getDoc(docRef);
   let loadedCategories: Record<string, GuildMember["categories"]> = {};
    let loadedCheckedItems: {
  [playerName: string]: {
    [categoryName: string]: {
      [itemName: string]: boolean;
    };
  };
} = {};


    if (snap.exists()) {
      const data = snap.data();
      loadedCategories = data.categoriesData || {};
      loadedCheckedItems = data.checkedItems || {};
    }

    // 3. Fusionar categorías guardadas con miembros de la API
    const membersWithCategories = membersFromAPI.map(member => ({
      ...member,
      categories: loadedCategories[member.name] || {},
    }));

    // 4. Actualizar estados
    setAllMembers(membersWithCategories);
    setCheckedItems(loadedCheckedItems);
    setLoading(false);
  } catch (error) {
    setError("Error al cargar los datos de la guild.");
    setAllMembers([]);
    setCheckedItems({});
    setLoading(false);
  }
};



useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  if (allMembers.length === 0) return;
  saveDataToFirestore(); // Guardar automáticamente cuando cambien
}, [allMembers, checkedItems]);

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
