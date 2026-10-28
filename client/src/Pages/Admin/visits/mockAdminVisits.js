/**
 * Realistic seed data for Admin Property Visits management.
 * Synchronized with PostgreSQL schema: `property_visits`, `properties`, `customer_requests`, `customers`, and `employees`.
 */

export const VISIT_STATUSES = ['Scheduled', 'Completed', 'Overdue', 'Cancelled'];

export const INITIAL_VISITS = [
  {
    id: 1,
    formatted_id: 'VST-001',
    property_id: 15,
    formatted_property_id: 'PRP-015',
    property_title: '500 Sq Yd Designer Bungalow',
    property_type: 'Residential House',
    society: 'Sector F-7/2',
    city: 'Islamabad',
    property_size: 500,
    property_size_uom: 'Sq Yd',
    property_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    demand_amount: '125,000,000',

    request_id: 21,
    formatted_request_id: 'REQ-021',
    request_purpose: 'Purchase Residential',

    visitor_customer_id: 2,
    customer_name: 'Shahbaz Sabir',
    customer_mobile: '03001234567',
    customer_email: 'shahbaz.sabir@example.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Hamza Tariq',
    employee_designation: 'Senior Property Inspection Officer',
    employee_mobile: '03219876543',

    visit_scheduled_date: '2026-10-18',
    visit_scheduled_time: '11:00 AM',
    visit_actual_date: null,
    visit_actual_time: null,

    status: 'Scheduled',
    visitor_remarks: null,
    employee_remarks: 'Customer requested inspection of rooftop solar setup and basement soundproofing during the visit.',
    created_at: '2026-10-14T09:30:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 2,
    formatted_id: 'VST-002',
    property_id: 18,
    formatted_property_id: 'PRP-018',
    property_title: 'Corporate HQ Floor Space',
    property_type: 'Commercial Office',
    society: 'Blue Area, Jinnah Avenue',
    city: 'Islamabad',
    property_size: 3200,
    property_size_uom: 'Sq Ft',
    property_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    demand_amount: '450,000 / month',

    request_id: 18,
    formatted_request_id: 'REQ-018',
    request_purpose: 'Commercial Lease',

    visitor_customer_id: 2,
    customer_name: 'Shahbaz Sabir',
    customer_mobile: '03001234567',
    customer_email: 'shahbaz.sabir@example.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Ali Raza Khan',
    employee_designation: 'Commercial Asset Specialist',
    employee_mobile: '03335551234',

    visit_scheduled_date: '2026-10-14',
    visit_scheduled_time: '03:30 PM',
    visit_actual_date: '2026-10-14',
    visit_actual_time: '03:45 PM',

    status: 'Completed',
    visitor_remarks: 'Excellent corporate building with dedicated elevator access. We are requesting legal tenancy paperwork.',
    employee_remarks: 'Client thoroughly inspected electrical backup, fiber optic connectivity, and basement parking reserved bays. Highly satisfied with building upkeep.',
    created_at: '2026-10-10T14:15:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 3,
    formatted_id: 'VST-003',
    property_id: 15,
    formatted_property_id: 'PRP-015',
    property_title: '500 Sq Yd Designer Bungalow',
    property_type: 'Residential House',
    society: 'Sector F-7/2',
    city: 'Islamabad',
    property_size: 500,
    property_size_uom: 'Sq Yd',
    property_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    demand_amount: '125,000,000',

    request_id: 4,
    formatted_request_id: 'REQ-004',
    request_purpose: 'Property Valuation & Inspection',

    visitor_customer_id: 3,
    customer_name: 'Malik Zeeshan',
    customer_mobile: '03124445566',
    customer_email: 'zeeshan.malik@outlook.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Hamza Tariq',
    employee_designation: 'Senior Property Inspection Officer',
    employee_mobile: '03219876543',

    visit_scheduled_date: '2026-10-12',
    visit_scheduled_time: '02:00 PM',
    visit_actual_date: '2026-10-12',
    visit_actual_time: '02:15 PM',

    status: 'Completed',
    visitor_remarks: 'Inspection carried out smoothly. Representative arrived promptly and had all registry documentation copies.',
    employee_remarks: 'Conducted structural integrity walk-through. Noted minor paint wear on boundary wall; interior plumbing and HVAC in pristine order.',
    created_at: '2026-10-08T11:00:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 4,
    formatted_id: 'VST-004',
    property_id: 2,
    formatted_property_id: 'PRP-002',
    property_title: '1 Kanal Luxury Mediterranean Villa',
    property_type: 'Villa',
    society: 'DHA Phase 5, Block C',
    city: 'Lahore',
    property_size: 1,
    property_size_uom: 'Kanal',
    property_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    demand_amount: '98,000,000',

    request_id: 5,
    formatted_request_id: 'REQ-005',
    request_purpose: 'Purchase Luxury Villa',

    visitor_customer_id: 4,
    customer_name: 'Dr. Fatima Zahra',
    customer_mobile: '03019988776',
    customer_email: 'fatima.zahra@healthcorp.pk',

    visit_conducted_employee_id: 2,
    employee_name: 'Bilal Ahmad',
    employee_designation: 'Lahore Regional Executive',
    employee_mobile: '03451122334',

    visit_scheduled_date: '2026-10-19',
    visit_scheduled_time: '10:30 AM',
    visit_actual_date: null,
    visit_actual_time: null,

    status: 'Scheduled',
    visitor_remarks: null,
    employee_remarks: 'Client requested keyholder coordination with society security prior to gate arrival.',
    created_at: '2026-10-14T16:20:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 5,
    formatted_id: 'VST-005',
    property_id: 18,
    formatted_property_id: 'PRP-018',
    property_title: 'Corporate HQ Floor Space',
    property_type: 'Commercial Office',
    society: 'Blue Area, Jinnah Avenue',
    city: 'Islamabad',
    property_size: 3200,
    property_size_uom: 'Sq Ft',
    property_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    demand_amount: '450,000 / month',

    request_id: 6,
    formatted_request_id: 'REQ-006',
    request_purpose: 'Commercial Lease',

    visitor_customer_id: 5,
    customer_name: 'Usman Ghani',
    customer_mobile: '03225556677',
    customer_email: 'usman.ghani@fintechpk.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Ali Raza Khan',
    employee_designation: 'Commercial Asset Specialist',
    employee_mobile: '03335551234',

    visit_scheduled_date: '2026-10-11',
    visit_scheduled_time: '12:00 PM',
    visit_actual_date: null,
    visit_actual_time: null,

    status: 'Overdue',
    visitor_remarks: null,
    employee_remarks: 'Scheduled visit date has elapsed without completion confirmation. Awaiting report upload from field team.',
    created_at: '2026-10-07T08:45:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 6,
    formatted_id: 'VST-006',
    property_id: 3,
    formatted_property_id: 'PRP-003',
    property_title: '10 Marla Corner Executive Residence',
    property_type: 'Residential House',
    society: 'Bahria Town Phase 7',
    city: 'Rawalpindi',
    property_size: 10,
    property_size_uom: 'Marla',
    property_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    demand_amount: '42,500,000',

    request_id: 7,
    formatted_request_id: 'REQ-007',
    request_purpose: 'Purchase Residential',

    visitor_customer_id: 6,
    customer_name: 'Kamran Siddiqui',
    customer_mobile: '03448889900',
    customer_email: 'kamran.sid@gmail.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Hamza Tariq',
    employee_designation: 'Senior Property Inspection Officer',
    employee_mobile: '03219876543',

    visit_scheduled_date: '2026-10-09',
    visit_scheduled_time: '04:00 PM',
    visit_actual_date: '2026-10-09',
    visit_actual_time: '04:10 PM',

    status: 'Completed',
    visitor_remarks: 'Lovely property, exactly as displayed in photos. Seller negotiations initiated.',
    employee_remarks: 'Owner was present on-site. Demonstrated dual electric meter setups and verified solar net-metering NOC.',
    created_at: '2026-10-05T13:30:00Z',
    created_by_name: 'Super Admin'
  },
  {
    id: 7,
    formatted_id: 'VST-007',
    property_id: 6,
    formatted_property_id: 'PRP-006',
    property_title: 'Prime 2 Kanal Commercial Plot',
    property_type: 'Plot',
    society: 'Gulberg Greens, Executive Block',
    city: 'Islamabad',
    property_size: 2,
    property_size_uom: 'Kanal',
    property_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    demand_amount: '180,000,000',

    request_id: 8,
    formatted_request_id: 'REQ-008',
    request_purpose: 'Investment Advisory',

    visitor_customer_id: 7,
    customer_name: 'Naveed Akhtar',
    customer_mobile: '03131112233',
    customer_email: 'naveed.akhtar@capitalinv.com',

    visit_conducted_employee_id: 2,
    employee_name: 'Ali Raza Khan',
    employee_designation: 'Commercial Asset Specialist',
    employee_mobile: '03335551234',

    visit_scheduled_date: '2026-10-07',
    visit_scheduled_time: '11:00 AM',
    visit_actual_date: null,
    visit_actual_time: null,

    status: 'Cancelled',
    visitor_remarks: 'Cancelled by customer due to sudden travel schedule. Re-schedule requested for late October.',
    employee_remarks: 'Visit cancelled prior to departure. Society gate pass revoked in accordance with protocol.',
    created_at: '2026-10-03T10:00:00Z',
    created_by_name: 'Super Admin'
  }
];

