import React, { useState } from 'react';
import {
  CreditCard,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  RotateCcw,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Receipt,
  Banknote,
  ArrowRight,
  Headphones,
  CheckCircle2,
  CircleDollarSign,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  {
    id: 'total',
    icon: Receipt,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    label: 'Total Invoices',
    value: '12',
    sub: 'All time invoices',
  },
  {
    id: 'paid',
    icon: CircleDollarSign,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    label: 'Paid Amount',
    value: 'Rs. 1,250,000',
    sub: 'Successfully paid',
  },
  {
    id: 'pending',
    icon: Clock,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    label: 'Pending Amount',
    value: 'Rs. 180,000',
    sub: 'Due payments',
  },
  {
    id: 'overdue',
    icon: CreditCard,
    iconBg: '#F3F0FF',
    iconColor: '#7C3AED',
    label: 'Overdue Amount',
    value: 'Rs. 0',
    sub: 'No overdue payments',
  },
];

const INVOICES = [
  {
    id: 'INV-2026-0012',
    secondaryId: '#PPC-10012',
    property: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    image: '/src/assets/prop_villa.png',
    fallback:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    type: 'Purchase',
    invoiceDate: '18 Aug 2026',
    dueDate: '25 Aug 2026',
    amount: 'Rs. 250,000',
    status: 'Paid',
  },
  {
    id: 'INV-2026-0011',
    secondaryId: '#PPC-10011',
    property: 'Luxury Apartment DHA',
    location: 'DHA Phase 2, Islamabad',
    image: '/src/assets/prop_apartment.png',
    fallback:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    type: 'Rent',
    invoiceDate: '10 Aug 2026',
    dueDate: '17 Aug 2026',
    amount: 'Rs. 120,000',
    status: 'Paid',
  },
  {
    id: 'INV-2026-0010',
    secondaryId: '#PPC-10010',
    property: 'Fully Furnished House',
    location: 'G-13, Islamabad',
    image: '/src/assets/prop_house.png',
    fallback:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80',
    type: 'Purchase',
    invoiceDate: '28 Jul 2026',
    dueDate: '04 Aug 2026',
    amount: 'Rs. 300,000',
    status: 'Pending',
  },
  {
    id: 'INV-2026-0009',
    secondaryId: '#PPC-10009',
    property: 'Luxury Apartment DHA',
    location: 'DHA Phase 2, Islamabad',
    image: '/src/assets/prop_apartment.png',
    fallback:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    type: 'Rent',
    invoiceDate: '15 Jul 2026',
    dueDate: '22 Jul 2026',
    amount: 'Rs. 80,000',
    status: 'Paid',
  },
  {
    id: 'INV-2026-0008',
    secondaryId: '#PPC-10008',
    property: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    image: '/src/assets/prop_villa.png',
    fallback:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    type: 'Purchase',
    invoiceDate: '30 Jun 2026',
    dueDate: '07 Jul 2026',
    amount: 'Rs. 200,000',
    status: 'Paid',
  },
];

const PAYMENT_SUMMARY = [
  {
    id: 'total',
    icon: Receipt,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    value: '12',
    label: 'Total Invoices',
    sub: 'View all invoices',
  },
  {
    id: 'paid',
    icon: CheckCircle2,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    value: '8',
    label: 'Paid Invoices',
    sub: 'View paid invoices',
  },
  {
    id: 'pending',
    icon: Clock,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    value: '3',
    label: 'Pending Invoices',
    sub: 'Pay pending invoices',
  },
  {
    id: 'overdue',
    icon: AlertCircle,
    iconBg: '#F3F0FF',
    iconColor: '#7C3AED',
    value: '0',
    label: 'Overdue Invoices',
    sub: "You're all caught up!",
  },
];

const QUICK_ACTIONS = [
  {
    id: 'payment',
    icon: CreditCard,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    title: 'Make a Payment',
    desc: 'Pay your pending invoices',
  },
  {
    id: 'methods',
    icon: Banknote,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    title: 'Payment Methods',
    desc: 'Manage your payment methods',
  },
  {
    id: 'statement',
    icon: Download,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    title: 'Download Statement',
    desc: 'Download your payment statement',
  },
];

const TABS = ['All Invoices', 'Paid', 'Pending', 'Overdue'];

