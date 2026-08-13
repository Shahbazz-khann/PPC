import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  ArrowUpRight,
  ShoppingBag,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Building2,
  TrendingUp,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// Structured to match the confirmed transactions table schema:
//   transaction_id, property_id, customer_id, transaction_type_id,
//   transaction_status_id, agreed_amount, transaction_date, timestamps
//
// Replace MOCK_TRANSACTIONS with a GET /api/customer/transactions API call
// when the backend is ready. Field names match the DB schema.

const MOCK_TRANSACTIONS = [
  {
    transaction_id: 'TXN-2026-0041',
    property: {
      property_id: 1,
      title: 'Modern Family Villa',
      location: 'Bahria Town, Islamabad',
      image: '/src/assets/prop_villa.png',
      fallback:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    },
    transaction_type: 'Purchase',
    transaction_status: 'Active',
    agreed_amount: 25000000,
    transaction_date: '2026-08-05',
  },
  {
    transaction_id: 'TXN-2026-0038',
    property: {
      property_id: 2,
      title: 'Luxury Apartment in DHA',
      location: 'DHA Phase 2, Islamabad',
      image: '/src/assets/prop_apartment.png',
      fallback:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    },
    transaction_type: 'Rent',
    transaction_status: 'Completed',
    agreed_amount: 120000,
    transaction_date: '2026-07-20',
  },
  {
    transaction_id: 'TXN-2026-0031',
    property: {
      property_id: 3,
      title: 'Fully Furnished House',
      location: 'G-13, Islamabad',
      image: '/src/assets/prop_house.png',
      fallback:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80',
    },
    transaction_type: 'Rent',
    transaction_status: 'Pending',
    agreed_amount: 85000,
    transaction_date: '2026-07-10',
  },
  {
    transaction_id: 'TXN-2026-0027',
    property: {
      property_id: 4,
      title: 'Smart Home Villa',
      location: 'E-11, Islamabad',
      image: '/src/assets/prop_living_room.png',
      fallback:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    },
    transaction_type: 'Purchase',
    transaction_status: 'Cancelled',
    agreed_amount: 45000000,
    transaction_date: '2026-06-28',
  },
  {
    transaction_id: 'TXN-2026-0019',
    property: {
      property_id: 5,
      title: 'Premium Penthouse',
      location: 'DHA Phase 5, Lahore',
      image: '/src/assets/prop_penthouse.png',
      fallback:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    },
    transaction_type: 'Rent',
    transaction_status: 'Completed',
    agreed_amount: 250000,
    transaction_date: '2026-05-15',
  },
];

