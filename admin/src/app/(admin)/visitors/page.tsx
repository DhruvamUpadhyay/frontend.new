"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import {
  Globe, Monitor, Smartphone, Tablet, MapPin, Clock, Eye,
  Search, Filter, RefreshCw, Loader2, ChevronDown, ChevronUp,
  TrendingUp, Users, Compass, BarChart3, AppWindow
} from 'lucide-react';

interface VisitorEntry {
  id: string;
  ip: string;
  page: string;
  referrer: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  geo: { country?: string; region?: string; city?: string; isp?: string };
  timestamp: string;
}

const DEVICE_ICONS: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  } catch { return iso; }
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
  } catch { return ''; }
}

function getTopN(arr: string[], n: number): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  arr.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export default function VisitorAnalyticsPage() {
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVisitors = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const q = query(collection(db, 'visitor_logs'), firestoreLimit(1000));
      const snap = await getDocs(q);
      const items: VisitorEntry[] = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() } as VisitorEntry));
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setVisitors(items);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load visitor data:', err);
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVisitors(); 
  }, [fetchVisitors]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => fetchVisitors(true), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchVisitors]);

  // ── Computed Analytics ──
  const analytics = useMemo(() => {
    const total = visitors.length;
    const uniqueIps = new Set(visitors.map(v => v.ip)).size;

    const today = new Date().toDateString();
    const todayCount = visitors.filter(v => new Date(v.timestamp).toDateString() === today).length;

    const devices = {
      desktop: visitors.filter(v => v.deviceType === 'desktop').length,
      mobile: visitors.filter(v => v.deviceType === 'mobile').length,
      tablet: visitors.filter(v => v.deviceType === 'tablet').length,
    };

    const topPages = getTopN(visitors.map(v => v.page), 5);
    const topCountries = getTopN(visitors.map(v => v.geo?.country).filter(Boolean) as string[], 5);
    const topCities = getTopN(visitors.map(v => v.geo?.city).filter(Boolean) as string[], 5);
    const topBrowsers = getTopN(visitors.map(v => v.browser), 5);
    const topOS = getTopN(visitors.map(v => v.os), 5);

    return { total, uniqueIps, todayCount, devices, topPages, topCountries, topCities, topBrowsers, topOS };
  }, [visitors]);

  // ── Filtered List ──
  const filteredVisitors = useMemo(() => {
    let result = visitors;
    if (deviceFilter !== 'all') {
      result = result.filter(v => v.deviceType === deviceFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.page?.toLowerCase().includes(q) ||
        v.ip?.toLowerCase().includes(q) ||
        v.browser?.toLowerCase().includes(q) ||
        v.geo?.country?.toLowerCase().includes(q) ||
        v.geo?.city?.toLowerCase().includes(q) ||
        v.os?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [visitors, deviceFilter, searchQuery]);

  if (loading && visitors.length === 0) {
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
            <Globe className="w-6 h-6 text-[#F59F59]" /> Visitor Analytics
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider ml-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Real-time visitor tracking with geolocation, device info, and page views.
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
            onClick={() => fetchVisitors()}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1D1A39] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── TOP METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Page Views', value: analytics.total, icon: Eye, color: 'text-[#1D1A39]', bg: 'bg-[#1D1A39]/5' },
          { label: 'Unique Visitors', value: analytics.uniqueIps, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Today\'s Views', value: analytics.todayCount, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Mobile Traffic', value: `${analytics.total > 0 ? Math.round((analytics.devices.mobile / analytics.total) * 100) : 0}%`, icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* ── ANALYTICS BREAKDOWNS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <BreakdownCard title="Top Pages" icon={Compass} items={analytics.topPages} total={analytics.total} color="text-blue-600" bg="bg-blue-50" />

        {/* Top Countries */}
        <BreakdownCard title="Top Countries" icon={MapPin} items={analytics.topCountries} total={analytics.total} color="text-emerald-600" bg="bg-emerald-50" />

        {/* Top Cities */}
        <BreakdownCard title="Top Cities" icon={MapPin} items={analytics.topCities} total={analytics.total} color="text-amber-600" bg="bg-amber-50" />

        {/* Top Browsers */}
        <BreakdownCard title="Browsers" icon={AppWindow} items={analytics.topBrowsers} total={analytics.total} color="text-purple-600" bg="bg-purple-50" />

        {/* Top OS */}
        <BreakdownCard title="Operating Systems" icon={Monitor} items={analytics.topOS} total={analytics.total} color="text-rose-600" bg="bg-rose-50" />

        {/* Device Split */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#F59F59]" /> Device Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Desktop', count: analytics.devices.desktop, icon: Monitor, color: 'bg-blue-500' },
              { label: 'Mobile', count: analytics.devices.mobile, icon: Smartphone, color: 'bg-purple-500' },
              { label: 'Tablet', count: analytics.devices.tablet, icon: Tablet, color: 'bg-amber-500' },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-[#1D1A39] flex items-center gap-2">
                    <d.icon className="w-3.5 h-3.5 text-gray-400" /> {d.label}
                  </span>
                  <span className="text-xs font-extrabold text-gray-400">{d.count} ({analytics.total > 0 ? Math.round((d.count / analytics.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-500`} style={{ width: `${analytics.total > 0 ? (d.count / analytics.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by page, IP, country, city, browser..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59] font-medium"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value as any)}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-[#1D1A39] focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59] cursor-pointer"
          >
            <option value="all">All Devices</option>
            <option value="desktop">🖥️ Desktop</option>
            <option value="mobile">📱 Mobile</option>
            <option value="tablet">📱 Tablet</option>
          </select>
        </div>
      </div>

      {/* ── VISITOR LOG TABLE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredVisitors.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-sm">
              {searchQuery || deviceFilter !== 'all'
                ? 'No visitors match your current filter.'
                : 'No visitor data yet. Views will appear here as visitors browse your site.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredVisitors.slice(0, 100).map((v) => {
              const DeviceIcon = DEVICE_ICONS[v.deviceType] || Monitor;
              const isExpanded = expandedId === v.id;
              const locationParts = [v.geo?.city, v.geo?.region, v.geo?.country].filter(Boolean);
              const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

              return (
                <div key={v.id} className="group">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    className="w-full text-left p-4 sm:p-5 hover:bg-gray-50/50 transition-colors flex items-center gap-4"
                  >
                    {/* Device Icon */}
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0">
                      <DeviceIcon className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#1D1A39] truncate max-w-[200px]">{v.page}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-500">
                          {v.browser}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-500">
                          {v.os}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <MapPin className="w-3 h-3" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-300 font-medium" title={formatTimestamp(v.timestamp)}>
                          <Clock className="w-3 h-3" />
                          {timeAgo(v.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Expand */}
                    <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 ml-[60px]">
                      <div className="bg-[#1D1A39] rounded-xl p-4 text-xs font-mono text-white/80 overflow-x-auto shadow-inner space-y-1">
                        <div><span className="text-[#F59F59] font-bold">IP:</span> {v.ip}</div>
                        <div><span className="text-[#F59F59] font-bold">Page:</span> {v.page}</div>
                        <div><span className="text-[#F59F59] font-bold">Referrer:</span> {v.referrer || '(direct)'}</div>
                        <div><span className="text-[#F59F59] font-bold">Device:</span> {v.deviceType} — {v.browser} on {v.os}</div>
                        <div><span className="text-[#F59F59] font-bold">Screen:</span> {v.screenWidth}×{v.screenHeight}</div>
                        <div><span className="text-[#F59F59] font-bold">Location:</span> {location}</div>
                        {v.geo?.isp && <div><span className="text-[#F59F59] font-bold">ISP:</span> {v.geo.isp}</div>}
                        <div><span className="text-[#F59F59] font-bold">Timestamp:</span> {formatTimestamp(v.timestamp)}</div>
                        <div className="pt-2 border-t border-white/10 mt-2">
                          <span className="text-[#F59F59] font-bold">User Agent:</span>
                          <pre className="mt-1 text-white/50 whitespace-pre-wrap break-all text-[10px]">{v.userAgent}</pre>
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

      <p className="text-xs text-gray-300 text-center font-medium">
        Showing {Math.min(filteredVisitors.length, 100)} of {filteredVisitors.length} visitor records · Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} {isLive && '· Auto-refreshing every 15s'}
      </p>
    </div>
  );
}

// ── Reusable Breakdown Card ──
function BreakdownCard({
  title, icon: Icon, items, total, color, bg,
}: {
  title: string; icon: React.ElementType; items: { name: string; count: number }[];
  total: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#F59F59]" /> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-300 italic">No data yet</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#1D1A39] truncate max-w-[140px]" title={item.name}>{item.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bg} rounded-full`} style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }} />
                </div>
                <span className="text-[11px] font-extrabold text-gray-400 w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
