import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  Search,
  Filter,
  Download,
  Home,
  Clock,
  RotateCw,
  CheckCircle2,
  Calendar,
  MapPin,
  Eye,
  MoreVertical,
  X,
  Building2,
  ShieldCheck,
  AlertCircle,
  Maximize,
  Phone,
} from 'lucide-react';

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const MOCK_SUMMARY = {
  total: 36,
  pending: 12,
  inProgress: 8,
  completed: 14,
  nextInspectionDate: '12 Aug 2025',
  nextInspectionProp: 'House #123, Street 5',
};

const INITIAL_PROPERTIES = [
  {
    id: 1,
    title: 'House #123, Street 5',
    ppc_id: 'PPC-PR-000123',
    owner_name: 'Ahmad Khan',
    owner_phone: '0300-1234567',
    location: 'Bahria Town Phase 8, Rawalpindi',
    area_short: 'Bahria Town Phase 8',
    type: 'House',
    verif_status: 'Verified',
    insp_status: 'Pending',
    last_inspection: '-',
    next_inspection_date: '12 Aug 2025',
    next_inspection_time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
    description: 'Executive 5 bedroom villa in Bahria Town. Scheduled for initial PPC physical verification.',
  },
  {
    id: 2,
    title: 'Plot #45, Block C',
    ppc_id: 'PPC-PR-000045',
    owner_name: 'Usman Ali',
    owner_phone: '0311-9876543',
    location: 'DHA Phase 2 Islamabad',
    area_short: 'DHA Phase 2',
    type: 'Plot',
    verif_status: 'Verified',
    insp_status: 'In Progress',
    last_inspection: '05 Aug 2025',
    next_inspection_date: '-',
    next_inspection_time: '',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
    description: 'Corner 1 Kanal residential plot in DHA Phase 2. Land boundary check in progress.',
  },
  {
    id: 3,
    title: 'House #67, Street 12',
    ppc_id: 'PPC-PR-000067',
    owner_name: 'Bilal Ahmed',
    owner_phone: '0321-6543210',
    location: 'G-13/4 Islamabad',
    area_short: 'G-13/4',
    type: 'House',
    verif_status: 'Verified',
    insp_status: 'In Progress',
    last_inspection: '06 Aug 2025',
    next_inspection_date: '13 Aug 2025',
    next_inspection_time: '11:30 AM',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
    description: '10 Marla house in G-13. Follow-up inspection scheduled for interior plumbing & electrical audit.',
  },
  {
    id: 4,
    title: 'Plot #09, Block A',
    ppc_id: 'PPC-PR-000009',
    owner_name: 'Faisal Malik',
    owner_phone: '0333-1112223',
    location: 'Citi Housing Jhelum',
    area_short: 'Citi Housing',
    type: 'Plot',
    verif_status: 'Unverified',
    insp_status: 'Pending',
    last_inspection: '-',
    next_inspection_date: '13 Aug 2025',
    next_inspection_time: '03:00 PM',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
    description: 'Newly registered plot awaiting site verification by PPC Inspector team.',
  },
  {
    id: 5,
    title: 'House #88, Street 3',
    ppc_id: 'PPC-PR-000088',
    owner_name: 'Hassan Raza',
    owner_phone: '0345-7778889',
    location: 'DHA Phase 5 Islamabad',
    area_short: 'DHA Phase 5',
    type: 'House',
    verif_status: 'Verified',
    insp_status: 'Completed',
    last_inspection: '08 Aug 2025',
    next_inspection_date: '22 Aug 2025',
    next_inspection_time: '10:30 AM',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
    description: 'Luxury bungalow. Physical inspection completed and passed. Next routine maintenance inspection set.',
  },
  {
    id: 6,
    title: 'Plot #22, Block B',
    ppc_id: 'PPC-PR-000022',
    owner_name: 'Imran Shah',
    owner_phone: '0305-5556677',
    location: 'Bahria Town Phase 7, Rawalpindi',
    area_short: 'Bahria Town Phase 7',
    type: 'Plot',
    verif_status: 'Verified',
    insp_status: 'Completed',
    last_inspection: '07 Aug 2025',
    next_inspection_date: '21 Aug 2025',
    next_inspection_time: '01:00 PM',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120&q=80',
    description: 'Verification audit complete and verified on PPC database.',
  },
  {
    id: 7,
    title: 'House #15, Street 9',
    ppc_id: 'PPC-PR-000015',
    owner_name: 'Zain Ul Abidin',
    owner_phone: '0310-2223334',
    location: 'PWD Housing Scheme Islamabad',
    area_short: 'PWD Housing',
    type: 'House',
    verif_status: 'Verified',
    insp_status: 'Pending',
    last_inspection: '-',
    next_inspection_date: '15 Aug 2025',
    next_inspection_time: '09:30 AM',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80',
    description: 'Residential property scheduled for PPC verification visit.',
  },
];

