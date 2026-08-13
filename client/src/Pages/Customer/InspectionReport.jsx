import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ClipboardCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  SlidersHorizontal,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// Structured to match the confirmed database schema:
//
//  inspections:       inspection_id, property_id, inspector_id,
//                     inspection_status_id, inspection_result_id, timestamps
//  inspection_reports: report_id, inspection_id, findings, timestamps
//  inspection_media:   media_id, inspection_id, media_type_id, uploaded_by
//
// Replace MOCK_REPORTS with GET /api/customer/inspection-reports when backend ready.
// All field names mirror the confirmed DB schema.

const MOCK_REPORTS = [
  {
    report_id: 'RPT-2026-0018',
    inspection_id: 'INS-2026-0041',
    property: {
      property_id: 1,
      title: 'Modern Family Villa',
      location: 'Bahria Town, Islamabad',
      image: '/src/assets/prop_villa.png',
      fallback: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    },
    inspector_name: 'Ahmed Raza',
    inspection_status: 'Completed',
    inspection_result: 'Passed',
    inspection_date: '2026-08-05',
    findings: 'The property is in excellent structural condition. All major systems including electrical, plumbing, and HVAC are functional. Minor cosmetic touch-ups recommended for external paintwork. No significant defects were observed.',
    media: [
      { media_id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80', caption: 'Front elevation' },
      { media_id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80', caption: 'Living area' },
      { media_id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', caption: 'Kitchen' },
    ],
  },
  {
    report_id: 'RPT-2026-0015',
    inspection_id: 'INS-2026-0038',
    property: {
      property_id: 2,
      title: 'Luxury Apartment in DHA',
      location: 'DHA Phase 2, Islamabad',
      image: '/src/assets/prop_apartment.png',
      fallback: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    },
    inspector_name: 'Usman Ali',
    inspection_status: 'Completed',
    inspection_result: 'Needs Attention',
    inspection_date: '2026-07-22',
    findings: 'Overall structure is sound. However, the bathroom tiles on the second floor show signs of water seepage. Electrical panel in the kitchen requires replacement. Recommend addressing these issues before proceeding.',
    media: [
      { media_id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80', caption: 'Building exterior' },
      { media_id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', caption: 'Bathroom seepage area' },
    ],
  },
  {
    report_id: 'RPT-2026-0012',
    inspection_id: 'INS-2026-0031',
    property: {
      property_id: 3,
      title: 'Fully Furnished House',
      location: 'G-13, Islamabad',
      image: '/src/assets/prop_house.png',
      fallback: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80',
    },
    inspector_name: 'Bilal Ahmed',
    inspection_status: 'In Progress',
    inspection_result: null,
    inspection_date: '2026-08-10',
    findings: null,
    media: [],
  },
  {
    report_id: 'RPT-2026-0009',
    inspection_id: 'INS-2026-0027',
    property: {
      property_id: 4,
      title: 'Smart Home Villa',
      location: 'E-11, Islamabad',
      image: '/src/assets/prop_living_room.png',
      fallback: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    },
    inspector_name: 'Ahmed Raza',
    inspection_status: 'Completed',
    inspection_result: 'Passed',
    inspection_date: '2026-07-01',
    findings: 'Property has been extensively renovated and all systems are in excellent working order. Smart home automation systems are fully operational. The property meets PPC quality standards.',
    media: [
      { media_id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80', caption: 'Main living area' },
    ],
  },
];

// ─── Status / Result Config ────────────────────────────────────────────────────

const STATUS_CFG = {
  'Completed':   { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0', Icon: CheckCircle2 },
  'In Progress': { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE', Icon: Clock },
  'Scheduled':   { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', Icon: Clock },
  'Pending':     { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', Icon: AlertCircle },
};

const RESULT_CFG = {
  'Passed':          { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0', Icon: CheckCircle2 },
  'Needs Attention': { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', Icon: AlertCircle },
  'Failed':          { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', Icon: X },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ label, config }) => {
  if (!label) return <span style={{ fontSize: '12px', color: '#9CA3AF' }}>—</span>;
  const cfg = config[label];
  if (!cfg) return <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{label}</span>;
  const { Icon } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: '20px', fontSize: '11px', fontWeight: '700', padding: '3px 10px',
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  );
};

// Lightbox for media gallery
const Lightbox = ({ media, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const current = media[idx];
  return (
    <div style={S.lightboxOverlay} onClick={onClose}>
      <div style={S.lightboxBox} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button style={S.lightboxClose} onClick={onClose}><X size={18} /></button>
        {/* Image */}
        <img src={current.url} alt={current.caption} style={S.lightboxImg} />
        <div style={S.lightboxCaption}>{current.caption}</div>
        {/* Navigation */}
        {media.length > 1 && (
          <div style={S.lightboxNav}>
            <button
              style={S.lightboxNavBtn}
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
              {idx + 1} / {media.length}
            </span>
            <button
              style={S.lightboxNavBtn}
              onClick={() => setIdx((i) => (i + 1) % media.length)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Report detail panel (slide-in style)
const ReportDetail = ({ report, onClose }) => {
  const [lightbox, setLightbox] = useState(null); // index or null
  const [propImgErr, setPropImgErr] = useState(false);

  return (
    <div style={S.detailOverlay}>
      <div style={S.detailPanel}>
        {/* Header */}
        <div style={S.detailHeader}>
          <div>
            <div style={S.detailTitle}>Inspection Report</div>
            <div style={S.detailSubtitle}>{report.report_id}</div>
          </div>
          <button style={S.detailClose} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Scrollable content */}
        <div style={S.detailBody}>
          {/* Property card */}
          <div style={S.detailSection}>
            <div style={S.detailSectionTitle}>Property</div>
            <div style={S.detailPropCard}>
              <img
                src={propImgErr ? report.property.fallback : report.property.image}
                alt={report.property.title}
                style={S.detailPropImg}
                onError={() => setPropImgErr(true)}
              />
              <div>
                <div style={S.detailPropName}>{report.property.title}</div>
                <div style={S.detailPropLoc}>
                  <MapPin size={12} color="#9CA3AF" />
                  {report.property.location}
                </div>
              </div>
            </div>
          </div>

          {/* Inspection info grid */}
          <div style={S.detailSection}>
            <div style={S.detailSectionTitle}>Inspection Details</div>
            <div style={S.detailInfoGrid}>
              <div style={S.detailInfoItem}>
                <span style={S.detailInfoLbl}>Inspection ID</span>
                <span style={S.detailInfoVal}>{report.inspection_id}</span>
              </div>
              <div style={S.detailInfoItem}>
                <span style={S.detailInfoLbl}>Inspection Date</span>
                <span style={S.detailInfoVal}>{formatDate(report.inspection_date)}</span>
              </div>
              <div style={S.detailInfoItem}>
                <span style={S.detailInfoLbl}>Inspector</span>
                <span style={S.detailInfoVal}>{report.inspector_name}</span>
              </div>
              <div style={S.detailInfoItem}>
                <span style={S.detailInfoLbl}>Status</span>
                <StatusBadge label={report.inspection_status} config={STATUS_CFG} />
              </div>
              <div style={S.detailInfoItem}>
                <span style={S.detailInfoLbl}>Result</span>
                <StatusBadge label={report.inspection_result} config={RESULT_CFG} />
              </div>
            </div>
          </div>

          {/* Findings */}
          <div style={S.detailSection}>
            <div style={S.detailSectionTitle}>Findings & Remarks</div>
            {report.findings ? (
              <div style={S.detailFindings}>{report.findings}</div>
            ) : (
              <div style={S.detailPending}>
                Inspection is still in progress. Findings will be available once the inspection is completed.
              </div>
            )}
          </div>

          {/* Media gallery */}
          {report.media && report.media.length > 0 && (
            <div style={S.detailSection}>
              <div style={S.detailSectionTitle}>
                Inspection Evidence
                <span style={S.mediaCount}>{report.media.length} file{report.media.length > 1 ? 's' : ''}</span>
              </div>
              <div style={S.mediaGrid}>
                {report.media.map((m, i) => (
                  <div
                    key={m.media_id}
                    style={S.mediaThumb}
                    onClick={() => setLightbox(i)}
                  >
                    <img src={m.url} alt={m.caption} style={S.mediaThumbImg} />
                    <div style={S.mediaThumbOverlay}>
                      <ImageIcon size={18} color="#fff" />
                    </div>
                    <div style={S.mediaThumbCaption}>{m.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          media={report.media}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};

// Report list card
const ReportCard = ({ report, onView }) => {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={S.card}>
      {/* Property image */}
      <div style={S.cardImgWrap}>
        <img
          src={imgErr ? report.property.fallback : report.property.image}
          alt={report.property.title}
          style={S.cardImg}
          onError={() => setImgErr(true)}
        />
      </div>

      {/* Content */}
      <div style={S.cardBody}>
        {/* Badges */}
        <div style={S.cardBadgeRow}>
          <StatusBadge label={report.inspection_status} config={STATUS_CFG} />
          <StatusBadge label={report.inspection_result} config={RESULT_CFG} />
        </div>
        <div style={S.cardTitle}>{report.property.title}</div>
        <div style={S.cardLoc}>
          <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
          {report.property.location}
        </div>

        {/* Meta */}
        <div style={S.cardMeta}>
          <div style={S.cardMetaItem}>
            <span style={S.cardMetaLbl}>Report ID</span>
            <span style={S.cardMetaVal}>{report.report_id}</span>
          </div>
          <div style={S.cardMetaDivider} />
          <div style={S.cardMetaItem}>
            <span style={S.cardMetaLbl}>Inspection Date</span>
            <span style={S.cardMetaVal}>
              <Calendar size={11} color="#6B7280" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
              {formatDate(report.inspection_date)}
            </span>
          </div>
          <div style={S.cardMetaDivider} />
          <div style={S.cardMetaItem}>
            <span style={S.cardMetaLbl}>Inspector</span>
            <span style={S.cardMetaVal}>
              <User size={11} color="#6B7280" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
              {report.inspector_name}
            </span>
          </div>
        </div>

        {/* Findings preview */}
        {report.findings && (
          <div style={S.cardFindings}>
            {report.findings.length > 120 ? report.findings.slice(0, 120) + '…' : report.findings}
          </div>
        )}
      </div>

      {/* Right action */}
      <div style={S.cardRight}>
        {report.media.length > 0 && (
          <div style={S.mediaCountPill}>
            <ImageIcon size={12} color="#6B7280" />
            {report.media.length} photo{report.media.length > 1 ? 's' : ''}
          </div>
        )}
        <button style={S.viewBtn} onClick={() => onView(report)}>
          View Report
          <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

// Summary stat card
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

// ─── Main Page Component ───────────────────────────────────────────────────────

const InspectionReport = () => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [resultFilter, setResult] = useState('All');
  const [sortBy, setSort]         = useState('newest');
  const [selectedReport, setSelected] = useState(null);

  // Derived summary values
  const total     = MOCK_REPORTS.length;
  const completed = MOCK_REPORTS.filter((r) => r.inspection_status === 'Completed').length;
  const passed    = MOCK_REPORTS.filter((r) => r.inspection_result === 'Passed').length;
  const attention = MOCK_REPORTS.filter((r) => r.inspection_result === 'Needs Attention').length;

  const filtered = useMemo(() => {
    let list = [...MOCK_REPORTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.property.title.toLowerCase().includes(q) ||
          r.property.location.toLowerCase().includes(q) ||
          r.report_id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter((r) => r.inspection_status === statusFilter);
    if (resultFilter !== 'All') list = list.filter((r) => r.inspection_result === resultFilter);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));
    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.inspection_date) - new Date(b.inspection_date));

    return list;
  }, [search, statusFilter, resultFilter, sortBy]);

  return (
    <div style={S.page}>
      {/* ── Page Header ── */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Inspection Reports</h1>
          <p style={S.pageSub}>
            Review inspection reports for your associated properties. Reports are generated after a PPC inspector completes a property inspection.
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={S.summaryGrid}>
        <SummaryCard icon={FileText}      iconBg="#E8F4F1" iconColor="#1D6A4A" value={total}     label="Total Reports" />
        <SummaryCard icon={ClipboardCheck} iconBg="#DBEAFE" iconColor="#1D4ED8" value={completed} label="Completed" />
        <SummaryCard icon={CheckCircle2}  iconBg="#D1FAE5" iconColor="#065F46" value={passed}    label="Passed" />
        <SummaryCard icon={AlertCircle}   iconBg="#FEF3C7" iconColor="#B45309" value={attention} label="Needs Attention" />
      </div>

      {/* ── Filter Bar ── */}
      <div style={S.filterBar}>
        {/* Search */}
        <div style={S.searchWrap}>
          <Search size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            id="insp-search"
            type="text"
            placeholder="Search by property or report ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchInput}
          />
        </div>

        {/* Status */}
        <div style={S.selectWrap}>
          <select id="insp-status" value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={S.selectEl}>
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>

        {/* Result */}
        <div style={S.selectWrap}>
          <select id="insp-result" value={resultFilter} onChange={(e) => setResult(e.target.value)} style={S.selectEl}>
            <option value="All">All Results</option>
            <option value="Passed">Passed</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>

        {/* Sort */}
        <div style={S.selectWrap}>
          <SlidersHorizontal size={13} color="#6B7280" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          <select id="insp-sort" value={sortBy} onChange={(e) => setSort(e.target.value)} style={{ ...S.selectEl, paddingLeft: '30px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <ChevronDown size={13} color="#6B7280" style={S.selectIcon} />
        </div>
      </div>

      {/* ── Results count ── */}
      <div style={S.resultsCount}>
        {filtered.length > 0
          ? `Showing ${filtered.length} of ${MOCK_REPORTS.length} reports`
          : 'No matching reports'}
      </div>

      {/* ── Report List ── */}
      {filtered.length === 0 ? (
        search || statusFilter !== 'All' || resultFilter !== 'All' ? (
          <div style={S.emptyState}>
            <div style={S.emptyIconBox}><Search size={30} color="#D1D5DB" strokeWidth={1.5} /></div>
            <div style={S.emptyTitle}>No reports match your filters</div>
            <div style={S.emptySub}>Try adjusting your search or filter criteria.</div>
            <button
              onClick={() => { setSearch(''); setStatus('All'); setResult('All'); }}
              style={S.clearBtn}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={S.emptyState}>
            <div style={S.emptyIconBox}><Building2 size={32} color="#D1D5DB" strokeWidth={1.5} /></div>
            <div style={S.emptyTitle}>No inspection reports available</div>
            <div style={S.emptySub}>
              Inspection reports will appear here once a PPC inspector has completed an inspection for your associated properties.
            </div>
          </div>
        )
      ) : (
        <div style={S.reportList}>
          {filtered.map((r) => (
            <ReportCard key={r.report_id} report={r} onView={setSelected} />
          ))}
        </div>
      )}

      {/* ── Report Detail Panel ── */}
      {selectedReport && (
        <ReportDetail report={selectedReport} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const S = {
  page: {
    background: '#FFFFFF', minHeight: '100vh', padding: '28px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: '#111827',
  },
  pageHeader: { marginBottom: '24px' },
  pageTitle: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', lineHeight: 1.2 },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: '500', maxWidth: '640px', lineHeight: 1.6 },

  // Summary
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px',
  },
  summaryCard: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px',
    padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  summaryIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  summaryVal: { fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  summaryLbl: { fontSize: '12px', color: '#6B7280', fontWeight: '500', marginTop: '3px' },

  // Filter bar
  filterBar: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px',
    padding: '9px 14px', flex: 2, minWidth: '200px', height: '40px',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: '13px', color: '#374151', width: '100%', fontFamily: 'inherit',
  },
  selectWrap: { position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 },
  selectEl: {
    appearance: 'none', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: '10px', padding: '9px 32px 9px 12px',
    fontSize: '13px', color: '#374151', fontFamily: 'inherit',
    fontWeight: '500', cursor: 'pointer', height: '40px', outline: 'none',
  },
  selectIcon: { position: 'absolute', right: '10px', pointerEvents: 'none' },

  resultsCount: { fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '16px' },

  // Report list
  reportList: { display: 'flex', flexDirection: 'column', gap: '14px' },

  // Report card
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '16px', padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  cardImgWrap: { width: '130px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardBody: { flex: 1, minWidth: 0 },
  cardBadgeRow: { display: 'flex', gap: '6px', marginBottom: '7px', flexWrap: 'wrap' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '3px' },
  cardLoc: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '10px' },
  cardMeta: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  cardMetaItem: { display: 'flex', flexDirection: 'column', gap: '1px', paddingRight: '16px' },
  cardMetaDivider: { width: '1px', height: '28px', background: '#E5E7EB', marginRight: '16px', flexShrink: 0 },
  cardMetaLbl: { fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardMetaVal: { fontSize: '12px', color: '#374151', fontWeight: '700' },
  cardFindings: {
    fontSize: '12px', color: '#6B7280', lineHeight: 1.6, fontWeight: '500',
    background: '#F8FAFC', borderRadius: '8px', padding: '8px 10px',
  },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 },
  mediaCountPill: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: '#F1F5F9', borderRadius: '20px',
    fontSize: '11px', color: '#6B7280', fontWeight: '600', padding: '4px 10px',
  },
  viewBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#1D6A4A', color: '#FFFFFF', border: 'none',
    borderRadius: '10px', padding: '9px 16px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },

  // Empty state
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '64px 20px', textAlign: 'center',
  },
  emptyIconBox: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  emptyTitle: { fontSize: '17px', fontWeight: '800', color: '#111827', marginBottom: '8px' },
  emptySub: { fontSize: '13px', color: '#6B7280', fontWeight: '500', maxWidth: '380px', lineHeight: 1.6, marginBottom: '20px' },
  clearBtn: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#374151',
    borderRadius: '10px', padding: '9px 22px',
    fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },

  // ── Detail Panel (slide-over) ──
  detailOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
  },
  detailPanel: {
    width: '520px', maxWidth: '95vw', background: '#FFFFFF',
    height: '100vh', display: 'flex', flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
  },
  detailHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1.5px solid #E2E8F0', flexShrink: 0,
  },
  detailTitle: { fontSize: '17px', fontWeight: '800', color: '#111827' },
  detailSubtitle: { fontSize: '12px', color: '#9CA3AF', fontWeight: '500', marginTop: '2px' },
  detailClose: {
    background: '#F1F5F9', border: 'none', borderRadius: '8px',
    width: '32px', height: '32px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', color: '#374151',
  },
  detailBody: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  detailSection: {},
  detailSectionTitle: {
    fontSize: '12px', fontWeight: '700', color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  detailPropCard: { display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', borderRadius: '12px', padding: '12px' },
  detailPropImg: { width: '80px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  detailPropName: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  detailPropLoc: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', fontWeight: '500' },
  detailInfoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  detailInfoItem: { display: 'flex', flexDirection: 'column', gap: '4px', background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' },
  detailInfoLbl: { fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },
  detailInfoVal: { fontSize: '13px', color: '#111827', fontWeight: '700' },
  detailFindings: {
    fontSize: '13px', color: '#374151', lineHeight: 1.8, fontWeight: '500',
    background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px',
  },
  detailPending: {
    fontSize: '13px', color: '#9CA3AF', lineHeight: 1.7, fontWeight: '500',
    background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px',
    fontStyle: 'italic',
  },

  // Media gallery
  mediaCount: {
    background: '#E8F4F1', color: '#1D6A4A', borderRadius: '20px',
    fontSize: '10px', fontWeight: '700', padding: '2px 8px', marginLeft: '6px',
  },
  mediaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  mediaThumb: {
    position: 'relative', borderRadius: '10px', overflow: 'hidden',
    cursor: 'pointer', aspectRatio: '4/3',
    border: '1.5px solid #E2E8F0',
  },
  mediaThumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  mediaThumbOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  mediaThumbCaption: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'rgba(0,0,0,0.55)', color: '#fff',
    fontSize: '10px', fontWeight: '600', padding: '4px 6px',
  },

  // ── Lightbox ──
  lightboxOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  lightboxBox: {
    position: 'relative', background: '#111827', borderRadius: '16px',
    maxWidth: '820px', width: '90vw', padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  lightboxClose: {
    position: 'absolute', top: '12px', right: '12px',
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
    color: '#fff', width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  lightboxImg: { width: '100%', borderRadius: '10px', objectFit: 'contain', maxHeight: '65vh' },
  lightboxCaption: { fontSize: '13px', color: '#9CA3AF', fontWeight: '500' },
  lightboxNav: { display: 'flex', alignItems: 'center', gap: '16px' },
  lightboxNavBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
    color: '#fff', width: '34px', height: '34px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
};

export default InspectionReport;
