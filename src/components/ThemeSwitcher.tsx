
import { Sun, Palette, CloudFog } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/Primitives";
import { useState } from "react";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Map themes to labels and icons
    const themes = [
        { id: "dark-colorful", label: "Escuro Colorido", icon: Palette, color: "text-purple-500" },
        { id: "dark-melancholic", label: "Escuro Melancólico", icon: CloudFog, color: "text-slate-400" },
        { id: "light", label: "Claro", icon: Sun, color: "text-yellow-500" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {isOpen && (
                <div
                    className="bg-card border border-border shadow-2xl rounded-xl p-2 mb-2 flex flex-col gap-1 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
                        Escolha o Tema
                    </div>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id as any);
                                setIsOpen(false);
                            }}
                            className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left w-full
                        ${theme === t.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}
                    `}
                        >
                            <t.icon className={`w-4 h-4 ${t.color}`} />
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
            >
                <Palette className="w-6 h-6" />
            </Button>
        </div>
    );
}
