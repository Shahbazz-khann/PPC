import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  Search,
  Download,
  Plus,
  ClipboardList,
  Clock,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  MoreVertical,
  Calendar,
  Phone,
  MapPin,
  X,
  Check,
  AlertCircle,
  Filter,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_INSPECTIONS = [
  {
    id: 1,
    property_title: 'House # 123, Street 5',
    address: 'Bahria Town, Phase 8 Rawalpindi',
    owner_name: 'Ahmad Khan',
    owner_phone: '0300-1234567',
    area: 'Bahria Town Phase 8',
    scheduled_date: '12 Aug 2025',
    scheduled_time: '10:00 AM',
    status: 'Pending',
    priority: 'High',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
    notes: 'Physical verification required for structural integrity, boundary check, and electrical fittings.',
  },
  {
    id: 2,
    property_title: 'Plot # 45, Block C',
    address: 'DHA Phase 2 Islamabad',
    owner_name: 'Usman Ali',
    owner_phone: '0311-9876543',
    area: 'DHA Phase 2 Islamabad',
    scheduled_date: '12 Aug 2025',
    scheduled_time: '02:00 PM',
    status: 'In Progress',
    priority: 'Medium',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
    notes: 'Boundary coordinates and access road verification ongoing.',
  },
  {
    id: 3,
    property_title: 'House # 67, Street 12',
    address: 'G-13/4 Islamabad',
    owner_name: 'Bilal Ahmed',
    owner_phone: '0321-6543210',
    area: 'G-13/4 Islamabad',
    scheduled_date: '13 Aug 2025',
    scheduled_time: '11:30 AM',
    status: 'In Progress',
    priority: 'High',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
    notes: 'Interior quality and plumbing audit in progress.',
  },
  {
    id: 4,
    property_title: 'Plot # 09, Block A',
    address: 'Citi Housing Jhelum',
    owner_name: 'Faisal Malik',
    owner_phone: '0333-1112223',
    area: 'Citi Housing Jhelum',
    scheduled_date: '13 Aug 2025',
    scheduled_time: '03:00 PM',
    status: 'Pending',
    priority: 'Medium',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
    notes: 'Site visit scheduled for plot soil and level inspection.',
  },
  {
    id: 5,
    property_title: 'House # 88, Street 3',
    address: 'DHA Phase 5 Islamabad',
    owner_name: 'Hassan Raza',
    owner_phone: '0345-7778889',
    area: 'DHA Phase 5 Islamabad',
    scheduled_date: '14 Aug 2025',
    scheduled_time: '10:30 AM',
    status: 'Completed',
    priority: 'Low',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
    notes: 'Passed all PPC inspection standards. Detailed verification report submitted.',
  },
  {
    id: 6,
    property_title: 'Plot # 22, Block B',
    address: 'Bahria Town, Phase 7 Rawalpindi',
    owner_name: 'Imran Shah',
    owner_phone: '0305-5556677',
    area: 'Bahria Town Phase 7',
    scheduled_date: '14 Aug 2025',
    scheduled_time: '01:00 PM',
    status: 'Completed',
    priority: 'Low',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120&q=80',
    notes: 'Corner plot dimensions verified.',
  },
  {
    id: 7,
    property_title: 'House # 15, Street 9',
    address: 'PWD Housing Scheme Islamabad',
    owner_name: 'Zain Ul Abidin',
    owner_phone: '0310-2223334',
    area: 'PWD Housing Scheme Islamabad',
    scheduled_date: '15 Aug 2025',
    scheduled_time: '09:30 AM',
    status: 'Completed',
    priority: 'Medium',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80',
    notes: 'Verification report submitted and approved.',
  },
];

const SUMMARY_METRICS = {
  total: 24,
  pending: 7,
  inProgress: 4,
  completed: 13,
  cancelled: 0,
};

