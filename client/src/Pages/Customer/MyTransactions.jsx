import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import { getTransactionSummary, getTransactions, getTransactionById } from '../../Services/customer.services';

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

// Summary card config — derived from API now
function buildSummary(data) {
  if (!data) return { total: 0, active: 0, completed: 0, pending: 0 };
  return {
    total:     data.total_transactions || 0,
    active:    data.active_transactions || 0,
    completed: data.completed_transactions || 0,
    pending:   data.pending_transactions || 0,
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

const TransactionCard = ({ tx, onView }) => {
  const [imgErr, setImgErr] = useState(false);
  
  const title = tx.property_title || 'Unknown Property';
  const location = [tx.address, tx.city].filter(Boolean).join(', ') || 'Unknown Location';
  const image = tx.primary_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80';
  const fallback = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80';

  return (
    <div style={S.txCard}>
      {/* Property Image */}
      <div style={S.txImgWrap}>
        <img
          src={imgErr ? fallback : image}
          alt={title}
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
        <div style={S.txTitle}>{title}</div>
        <div style={S.txLocation}>
          <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
          <span>{location}</span>
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
        <button style={S.viewBtn} onClick={() => onView(tx.transaction_id)}>
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

  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, typeFilter, statusFilter, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [summaryRes, txRes] = await Promise.all([
        getTransactionSummary(),
        getTransactions({
          search,
          transaction_type: typeFilter !== 'All' ? typeFilter : '',
          status: statusFilter !== 'All' ? statusFilter : '',
          sort: sortBy
        })
      ]);

      if (summaryRes.data.success) {
        setSummaryData(summaryRes.data.data);
      }
      
      if (txRes.data.success) {
        setTransactions(txRes.data.data);
      }

    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (txId) => {
    try {
      setModalLoading(true);
      const res = await getTransactionById(txId);
      if (res.data.success) {
        setSelectedTx(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      alert('Failed to load details.');
    } finally {
      setModalLoading(false);
    }
  };

  const summary = buildSummary(summaryData);

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
        {loading ? 'Loading...' : (transactions.length > 0
          ? `Showing ${transactions.length} transactions`
          : 'No matching transactions')}
      </div>

      {/* ── Transaction List ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 size={32} color="#1D6A4A" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ ...S.emptyState, color: '#991B1B' }}>
          <AlertCircle size={36} strokeWidth={1.5} />
          <div style={S.emptyTitle}>Error</div>
          <div style={S.emptyDesc}>{error}</div>
        </div>
      ) : transactions.length === 0 ? (
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
          {transactions.map((tx) => (
            <TransactionCard key={tx.transaction_id} tx={tx} onView={handleViewDetails} />
          ))}
        </div>
      )}

      {/* ── Modal Overlay ── */}
      {(selectedTx || modalLoading) && (
        <div style={S.modalOverlay}>
          <div style={S.modalContent}>
            {modalLoading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                 <Loader2 size={32} color="#1D6A4A" style={{ animation: 'spin 1s linear infinite' }} />
               </div>
            ) : selectedTx && (
              <>
                <div style={S.modalHeader}>
                  <h3 style={S.modalTitle}>Transaction Details</h3>
                  <button style={S.modalClose} onClick={() => setSelectedTx(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div style={S.modalBody}>
                  <div style={S.modalImgWrap}>
                    <img 
                      src={selectedTx.primary_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'} 
                      alt={selectedTx.property_title} 
                      style={S.modalImg} 
                    />
                  </div>
                  
                  <div style={S.modalSection}>
                    <h4 style={S.modalSub}>Property</h4>
                    <div style={S.modalValueLg}>{selectedTx.property_title}</div>
                    <div style={S.modalValueMd}>{[selectedTx.address, selectedTx.city].filter(Boolean).join(', ')}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={S.modalField}>
                      <span style={S.modalLabel}>Transaction ID</span>
                      <span style={S.modalValue}>{selectedTx.transaction_id}</span>
                    </div>
                    <div style={S.modalField}>
                      <span style={S.modalLabel}>Date</span>
                      <span style={S.modalValue}>{formatDate(selectedTx.transaction_date)}</span>
                    </div>
                    <div style={S.modalField}>
                      <span style={S.modalLabel}>Agreed Amount</span>
                      <span style={S.modalValueAmount}>{formatPKR(selectedTx.agreed_amount)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <TypeBadge type={selectedTx.transaction_type} />
                    <StatusBadge status={selectedTx.transaction_status} />
                  </div>
                  
                  {selectedTx.remarks && (
                    <div style={{ ...S.modalSection, marginTop: '20px' }}>
                      <h4 style={S.modalSub}>Remarks</h4>
                      <p style={S.modalDesc}>{selectedTx.remarks}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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

  // Modal Overlay
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px'
  },
  modalContent: {
    background: '#FFF', borderRadius: '16px',
    width: '100%', maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    maxHeight: '90vh',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #E5E7EB',
  },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' },
  modalClose: {
    background: 'transparent', border: 'none', color: '#6B7280',
    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '6px',
  },
  modalBody: { padding: '20px', overflowY: 'auto' },
  modalImgWrap: { width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' },
  modalImg: { width: '100%', height: '100%', objectFit: 'cover' },
  modalSection: { marginBottom: '16px' },
  modalSub: { margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  modalValueLg: { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
  modalValueMd: { fontSize: '14px', color: '#4B5563', fontWeight: '500' },
  modalField: {
    background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px',
    borderRadius: '10px', flex: '1 1 calc(33% - 10px)', minWidth: '130px',
  },
  modalLabel: { display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' },
  modalValue: { fontSize: '14px', color: '#111827', fontWeight: '700' },
  modalValueAmount: { fontSize: '16px', color: '#1D6A4A', fontWeight: '800' },
  modalDesc: { fontSize: '14px', color: '#374151', lineHeight: '1.5', margin: 0 },
};

// Global spin animation for loader
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

export default MyTransactions;
