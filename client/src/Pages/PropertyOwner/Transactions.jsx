import React, { useState, useMemo } from 'react';
import {
  FileText, CheckCircle2, Clock, AlertCircle, Search, ChevronDown,
  RotateCcw, Eye, X,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  {
    transaction_id: 1, ppc_id: '#TXN-2026-0041',
    property_title: 'Modern Family Villa', property_location: 'Bahria Town', city: 'Islamabad', property_type: 'House',
    transaction_type: 'Purchase', transaction_status: 'Active',
    agreed_amount: 25000000, transaction_date: '05 Aug 2026', updated_at: '17 Aug 2026',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
  },
  {
    transaction_id: 2, ppc_id: '#TXN-2026-0038',
    property_title: 'Fully Furnished House', property_location: 'G-13', city: 'Islamabad', property_type: 'House',
    transaction_type: 'Rent', transaction_status: 'Completed',
    agreed_amount: 120000, transaction_date: '01 Jul 2026', updated_at: '01 Jul 2026',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
  },
  {
    transaction_id: 3, ppc_id: '#TXN-2026-0030',
    property_title: 'Smart Home Villa', property_location: 'E-11', city: 'Islamabad', property_type: 'House',
    transaction_type: 'Purchase', transaction_status: 'Pending',
    agreed_amount: 45000000, transaction_date: '10 Jun 2026', updated_at: '10 Jun 2026',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
  },
  {
    transaction_id: 4, ppc_id: '#TXN-2026-0025',
    property_title: 'Premium Penthouse', property_location: 'DHA Phase 5', city: 'Lahore', property_type: 'Apartment',
    transaction_type: 'Rent', transaction_status: 'Completed',
    agreed_amount: 250000, transaction_date: '01 May 2026', updated_at: '01 May 2026',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
  },
];

const STATUS_CONFIG = {
  Active:    { bg: '#DCFCE7', color: '#166534', icon: CheckCircle2 },
  Completed: { bg: '#EEF2FF', color: '#4338CA', icon: CheckCircle2 },
  Pending:   { bg: '#FFF7ED', color: '#92400E', icon: Clock },
};

const TYPE_COLORS = {
  House:     { bg: '#E8F4F1', color: '#1D6A4A' },
  Apartment: { bg: '#EEF2FF', color: '#4F46E5' },
  Commercial:{ bg: '#FEF3C7', color: '#92400E' },
};

const TXN_TYPE = {
  Purchase: { bg: '#E8F4F1', color: '#1D6A4A' },
  Rent:     { bg: '#EEF2FF', color: '#4F46E5' },
};

const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK');

const DetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const sc = STATUS_CONFIG[item.transaction_status] || STATUS_CONFIG.Pending;
  const StatusIcon = sc.icon;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>Transaction Details</h3>
          <button style={S.closeBtn} onClick={onClose}><X size={18} color="#374151" /></button>
        </div>
        <div style={S.modalBody}>
          <img src={item.image} alt={item.property_title} style={S.modalImg}
            onError={(e) => { e.target.src = 'https://placehold.co/440x140/e2e8f0/94a3b8?text=PPC'; }} />
          <div style={S.modalGrid}>
            {[
              ['Transaction ID', item.ppc_id],
              ['Property', item.property_title],
              ['Location', `${item.property_location}, ${item.city}`],
              ['Type', item.transaction_type],
              ['Agreed Amount', fmt(item.agreed_amount)],
              ['Transaction Date', item.transaction_date],
              ['Last Updated', item.updated_at],
            ].map(([k, v]) => (
              <div key={k} style={S.modalRow}><span style={S.modalKey}>{k}</span><span style={S.modalVal}>{v}</span></div>
            ))}
            <div style={S.modalRow}>
              <span style={S.modalKey}>Status</span>
              <span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} />{item.transaction_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerTransactions = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = useMemo(() => MOCK_TRANSACTIONS.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.property_title.toLowerCase().includes(q) && !p.ppc_id.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'All Status' && p.transaction_status !== statusFilter) return false;
    return true;
  }), [search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const counts = {
    total: MOCK_TRANSACTIONS.length,
    active: MOCK_TRANSACTIONS.filter((t) => t.transaction_status === 'Active').length,
    completed: MOCK_TRANSACTIONS.filter((t) => t.transaction_status === 'Completed').length,
    pending: MOCK_TRANSACTIONS.filter((t) => t.transaction_status === 'Pending').length,
  };

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>Transactions</h1>
        <p style={S.pageSub}>View transaction records related to your properties managed through PPC.</p>
      </div>

      <div style={S.cards}>
        {[
          { label: 'Total Transactions', sub: 'All transaction records', val: counts.total, icon: FileText, bg: '#E8F4F1', color: '#1D6A4A' },
          { label: 'Active', sub: 'In progress', val: counts.active, icon: CheckCircle2, bg: '#DCFCE7', color: '#166534' },
          { label: 'Completed', sub: 'Finalised transactions', val: counts.completed, icon: CheckCircle2, bg: '#EEF2FF', color: '#4338CA' },
          { label: 'Pending', sub: 'Awaiting progress', val: counts.pending, icon: Clock, bg: '#FFF7ED', color: '#D97706' },
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

      <div style={S.filterBar}>
        <div style={S.searchBox}>
          <Search size={15} color="#9CA3AF" />
          <input style={S.searchInput} placeholder="Search by property, transaction ID or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Transaction Status</span>
          <div style={S.selectWrap}>
            <select style={S.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={S.chevron} />
          </div>
        </div>
        <button style={S.clearBtn} onClick={() => { setSearch(''); setStatusFilter('All Status'); setPage(1); }}>
          <RotateCcw size={13} /> Clear Filters
        </button>
      </div>

      <div style={S.tableWrap}>
        {filtered.length === 0 ? (
          <div style={S.emptyState}><AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} /><p style={S.emptyTitle}>No matching transaction records found</p></div>
        ) : (
          <>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  {['Property', 'Transaction ID', 'Property Type', 'City', 'Txn Type', 'Agreed Amount', 'Date', 'Status', 'Action'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => {
                  const sc = STATUS_CONFIG[p.transaction_status] || STATUS_CONFIG.Pending;
                  const StatusIcon = sc.icon;
                  const tc = TYPE_COLORS[p.property_type] || { bg: '#F3F4F6', color: '#374151' };
                  const ttc = TXN_TYPE[p.transaction_type] || { bg: '#F3F4F6', color: '#374151' };
                  return (
                    <tr key={p.transaction_id} style={{ ...S.tr, background: i % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
                      <td style={S.td}>
                        <div style={S.propCell}>
                          <img src={p.image} alt={p.property_title} style={S.propImg}
                            onError={(e) => { e.target.src = 'https://placehold.co/60x48/e2e8f0/94a3b8?text=PPC'; }} />
                          <div>
                            <div style={S.propName}>{p.property_title}</div>
                            <div style={S.propLoc}>{p.property_location}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}><span style={S.ppcId}>{p.ppc_id}</span></td>
                      <td style={S.td}><span style={{ ...S.typeBadge, background: tc.bg, color: tc.color }}>{p.property_type}</span></td>
                      <td style={S.td}><span style={S.cityTxt}>{p.city}</span></td>
                      <td style={S.td}><span style={{ ...S.typeBadge, background: ttc.bg, color: ttc.color }}>{p.transaction_type}</span></td>
                      <td style={S.td}><span style={S.amountTxt}>{fmt(p.agreed_amount)}</span></td>
                      <td style={S.td}><span style={S.dateTxt}>{p.transaction_date}</span></td>
                      <td style={S.td}><span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} />{p.transaction_status}</span></td>
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
            <div style={S.pagination}>
              <span style={S.paginInfo}>Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} records</span>
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
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px', whiteSpace: 'nowrap' },
  cityTxt: { fontSize: '12px', color: '#374151' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  amountTxt: { fontSize: '13px', fontWeight: '700', color: '#1D6A4A' },
  dateTxt: { fontSize: '12px', color: '#374151' },
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
  modal: { background: '#FFFFFF', borderRadius: '16px', width: '460px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
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

export default OwnerTransactions;
