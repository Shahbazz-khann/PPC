import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  MapPin,
  X,
  Check,
  Zap,
  Droplets,
  AlertTriangle,
  Layers,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const MOCK_SUMMARY = {
  total: 42,
  drafts: 5,
  submitted: 28,
  approved: 32,
  revisions: 4,
};

const INITIAL_REPORTS = [
  {
    id: 1,
    title: 'House # 123, Street 5',
    report_id: 'RPT-2025-00042',
    inspector_name: 'Inspector Sara',
    inspection_date: '12 Aug 2025',
    inspection_time: '10:00 AM',
    inspection_id: 'INS-00078',
    property_location: 'Bahria Town Phase 8, Rawalpindi',
    submitted_date: '12 Aug 2025',
    submitted_time: '02:30 PM',
    status: 'Approved',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
    notes: 'Structure, boundary wall, electrical wiring, and plumbing verified. Report approved with A+ quality rating.',
  },
  {
    id: 2,
    title: 'Plot # 45, Block C',
    report_id: 'RPT-2025-00041',
    inspector_name: 'Inspector Sara',
    inspection_date: '12 Aug 2025',
    inspection_time: '02:00 PM',
    inspection_id: 'INS-00077',
    property_location: 'DHA Phase 2, Islamabad',
    submitted_date: '12 Aug 2025',
    submitted_time: '05:15 PM',
    status: 'Submitted',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
    notes: 'Land plot boundary marks checked. Awaiting senior inspector review.',
  },
  {
    id: 3,
    title: 'House # 67, Street 12',
    report_id: 'RPT-2025-00040',
    inspector_name: 'Inspector Sara',
    inspection_date: '13 Aug 2025',
    inspection_time: '11:30 AM',
    inspection_id: 'INS-00076',
    property_location: 'G-13/4, Islamabad',
    submitted_date: '13 Aug 2025',
    submitted_time: '01:45 PM',
    status: 'Under Review',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
    notes: 'Furnishing quality audit report submitted. Currently under review by QA lead.',
  },
  {
    id: 4,
    title: 'Plot # 09, Block A',
    report_id: 'RPT-2025-00039',
    inspector_name: 'Inspector Sara',
    inspection_date: '13 Aug 2025',
    inspection_time: '03:00 PM',
    inspection_id: 'INS-00075',
    property_location: 'Citi Housing, Jhelum',
    submitted_date: '13 Aug 2025',
    submitted_time: '04:20 PM',
    status: 'Revision Requested',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
    notes: 'Additional high-resolution photographs of boundary demarcation needed.',
  },
  {
    id: 5,
    title: 'House # 88, Street 3',
    report_id: 'RPT-2025-00038',
    inspector_name: 'Inspector Sara',
    inspection_date: '14 Aug 2025',
    inspection_time: '10:30 AM',
    inspection_id: 'INS-00074',
    property_location: 'DHA Phase 5, Islamabad',
    submitted_date: '14 Aug 2025',
    submitted_time: '12:10 PM',
    status: 'Approved',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
    notes: 'Solar grid and electrical inspection passed.',
  },
  {
    id: 6,
    title: 'Plot # 22, Block B',
    report_id: 'RPT-2025-00037',
    inspector_name: 'Inspector Sara',
    inspection_date: '14 Aug 2025',
    inspection_time: '01:00 PM',
    inspection_id: 'INS-00073',
    property_location: 'Bahria Town Phase 7, Rawalpindi',
    submitted_date: '14 Aug 2025',
    submitted_time: '03:50 PM',
    status: 'Approved',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120&q=80',
    notes: 'Corner plot possession and area measurement verified.',
  },
  {
    id: 7,
    title: 'House # 15, Street 9',
    report_id: 'RPT-2025-00036',
    inspector_name: 'Inspector Sara',
    inspection_date: '15 Aug 2025',
    inspection_time: '09:30 AM',
    inspection_id: 'INS-00072',
    property_location: 'PWD Housing Scheme, Islamabad',
    submitted_date: '15 Aug 2025',
    submitted_time: '11:30 AM',
    status: 'Submitted',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80',
    notes: 'Full structural report submitted for review.',
  },
];