export const MOCK_AVAILABLE_PROPERTIES = [
  { id: 15, formatted_id: 'PRP-015', title: '500 Sq Yd Designer Bungalow', location: 'Sector F-7/2, Islamabad' },
  { id: 18, formatted_id: 'PRP-018', title: 'Corporate HQ Floor Space', location: 'Blue Area, Islamabad' },
  { id: 2, formatted_id: 'PRP-002', title: '1 Kanal Luxury Mediterranean Villa', location: 'DHA Phase 5, Lahore' },
  { id: 3, formatted_id: 'PRP-003', title: '10 Marla Corner Executive Residence', location: 'Bahria Town, Rawalpindi' },
  { id: 6, formatted_id: 'PRP-006', title: 'Prime 2 Kanal Commercial Plot', location: 'Gulberg Greens, Islamabad' }
];

export const MOCK_AVAILABLE_CUSTOMERS = [
  { id: 2, name: 'Shahbaz Sabir', mobile: '03001234567', email: 'shahbaz.sabir@example.com' },
  { id: 3, name: 'Malik Zeeshan', mobile: '03124445566', email: 'zeeshan.malik@outlook.com' },
  { id: 4, name: 'Dr. Fatima Zahra', mobile: '03019988776', email: 'fatima.zahra@healthcorp.pk' },
  { id: 5, name: 'Usman Ghani', mobile: '03225556677', email: 'usman.ghani@fintechpk.com' },
  { id: 6, name: 'Kamran Siddiqui', mobile: '03448889900', email: 'kamran.sid@gmail.com' }
];

export const MOCK_AVAILABLE_EMPLOYEES = [
  { id: 2, name: 'Hamza Tariq', designation: 'Senior Property Inspection Officer' },
  { id: 3, name: 'Ali Raza Khan', designation: 'Commercial Asset Specialist' },
  { id: 4, name: 'Bilal Ahmad', designation: 'Lahore Regional Executive' }
];
