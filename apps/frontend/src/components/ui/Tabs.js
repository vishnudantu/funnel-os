import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
const TabsContext = createContext(undefined);
function useTabs() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
}
export function Tabs({ value, onValueChange, children, className }) {
    return (_jsx(TabsContext.Provider, { value: { value, onValueChange }, children: _jsx("div", { className: className, children: children }) }));
}
export function TabsList({ children, className }) {
    return (_jsx("div", { className: cn('flex', className), children: children }));
}
export function TabsTrigger({ value, children, className }) {
    const { value: selectedValue, onValueChange } = useTabs();
    const isSelected = value === selectedValue;
    return (_jsx("button", { role: "tab", "data-state": isSelected ? 'active' : 'inactive', onClick: () => onValueChange(value), className: cn(className), children: children }));
}
export function TabsContent({ value, children, className }) {
    const { value: selectedValue } = useTabs();
    if (value !== selectedValue) {
        return null;
    }
    return (_jsx("div", { role: "tabpanel", className: className, children: children }));
}