const ISSUE_CATEGORIES = [
  { label: 'Boundary Wall Issues', count: 12, percent: 28, color: '#EF4444', icon: AlertTriangle, bg: '#FEE2E2' },
  { label: 'Electricity / Wiring', count: 9, percent: 21, color: '#D97706', icon: Zap, bg: '#FEF3C7' },
  { label: 'Plumbing Issues', count: 7, percent: 17, color: '#2563EB', icon: Droplets, bg: '#DBEAFE' },
  { label: 'Structural Cracks', count: 6, percent: 14, color: '#16A34A', icon: ShieldCheck, bg: '#DCFCE7' },
  { label: 'Other', count: 8, percent: 19, color: '#9333EA', icon: Layers, bg: '#F3E8FF' },
];

const RECENT_ACTIVITIES = [
  { id: 1, text: 'Report RPT-2025-00042 approved', date: '12 Aug 2025, 04:20 PM', status: 'approved', dotColor: '#22C55E' },
  { id: 2, text: 'Report RPT-2025-00040 under review', date: '13 Aug 2025, 01:45 PM', status: 'review', dotColor: '#EAB308' },
  { id: 3, text: 'Revision requested for RPT-2025-00039', date: '13 Aug 2025, 04:20 PM', status: 'revision', dotColor: '#EF4444' },
];