// ─── Helper Components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    Paid: { bg: '#DCFCE7', color: '#166534' },
    Pending: { bg: '#FEF3C7', color: '#92400E' },
    Overdue: { bg: '#FEE2E2', color: '#991B1B' },
  };
  const st = map[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        background: st.bg,
        color: st.color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const map = {
    Purchase: { bg: '#DCFCE7', color: '#166534' },
    Rent: { bg: '#DBEAFE', color: '#1D4ED8' },
  };
  const st = map[type] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        background: st.bg,
        color: st.color,
        whiteSpace: 'nowrap',
      }}
    >
      {type}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const PaymentAndInvoices = () => {
  const [activeTab, setActiveTab] = useState('All Invoices');
  const [searchValue, setSearchValue] = useState('');
  const [invoiceType, setInvoiceType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('This Year');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const handleReset = () => {
    setSearchValue('');
    setInvoiceType('All');
    setStatusFilter('All');
    setDateRange('This Year');
  };

  return (
    <div style={s.page}>
      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Payments &amp; Invoices</h1>
        <p style={s.pageSubtitle}>
          View your invoices, payment history and manage your payments.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={s.twoCol}>
        {/* ══════════════ MAIN CONTENT ══════════════ */}
        <div style={s.mainCol}>
          {/* ── Summary Cards ── */}
          <div style={s.summaryGrid}>
            {SUMMARY_CARDS.map((card) => {
              const IconComp = card.icon;
              return (
                <div key={card.id} style={s.summaryCard}>
                  <div style={s.summaryCardTop}>
                    <div style={{ ...s.summaryIconBox, background: card.iconBg }}>
                      <IconComp size={20} color={card.iconColor} strokeWidth={1.8} />
                    </div>
                    <div style={s.summaryCardText}>
                      <div style={s.summaryLabel}>{card.label}</div>
                      <div style={s.summaryValue}>{card.value}</div>
                    </div>
                  </div>
                  <div style={s.summarySub}>{card.sub}</div>
                </div>
              );
            })}
          </div>

          {/* ── Invoice Table Card ── */}
          <div style={s.tableCard}>
            {/* Tabs */}
            <div style={s.tabsRow}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabBtnActive : {}) }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {activeTab === tab && <div style={s.tabUnderline} />}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={s.filtersRow}>
              <div style={s.searchWrap}>
                <Search size={14} color="#9CA3AF" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search by invoice id, property or type..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={s.searchInput}
                />
              </div>

              <div style={s.filterGroup}>
                <label style={s.filterLabel}>Invoice Type</label>
                <div style={s.selectWrap}>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                    style={s.select}
                  >
                    <option>All</option>
                    <option>Purchase</option>
                    <option>Rent</option>
                  </select>
                  <ChevronDown size={13} color="#6B7280" style={s.selectChevron} />
                </div>
              </div>

              <div style={s.filterGroup}>
                <label style={s.filterLabel}>Status</label>
                <div style={s.selectWrap}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={s.select}
                  >
                    <option>All</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                  <ChevronDown size={13} color="#6B7280" style={s.selectChevron} />
                </div>
              </div>

              <div style={s.filterGroup}>
                <label style={s.filterLabel}>Date Range</label>
                <div style={s.selectWrap}>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={s.select}
                  >
                    <option>This Year</option>
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                  </select>
                  <ChevronDown size={13} color="#6B7280" style={s.selectChevron} />
                </div>
              </div>

              <button style={s.resetBtn} onClick={handleReset}>
                <RotateCcw size={13} color="#374151" strokeWidth={2} />
                Reset
              </button>
            </div>

            {/* Table */}
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHeadRow}>
                    {['Invoice', 'Property', 'Type', 'Invoice Date', 'Due Date', 'Amount', 'Status', 'Action'].map((col) => (
                      <th key={col} style={s.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv, idx) => (
                    <tr key={inv.id} style={{ ...s.tableRow, background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={s.td}>
                        <div style={s.invoiceId}>{inv.id}</div>
                        <div style={s.invoiceSecId}>{inv.secondaryId}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.propCell}>
                          <img
                            src={inv.image}
                            alt={inv.property}
                            style={s.propThumb}
                            onError={(e) => { e.target.src = inv.fallback; }}
                          />
                          <div>
                            <div style={s.propName}>{inv.property}</div>
                            <div style={s.propLocation}>
                              <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
                              <span>{inv.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}><TypeBadge type={inv.type} /></td>
                      <td style={{ ...s.td, ...s.dateCell }}>{inv.invoiceDate}</td>
                      <td style={{ ...s.td, ...s.dateCell }}>{inv.dueDate}</td>
                      <td style={{ ...s.td, ...s.amountCell }}>{inv.amount}</td>
                      <td style={s.td}><StatusBadge status={inv.status} /></td>
                      <td style={s.td}>
                        <div style={s.actionCell}>
                          <button style={s.viewBtn}>
                            <Eye size={13} color="#374151" strokeWidth={2} />
                            View
                          </button>
                          {inv.status === 'Pending' ? (
                            <button style={s.payNowBtn}>Pay Now</button>
                          ) : (
                            <button style={s.downloadBtn} title="Download">
                              <Download size={14} color="#374151" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={s.pagination}>
              <span style={s.paginationInfo}>Showing 1 to 5 of 12 invoices</span>
              <div style={s.paginationControls}>
                <button
                  style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={15} color="#374151" strokeWidth={2} />
                </button>
                {[1, 2, 3].map((pg) => (
                  <button
                    key={pg}
                    style={{ ...s.pageNumBtn, ...(currentPage === pg ? s.pageNumBtnActive : {}) }}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={15} color="#374151" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT SIDEBAR ══════════════ */}
        <aside style={s.rightAside}>
          {/* Payment Summary */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Payment Summary</div>
            <div style={s.summaryList}>
              {PAYMENT_SUMMARY.map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.id} style={s.summaryItem}>
                    <div style={{ ...s.summaryItemIcon, background: item.iconBg }}>
                      <IconComp size={16} color={item.iconColor} strokeWidth={1.8} />
                    </div>
                    <div style={s.summaryItemText}>
                      <div style={s.summaryItemLabel}>{item.label}</div>
                      <div style={s.summaryItemValue}>{item.value}</div>
                      <div style={s.summaryItemSub}>{item.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Quick Actions</div>
            <div style={s.quickActionsList}>
              {QUICK_ACTIONS.map((qa) => {
                const IconComp = qa.icon;
                return (
                  <button key={qa.id} style={s.quickActionItem}>
                    <div style={{ ...s.qaIconBox, background: qa.iconBg }}>
                      <IconComp size={16} color={qa.iconColor} strokeWidth={1.8} />
                    </div>
                    <div style={s.qaText}>
                      <div style={s.qaTitle}>{qa.title}</div>
                      <div style={s.qaDesc}>{qa.desc}</div>
                    </div>
                    <ArrowRight size={15} color="#9CA3AF" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Need Help */}
          <div style={s.sideCard}>
            <div style={s.needHelpHeader}>
              <div style={s.needHelpIconBox}>
                <Headphones size={20} color="#1D6A4A" strokeWidth={1.8} />
              </div>
              <div style={s.sideCardTitle}>Need Help?</div>
            </div>
            <p style={s.needHelpText}>
              If you have any questions regarding payments and invoices.
            </p>
            <button style={s.contactSupportBtn}>Contact Support</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    padding: '24px 28px 0 28px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '400',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 260px',
    gap: '20px',
    padding: '20px 28px 28px 28px',
    flex: 1,
    alignItems: 'start',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  summaryCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryCardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  summaryIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryCardText: { flex: 1 },
  summaryLabel: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  summaryValue: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1.2,
    marginTop: '2px',
  },
  summarySub: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tableCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1.5px solid #E5E7EB',
    padding: '0 20px',
    gap: '4px',
  },
  tabBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '14px 14px 12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: { color: '#1D6A4A' },
  tabUnderline: {
    position: 'absolute',
    bottom: '-1.5px',
    left: 0,
    right: 0,
    height: '2.5px',
    background: '#1D6A4A',
    borderRadius: '2px 2px 0 0',
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    padding: '14px 20px',
    borderBottom: '1.5px solid #E5E7EB',
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '7px 12px',
    flex: 1,
    minWidth: '180px',
    background: '#FAFAFA',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '12px',
    color: '#374151',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: '0.2px',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '6px 30px 6px 10px',
    fontSize: '12px',
    color: '#374151',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
    minWidth: '90px',
  },
  selectChevron: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginTop: '19px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  tableWrap: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12.5px',
  },
  tableHeadRow: {
    background: '#F9FAFB',
    borderBottom: '1.5px solid #E5E7EB',
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background 0.12s',
  },
  td: {
    padding: '11px 14px',
    verticalAlign: 'middle',
    color: '#374151',
    fontSize: '12.5px',
  },
  invoiceId: {
    fontWeight: '700',
    color: '#111827',
    fontSize: '12.5px',
  },
  invoiceSecId: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: '2px',
  },
  propCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  propThumb: {
    width: '46px',
    height: '38px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid #E5E7EB',
  },
  propName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: '12.5px',
    whiteSpace: 'nowrap',
  },
  propLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '3px',
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateCell: {
    color: '#6B7280',
    whiteSpace: 'nowrap',
    fontSize: '12px',
  },
  amountCell: {
    fontWeight: '700',
    color: '#111827',
    whiteSpace: 'nowrap',
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '7px',
    padding: '5px 10px',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '7px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
  },
  payNowBtn: {
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '7px',
    padding: '5px 12px',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderTop: '1.5px solid #E5E7EB',
  },
  paginationInfo: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pageBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '7px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageNumBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '7px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  pageNumBtnActive: {
    background: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    color: '#FFFFFF',
  },
  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  sideCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '14px',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  summaryItemIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  summaryItemText: { flex: 1 },
  summaryItemLabel: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryItemValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1.2,
  },
  summaryItemSub: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: '1px',
  },
  quickActionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  quickActionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 8px',
    background: 'none',
    border: 'none',
    borderRadius: '9px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.15s',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  qaIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qaText: { flex: 1 },
  qaTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#111827',
  },
  qaDesc: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: '1px',
  },
  needHelpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  needHelpIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: '14px',
  },
  needHelpText: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: 1.5,
    margin: '0 0 14px 0',
  },
  contactSupportBtn: {
    display: 'block',
    width: '100%',
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 0',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

export default PaymentAndInvoices;
