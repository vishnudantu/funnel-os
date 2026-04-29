import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, MoreHorizontal, ArrowUpDown, RefreshCw, Loader2, Plus, X } from 'lucide-react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, SortingState } from '@tanstack/react-table';
import { cn, formatRelativeTime, getSourceColor, formatCurrency } from '../lib/utils';
import { api, type Lead as APILead } from '../lib/api';
import AddLeadModal from '../components/AddLeadModal';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  score: number;
  stage: string;
  lastActivity: Date;
  deal_value?: number | null;
}

const columnHelper = createColumnHelper<Lead>();

export default function LeadsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name<ArrowUpDown size={14} /></button>,
      cell: ({ getValue, row }) => <div><p className="font-medium text-[#0F172A]">{getValue()}</p><p className="text-sm text-slate-500">{row.original.email}</p></div>,
    }),
    columnHelper.accessor('phone', { header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</span>, cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span> }),
    columnHelper.accessor('source', { header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Source</span>, cell: ({ getValue }) => <span className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: getSourceColor(getValue()) }}>{getValue()}</span> }),
    columnHelper.accessor('score', { header: ({ column }) => <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">Score<ArrowUpDown size={14} /></button>, cell: ({ getValue }) => <span className={cn('font-semibold', getValue() >= 80 ? 'text-[#DC2626]' : getValue() >= 60 ? 'text-[#EA580C]' : getValue() >= 40 ? 'text-[#D97706]' : 'text-[#16A34A]')}>{getValue()}</span> }),
    columnHelper.accessor('stage', { header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stage</span>, cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span> }),
    columnHelper.accessor('lastActivity', { header: ({ column }) => <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Activity<ArrowUpDown size={14} /></button>, cell: ({ getValue }) => <span className="text-sm text-slate-500">{formatRelativeTime(getValue())}</span> }),
    columnHelper.display({ id: 'actions', cell: () => <button className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button> }),
  ];
  const loadLeads = async () => {
    try {
      setLoading(true);
      const result = await api.leads.list({
        page: pagination.page,
        limit: pagination.limit,
        search: globalFilter,
        source: selectedSource === 'all' ? undefined : selectedSource,
      });
      const leadsWithScore = result.data.map((lead: APILead) => ({
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
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [pagination.page, pagination.limit, selectedSource]);

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Score', 'Stage', 'Deal Value', 'Last Activity'];
    const csvData = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.source,
      lead.score,
      lead.stage,
      lead.deal_value || 0,
      lead.lastActivity.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const table = useReactTable({ data: leads, columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });

  if (loading && leads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading leads...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Leads</h1>
            <p className="text-sm text-slate-500 mt-1">{pagination.total} total leads</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadLeads} className="btn btn-secondary p-2">
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
            </button>
            <button onClick={() => setShowAddLeadModal(true)} className="btn btn-primary">
              <Plus size={18} />
              <span className="mobile-hide">Add Lead</span>
            </button>
          </div>
        </div>
      </header>
      <div className="p-6 pb-0">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search leads..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('btn btn-secondary', showFilters && 'bg-[#2563EB] text-white')}
            >
              <Filter size={18} />
              <span className="mobile-hide">Filters</span>
            </button>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download size={18} />
              <span className="mobile-hide">Export</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-1.5 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="all">All Sources</option>
                <option value="Manual">Manual</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Import">Import</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedSource('all');
                setShowFilters(false);
              }}
              className="text-sm text-[#2563EB] hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
          <table className="w-full"><thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            {table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} className="px-4 py-3 text-left">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}
          </thead><tbody>{table.getRowModel().rows.map((row) => <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
            {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
          </motion.tr>)}</tbody></table>
        </div>
        <div className="flex items-center justify-between mt-4"><p className="text-sm text-slate-500">Showing {table.getRowModel().rows.length} of {pagination.total} leads</p>
          <div className="flex gap-2"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn btn-secondary px-4 py-2">Previous</button><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn btn-secondary px-4 py-2">Next</button></div></div>
      </div>

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSuccess={loadLeads}
      />
    </div>
  );
}