// Status metadata — maps transaction_status values to visual tokens
const STATUS_CONFIG = {
  Active:    { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE', Icon: Clock },
  Completed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0', Icon: CheckCircle2 },
  Pending:   { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', Icon: AlertCircle },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', Icon: XCircle },
};

// Transaction type metadata
const TYPE_CONFIG = {
  Purchase: { bg: '#EDE9FE', color: '#6D28D9', Icon: ShoppingBag },
  Rent:     { bg: '#E0F2FE', color: '#0369A1', Icon: Home },
};

// Summary card config — derived from MOCK_TRANSACTIONS
function buildSummary(transactions) {
  return {
    total:     transactions.length,
    active:    transactions.filter((t) => t.transaction_status === 'Active').length,
    completed: transactions.filter((t) => t.transaction_status === 'Completed').length,
    pending:   transactions.filter((t) => t.transaction_status === 'Pending').length,
  };
}

// Format PKR amounts
function formatPKR(amount) {
  if (amount >= 1_000_000)
    return `Rs. ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  if (amount >= 1_000)
    return `Rs. ${(amount / 1_000).toFixed(0)}K`;
  return `Rs. ${amount.toLocaleString()}`;
}

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const { Icon } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: '20px', fontSize: '11px', fontWeight: '700',
      padding: '3px 10px',
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {status}
    </span>
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.Purchase;
  const { Icon } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: cfg.bg, color: cfg.color,
      borderRadius: '20px', fontSize: '11px', fontWeight: '700',
      padding: '3px 10px',
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {type}
    </span>
  );
};

// ─── Transaction Card ─────────────────────────────────────────────────────────

const TransactionCard = ({ tx }) => {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={S.txCard}>
      {/* Property Image */}
      <div style={S.txImgWrap}>
        <img
          src={imgErr ? tx.property.fallback : tx.property.image}
          alt={tx.property.title}
          style={S.txImg}
          onError={() => setImgErr(true)}
        />
      </div>

      {/* Main content */}
      <div style={S.txBody}>
        {/* Top row: badges */}
        <div style={S.txBadgeRow}>
          <TypeBadge type={tx.transaction_type} />
          <StatusBadge status={tx.transaction_status} />
        </div>

        {/* Property name + location */}
        <div style={S.txTitle}>{tx.property.title}</div>
        <div style={S.txLocation}>
          <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
          <span>{tx.property.location}</span>
        </div>

        {/* Meta row */}
        <div style={S.txMeta}>
          <div style={S.txMetaItem}>
            <span style={S.txMetaLbl}>Transaction ID</span>
            <span style={S.txMetaVal}>{tx.transaction_id}</span>
          </div>
          <div style={S.txMetaDivider} />
          <div style={S.txMetaItem}>
            <span style={S.txMetaLbl}>Date</span>
            <span style={S.txMetaVal}>
              <Calendar size={12} color="#6B7280" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
              {formatDate(tx.transaction_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: amount + action */}
      <div style={S.txRight}>
        <div style={S.txAmount}>{formatPKR(tx.agreed_amount)}</div>
        <div style={S.txAmountLbl}>
          {tx.transaction_type === 'Rent' ? 'per month' : 'agreed amount'}
        </div>
        <button style={S.viewBtn}>
          <Eye size={14} strokeWidth={2} />
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({ icon: Icon, iconBg, iconColor, value, label }) => (
  <div style={S.summaryCard}>
    <div style={{ ...S.summaryIcon, background: iconBg }}>
      <Icon size={18} color={iconColor} strokeWidth={2} />
    </div>
    <div>
      <div style={S.summaryVal}>{value}</div>
      <div style={S.summaryLbl}>{label}</div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div style={S.emptyState}>
    <div style={S.emptyIcon}>
      <Building2 size={36} color="#D1D5DB" strokeWidth={1.5} />
    </div>
    <div style={S.emptyTitle}>No transactions yet</div>
    <div style={S.emptyDesc}>
      You haven't started any property transactions. Browse available properties to get started.
    </div>
    <button style={S.emptyBtn}>
      Browse Properties <ArrowUpRight size={14} strokeWidth={2.5} />
    </button>
  </div>
);

// ─── Main Page Component ───────────────────────────────────────────────────────

const MyTransactions = () => {
  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const [sortBy, setSort]       = useState('newest');

  const summary = buildSummary(MOCK_TRANSACTIONS);

  const filtered = useMemo(() => {
    let list = [...MOCK_TRANSACTIONS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.property.title.toLowerCase().includes(q) ||
          t.property.location.toLowerCase().includes(q) ||
          t.transaction_id.toLowerCase().includes(q)
      );
    }
    // Type
    if (typeFilter !== 'All') {
      list = list.filter((t) => t.transaction_type === typeFilter);
    }
    // Status
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.transaction_status === statusFilter);
    }
    // Sort
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
    if (sortBy === 'amount_desc') list.sort((a, b) => b.agreed_amount - a.agreed_amount);
    if (sortBy === 'amount_asc')  list.sort((a, b) => a.agreed_amount - b.agreed_amount);

    return list;
  }, [search, typeFilter, statusFilter, sortBy]);

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>My Transactions</h1>
          <p style={S.pageSub}>
            Track your property purchase and rental transactions in one place.
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={S.summaryGrid}>
        <SummaryCard
          icon={TrendingUp}
          iconBg="#E8F4F1"
          iconColor="#1D6A4A"
          value={summary.total}
          label="Total Transactions"
        />
        <SummaryCard
          icon={Clock}
          iconBg="#DBEAFE"
          iconColor="#1D4ED8"
          value={summary.active}
          label="Active"
        />
        <SummaryCard
          icon={CheckCircle2}
          iconBg="#D1FAE5"
          iconColor="#065F46"
          value={summary.completed}
          label="Completed"
        />
        <SummaryCard
          icon={AlertCircle}
          iconBg="#FEF3C7"
          iconColor="#B45309"
          value={summary.pending}
          label="Pending"
        />
      </div>

      {/* ── Filter Bar ── */}
      <div style={S.filterBar}>
        {/* Search */}
        <div style={S.searchWrap}>
          <Search size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by property, location, or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchInput}
            id="tx-search"
          />
        </div>

        {/* Type filter */}
        <div style={S.selectWrap}>
          <select
            id="tx-type-filter"
            value={typeFilter}
            onChange={(e) => setType(e.target.value)}
            style={S.selectEl}
          >
            <option value="All">All Types</option>
            <option value="Purchase">Purchase</option>
            <option value="Rent">Rent</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>

        {/* Status filter */}
        <div style={S.selectWrap}>
          <select
            id="tx-status-filter"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            style={S.selectEl}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>

        {/* Sort */}
        <div style={S.selectWrap}>
          <SlidersHorizontal size={13} color="#6B7280" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          <select
            id="tx-sort"
            value={sortBy}
            onChange={(e) => setSort(e.target.value)}
            style={{ ...S.selectEl, paddingLeft: '30px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>
      </div>

      {/* ── Results count ── */}
      <div style={S.resultsCount}>
        {filtered.length > 0
          ? `Showing ${filtered.length} of ${MOCK_TRANSACTIONS.length} transactions`
          : 'No matching transactions'}
      </div>

      {/* ── Transaction List ── */}
      {filtered.length === 0 ? (
        search || typeFilter !== 'All' || statusFilter !== 'All' ? (
          // Filtered empty state
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>
              <Search size={32} color="#D1D5DB" strokeWidth={1.5} />
            </div>
            <div style={S.emptyTitle}>No transactions match your filters</div>
            <div style={S.emptyDesc}>Try adjusting your search or filter criteria.</div>
            <button
              onClick={() => { setSearch(''); setType('All'); setStatus('All'); }}
              style={S.clearBtn}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div style={S.txList}>
          {filtered.map((tx) => (
            <TransactionCard key={tx.transaction_id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const S = {
  // Page
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    padding: '28px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
  },
  pageHeader: { marginBottom: '24px' },
  pageTitle: {
    fontSize: '26px', fontWeight: '800', color: '#111827',
    margin: '0 0 4px 0', lineHeight: 1.2,
  },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: '500' },

  // Summary grid
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  summaryIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  summaryVal: { fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  summaryLbl: { fontSize: '12px', color: '#6B7280', fontWeight: '500', marginTop: '3px' },

  // Filter bar
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '14px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: '10px', padding: '9px 14px',
    flex: 2, minWidth: '200px', height: '40px',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: '13px', color: '#374151', width: '100%', fontFamily: 'inherit',
  },
  selectWrap: {
    position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  selectEl: {
    appearance: 'none',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: '10px', padding: '9px 32px 9px 12px',
    fontSize: '13px', color: '#374151',
    fontFamily: 'inherit', fontWeight: '500',
    cursor: 'pointer', height: '40px', outline: 'none',
  },
  selectIcon: { position: 'absolute', right: '10px', pointerEvents: 'none' },

  // Results count
  resultsCount: {
    fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '16px',
  },

  // Transaction list
  txList: { display: 'flex', flexDirection: 'column', gap: '14px' },

  // Transaction card
  txCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.15s',
  },
  txImgWrap: {
    width: '130px', height: '90px',
    borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
  },
  txImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  txBody: { flex: 1, minWidth: 0 },
  txBadgeRow: { display: 'flex', gap: '6px', marginBottom: '7px', flexWrap: 'wrap' },
  txTitle: { fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '3px' },
  txLocation: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '10px',
  },
  txMeta: { display: 'flex', alignItems: 'center', gap: '0' },
  txMetaItem: { display: 'flex', flexDirection: 'column', gap: '1px', paddingRight: '16px' },
  txMetaDivider: { width: '1px', height: '28px', background: '#E5E7EB', marginRight: '16px', flexShrink: 0 },
  txMetaLbl: { fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },
  txMetaVal: { fontSize: '12px', color: '#374151', fontWeight: '700' },

  txRight: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    gap: '4px', flexShrink: 0, minWidth: '130px',
  },
  txAmount: { fontSize: '20px', fontWeight: '800', color: '#1D6A4A' },
  txAmountLbl: { fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '8px' },
  viewBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#FFFFFF', border: '1.5px solid #1D6A4A', color: '#1D6A4A',
    borderRadius: '10px', padding: '8px 16px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },

  // Empty state
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '64px 20px', textAlign: 'center',
  },
  emptyIcon: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: { fontSize: '17px', fontWeight: '800', color: '#111827', marginBottom: '8px' },
  emptyDesc: { fontSize: '13px', color: '#6B7280', fontWeight: '500', maxWidth: '340px', lineHeight: 1.6, marginBottom: '20px' },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#1D6A4A', color: '#FFFFFF', border: 'none',
    borderRadius: '10px', padding: '10px 22px',
    fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },
  clearBtn: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#374151',
    borderRadius: '10px', padding: '9px 22px',
    fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default MyTransactions;
