import React, { useState, useMemo } from 'react';
import {
  Receipt, CheckCircle2, Clock, AlertCircle, Search, ChevronDown,
  RotateCcw, Eye, X,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_INVOICES = [
  {
    invoice_id: 1, ppc_id: '#INV-2026-0010',
    property_title: 'Modern Family Villa', property_location: 'Bahria Town', city: 'Islamabad',
    invoice_type: 'Service Fee', invoice_status: 'Paid',
    amount: 85000, invoice_date: '05 Aug 2026', due_date: '20 Aug 2026', updated_at: '10 Aug 2026',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
  },
  {
    invoice_id: 2, ppc_id: '#INV-2026-0009',
    property_title: 'Luxury Apartment', property_location: 'DHA Phase 2', city: 'Islamabad',
    invoice_type: 'Service Fee', invoice_status: 'Pending',
    amount: 95000, invoice_date: '17 Aug 2026', due_date: '01 Sep 2026', updated_at: '17 Aug 2026',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
  },
  {
    invoice_id: 3, ppc_id: '#INV-2026-0008',
    property_title: 'Fully Furnished House', property_location: 'G-13', city: 'Islamabad',
    invoice_type: 'Inspection Fee', invoice_status: 'Paid',
    amount: 15000, invoice_date: '01 Aug 2026', due_date: '15 Aug 2026', updated_at: '10 Aug 2026',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
  },
  {
    invoice_id: 4, ppc_id: '#INV-2026-0007',
    property_title: 'Smart Home Villa', property_location: 'E-11', city: 'Islamabad',
    invoice_type: 'Service Fee', invoice_status: 'Overdue',
    amount: 85000, invoice_date: '01 Jul 2026', due_date: '15 Jul 2026', updated_at: '16 Jul 2026',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
  },
  {
    invoice_id: 5, ppc_id: '#INV-2026-0006',
    property_title: 'Premium Penthouse', property_location: 'DHA Phase 5', city: 'Lahore',
    invoice_type: 'Inspection Fee', invoice_status: 'Paid',
    amount: 15000, invoice_date: '01 Apr 2026', due_date: '15 Apr 2026', updated_at: '10 Apr 2026',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
  },
];

const STATUS_CONFIG = {
  Paid:    { bg: '#DCFCE7', color: '#166534', icon: CheckCircle2 },
  Pending: { bg: '#FFF7ED', color: '#92400E', icon: Clock },
  Overdue: { bg: '#FEF2F2', color: '#991B1B', icon: AlertCircle },
};

const INV_TYPE = {
  'Service Fee':   { bg: '#E8F4F1', color: '#1D6A4A' },
  'Inspection Fee':{ bg: '#EEF2FF', color: '#4F46E5' },
};

const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK');

const DetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const sc = STATUS_CONFIG[item.invoice_status] || STATUS_CONFIG.Pending;
  const StatusIcon = sc.icon;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>Invoice Details</h3>
          <button style={S.closeBtn} onClick={onClose}><X size={18} color="#374151" /></button>
        </div>
        <div style={S.modalBody}>
          <img src={item.image} alt={item.property_title} style={S.modalImg}
            onError={(e) => { e.target.src = 'https://placehold.co/440x140/e2e8f0/94a3b8?text=PPC'; }} />
          <div style={S.modalGrid}>
            {[
              ['Invoice ID', item.ppc_id],
              ['Property', item.property_title],
              ['Location', `${item.property_location}, ${item.city}`],
              ['Invoice Type', item.invoice_type],
              ['Amount', fmt(item.amount)],
              ['Invoice Date', item.invoice_date],
              ['Due Date', item.due_date],
              ['Last Updated', item.updated_at],
            ].map(([k, v]) => (
              <div key={k} style={S.modalRow}><span style={S.modalKey}>{k}</span><span style={S.modalVal}>{v}</span></div>
            ))}
            <div style={S.modalRow}>
              <span style={S.modalKey}>Status</span>
              <span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} />{item.invoice_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerPaymentAndInvoices = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = useMemo(() => MOCK_INVOICES.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.property_title.toLowerCase().includes(q) && !p.ppc_id.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'All Status' && p.invoice_status !== statusFilter) return false;
    return true;
  }), [search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const totalPaid = MOCK_INVOICES.filter((i) => i.invoice_status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = MOCK_INVOICES.filter((i) => i.invoice_status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const counts = {
    total: MOCK_INVOICES.length,
    paid: MOCK_INVOICES.filter((i) => i.invoice_status === 'Paid').length,
    pending: MOCK_INVOICES.filter((i) => i.invoice_status === 'Pending').length,
    overdue: MOCK_INVOICES.filter((i) => i.invoice_status === 'Overdue').length,
  };

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>Payments &amp; Invoices</h1>
        <p style={S.pageSub}>View invoices and payment records related to your PPC-managed properties.</p>
      </div>

      {/* Financial Summary */}
      <div style={S.financialRow}>
        <div style={S.finBox}>
          <div style={S.finLabel}>Total Paid</div>
          <div style={S.finValGreen}>{fmt(totalPaid)}</div>
          <div style={S.finSub}>{counts.paid} invoices paid</div>
        </div>
        <div style={S.finBox}>
          <div style={S.finLabel}>Outstanding Amount</div>
          <div style={S.finValAmber}>{fmt(totalPending)}</div>
          <div style={S.finSub}>{counts.pending + counts.overdue} invoices due</div>
        </div>
      </div>

      <div style={S.cards}>
        {[
          { label: 'Total Invoices', sub: 'All invoice records', val: counts.total, icon: Receipt, bg: '#E8F4F1', color: '#1D6A4A' },
          { label: 'Paid', sub: 'Successfully paid', val: counts.paid, icon: CheckCircle2, bg: '#DCFCE7', color: '#166534' },
          { label: 'Pending', sub: 'Payment awaited', val: counts.pending, icon: Clock, bg: '#FFF7ED', color: '#D97706' },
          { label: 'Overdue', sub: 'Past due date', val: counts.overdue, icon: AlertCircle, bg: '#FEF2F2', color: '#991B1B' },
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
          <input style={S.searchInput} placeholder="Search by property, invoice ID or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Invoice Status</span>
          <div style={S.selectWrap}>
            <select style={S.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
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
          <div style={S.emptyState}><AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} /><p style={S.emptyTitle}>No matching invoice records found</p></div>
        ) : (
          <>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  {['Property', 'Invoice ID', 'Invoice Type', 'City', 'Amount', 'Invoice Date', 'Due Date', 'Status', 'Action'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => {
                  const sc = STATUS_CONFIG[p.invoice_status] || STATUS_CONFIG.Pending;
                  const StatusIcon = sc.icon;
                  const itc = INV_TYPE[p.invoice_type] || { bg: '#F3F4F6', color: '#374151' };
                  return (
                    <tr key={p.invoice_id} style={{ ...S.tr, background: i % 2 === 0 ? '#FFF' : '#FAFAFA' }}>
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
                      <td style={S.td}><span style={{ ...S.typeBadge, background: itc.bg, color: itc.color }}>{p.invoice_type}</span></td>
                      <td style={S.td}><span style={S.cityTxt}>{p.city}</span></td>
                      <td style={S.td}><span style={S.amountTxt}>{fmt(p.amount)}</span></td>
                      <td style={S.td}><span style={S.dateTxt}>{p.invoice_date}</span></td>
                      <td style={S.td}><span style={S.dateTxt}>{p.due_date}</span></td>
                      <td style={S.td}><span style={{ ...S.badge, background: sc.bg, color: sc.color }}><StatusIcon size={12} />{p.invoice_status}</span></td>
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
  pageHeader: { marginBottom: '18px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0 },
  financialRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' },
  finBox: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  finLabel: { fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' },
  finValGreen: { fontSize: '22px', fontWeight: '800', color: '#10B981', lineHeight: 1.2 },
  finValAmber: { fontSize: '22px', fontWeight: '800', color: '#D97706', lineHeight: 1.2 },
  finSub: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
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

export default OwnerPaymentAndInvoices;
