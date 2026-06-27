"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { apiClient } from '@/api/client';
import { auth } from '@/config/firebase';
import {
  ScrollText, Search, Filter, Shield, LogIn, Database,
  AlertTriangle, ChevronDown, ChevronUp, Loader2, Clock,
  User, FileText, Trash2, Edit3, Plus, RefreshCw
} from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  adminEmail: string;
  collectionName: string;
  docId: string;
  timestamp: string;
  details: Record<string, unknown>;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; category: string }> = {
  ADMIN_LOGIN:          { label: 'Admin Login',         color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: LogIn,          category: 'auth' },
  ADMIN_LOGOUT:         { label: 'Admin Logout',        color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     icon: LogIn,          category: 'auth' },
  CREATE:               { label: 'Created',             color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       icon: Plus,           category: 'database' },
  UPDATE:               { label: 'Updated',             color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     icon: Edit3,          category: 'database' },
  DELETE:               { label: 'Deleted',             color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: Trash2,         category: 'database' },
  RATE_LIMIT_BLOCKED:   { label: 'Rate Limit Blocked',  color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',   icon: Shield,         category: 'security' },
  NEWSLETTER_SUBSCRIBE: { label: 'Newsletter Signup',   color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200',   icon: FileText,       category: 'database' },
  SECURITY_BLOCKED:     { label: 'Security Event',      color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: AlertTriangle,  category: 'security' },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || {
    label: action,
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icon: FileText,
    category: 'other',
  };
}

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string) {
  try {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'auth' | 'database' | 'security'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = (await apiClient.get('system_logs', 500)) as LogEntry[];
      
      // Filter out Developer logs if the current user is not the Developer
      const currentUserEmail = auth.currentUser?.email;
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'developer@forensicbypriyanshi.com';
      
      const visibleLogs = currentUserEmail === adminEmail 
        ? data 
        : data.filter(log => log.adminEmail !== adminEmail);
        
      setLogs(visibleLogs);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
    if (!silent) setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Auto-refresh every 15 seconds when live mode is on
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => fetchLogs(true), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchLogs]);

  // ── Computed Metrics ──
  const metrics = useMemo(() => {
    const total = logs.length;
    const logins = logs.filter(l => l.action === 'ADMIN_LOGIN').length;
    const dbEdits = logs.filter(l => ['CREATE', 'UPDATE', 'DELETE'].includes(l.action)).length;
    const security = logs.filter(l => ['RATE_LIMIT_BLOCKED', 'SECURITY_BLOCKED'].includes(l.action)).length;
    return { total, logins, dbEdits, security };
  }, [logs]);

  // ── Filtered & Searched Logs ──
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (categoryFilter !== 'all') {
      result = result.filter(l => getActionConfig(l.action).category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.adminEmail?.toLowerCase().includes(q) ||
        l.collectionName?.toLowerCase().includes(q) ||
        l.docId?.toLowerCase().includes(q) ||
        JSON.stringify(l.details || {}).toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, categoryFilter, searchQuery]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39] font-display flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#F59F59]" /> Audit Logs
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider ml-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Track all admin activity, database changes, and security events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-3 rounded-xl text-sm font-bold border transition-colors ${
              isLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isLive ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1D1A39] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── METRICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: metrics.total, icon: ScrollText, color: 'text-[#1D1A39]', bg: 'bg-[#1D1A39]/5' },
          { label: 'Admin Logins', value: metrics.logins, icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'DB Operations', value: metrics.dbEdits, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Security Alerts', value: metrics.security, icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#1D1A39] tracking-tight">{card.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, action, collection, or details..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59] font-medium"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-[#1D1A39] focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="auth">🔑 Auth Events</option>
            <option value="database">🗄️ Database Ops</option>
            <option value="security">🛡️ Security Alerts</option>
          </select>
        </div>
      </div>

      {/* ── LOG ENTRIES TABLE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-sm">
              {searchQuery || categoryFilter !== 'all'
                ? 'No logs match your current filter.'
                : 'No audit logs recorded yet. Actions will appear here as they occur.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => {
              const config = getActionConfig(log.action);
              const ActionIcon = config.icon;
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id} className="group">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full text-left p-4 sm:p-5 hover:bg-gray-50/50 transition-colors flex items-center gap-4"
                  >
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl border ${config.bg} flex-shrink-0`}>
                      <ActionIcon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Main Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {log.collectionName && (
                          <span className="text-xs font-bold text-gray-400">
                            on <span className="text-[#1D1A39] font-extrabold">{log.collectionName}</span>
                          </span>
                        )}
                        {log.docId && (
                          <span className="text-xs text-gray-300 font-mono truncate max-w-[120px]" title={log.docId}>
                            #{log.docId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <User className="w-3 h-3" />
                          {log.adminEmail || 'system'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-300 font-medium" title={formatTimestamp(log.timestamp)}>
                          <Clock className="w-3 h-3" />
                          {timeAgo(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 ml-[60px]">
                      <div className="bg-[#1D1A39] rounded-xl p-4 text-xs font-mono text-white/80 overflow-x-auto shadow-inner">
                        <div className="space-y-1">
                          <div><span className="text-[#F59F59] font-bold">Action:</span> {log.action}</div>
                          <div><span className="text-[#F59F59] font-bold">User:</span> {log.adminEmail}</div>
                          <div><span className="text-[#F59F59] font-bold">Collection:</span> {log.collectionName || '—'}</div>
                          <div><span className="text-[#F59F59] font-bold">Document ID:</span> {log.docId || '—'}</div>
                          <div><span className="text-[#F59F59] font-bold">Timestamp:</span> {formatTimestamp(log.timestamp)}</div>
                          <div className="pt-2 border-t border-white/10 mt-2">
                            <span className="text-[#F59F59] font-bold">Details:</span>
                            <pre className="mt-1 text-white/60 whitespace-pre-wrap break-all">
                              {JSON.stringify(log.details || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER NOTE ── */}
      <p className="text-xs text-gray-300 text-center font-medium">
        Showing {filteredLogs.length} of {logs.length} total log entries · Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} {isLive && '· Auto-refreshing every 15s'}
      </p>
    </div>
  );
}
