import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck, CheckCircle2, Clock, XCircle, Search, ChevronDown,
  RotateCcw, Eye, AlertCircle, X, MapPin,
} from 'lucide-react';

import { getSellingInspectionsSummary, getSellingInspectionsList, getSellingInspectionDetails } from '../../Services/user.services';
import './InspectionsResponsive.css';

// Mock data removed.

const STATUS_CONFIG = {
  Completed: { bg: '#DCFCE7', color: '#166534', icon: CheckCircle2 },
  Scheduled: { bg: '#EEF2FF', color: '#4338CA', icon: Clock },
  Pending:   { bg: '#FFF7ED', color: '#92400E', icon: Clock },
};

const RESULT_CONFIG = {
  Passed: { bg: '#DCFCE7', color: '#166534' },
  Failed: { bg: '#FEF2F2', color: '#991B1B' },
};

const TYPE_COLORS = {
  House: { bg: '#E8F4F1', color: '#1D6A4A' },
  Apartment: { bg: '#EEF2FF', color: '#4F46E5' },
  Commercial: { bg: '#FEF3C7', color: '#92400E' },
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (item?.inspection_id) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getSellingInspectionDetails(item.inspection_id);
          if (isMounted) {
            setDetails(res?.data?.data || res?.data || null);
          }
        } catch (err) {
          console.error('Failed to load inspection details:', err);
          if (isMounted) setError('Unable to load inspection details.');
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchDetails();
    }
    return () => { isMounted = false; };
  }, [item]);

  if (!item) return null;

  const displayData = details || item;
  const sc = STATUS_CONFIG[displayData.inspection_status] || STATUS_CONFIG.Pending;
  const StatusIcon = sc.icon;
  const rc = displayData.inspection_result ? RESULT_CONFIG[displayData.inspection_result] : null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div className="responsive-modal" style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>Inspection Details</h3>
          <button style={S.closeBtn} onClick={onClose}><X size={18} color="#374151" /></button>
        </div>
        <div style={S.modalBody}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading details...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#991B1B' }}>{error}</div>
          ) : !details ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Details not available</div>
          ) : (
            <>
              <img src={displayData.property_image || 'https://placehold.co/440x140/e2e8f0/94a3b8?text=PPC'} alt={displayData.property_title} style={S.modalImg}
                onError={(e) => { e.target.src = 'https://placehold.co/440x140/e2e8f0/94a3b8?text=PPC'; }} />
              <div style={S.modalGrid}>
                <Row label="Inspection ID" val={`#INS-${displayData.inspection_id}`} />
                <Row label="Property" val={displayData.property_title} />
                <Row label="Type" val={displayData.property_type || 'N/A'} />
                <Row label="Location" val={displayData.location} />
                <div style={S.modalRow}>
                  <span style={S.modalKey}>Status</span>
                  <span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} /> {displayData.inspection_status || 'Pending'}</span>
                </div>
                {displayData.inspection_result && (
                  <div style={S.modalRow}>
                    <span style={S.modalKey}>Result</span>
                    <span style={{ ...S.badge, background: rc.bg, color: rc.color }}>{displayData.inspection_result}</span>
                  </div>
                )}
                {displayData.scheduled_at && <Row label="Scheduled Date" val={new Date(displayData.scheduled_at).toLocaleDateString()} />}
                {displayData.completed_at && <Row label="Completed Date" val={new Date(displayData.completed_at).toLocaleDateString()} />}
                <Row label="Last Updated" val={new Date(displayData.last_updated || displayData.completed_at || displayData.scheduled_at || Date.now()).toLocaleDateString()} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, val }) => (
  <div style={S.modalRow}>
    <span style={S.modalKey}>{label}</span>
    <span style={S.modalVal}>{val}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const OwnerInspections = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const [inspections, setInspections] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchList = async () => {
      try {
        setLoadingList(true);
        const params = {
          page,
          limit: PER_PAGE,
        };
        if (search) params.search = search;
        if (statusFilter !== 'All Status') params.status = statusFilter;
        
        const res = await getSellingInspectionsList(params);
        if (isMounted) {
          const payload = res?.data?.data || res?.data || [];
          setInspections(payload);
          const pagin = res?.data?.pagination || {};
          setTotalRecords(pagin.total || 0);
          setListError(null);
        }
      } catch (err) {
        console.error('Failed to load inspections list:', err);
        if (isMounted) setListError('Unable to load inspection records.');
      } finally {
        if (isMounted) setLoadingList(false);
      }
    };
    fetchList();
    return () => { isMounted = false; };
  }, [page, search, statusFilter]);

  const totalPages = Math.ceil(totalRecords / PER_PAGE);

  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const res = await getSellingInspectionsSummary();
        if (isMounted) {
          const payload = res?.data?.data || res?.data || {};
          setSummaryData(payload);
          setSummaryError(null);
        }
      } catch (err) {
        console.error('Failed to load inspections summary:', err);
        if (isMounted) setSummaryError('Unable to load summary.');
      } finally {
        if (isMounted) setLoadingSummary(false);
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, []);

  const total = summaryData?.total_inspections || 0;
  const completed = summaryData?.completed || 0;
  const scheduled = summaryData?.scheduled || 0;
  const pending = summaryData?.pending_assignment || 0;

  return (
    <div className="responsive-page" style={S.page}>
      <div className="responsive-header" style={S.pageHeader}>
        <h1 style={S.pageTitle}>Inspections</h1>
        <p style={S.pageSub}>View inspection records for your properties managed by PPC.</p>
      </div>

      {/* Cards */}
      {summaryError ? (
        <div style={{ color: 'red', margin: '10px 0' }}>{summaryError}</div>
      ) : (
        <div className="responsive-cards" style={S.cards}>
          {[
            { label: 'Total Inspections', sub: 'All inspection records', val: loadingSummary ? '...' : total, icon: ClipboardCheck, bg: '#E8F4F1', color: '#1D6A4A' },
            { label: 'Completed', sub: 'Inspection finalised', val: loadingSummary ? '...' : completed, icon: CheckCircle2, bg: '#DCFCE7', color: '#166534' },
            { label: 'Scheduled', sub: 'Upcoming inspections', val: loadingSummary ? '...' : scheduled, icon: Clock, bg: '#EEF2FF', color: '#4338CA' },
            { label: 'Pending Assignment', sub: 'Not yet scheduled', val: loadingSummary ? '...' : pending, icon: AlertCircle, bg: '#FFF7ED', color: '#D97706' },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} style={S.card}>
                <div style={{ ...S.cardIcon, background: c.bg }}><Icon size={22} color={c.color} /></div>
                <div>
                  <div style={S.cardVal}>{c.val}</div>
                  <div style={S.cardLabel}>{c.label}</div>
                  <div style={S.cardSub}>{c.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="responsive-filter-bar" style={S.filterBar}>
        <div style={S.searchBox}>
          <Search size={15} color="#9CA3AF" />
          <input style={S.searchInput} placeholder="Search by property title, ID or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Inspection Status</span>
          <div style={S.selectWrap}>
            <select style={S.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Completed</option>
              <option>Scheduled</option>
              <option>Pending</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={S.chevron} />
          </div>
        </div>
        <button style={S.clearBtn} onClick={() => { setSearch(''); setStatusFilter('All Status'); setPage(1); }}>
          <RotateCcw size={13} /> Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="responsive-table-wrap" style={S.tableWrap}>
        {loadingList ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Loading inspection records...</div>
        ) : listError ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#991B1B' }}>{listError}</div>
        ) : inspections.length === 0 ? (
          <div style={S.emptyState}>
            <AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} />
            <p style={S.emptyTitle}>No matching inspection records found</p>
          </div>
        ) : (
          <>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  {['Property', 'Inspection ID', 'Type', 'Location', 'Status', 'Result', 'Scheduled Date', 'Completed Date', 'Action'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.map((p, i) => {
                  const sc = STATUS_CONFIG[p.inspection_status] || STATUS_CONFIG.Pending;
                  const StatusIcon = sc.icon;
                  const rc = p.inspection_result ? RESULT_CONFIG[p.inspection_result] : null;
                  const tc = TYPE_COLORS[p.property_type] || { bg: '#F3F4F6', color: '#374151' };
                  return (
                    <tr key={p.inspection_id} style={{ ...S.tr, background: i % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
                      <td style={S.td}>
                        <div style={S.propCell}>
                          <img src={p.image || 'https://placehold.co/60x48/e2e8f0/94a3b8?text=PPC'} alt={p.property_title} style={S.propImg}
                            onError={(e) => { e.target.src = 'https://placehold.co/60x48/e2e8f0/94a3b8?text=PPC'; }} />
                          <div>
                            <div style={S.propName}>{p.property_title}</div>
                            <div style={S.propLoc}>{p.address}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}><span style={S.ppcId}>{`#INS-${p.inspection_id}`}</span></td>
                      <td style={S.td}><span style={{ ...S.typeBadge, background: tc.bg, color: tc.color }}>{p.property_type || 'N/A'}</span></td>
                      <td style={S.td}><span style={S.cityTxt}>{p.city}</span></td>
                      <td style={S.td}><span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} /> {p.inspection_status || 'Pending'}</span></td>
                      <td style={S.td}>
                        {p.inspection_result ? (
                          <span style={{ ...S.badge, background: rc.bg, color: rc.color }}>{p.inspection_result}</span>
                        ) : <span style={S.naText}>—</span>}
                      </td>
                      <td style={S.td}><span style={S.dateTxt}>{p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString() : '—'}</span></td>
                      <td style={S.td}><span style={S.dateTxt}>{p.completed_at ? new Date(p.completed_at).toLocaleDateString() : '—'}</span></td>
                      <td style={S.td}>
                        <div style={S.actions}>
                          <button style={S.viewBtn} onClick={() => setSelected(p)}>View Details</button>
                          <button style={S.eyeBtn} onClick={() => setSelected(p)}><Eye size={15} color="#1D6A4A" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="responsive-pagination" style={S.pagination}>
              <span style={S.paginInfo}>Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, totalRecords)} of {totalRecords} records</span>
              <div style={S.paginBtns}>
                <button style={S.paginArrow} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} style={{ ...S.paginNum, ...(page === i + 1 ? S.paginNumActive : {}) }} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button style={S.paginArrow} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh', padding: '28px', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: '#111827' },
  pageHeader: { marginBottom: '22px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '22px' },
  card: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardVal: { fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1.1 },
  cardLabel: { fontSize: '12.5px', fontWeight: '700', color: '#374151', marginTop: '2px' },
  cardSub: { fontSize: '11px', color: '#9CA3AF', marginTop: '1px' },
  filterBar: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-end', gap: '14px', marginBottom: '18px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '7px 12px', flex: 2, minWidth: '220px', background: '#FAFAFA' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '12.5px', color: '#111827', width: '100%', fontFamily: 'inherit' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' },
  filterLabel: { fontSize: '11px', fontWeight: '600', color: '#6B7280' },
  selectWrap: { position: 'relative' },
  select: { appearance: 'none', WebkitAppearance: 'none', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '7px 30px 7px 12px', fontSize: '12.5px', color: '#111827', background: '#FFFFFF', cursor: 'pointer', outline: 'none', width: '100%', fontFamily: 'inherit' },
  chevron: { position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid #E2E8F0', background: '#FFFFFF', borderRadius: '8px', padding: '7px 16px', fontSize: '12.5px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  tableWrap: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F8FAFC' },
  th: { padding: '12px 14px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '13px 14px', verticalAlign: 'middle' },
  propCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  propImg: { width: '60px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' },
  propName: { fontSize: '13px', fontWeight: '700', color: '#111827' },
  propLoc: { fontSize: '11px', color: '#6B7280', marginTop: '2px' },
  ppcId: { fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'monospace' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px' },
  cityTxt: { fontSize: '12px', color: '#374151' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  dateTxt: { fontSize: '12px', color: '#374151' },
  naText: { fontSize: '13px', color: '#9CA3AF' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  viewBtn: { border: '1.5px solid #D1D5DB', background: '#FFFFFF', borderRadius: '7px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  eyeBtn: { border: '1.5px solid #E2E8F0', background: '#FFFFFF', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #E2E8F0' },
  paginInfo: { fontSize: '12px', color: '#6B7280' },
  paginBtns: { display: 'flex', gap: '4px' },
  paginArrow: { width: '32px', height: '32px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' },
  paginNum: { width: '32px', height: '32px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  paginNumActive: { background: '#1D6A4A', color: '#FFFFFF', border: '1px solid #1D6A4A' },
  emptyState: { padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  emptyTitle: { fontSize: '15px', fontWeight: '700', color: '#374151', margin: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#FFFFFF', borderRadius: '16px', width: '480px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #E2E8F0' },
  modalTitle: { fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' },
  modalBody: { padding: '20px' },
  modalImg: { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' },
  modalGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  modalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' },
  modalKey: { color: '#6B7280', fontWeight: '600' },
  modalVal: { color: '#111827', fontWeight: '600', textAlign: 'right' },
};

export default OwnerInspections;
