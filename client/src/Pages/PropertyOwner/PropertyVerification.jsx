import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ShieldCheck, Clock, XCircle, Search, ChevronDown,
  RotateCcw, MapPin, Eye, CheckCircle2, AlertCircle, X,
} from 'lucide-react';
import { getOwnerVerificationSummary, getOwnerPropertyVerifications } from '../../Services/owner.services';

const TYPE_COLORS = {
  House: { bg: '#E8F4F1', color: '#1D6A4A' },
  Apartment: { bg: '#EEF2FF', color: '#4F46E5' },
  Commercial: { bg: '#FEF3C7', color: '#92400E' },
};

const STATUS_CONFIG = {
  Verified: { bg: '#DCFCE7', color: '#166534', icon: CheckCircle2, label: 'Verified' },
  Pending:  { bg: '#FFF7ED', color: '#92400E', icon: Clock,         label: 'Pending'  },
  Rejected: { bg: '#FEF2F2', color: '#991B1B', icon: XCircle,       label: 'Rejected' },
};

// ─── Formatting Helpers ───────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
  const host = base.replace(/\/api\/v1\/?$/, '');
  return `${host}${url}`;
};

// ─── Image Carousel Component ──────────────────────────────────────────────────
const PropertyImageCarousel = ({ property, imgErrors, handleImageError, styles, customStyles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use the array of images if available, otherwise fallback to primary_image
  const hasImagesArray = Array.isArray(property.images) && property.images.length > 0;
  const imagesToRender = hasImagesArray 
    ? property.images 
    : (property.primary_image ? [property.primary_image] : []);

  // Filter out images that have errored
  const validImages = imagesToRender.filter((img, idx) => !imgErrors[`${property.property_id}-${idx}`]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  // State: No valid images at all
  if (validImages.length === 0) {
    return (
      <div style={{ ...styles.propImage, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '14px', ...customStyles }}>
        No image available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <img
        src={getImageUrl(validImages[currentIndex])}
        alt={`${property.property_title || 'Property'} - ${currentIndex + 1}`}
        style={{ ...styles.propImage, ...customStyles }}
        onError={() => handleImageError(property.property_id, currentIndex)}
      />
      {validImages.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            ‹
          </button>
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            ›
          </button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {validImages.map((_, idx) => (
              <div 
                key={idx}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)', transition: 'background 0.2s' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ prop, onClose, imgErrors, handleImageError }) => {
  if (!prop) return null;
  const sc = STATUS_CONFIG[prop.verification_status] || STATUS_CONFIG.Pending;
  const StatusIcon = sc.icon;
  const ppcId = `#PPC-1000${prop.property_id}`;
  const location = prop.address || prop.property_location || 'Unknown Location';
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>Verification Details</h3>
          <button style={S.closeBtn} onClick={onClose}><X size={18} color="#374151" /></button>
        </div>
        <div style={S.modalBody}>
          <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <PropertyImageCarousel 
              property={prop} 
              imgErrors={imgErrors} 
              handleImageError={handleImageError} 
              styles={S} 
              customStyles={{ width: '100%', height: '100%', borderRadius: '0' }}
            />
          </div>
          <div style={S.modalGrid}>
            <div style={S.modalRow}><span style={S.modalKey}>Property</span><span style={S.modalVal}>{prop.property_title}</span></div>
            <div style={S.modalRow}><span style={S.modalKey}>PPC ID</span><span style={S.modalVal}>{ppcId}</span></div>
            <div style={S.modalRow}><span style={S.modalKey}>Type</span><span style={S.modalVal}>{prop.property_type || 'N/A'}</span></div>
            <div style={S.modalRow}><span style={S.modalKey}>Location</span><span style={S.modalVal}>{location}, {prop.city || 'N/A'}</span></div>
            <div style={S.modalRow}>
              <span style={S.modalKey}>Status</span>
              <span style={{ ...S.statusBadge, background: sc.bg, color: sc.color }}>
                <StatusIcon size={12} /> {sc.label}
              </span>
            </div>
            <div style={S.modalRow}><span style={S.modalKey}>Verification Date</span><span style={S.modalVal}>{formatDate(prop.verification_date)}</span></div>
            <div style={S.modalRow}><span style={S.modalKey}>Last Updated</span><span style={S.modalVal}>{formatDate(prop.last_updated)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OwnerPropertyVerification = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const PER_PAGE = 10;

  const [listData, setListData] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [imgErrors, setImgErrors] = useState({});
  const handleImageError = (propertyId, idx = 0) => {
    setImgErrors(prev => ({ ...prev, [`${propertyId}-${idx}`]: true }));
  };

  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const res = await getOwnerVerificationSummary();
        if (isMounted) {
          setSummaryData(res.data);
          setSummaryError(null);
        }
      } catch (err) {
        console.error("Failed to load verification summary:", err);
        if (isMounted) {
          setSummaryError("Unable to load summary data.");
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false);
        }
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      try {
        setLoadingList(true);
        const res = await getOwnerPropertyVerifications({
          page,
          limit: PER_PAGE,
          search: search || undefined,
          status: statusFilter !== 'All Status' ? statusFilter : undefined
        });
        if (isMounted) {
          setListData(res.data || []);
          setTotalPages(res.pagination?.total_pages || 1);
          setTotalRecords(res.pagination?.total || 0);
          setListError(null);
        }
      } catch (err) {
        console.error("Failed to load verification list:", err);
        if (isMounted) {
          setListError("Unable to load properties.");
          setListData([]);
        }
      } finally {
        if (isMounted) {
          setLoadingList(false);
        }
      }
    }, 300);
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [page, search, statusFilter]);

  const total = summaryData ? summaryData.total_properties : 0;
  const pending = summaryData ? summaryData.pending_verification : 0;
  const verified = summaryData ? summaryData.verified_properties : 0;
  const rejected = summaryData ? summaryData.rejected_properties : 0;

  const handleClear = () => { setSearch(''); setStatusFilter('All Status'); setPage(1); };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>Property Verification</h1>
        <p style={S.pageSub}>Track and monitor the verification status of your properties by PPC.</p>
      </div>

      {/* Summary Cards */}
      {loadingSummary ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6B7280', fontSize: '14px' }}>Loading summary...</div>
      ) : summaryError ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#EF4444', fontSize: '14px' }}>{summaryError}</div>
      ) : (
        <div style={S.cards}>
          {[
            { label: 'Total Properties', sub: 'All your properties', val: total, icon: Building2, bg: '#E8F4F1', color: '#1D6A4A' },
            { label: 'Pending Verification', sub: 'Awaiting approval', val: pending, icon: Clock, bg: '#FFF7ED', color: '#D97706' },
            { label: 'Verified Properties', sub: 'Successfully verified', val: verified, icon: ShieldCheck, bg: '#DCFCE7', color: '#166534' },
            { label: 'Rejected Properties', sub: 'Require attention', val: rejected, icon: XCircle, bg: '#FEF2F2', color: '#991B1B' },
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
      <div style={S.filterBar}>
        <div style={S.searchBox}>
          <Search size={15} color="#9CA3AF" />
          <input style={S.searchInput} placeholder="Search by property title, ID or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={S.filterCenter}>
          <span style={S.filterCenterLabel}>Verification Status</span>
          <div style={S.selectWrap}>
            <select style={S.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Pending</option>
              <option>Verified</option>
              <option>Rejected</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={S.chevron} />
          </div>
        </div>
        <button style={S.clearBtn} onClick={handleClear}>
          <RotateCcw size={13} /> Clear Filters
        </button>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        {loadingList ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6B7280' }}>Loading properties...</div>
        ) : listError ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#EF4444' }}>{listError}</div>
        ) : listData.length === 0 ? (
          <div style={S.emptyState}>
            <AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} />
            <p style={S.emptyTitle}>No matching properties found</p>
            <p style={S.emptySub}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  {['Property', 'Property ID', 'Type', 'Location', 'Verification Status', 'Verification Date', 'Last Updated', 'Action'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listData.map((p, i) => {
                  const sc = STATUS_CONFIG[p.verification_status] || STATUS_CONFIG.Pending;
                  const StatusIcon = sc.icon;
                  const tc = TYPE_COLORS[p.property_type] || { bg: '#F3F4F6', color: '#374151' };
                  const ppcId = `#PPC-1000${p.property_id}`;
                  const location = p.address || p.property_location || 'Unknown Location';
                  return (
                    <tr key={p.property_id} style={{ ...S.tr, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={S.td}>
                        <div style={S.propCell}>
                          <div style={{ width: '60px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                            {(!getImageUrl(p.primary_image) || imgErrors[`${p.property_id}-0`]) ? (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '10px', textAlign: 'center' }}>
                                No image
                              </div>
                            ) : (
                              <img src={getImageUrl(p.primary_image)} alt={p.property_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => handleImageError(p.property_id, 0)} />
                            )}
                          </div>
                          <div>
                            <div style={S.propName}>{p.property_title}</div>
                            <div style={S.propLoc}>{location}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}><span style={S.ppcId}>{ppcId}</span></td>
                      <td style={S.td}>
                        <span style={{ ...S.typeBadge, background: tc.bg, color: tc.color }}>{p.property_type || 'N/A'}</span>
                      </td>
                      <td style={S.td}><span style={S.cityTxt}>{location},<br />{p.city || 'N/A'}</span></td>
                      <td style={S.td}>
                        <span style={{ ...S.statusBadge, background: sc.bg, color: sc.color }}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </td>
                      <td style={S.td}><span style={S.dateTxt}>{formatDate(p.verification_date)}</span></td>
                      <td style={S.td}><span style={S.dateTxt}>{formatDate(p.last_updated)}</span></td>
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

            {/* Pagination */}
            <div style={S.pagination}>
              <span style={S.paginInfo}>Showing {totalRecords > 0 ? (page - 1) * PER_PAGE + 1 : 0} to {Math.min(page * PER_PAGE, totalRecords)} of {totalRecords} properties</span>
              <div style={S.paginBtns}>
                <button style={S.paginArrow} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} style={{ ...S.paginNum, ...(page === i + 1 ? S.paginNumActive : {}) }}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button style={S.paginArrow} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && <DetailModal prop={selected} onClose={() => setSelected(null)} imgErrors={imgErrors} handleImageError={handleImageError} />}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
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
  filterCenter: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' },
  filterCenterLabel: { fontSize: '11px', fontWeight: '600', color: '#6B7280' },
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
  cityTxt: { fontSize: '12px', color: '#374151', lineHeight: 1.4 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  dateTxt: { fontSize: '12px', color: '#374151' },
  actions: { display: 'flex', alignItems: 'center', gap: '8px' },
  viewBtn: { border: '1.5px solid #D1D5DB', background: '#FFFFFF', borderRadius: '7px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  eyeBtn: { border: '1.5px solid #E2E8F0', background: '#FFFFFF', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #E2E8F0' },
  paginInfo: { fontSize: '12px', color: '#6B7280' },
  paginBtns: { display: 'flex', gap: '4px' },
  paginArrow: { width: '32px', height: '32px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' },
  paginNum: { width: '32px', height: '32px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  paginNumActive: { background: '#1D6A4A', color: '#FFFFFF', border: '1px solid #1D6A4A' },

  emptyState: { padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  emptyTitle: { fontSize: '15px', fontWeight: '700', color: '#374151', margin: 0 },
  emptySub: { fontSize: '13px', color: '#9CA3AF', margin: 0 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#FFFFFF', borderRadius: '16px', width: '480px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #E2E8F0' },
  modalTitle: { fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' },
  modalBody: { padding: '20px' },
  modalImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' },
  modalGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  modalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' },
  modalKey: { color: '#6B7280', fontWeight: '600' },
  modalVal: { color: '#111827', fontWeight: '600', textAlign: 'right' },
};

export default OwnerPropertyVerification;
