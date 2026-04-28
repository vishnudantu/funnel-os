import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, MoreHorizontal, ArrowUpDown, RefreshCw, Loader2 } from 'lucide-react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { cn, formatRelativeTime, getSourceColor } from '../lib/utils';
import { api } from '../lib/api';
const columnHelper = createColumnHelper();
export default function LeadsPage() {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => _jsxs("button", { onClick: () => column.toggleSorting(), className: "flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider", children: ["Name", _jsx(ArrowUpDown, { size: 14 })] }),
            cell: ({ getValue, row }) => _jsxs("div", { children: [_jsx("p", { className: "font-medium text-[#0F172A]", children: getValue() }), _jsx("p", { className: "text-sm text-slate-500", children: row.original.email })] }),
        }),
        columnHelper.accessor('phone', { header: () => _jsx("span", { className: "text-xs font-semibold text-slate-600 uppercase tracking-wider", children: "Phone" }), cell: ({ getValue }) => _jsx("span", { className: "text-slate-600", children: getValue() }) }),
        columnHelper.accessor('source', { header: () => _jsx("span", { className: "text-xs font-semibold text-slate-600 uppercase tracking-wider", children: "Source" }), cell: ({ getValue }) => _jsx("span", { className: "text-xs px-2 py-1 rounded-full text-white font-medium", style: { backgroundColor: getSourceColor(getValue()) }, children: getValue() }) }),
        columnHelper.accessor('score', { header: ({ column }) => _jsxs("button", { onClick: () => column.toggleSorting(), className: "flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider", children: ["Score", _jsx(ArrowUpDown, { size: 14 })] }), cell: ({ getValue }) => _jsx("span", { className: cn('font-semibold', getValue() >= 80 ? 'text-[#DC2626]' : getValue() >= 60 ? 'text-[#EA580C]' : getValue() >= 40 ? 'text-[#D97706]' : 'text-[#16A34A]'), children: getValue() }) }),
        columnHelper.accessor('stage', { header: () => _jsx("span", { className: "text-xs font-semibold text-slate-600 uppercase tracking-wider", children: "Stage" }), cell: ({ getValue }) => _jsx("span", { className: "text-slate-600", children: getValue() }) }),
        columnHelper.accessor('lastActivity', { header: ({ column }) => _jsxs("button", { onClick: () => column.toggleSorting(), className: "flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider", children: ["Last Activity", _jsx(ArrowUpDown, { size: 14 })] }), cell: ({ getValue }) => _jsx("span", { className: "text-sm text-slate-500", children: formatRelativeTime(getValue()) }) }),
        columnHelper.display({ id: 'actions', cell: () => _jsx("button", { className: "p-1 text-slate-400 hover:text-slate-600", children: _jsx(MoreHorizontal, { size: 18 }) }) }),
    ];
    const loadLeads = async () => {
        try {
            setLoading(true);
            const result = await api.leads.list({ page: pagination.page, limit: pagination.limit, search: globalFilter });
            const leadsWithScore = result.data.map((lead) => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                source: lead.source,
                score: lead.ai_score?.score || 0,
                stage: 'New Lead',
                lastActivity: new Date(lead.created_at),
                deal_value: lead.deal_value,
            }));
            setLeads(leadsWithScore);
            setPagination(prev => ({ ...prev, total: result.pagination.total }));
        }
        catch (error) {
            console.error('Failed to load leads:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadLeads();
    }, [pagination.page, pagination.limit]);
    const table = useReactTable({ data: leads, columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
    if (loading && leads.length === 0) {
        return (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-3 text-slate-500", children: [_jsx(Loader2, { className: "animate-spin", size: 20 }), "Loading leads..."] }) }));
    }
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsx("header", { className: "px-6 py-4 border-b border-[#E2E8F0] bg-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0F172A]", children: "Leads" }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: [pagination.total, " total leads"] })] }), _jsx("button", { onClick: loadLeads, className: "btn btn-secondary p-2", children: _jsx(RefreshCw, { size: 18, className: cn(loading && 'animate-spin') }) })] }) }), _jsx("div", { className: "p-6 pb-0", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 20 }), _jsx("input", { type: "text", placeholder: "Search leads...", value: globalFilter, onChange: (e) => setGlobalFilter(e.target.value), onKeyDown: (e) => e.key === 'Enter' && loadLeads(), className: "w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn btn-secondary", children: [_jsx(Filter, { size: 18 }), _jsx("span", { className: "mobile-hide", children: "Filters" })] }), _jsxs("button", { className: "btn btn-secondary", children: [_jsx(Download, { size: 18 }), _jsx("span", { className: "mobile-hide", children: "Export" })] })] })] }) }), _jsxs("div", { className: "flex-1 overflow-auto px-6 pb-6", children: [_jsx("div", { className: "bg-white rounded-lg border border-[#E2E8F0] overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#F8FAFC] border-b border-[#E2E8F0]", children: table.getHeaderGroups().map((headerGroup) => _jsx("tr", { children: headerGroup.headers.map((header) => _jsx("th", { className: "px-4 py-3 text-left", children: flexRender(header.column.columnDef.header, header.getContext()) }, header.id)) }, headerGroup.id)) }), _jsx("tbody", { children: table.getRowModel().rows.map((row) => _jsx(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors", children: row.getVisibleCells().map((cell) => _jsx("td", { className: "px-4 py-3", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) })] }) }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("p", { className: "text-sm text-slate-500", children: ["Showing ", table.getRowModel().rows.length, " of ", pagination.total, " leads"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), className: "btn btn-secondary px-4 py-2", children: "Previous" }), _jsx("button", { onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), className: "btn btn-secondary px-4 py-2", children: "Next" })] })] })] })] }));
}
