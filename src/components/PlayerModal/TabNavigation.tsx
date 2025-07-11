import React from "react";

const tabs = ["bosses", "quests", "chares", "notas"] as const;
type Tab = typeof tabs[number];

type TabNavigationProps = {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
};

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`
                        px-4 py-2 rounded-md capitalize text-sm sm:text-base
                        transition-colors duration-200 border-2
                        ${
                            activeTab === tab 
                                ? "bg-[#5d3b1e] border-[#c4a97a] text-[#e8d5b5] font-bold"
                                : "bg-[#2d1a0f] border-[#5d3b1e] text-[#c4a97a] hover:bg-[#3a2415]"
                        }
                    `}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};