const Inspection = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // Data state
  const [inspectionsList, setInspectionsList] = useState(INITIAL_INSPECTIONS);

  // Active status tab: 'All' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  const [activeTab, setActiveTab] = useState('All');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [dateFilter, setDateFilter] = useState('');

  // Modals state
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [editingInspection, setEditingInspection] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ inspectionId: 1, noteText: '' });
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const displayName = user?.full_name || user?.name || 'Inspector Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

  // Filtered List Computation
  const filteredInspections = useMemo(() => {
    return inspectionsList.filter((item) => {
      // Tab filter
      if (activeTab === 'Pending' && item.status !== 'Pending') return false;
      if (activeTab === 'In Progress' && item.status !== 'In Progress') return false;
      if (activeTab === 'Completed' && item.status !== 'Completed') return false;
      if (activeTab === 'Cancelled' && item.status !== 'Cancelled') return false;

      // Status dropdown filter
      if (statusFilter !== 'All Status' && item.status !== statusFilter) return false;

      // Area dropdown filter
      if (areaFilter !== 'All Areas' && !item.area.toLowerCase().includes(areaFilter.toLowerCase()))
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.property_title.toLowerCase().includes(q);
        const matchOwner = item.owner_name.toLowerCase().includes(q);
        const matchAddr = item.address.toLowerCase().includes(q);
        const matchArea = item.area.toLowerCase().includes(q);
        if (!matchTitle && !matchOwner && !matchAddr && !matchArea) return false;
      }

      return true;
    });
  }, [inspectionsList, activeTab, statusFilter, areaFilter, searchQuery]);

  // Handle Export
  const handleExport = () => {
    setToastMessage('Inspection records exported successfully (CSV format).');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Save Inspection Note
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteForm.noteText.trim()) return;

    setInspectionsList((prev) =>
      prev.map((item) => {
        if (item.id === Number(noteForm.inspectionId)) {
          return {
            ...item,
            notes: `${item.notes}\nNote [${new Date().toLocaleDateString()}]: ${noteForm.noteText.trim()}`,
          };
        }
        return item;
      })
    );

    setToastMessage('Inspection note appended successfully.');
    setTimeout(() => setToastMessage(null), 4000);
    setIsAddingNote(false);
    setNoteForm({ inspectionId: 1, noteText: '' });
  };

  // Handle Save Status Edit
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!editingInspection) return;

    setInspectionsList((prev) =>
      prev.map((item) => {
        if (item.id === editingInspection.id) {
          return {
            ...item,
            status: editingInspection.status,
            priority: editingInspection.priority,
            notes: editingInspection.notes,
          };
        }
        return item;
      })
    );

    setToastMessage(`Inspection status updated to ${editingInspection.status}.`);
    setTimeout(() => setToastMessage(null), 4000);
    setEditingInspection(null);
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert Banner */}
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
          <h1 style={styles.headerTitle}>Inspections</h1>
          <p style={styles.headerSubtitle}>
            Manage and track all property inspections assigned to you.
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
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
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
          STATUS TABS & TOP ACTIONS ROW
      ═══════════════════════════════════════════════ */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsList}>
          <button
            style={activeTab === 'All' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('All')}
          >
            <span>All Inspections</span>
            <span style={activeTab === 'All' ? styles.tabBadgeActive : styles.tabBadgeInactive}>
              {SUMMARY_METRICS.total}
            </span>
          </button>

          <button
            style={activeTab === 'Pending' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('Pending')}
          >
            <span>Pending</span>
            <span style={activeTab === 'Pending' ? styles.tabBadgeActive : styles.tabBadgeInactive}>
              {SUMMARY_METRICS.pending}
            </span>
          </button>

          <button
            style={activeTab === 'In Progress' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('In Progress')}
          >
            <span>In Progress</span>
            <span style={activeTab === 'In Progress' ? styles.tabBadgeActive : styles.tabBadgeInactive}>
              {SUMMARY_METRICS.inProgress}
            </span>
          </button>

          <button
            style={activeTab === 'Completed' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('Completed')}
          >
            <span>Completed</span>
            <span style={activeTab === 'Completed' ? styles.tabBadgeActive : styles.tabBadgeInactive}>
              {SUMMARY_METRICS.completed}
            </span>
          </button>

          <button
            style={activeTab === 'Cancelled' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('Cancelled')}
          >
            <span>Cancelled</span>
            <span style={activeTab === 'Cancelled' ? styles.tabBadgeActive : styles.tabBadgeInactive}>
              {SUMMARY_METRICS.cancelled}
            </span>
          </button>
        </div>

        <div style={styles.actionsGroup}>
          <button style={styles.exportBtn} onClick={handleExport}>
            <Download size={15} color="#374151" />
            <span>Export</span>
          </button>

          <button style={styles.addNoteBtn} onClick={() => setIsAddingNote(true)}>
            <Plus size={16} />
            <span>Add Inspection Note</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SUMMARY METRIC CARDS (5 Cards Row)
      ═══════════════════════════════════════════════ */}
      <section style={styles.summaryGrid}>
        {/* Total */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Total Inspections</span>
              <span style={styles.summaryCardVal}>{SUMMARY_METRICS.total}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#E0F2FE', color: '#0284C7' }}>
              <ClipboardList size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>All time</span>
        </div>

        {/* Pending */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Pending</span>
              <span style={styles.summaryCardVal}>{SUMMARY_METRICS.pending}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Awaiting inspection</span>
        </div>

        {/* In Progress */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>In Progress</span>
              <span style={styles.summaryCardVal}>{SUMMARY_METRICS.inProgress}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#DCFCE7', color: '#16A34A' }}>
              <RotateCw size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Currently ongoing</span>
        </div>

        {/* Completed */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Completed</span>
              <span style={styles.summaryCardVal}>{SUMMARY_METRICS.completed}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#F3E8FF', color: '#9333EA' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Successfully completed</span>
        </div>

        {/* Cancelled */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Cancelled</span>
              <span style={styles.summaryCardVal}>{SUMMARY_METRICS.cancelled}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEE2E2', color: '#DC2626' }}>
              <XCircle size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Cancelled inspections</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEARCH & FILTERS BAR
      ═══════════════════════════════════════════════ */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Search Box */}
          <div style={styles.searchWrap}>
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by property, owner, or location..."
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
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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

          {/* Date Picker Input */}
          <div style={styles.datePickerWrap}>
            <Calendar size={14} color="#6B7280" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {/* Filter Reset Button */}
          <button
            style={styles.filterBtn}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All Status');
              setAreaFilter('All Areas');
              setDateFilter('');
            }}
          >
            <Filter size={14} color="#374151" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ASSIGNED INSPECTION TABLE
      ═══════════════════════════════════════════════ */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Property Details</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Area</th>
              <th style={styles.th}>Scheduled Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Priority</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.emptyTd}>
                  <div style={styles.emptyState}>
                    <AlertCircle size={36} color="#9CA3AF" />
                    <p style={styles.emptyText}>No inspection records match your selected filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInspections.map((item, index) => {
                // Priority style config
                const prioBg =
                  item.priority === 'High'
                    ? '#FEE2E2'
                    : item.priority === 'Medium'
                    ? '#FFEDD5'
                    : '#DCFCE7';
                const prioColor =
                  item.priority === 'High'
                    ? '#991B1B'
                    : item.priority === 'Medium'
                    ? '#9A3412'
                    : '#166534';

                // Status style config
                const statusBg =
                  item.status === 'Pending'
                    ? '#FEF3C7'
                    : item.status === 'In Progress'
                    ? '#DBEAFE'
                    : item.status === 'Completed'
                    ? '#DCFCE7'
                    : '#FEE2E2';
                const statusColor =
                  item.status === 'Pending'
                    ? '#92400E'
                    : item.status === 'In Progress'
                    ? '#1E40AF'
                    : item.status === 'Completed'
                    ? '#166534'
                    : '#991B1B';

                return (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.tdIndex}>{index + 1}</td>

                    {/* Property Details */}
                    <td style={styles.td}>
                      <div style={styles.propDetailsGroup}>
                        <img src={item.image} alt={item.property_title} style={styles.propThumb} />
                        <div>
                          <h4 style={styles.propTitle}>{item.property_title}</h4>
                          <p style={styles.propAddress}>{item.address}</p>
                        </div>
                      </div>
                    </td>

                    {/* Owner Info */}
                    <td style={styles.td}>
                      <div style={styles.ownerGroup}>
                        <span style={styles.ownerName}>{item.owner_name}</span>
                        <span style={styles.ownerPhone}>{item.owner_phone}</span>
                      </div>
                    </td>

                    {/* Area */}
                    <td style={styles.td}>
                      <span style={styles.areaText}>{item.area}</span>
                    </td>

                    {/* Scheduled Date & Time */}
                    <td style={styles.td}>
                      <div style={styles.scheduleGroup}>
                        <div style={styles.scheduleDateRow}>
                          <Calendar size={13} color="#6B7280" />
                          <span>{item.scheduled_date}</span>
                        </div>
                        <span style={styles.scheduleTime}>{item.scheduled_time}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: statusBg, color: statusColor }}>
                        {item.status}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: prioBg, color: prioColor }}>
                        {item.priority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={styles.tdActions}>
                      <div style={styles.actionButtonsRow}>
                        {/* View Details button */}
                        <button
                          style={styles.iconBtn}
                          title="View Details"
                          onClick={() => setSelectedDetails(item)}
                        >
                          <Eye size={15} color="#475569" />
                        </button>

                        {/* Start / Edit Inspection button */}
                        <button
                          style={styles.iconBtn}
                          title={
                            item.status === 'Completed'
                              ? 'View Report & Notes'
                              : 'Start / Update Inspection'
                          }
                          onClick={() => setEditingInspection({ ...item })}
                        >
                          <Edit3 size={15} color="#475569" />
                        </button>

                        {/* Options button */}
                        <button
                          style={styles.iconBtn}
                          title="Options"
                          onClick={() => setSelectedDetails(item)}
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

        {/* Table Footer Pagination */}
        <div style={styles.paginationRow}>
          <span style={styles.paginationText}>
            Showing 1 to {filteredInspections.length} of {SUMMARY_METRICS.total} results
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
            <button style={styles.pageArrowBtn} onClick={() => setCurrentPage((p) => p + 1)}>
              &gt;
            </button>

            <div style={{ ...styles.dropdownWrap, marginLeft: '8px' }}>
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
          VIEW INSPECTION DETAILS MODAL
      ═══════════════════════════════════════════════ */}
      {selectedDetails && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDetails(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} color="#2563EB" />
                <h3 style={styles.modalTitle}>Inspection Overview Details</h3>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setSelectedDetails(null)}>
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalHero}>
                <img
                  src={selectedDetails.image}
                  alt={selectedDetails.property_title}
                  style={styles.modalImg}
                />
                <div>
                  <h2 style={styles.modalHeroTitle}>{selectedDetails.property_title}</h2>
                  <p style={styles.modalHeroSub}>
                    <MapPin size={13} color="#64748B" /> {selectedDetails.address}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <span style={styles.modalBadge}>{selectedDetails.status}</span>
                    <span style={styles.modalBadgePrio}>Priority: {selectedDetails.priority}</span>
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
                  <span style={styles.infoLabel}>Scheduled Date:</span>
                  <strong style={styles.infoVal}>{selectedDetails.scheduled_date}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Scheduled Time:</span>
                  <strong style={styles.infoVal}>{selectedDetails.scheduled_time}</strong>
                </div>
              </div>

              <div style={styles.notesBox}>
                <h4 style={styles.notesTitle}>Inspector Notes & Remarks:</h4>
                <p style={styles.notesContent}>{selectedDetails.notes}</p>
              </div>

              <div style={styles.checklistSection}>
                <h4 style={styles.notesTitle}>PPC Inspection Audit Items:</h4>
                <div style={styles.checkItem}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Structural Foundation & Wall Integrity</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Electrical Wiring & Distribution Board</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Plumbing Lines, Pressure & Water Fixtures</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Property Boundaries & Legal Land Marking</span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryModalBtn}
                onClick={() => {
                  setSelectedDetails(null);
                  setEditingInspection({ ...selectedDetails });
                }}
              >
                Edit / Update Inspection
              </button>
              <button style={styles.primaryModalBtn} onClick={() => setSelectedDetails(null)}>
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          EDIT / START INSPECTION MODAL
      ═══════════════════════════════════════════════ */}
      {editingInspection && (
        <div style={styles.modalOverlay} onClick={() => setEditingInspection(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateStatus}>
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={20} color="#2563EB" />
                  <h3 style={styles.modalTitle}>
                    Update Inspection Status — {editingInspection.property_title}
                  </h3>
                </div>
                <button
                  type="button"
                  style={styles.modalCloseBtn}
                  onClick={() => setEditingInspection(null)}
                >
                  <X size={18} color="#475569" />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Inspection Status</label>
                  <select
                    value={editingInspection.status}
                    onChange={(e) =>
                      setEditingInspection((prev) => ({ ...prev, status: e.target.value }))
                    }
                    style={styles.formSelect}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Inspection Priority</label>
                  <select
                    value={editingInspection.priority}
                    onChange={(e) =>
                      setEditingInspection((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    style={styles.formSelect}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Inspector Notes & Audit Remarks</label>
                  <textarea
                    rows={4}
                    value={editingInspection.notes}
                    onChange={(e) =>
                      setEditingInspection((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    style={styles.formTextarea}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.secondaryModalBtn}
                  onClick={() => setEditingInspection(null)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryModalBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          ADD INSPECTION NOTE MODAL
      ═══════════════════════════════════════════════ */}
      {isAddingNote && (
        <div style={styles.modalOverlay} onClick={() => setIsAddingNote(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveNote}>
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={20} color="#2563EB" />
                  <h3 style={styles.modalTitle}>Add Inspection Note</h3>
                </div>
                <button
                  type="button"
                  style={styles.modalCloseBtn}
                  onClick={() => setIsAddingNote(false)}
                >
                  <X size={18} color="#475569" />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Select Assigned Property</label>
                  <select
                    value={noteForm.inspectionId}
                    onChange={(e) =>
                      setNoteForm((prev) => ({ ...prev, inspectionId: e.target.value }))
                    }
                    style={styles.formSelect}
                  >
                    {inspectionsList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.property_title} — {item.area}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Inspection Note Content</label>
                  <textarea
                    rows={4}
                    placeholder="Enter observation, structural remark, or follow-up note..."
                    value={noteForm.noteText}
                    onChange={(e) =>
                      setNoteForm((prev) => ({ ...prev, noteText: e.target.value }))
                    }
                    style={styles.formTextarea}
                    required
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.secondaryModalBtn}
                  onClick={() => setIsAddingNote(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryModalBtn}>
                  Save Note
                </button>
              </div>
            </form>
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

  /* ── Tabs & Top Actions Bar ── */
  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1.5px solid #E2E8F0',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  tabsList: {
    display: 'flex',
    gap: '24px',
  },
  tabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2.5px solid #2563EB',
    padding: '10px 4px 12px 4px',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#2563EB',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  tabInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2.5px solid transparent',
    padding: '10px 4px 12px 4px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#64748B',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  tabBadgeActive: {
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  tabBadgeInactive: {
    background: '#F1F5F9',
    color: '#64748B',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },

  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  addNoteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '8.5px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
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
    marginBottom: '20px',
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
    minWidth: '130px',
  },
  selectEl: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 30px 7.5px 12px',
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
    right: '10px',
    pointerEvents: 'none',
  },
  datePickerWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7px 12px',
    background: '#FFFFFF',
  },
  dateInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#334155',
    background: 'transparent',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
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
    width: '46px',
    height: '46px',
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
  propAddress: {
    fontSize: '11.5px',
    color: '#64748B',
    margin: '2px 0 0 0',
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

  areaText: {
    fontSize: '12.5px',
    color: '#334155',
    fontWeight: '500',
  },

  scheduleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  scheduleDateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#0F172A',
  },
  scheduleTime: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
    paddingLeft: '18px',
  },

  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    textAlign: 'center',
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

  /* ── Modal Styles ── */
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
  modalBadge: {
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  modalBadgePrio: {
    background: '#FEF3C7',
    color: '#92400E',
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
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '14px',
  },
  notesTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400E',
    margin: '0 0 6px 0',
  },
  notesContent: {
    fontSize: '12.5px',
    color: '#78350F',
    margin: 0,
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  },

  checklistSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12.5px',
    color: '#334155',
    fontWeight: '500',
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

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
  },
  formSelect: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#0F172A',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
  },
  formTextarea: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#0F172A',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    resize: 'vertical',
  },
};

export default Inspection;
