import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, ChevronDown, LogOut } from "lucide-react";

export const Header: React.FC = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="px-6 py-4 border-b border-[#2a2a35] sticky top-0 z-30 bg-[#0b0b12]/90 backdrop-blur">
            <div className="max-w-7xl mx-auto flex items-center justify-between">   
                <h1 className="text-2xl font-semibold text-white">GlobeNomad</h1>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-md hover:bg-[#14141c]" aria-label="Settings">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen((open) => !open)}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-[#14141c] text-white transition-all"
                        >
                            <User className="w-5 h-5" />
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-[#15151f] border border-[#2a2a35] rounded-lg shadow-lg"
                            >
                                <div className="py-2">
                                    <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-[#E6E8EB] hover:bg-[#1a1a26] transition-colors">
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </a>
                                    <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-[#E6E8EB] hover:bg-[#1a1a26] transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </a>
                                    <hr className="my-2 border-[#2a2a35]" />
                                    <a href="/login" className="flex items-center gap-2 px-4 py-2 text-[#E6E8EB] hover:bg-[#1a1a26] transition-colors">
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;