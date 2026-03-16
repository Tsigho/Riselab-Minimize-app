import * as React from "react"
import { X } from "lucide-react"

// --- Button ---
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'destructive', size?: 'sm' | 'md' | 'lg' }>(
    ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            outline: "border border-input bg-background hover:bg-muted text-foreground",
            ghost: "hover:bg-muted text-foreground",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        }
        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
        }
        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

// --- Label ---
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className = "", ...props }, ref) => (
        <label
            ref={ref}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
            {...props}
        />
    )
)
Label.displayName = "Label"

// --- Textarea ---
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"


// --- Switch ---
export const Switch = React.forwardRef<HTMLButtonElement, { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ checked, onCheckedChange, className = "", ...props }, ref) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            ref={ref}
            className={`
                peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                ${checked ? 'bg-primary' : 'bg-input'}
                ${className}
            `}
            {...props}
        >
            <span
                data-state={checked ? 'checked' : 'unchecked'}
                className={`
                    pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform 
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    )
)
Switch.displayName = "Switch"

// --- Dialog (Simple Implementation) ---
export const Dialog = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-50 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background p-6 shadow-lg sm:rounded-xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// --- Card ---
export const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
    <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
        {children}
    </div>
)
// --- Select ---
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className = "", children, ...props }, ref) => (
        <div className="relative">
            <select
                ref={ref}
                className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </div>
        </div>
    )
)
Select.displayName = "Select"

// --- Badge ---
export const Badge = ({ className = "", variant = "default", children, ...props }: { className?: string, variant?: "default" | "secondary" | "outline", children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground border border-input opacity-70",
    }
    return (
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    )
}

// --- Tabs (Simple Implementation) ---
export const Tabs = ({ defaultValue, className, children }: { defaultValue: string, className?: string, children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <div className={className}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
};

export const TabsList = ({ className, children, activeTab, setActiveTab }: any) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
            }
            return child;
        })}
    </div>
);

export const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: any) => (
    <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
            ${activeTab === value ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50 hover:text-foreground'} 
            ${className}`}
        onClick={() => setActiveTab(value)}
    >
        {children}
    </button>
);

export const TabsContent = ({ value, children, className, activeTab }: any) => {
    if (activeTab !== value) return null;
    return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in zoom-in-95 duration-200 ${className}`}>{children}</div>;
};