const InspectorProperties = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // State
  const [propertiesList, setPropertiesList] = useState(INITIAL_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Modals & Toast State
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const displayName = user?.full_name || user?.name || 'Inspector Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return propertiesList.filter((item) => {
      // Area filter
      if (
        areaFilter !== 'All Areas' &&
        !item.location.toLowerCase().includes(areaFilter.toLowerCase())
      )
        return false;

      // Type filter
      if (typeFilter !== 'All Types' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'All Status' && item.insp_status !== statusFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.ppc_id.toLowerCase().includes(q);
        const matchOwner = item.owner_name.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchOwner && !matchLoc) return false;
      }

      return true;
    });
  }, [propertiesList, areaFilter, typeFilter, statusFilter, searchQuery]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
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
          <h1 style={styles.headerTitle}>Properties</h1>
          <p style={styles.headerSubtitle}>
            View properties assigned for inspection and their verification status.
          </p>
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
        {/* Card 1: Total Assigned Properties */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Total Assigned Properties</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.total}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#E0F2FE', color: '#0284C7' }}>
              <Home size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>All time</span>
        </div>

        {/* Card 2: Pending Inspection */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Pending Inspection</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.pending}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Awaiting inspection</span>
        </div>

        {/* Card 3: In Progress */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>In Progress</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.inProgress}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#DBEAFE', color: '#1E40AF' }}>
              <RotateCw size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Currently inspecting</span>
        </div>

        {/* Card 4: Completed */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Completed</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.completed}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#DCFCE7', color: '#166534' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Inspections completed</span>
        </div>

        {/* Card 5: Next Inspection (Soonest) */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Next Inspection (Soonest)</span>
              <span style={styles.summaryCardValDate}>{MOCK_SUMMARY.nextInspectionDate}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#F3E8FF', color: '#9333EA' }}>
              <Calendar size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>{MOCK_SUMMARY.nextInspectionProp}</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEARCH & FILTERS BAR
      ═══════════════════════════════════════════════ */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Search Input */}
          <div style={styles.searchWrap}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by property name, ID, owner or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Area Filter */}
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

          {/* Type Filter */}
          <div style={styles.dropdownWrap}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Types">All Types</option>
              <option value="House">House</option>
              <option value="Plot">Plot</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Status Filter */}
          <div style={styles.dropdownWrap}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Filter Reset Button */}
          <button
            style={styles.filterBtn}
            onClick={() => {
              setSearchQuery('');
              setAreaFilter('All Areas');
              setTypeFilter('All Types');
              setStatusFilter('All Status');
            }}
          >
            <Filter size={14} color="#374151" />
            <span>Filters</span>
          </button>

          {/* Export Button */}
          <button
            style={styles.exportBtn}
            onClick={() => triggerToast('Exporting assigned properties dataset...')}
          >
            <Download size={14} color="#334155" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ASSIGNED PROPERTIES DATA TABLE
      ═══════════════════════════════════════════════ */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Property Details</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Verification Status</th>
              <th style={styles.th}>Inspection Status</th>
              <th style={styles.th}>Last Inspection</th>
              <th style={styles.th}>Next Inspection</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={10} style={styles.emptyTd}>
                  <div style={styles.emptyState}>
                    <AlertCircle size={36} color="#9CA3AF" />
                    <p style={styles.emptyText}>No assigned properties match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProperties.map((item, index) => {
                // Verification status badge colors
                const verifBg = item.verif_status === 'Verified' ? '#DCFCE7' : '#FEE2E2';
                const verifColor = item.verif_status === 'Verified' ? '#166534' : '#991B1B';

                // Inspection status badge colors
                const inspBg =
                  item.insp_status === 'Pending'
                    ? '#FEF3C7'
                    : item.insp_status === 'In Progress'
                    ? '#DBEAFE'
                    : '#DCFCE7';
                const inspColor =
                  item.insp_status === 'Pending'
                    ? '#92400E'
                    : item.insp_status === 'In Progress'
                    ? '#1E40AF'
                    : '#166534';

                return (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.tdIndex}>{index + 1}</td>

                    {/* Property Details */}
                    <td style={styles.td}>
                      <div style={styles.propDetailsGroup}>
                        <img src={item.image} alt={item.title} style={styles.propThumb} />
                        <div>
                          <h4 style={styles.propTitle}>{item.title}</h4>
                          <span style={styles.propId}>{item.ppc_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={styles.td}>
                      <div style={styles.ownerGroup}>
                        <span style={styles.ownerName}>{item.owner_name}</span>
                        <span style={styles.ownerPhone}>{item.owner_phone}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td style={styles.td}>
                      <span style={styles.locationText}>{item.location}</span>
                    </td>

                    {/* Type */}
                    <td style={styles.td}>
                      <div style={styles.typeGroup}>
                        <Building2 size={14} color="#64748B" />
                        <span style={styles.typeText}>{item.type}</span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: verifBg, color: verifColor }}>
                        {item.verif_status}
                      </span>
                    </td>

                    {/* Inspection Status */}
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: inspBg, color: inspColor }}>
                        {item.insp_status}
                      </span>
                    </td>

                    {/* Last Inspection */}
                    <td style={styles.td}>
                      <span style={styles.dateSubText}>{item.last_inspection}</span>
                    </td>

                    {/* Next Inspection */}
                    <td style={styles.td}>
                      {item.next_inspection_date !== '-' ? (
                        <div style={styles.nextInspGroup}>
                          <span style={styles.nextDate}>{item.next_inspection_date}</span>
                          <span style={styles.nextTime}>{item.next_inspection_time}</span>
                        </div>
                      ) : (
                        <span style={styles.dateSubText}>-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={styles.tdActions}>
                      <div style={styles.actionButtonsRow}>
                        <button
                          style={styles.detailsBtn}
                          onClick={() => setSelectedDetails(item)}
                        >
                          View Details
                        </button>
                        <button
                          style={styles.moreBtn}
                          onClick={() => setSelectedDetails(item)}
                          title="More Options"
                        >
                          <MoreVertical size={16} color="#94A3B8" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={styles.paginationRow}>
          <span style={styles.paginationText}>
            Showing 1 to {filteredProperties.length} of {MOCK_SUMMARY.total} properties
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

      {/* ═══════════════════════════════════════════════
          VIEW PROPERTY DETAILS MODAL
      ═══════════════════════════════════════════════ */}
      {selectedDetails && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDetails(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#2563EB" />
                <h3 style={styles.modalTitle}>Property Inspection Overview</h3>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setSelectedDetails(null)}>
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalHero}>
                <img
                  src={selectedDetails.image}
                  alt={selectedDetails.title}
                  style={styles.modalImg}
                />
                <div>
                  <h2 style={styles.modalHeroTitle}>{selectedDetails.title}</h2>
                  <p style={styles.modalHeroSub}>
                    <MapPin size={13} color="#64748B" /> {selectedDetails.location}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span style={styles.modalTagId}>{selectedDetails.ppc_id}</span>
                    <span style={styles.modalTagType}>{selectedDetails.type}</span>
                  </div>
                </div>
              </div>

              <div style={styles.infoGrid2}>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Owner Name:</span>
                  <strong style={styles.infoVal}>{selectedDetails.owner_name}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Owner Contact:</span>
                  <strong style={styles.infoVal}>{selectedDetails.owner_phone}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>PPC Verification Status:</span>
                  <strong style={styles.infoValGreen}>{selectedDetails.verif_status}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Current Inspection Status:</span>
                  <strong style={styles.infoValBlue}>{selectedDetails.insp_status}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Last Inspection Date:</span>
                  <strong style={styles.infoVal}>{selectedDetails.last_inspection}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Next Scheduled Inspection:</span>
                  <strong style={styles.infoVal}>
                    {selectedDetails.next_inspection_date} {selectedDetails.next_inspection_time}
                  </strong>
                </div>
              </div>

              <div style={styles.notesBox}>
                <h4 style={styles.notesTitle}>Property Description & Notes:</h4>
                <p style={styles.notesContent}>{selectedDetails.description}</p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.primaryModalBtn} onClick={() => setSelectedDetails(null)}>
                Close Details
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
    fontSize: '12px',
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
  summaryCardValDate: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1.2,
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
    minWidth: '240px',
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
    padding: '7.5px 16px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    marginLeft: 'auto',
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

  propDetailsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  propThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  propTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  propId: {
    fontSize: '11px',
    color: '#64748B',
    display: 'block',
    marginTop: '1px',
  },

  ownerGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  ownerName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  ownerPhone: {
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '1px',
  },

  locationText: {
    fontSize: '12.5px',
    color: '#334155',
    fontWeight: '500',
  },

  typeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  typeText: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
  },

  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },

  dateSubText: {
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
  },

  nextInspGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  nextDate: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#0F172A',
  },
  nextTime: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '1px',
  },

  actionButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  detailsBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  moreBtn: {
    background: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
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

  /* ── Pagination ── */
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

  /* ── Modal ── */
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
    maxWidth: '540px',
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
  modalTagId: {
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  modalTagType: {
    background: '#F1F5F9',
    color: '#334155',
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
  infoValGreen: {
    color: '#166534',
    fontWeight: '700',
    marginTop: '2px',
  },
  infoValBlue: {
    color: '#1E40AF',
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

  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
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

export default InspectorProperties;