const InspectorReports = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // Data & Filter states
  const [reportsList, setReportsList] = useState(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [dateRange, setDateRange] = useState('11 Aug 2025 - 17 Aug 2025');

  // Modals & Toast State
  const [selectedReport, setSelectedReport] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const displayName = user?.full_name || user?.name || 'Inspector Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';

  // Filtered reports computation
  const filteredReports = useMemo(() => {
    return reportsList.filter((item) => {
      // Status filter
      if (statusFilter !== 'All Status' && item.status !== statusFilter) return false;

      // Area filter
      if (
        areaFilter !== 'All Areas' &&
        !item.property_location.toLowerCase().includes(areaFilter.toLowerCase())
      )
        return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.report_id.toLowerCase().includes(q);
        const matchIns = item.inspection_id.toLowerCase().includes(q);
        const matchLoc = item.property_location.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchIns && !matchLoc) return false;
      }

      return true;
    });
  }, [reportsList, statusFilter, areaFilter, searchQuery]);

  // Toast actions
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toastBanner}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={styles.toastText}>{toastMessage}</span>
          <button style={styles.closeToastBtn} onClick={() => setToastMessage(null)}>
            <X size={14} color="#065F46" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TOP HEADER BAR
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        <div>
          <h1 style={styles.headerTitle}>Reports</h1>
          <p style={styles.headerSubtitle}>View, manage and download inspection reports.</p>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.notificationBtn} aria-label="Notifications">
            <Bell size={18} color="#374151" />
            <span style={styles.notificationBadge}>2</span>
          </button>

          <div style={styles.profileChip} onClick={() => navigate('/inspector/profile')}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={styles.profileAvatar}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';
              }}
            />
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{displayName}</span>
              <span style={styles.profileRole}>{displayRole}</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          SUMMARY METRIC CARDS (5 Cards Row)
      ═══════════════════════════════════════════════ */}
      <section style={styles.summaryGrid}>
        {/* Card 1: Total Reports */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Total Reports</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.total}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#E0F2FE', color: '#0284C7' }}>
              <FileText size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>All time</span>
        </div>

        {/* Card 2: Draft Reports */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Draft Reports</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.drafts}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Not submitted</span>
        </div>

        {/* Card 3: Submitted */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Submitted</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.submitted}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#DCFCE7', color: '#16A34A' }}>
              <Send size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Awaiting review</span>
        </div>

        {/* Card 4: Approved */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Approved</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.approved}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#F3E8FF', color: '#9333EA' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>This month</span>
        </div>

        {/* Card 5: Revisions Requested */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Revisions Requested</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.revisions}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEE2E2', color: '#DC2626' }}>
              <XCircle size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Need updates</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEARCH & FILTERS BAR
      ═══════════════════════════════════════════════ */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Search Box */}
          <div style={styles.searchWrap}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by property, owner, or report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Status Dropdown */}
          <div style={styles.dropdownWrap}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Status">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Revision Requested">Revision Requested</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Area Dropdown */}
          <div style={styles.dropdownWrap}>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Areas">All Areas</option>
              <option value="Bahria Town">Bahria Town</option>
              <option value="DHA Phase 2">DHA Phase 2</option>
              <option value="G-13">G-13</option>
              <option value="Citi Housing">Citi Housing</option>
              <option value="DHA Phase 5">DHA Phase 5</option>
              <option value="PWD Housing">PWD Housing</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Date Range Selector */}
          <div style={styles.dropdownWrapRange}>
            <Calendar size={14} color="#6B7280" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.selectElRange}
            >
              <option value="11 Aug 2025 - 17 Aug 2025">11 Aug 2025 - 17 Aug 2025</option>
              <option value="18 Aug 2025 - 24 Aug 2025">18 Aug 2025 - 24 Aug 2025</option>
              <option value="This Month">This Month (Aug 2025)</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Filter Reset Button */}
          <button
            style={styles.filterBtn}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All Status');
              setAreaFilter('All Areas');
            }}
          >
            <Filter size={14} color="#374151" />
            <span>Filters</span>
          </button>

          {/* Export Button */}
          <button
            style={styles.exportBtn}
            onClick={() => triggerToast('Exporting inspection reports dataset (PDF/Excel)...')}
          >
            <Download size={14} color="#334155" />
            <span>Export Reports</span>
            <ChevronDown size={14} color="#334155" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT AREA (2 Columns: Table + Side Panels)
      ═══════════════════════════════════════════════ */}
      <div style={styles.mainGrid2}>
        {/* Left Column: Reports Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Report Details</th>
                <th style={styles.th}>Inspection</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Date Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyTd}>
                    <div style={styles.emptyState}>
                      <AlertCircle size={36} color="#9CA3AF" />
                      <p style={styles.emptyText}>No inspection reports match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((item, index) => {
                  // Status Badge Colors
                  const statusBg =
                    item.status === 'Approved'
                      ? '#DCFCE7'
                      : item.status === 'Submitted'
                      ? '#DBEAFE'
                      : item.status === 'Under Review'
                      ? '#FEF3C7'
                      : item.status === 'Revision Requested'
                      ? '#FEE2E2'
                      : '#F1F5F9';

                  const statusColor =
                    item.status === 'Approved'
                      ? '#166534'
                      : item.status === 'Submitted'
                      ? '#1E40AF'
                      : item.status === 'Under Review'
                      ? '#92400E'
                      : item.status === 'Revision Requested'
                      ? '#991B1B'
                      : '#475569';

                  return (
                    <tr key={item.id} style={styles.tableRow}>
                      <td style={styles.tdIndex}>{index + 1}</td>

                      {/* Report Details */}
                      <td style={styles.td}>
                        <div style={styles.reportDetailsGroup}>
                          <img src={item.image} alt={item.title} style={styles.reportThumb} />
                          <div>
                            <h4 style={styles.reportTitle}>{item.title}</h4>
                            <span style={styles.reportId}>{item.report_id}</span>
                            <span style={styles.reportInspector}>{item.inspector_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Inspection info */}
                      <td style={styles.td}>
                        <div style={styles.inspGroup}>
                          <span style={styles.inspDate}>{item.inspection_date}</span>
                          <span style={styles.inspTime}>{item.inspection_time}</span>
                          <span style={styles.inspId}>{item.inspection_id}</span>
                        </div>
                      </td>

                      {/* Property Location */}
                      <td style={styles.td}>
                        <span style={styles.propLocText}>{item.property_location}</span>
                      </td>

                      {/* Date Submitted */}
                      <td style={styles.td}>
                        <div style={styles.inspGroup}>
                          <span style={styles.inspDate}>{item.submitted_date}</span>
                          <span style={styles.inspTime}>{item.submitted_time}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: statusBg, color: statusColor }}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={styles.tdActions}>
                        <div style={styles.actionButtonsRow}>
                          <button
                            style={styles.iconBtn}
                            title="View Report Details"
                            onClick={() => setSelectedReport(item)}
                          >
                            <Eye size={15} color="#475569" />
                          </button>

                          <button
                            style={styles.iconBtn}
                            title="Download PDF Report"
                            onClick={() => triggerToast(`Downloading PDF for ${item.report_id}...`)}
                          >
                            <Download size={15} color="#475569" />
                          </button>

                          <button
                            style={styles.iconBtn}
                            title="More Actions"
                            onClick={() => setSelectedReport(item)}
                          >
                            <MoreVertical size={15} color="#94A3B8" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table Pagination Bar */}
          <div style={styles.paginationRow}>
            <span style={styles.paginationText}>
              Showing 1 to {filteredReports.length} of {MOCK_SUMMARY.total} reports
            </span>

            <div style={styles.paginationControls}>
              <button
                style={styles.pageArrowBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <button
                style={currentPage === 1 ? styles.pageNumActive : styles.pageNumInactive}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                style={currentPage === 2 ? styles.pageNumActive : styles.pageNumInactive}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                style={currentPage === 3 ? styles.pageNumActive : styles.pageNumInactive}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
              <button
                style={currentPage === 4 ? styles.pageNumActive : styles.pageNumInactive}
                onClick={() => setCurrentPage(4)}
              >
                4
              </button>
              <button
                style={currentPage === 5 ? styles.pageNumActive : styles.pageNumInactive}
                onClick={() => setCurrentPage(5)}
              >
                5
              </button>
              <button style={styles.pageArrowBtn} onClick={() => setCurrentPage((p) => p + 1)}>
                &gt;
              </button>

              <div style={{ ...styles.dropdownWrap, minWidth: '100px', marginLeft: '8px' }}>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={styles.selectElPage}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panels Column */}
        <div style={styles.sideCol}>
          {/* Card 1: Reports Overview Donut Chart */}
          <div style={styles.panelCard}>
            <h3 style={styles.panelTitle}>Reports Overview</h3>

            <div style={styles.donutSection}>
              <div style={styles.donutWrapper}>
                <svg viewBox="0 0 100 100" style={styles.donutSvg}>
                  <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="11" fill="none" />
                  {/* Approved (76%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22C55E"
                    strokeWidth="11"
                    fill="none"
                    strokeDasharray="190 251.3"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Submitted (67%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3B82F6"
                    strokeWidth="11"
                    fill="none"
                    strokeDasharray="168 251.3"
                    strokeDashoffset="-60"
                    strokeLinecap="round"
                  />
                  {/* Under Review (12%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EAB308"
                    strokeWidth="11"
                    fill="none"
                    strokeDasharray="30 251.3"
                    strokeDashoffset="-140"
                    strokeLinecap="round"
                  />
                  {/* Revision Requested (10%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EF4444"
                    strokeWidth="11"
                    fill="none"
                    strokeDasharray="25 251.3"
                    strokeDashoffset="-175"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={styles.donutCenter}>
                  <span style={styles.donutCenterValue}>{MOCK_SUMMARY.total}</span>
                  <span style={styles.donutCenterLabel}>Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div style={styles.legendList}>
                <div style={styles.legendRow}>
                  <div style={styles.legendDotGroup}>
                    <span style={{ ...styles.legendDot, background: '#22C55E' }} />
                    <span style={styles.legendLabel}>Approved</span>
                  </div>
                  <span style={styles.legendVal}>32 (76%)</span>
                </div>

                <div style={styles.legendRow}>
                  <div style={styles.legendDotGroup}>
                    <span style={{ ...styles.legendDot, background: '#3B82F6' }} />
                    <span style={styles.legendLabel}>Submitted</span>
                  </div>
                  <span style={styles.legendVal}>28 (67%)</span>
                </div>

                <div style={styles.legendRow}>
                  <div style={styles.legendDotGroup}>
                    <span style={{ ...styles.legendDot, background: '#EAB308' }} />
                    <span style={styles.legendLabel}>Under Review</span>
                  </div>
                  <span style={styles.legendVal}>5 (12%)</span>
                </div>

                <div style={styles.legendRow}>
                  <div style={styles.legendDotGroup}>
                    <span style={{ ...styles.legendDot, background: '#EF4444' }} />
                    <span style={styles.legendLabel}>Revision Requested</span>
                  </div>
                  <span style={styles.legendVal}>4 (10%)</span>
                </div>

                <div style={styles.legendRow}>
                  <div style={styles.legendDotGroup}>
                    <span style={{ ...styles.legendDot, background: '#94A3B8' }} />
                    <span style={styles.legendLabel}>Draft</span>
                  </div>
                  <span style={styles.legendVal}>5 (12%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Issue Categories */}
          <div style={styles.panelCard}>
            <h3 style={styles.panelTitle}>Top Issue Categories</h3>

            <div style={styles.issuesList}>
              {ISSUE_CATEGORIES.map((cat, idx) => {
                const IconComp = cat.icon;
                return (
                  <div key={idx} style={styles.issueRow}>
                    <div style={styles.issueLeft}>
                      <div style={{ ...styles.issueIconBox, background: cat.bg, color: cat.color }}>
                        <IconComp size={15} />
                      </div>
                      <span style={styles.issueLabel}>{cat.label}</span>
                    </div>
                    <span style={styles.issueVal}>
                      {cat.count} <span style={styles.issueSub}>({cat.percent}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Recent Activity */}
          <div style={styles.panelCard}>
            <div style={styles.panelHeaderRow}>
              <h3 style={styles.panelTitle}>Recent Activity</h3>
              <button
                style={styles.viewAllBtn}
                onClick={() => triggerToast('Viewing complete activity history...')}
              >
                View all
              </button>
            </div>

            <div style={styles.activityList}>
              {RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} style={styles.activityItem}>
                  <span style={{ ...styles.activityDot, background: act.dotColor }} />
                  <div>
                    <h4 style={styles.activityText}>{act.text}</h4>
                    <span style={styles.activityDate}>{act.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VIEW REPORT DETAILS MODAL
      ═══════════════════════════════════════════════ */}
      {selectedReport && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#2563EB" />
                <h3 style={styles.modalTitle}>Inspection Report Details</h3>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setSelectedReport(null)}>
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalHero}>
                <img
                  src={selectedReport.image}
                  alt={selectedReport.title}
                  style={styles.modalImg}
                />
                <div>
                  <h2 style={styles.modalHeroTitle}>{selectedReport.title}</h2>
                  <p style={styles.modalHeroSub}>
                    <MapPin size={13} color="#64748B" /> {selectedReport.property_location}
                  </p>
                  <span style={styles.modalReportIdTag}>{selectedReport.report_id}</span>
                </div>
              </div>

              <div style={styles.infoGrid2}>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Inspection ID:</span>
                  <strong style={styles.infoVal}>{selectedReport.inspection_id}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Inspection Date:</span>
                  <strong style={styles.infoVal}>{selectedReport.inspection_date}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Date Submitted:</span>
                  <strong style={styles.infoVal}>{selectedReport.submitted_date}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Report Status:</span>
                  <strong style={styles.infoVal}>{selectedReport.status}</strong>
                </div>
              </div>

              <div style={styles.notesBox}>
                <h4 style={styles.notesTitle}>Inspector Findings & Summary:</h4>
                <p style={styles.notesContent}>{selectedReport.notes}</p>
              </div>

              <div style={styles.scoresGrid}>
                <div style={styles.scoreCard}>
                  <span style={styles.scoreLabel}>Boundary & Land</span>
                  <span style={styles.scoreValGreen}>95 / 100</span>
                </div>
                <div style={styles.scoreCard}>
                  <span style={styles.scoreLabel}>Structure & Walls</span>
                  <span style={styles.scoreValGreen}>90 / 100</span>
                </div>
                <div style={styles.scoreCard}>
                  <span style={styles.scoreLabel}>Wiring & Solar</span>
                  <span style={styles.scoreValBlue}>88 / 100</span>
                </div>
                <div style={styles.scoreCard}>
                  <span style={styles.scoreLabel}>Plumbing & Drainage</span>
                  <span style={styles.scoreValBlue}>85 / 100</span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryModalBtn}
                onClick={() => triggerToast(`Downloading PDF for ${selectedReport.report_id}...`)}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
              <button style={styles.primaryModalBtn} onClick={() => setSelectedReport(null)}>
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Styles Object ────────────────────────────────────────────────────────────
const styles = {
  container: {
    background: '#F8FAFC',
    minHeight: '100vh',
    padding: '24px 32px 40px 32px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#0F172A',
  },

  toastBanner: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#ECFDF5',
    border: '1.5px solid #A7F3D0',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  toastText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#065F46',
  },
  closeToastBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },

  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  notificationBtn: {
    position: 'relative',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },

  profileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '6px 12px 6px 8px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #E2E8F0',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#64748B',
  },

  /* ── 5 Metric Cards Row ── */
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  summaryCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  summaryCardTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    display: 'block',
    marginBottom: '4px',
  },
  summaryCardVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },
  summaryIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySubtext: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '500',
  },

  /* ── Filter Card ── */
  filterCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '12px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    marginBottom: '24px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 12px',
    flex: 2,
    minWidth: '220px',
    background: '#F8FAFC',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#0F172A',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  dropdownWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '120px',
  },
  selectEl: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 28px 7.5px 12px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  dropdownWrapRange: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7px 12px',
    background: '#FFFFFF',
    minWidth: '210px',
  },
  selectElRange: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    background: 'transparent',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  selectIcon: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    padding: '7.5px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    marginLeft: 'auto',
  },

  /* ── 2 Column Grid ── */
  mainGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },

  /* ── Table Card ── */
  tableCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    background: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '14px 16px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background 0.15s ease',
  },
  tdIndex: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748B',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#0F172A',
    verticalAlign: 'middle',
  },
  tdActions: {
    padding: '14px 16px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },

  reportDetailsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  reportThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  reportTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  reportId: {
    fontSize: '11px',
    color: '#64748B',
    display: 'block',
    marginTop: '1px',
    fontWeight: '500',
  },
  reportInspector: {
    fontSize: '11px',
    color: '#94A3B8',
    display: 'block',
  },

  inspGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  inspDate: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#0F172A',
  },
  inspTime: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '1px',
  },
  inspId: {
    fontSize: '10.5px',
    color: '#94A3B8',
    marginTop: '1px',
  },

  propLocText: {
    fontSize: '12.5px',
    color: '#334155',
    fontWeight: '500',
  },

  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },

  actionButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  iconBtn: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },

  emptyTd: {
    padding: '40px 16px',
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },

  paginationRow: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #E2E8F0',
    background: '#F8FAFC',
  },
  paginationText: {
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pageArrowBtn: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumActive: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  pageNumInactive: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  selectElPage: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '4px 24px 4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
  },

  /* ── Right Side Column Cards ── */
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  panelCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  panelTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 16px 0',
  },
  panelHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  viewAllBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563EB',
    cursor: 'pointer',
  },

  /* Donut Section */
  donutSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  donutWrapper: {
    position: 'relative',
    width: '130px',
    height: '130px',
    flexShrink: 0,
  },
  donutSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },
  donutCenterLabel: {
    fontSize: '10.5px',
    color: '#64748B',
    fontWeight: '500',
    marginTop: '2px',
  },

  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  legendDotGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendLabel: {
    color: '#334155',
    fontWeight: '600',
  },
  legendVal: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: '11.5px',
  },

  /* Issue Categories */
  issuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  issueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12.5px',
  },
  issueLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  issueIconBox: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  issueVal: {
    fontWeight: '700',
    color: '#0F172A',
  },
  issueSub: {
    color: '#64748B',
    fontWeight: '500',
  },

  /* Recent Activity */
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  activityText: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.3,
  },
  activityDate: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
    display: 'block',
  },

  /* Modals */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: '#FFFFFF',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  modalCloseBtn: {
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalHero: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    background: '#F8FAFC',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  modalImg: {
    width: '70px',
    height: '70px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  modalHeroTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  modalHeroSub: {
    fontSize: '12px',
    color: '#64748B',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: '3px 0 0 0',
  },
  modalReportIdTag: {
    display: 'inline-block',
    marginTop: '6px',
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },

  infoGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px',
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px',
  },
  infoLabel: {
    color: '#64748B',
  },
  infoVal: {
    color: '#0F172A',
    fontWeight: '700',
    marginTop: '2px',
  },

  notesBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '14px',
  },
  notesTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 6px 0',
  },
  notesContent: {
    fontSize: '12.5px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5',
  },

  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  scoreCard: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  scoreLabel: {
    fontSize: '11.5px',
    color: '#64748B',
    fontWeight: '600',
  },
  scoreValGreen: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#16A34A',
  },
  scoreValBlue: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#2563EB',
  },

  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  secondaryModalBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    color: '#334155',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  primaryModalBtn: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

export default InspectorReports;
