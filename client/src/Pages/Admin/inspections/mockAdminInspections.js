/**
 * Realistic seed & mock data for Admin Property Inspections & Reports.
 * Synchronized with PostgreSQL schema:
 * `property_inspection_schedule`, `property_inspected_details`, `inspection_checklist_statuses`, `properties`, and `employees`.
 */

export const INSPECTION_STATUSES = ['Verified', 'Issues Flagged', 'Scheduled', 'In Progress'];

export const CHECKLIST_STATUS_MAP = {
  1: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  2: { label: 'Not Verified', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  3: { label: 'Partially Verified', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  4: { label: 'Not Applicable', color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

export const INITIAL_INSPECTIONS = [
  {
    id: 1,
    formatted_id: 'INS-001',
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

    customer_id: 2,
    customer_name: 'Shahbaz Sabir',
    customer_mobile: '3115053532',
    customer_email: 'shahbazzkhann2022@gmail.com',

    inspection_employee_id: 2,
    employee_name: 'Super Admin',
    employee_designation: 'Field Operations Officer',
    employee_mobile: '03219876543',

    inspection_scheduled_date: '2026-10-15',
    inspection_scheduled_time: '10:30 AM',
    inspection_actual_date: '2026-10-15',
    inspection_actual_time: '11:15 AM',

    status: 'Verified',
    overall_rating: 4.8,
    inspection_findings: 'Excellent structural condition with premium construction standards. Reinforced concrete frame shows zero deflection or stress fissures. Imported plumbing lines and modern solar net-metering are fully operational.',
    inspection_remarks: 'Property is verified and cleared for premium acquisition. All CDA building by-laws and layout plan sanctions are documented.',
    created_at: '2026-10-14T08:30:00Z',
    created_by_name: 'Super Admin',
    gps_coordinates: '33.7294° N, 73.0551° E',

    checklist: [
      {
        id: 101,
        category: 'Structural & Civil Works',
        item_title: 'Foundation, Beams & Columns',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Zero structural settling cracks detected in basement or ground floor load-bearing columns.'
      },
      {
        id: 102,
        category: 'Electrical Systems',
        item_title: 'Main DB Box, Wiring & Earthing',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Schneider breakers installed with dedicated earth pit resistance measured at 2.4 ohms.'
      },
      {
        id: 103,
        category: 'Plumbing & Water Supply',
        item_title: 'PPR-C Piping & Water Pressure',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Pressure testing passed at 6 bar across all 6 ensuite bathrooms and kitchen line.'
      },
      {
        id: 104,
        category: 'Roofing & Weatherproofing',
        item_title: 'Rooftop Bitumen & Water Drainage',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Double-layer bitumen membrane with glazed ceramic heat-proofing tiles in pristine condition.'
      },
      {
        id: 105,
        category: 'Legal & Society Compliance',
        item_title: 'CDA Completion & Sewerage NOC',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'CDA building completion certificate and utility transfer NOCs verified in original registry.'
      }
    ]
  },
  {
    id: 2,
    formatted_id: 'INS-002',
    property_id: 18,
    formatted_property_id: 'PRP-018',
    property_title: 'Corporate HQ Floor Space',
    property_type: 'Commercial Office',
    society: 'Blue Area, Jinnah Avenue',
    city: 'Islamabad',
    property_size: 3200,
    property_size_uom: 'Sq Ft',
    property_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    demand_amount: '5,000,000,000',

    customer_id: 2,
    customer_name: 'Shahbaz Sabir',
    customer_mobile: '3115053532',
    customer_email: 'shahbazzkhann2022@gmail.com',

    inspection_employee_id: 2,
    employee_name: 'Super Admin',
    employee_designation: 'Commercial Asset Specialist',
    employee_mobile: '03219876543',

    inspection_scheduled_date: '2026-10-12',
    inspection_scheduled_time: '02:00 PM',
    inspection_actual_date: '2026-10-12',
    inspection_actual_time: '02:45 PM',

    status: 'Issues Flagged',
    overall_rating: 3.5,
    inspection_findings: 'Commercial floor space is structurally sound with high-capacity fiber connectivity. However, the secondary fire escape exit is obstructed and central HVAC damper needs recalibration on the northern wing.',
    inspection_remarks: 'Owner notified regarding emergency staircase clearance. Re-inspection required within 14 days before corporate lease approval.',
    created_at: '2026-10-10T11:15:00Z',
    created_by_name: 'Super Admin',
    gps_coordinates: '33.7142° N, 73.0598° E',

    checklist: [
      {
        id: 201,
        category: 'Fire & Safety Standards',
        item_title: 'Emergency Exits & Sprinklers',
        status_id: 2,
        status_label: 'Not Verified',
        remarks: 'Emergency exit corridor has storage obstruction; fire hose reel pressure requires pump maintenance.'
      },
      {
        id: 202,
        category: 'HVAC & Climate Control',
        item_title: 'Central Chiller Ducting & Airflow',
        status_id: 3,
        status_label: 'Partially Verified',
        remarks: 'Main chiller running efficiently; zone 3 variable air volume damper sticking.'
      },
      {
        id: 203,
        category: 'Electrical & Backup Generators',
        item_title: '500kVA Generator & Automatic Transfer Switch',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Automatic Transfer Switch responded in 8.2 seconds during load cutoff simulation.'
      },
      {
        id: 204,
        category: 'Elevators & Vertical Transport',
        item_title: 'High-speed Passenger Elevators',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'Valid third-party safety inspection certificate on display with emergency battery lowering.'
      }
    ]
  },
  {
    id: 3,
    formatted_id: 'INS-003',
    property_id: 2,
    formatted_property_id: 'PRP-002',
    property_title: '1 Kanal Luxury Mediterranean Villa',
    property_type: 'Villa',
    society: 'DHA Phase 5, Block C',
    city: 'Lahore',
    property_size: 1,
    property_size_uom: 'Kanal',
    property_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    demand_amount: '25,000,000',

    customer_id: 3,
    customer_name: 'Zulkifl Khan',
    customer_mobile: '3319856454',
    customer_email: 'zulkifl@example.com',

    inspection_employee_id: 2,
    employee_name: 'Super Admin',
    employee_designation: 'Senior Property Inspection Officer',
    employee_mobile: '03219876543',

    inspection_scheduled_date: '2026-10-18',
    inspection_scheduled_time: '11:00 AM',
    inspection_actual_date: null,
    inspection_actual_time: null,

    status: 'Scheduled',
    overall_rating: null,
    inspection_findings: 'Pre-inspection documents received. On-site verification scheduled with society management and DHA building control supervisor.',
    inspection_remarks: 'Field officer assigned to conduct on-site physical walk-through, moisture scanning, and perimeter boundary survey.',
    created_at: '2026-10-15T14:20:00Z',
    created_by_name: 'Super Admin',
    gps_coordinates: '31.4722° N, 74.3980° E',

    checklist: [
      {
        id: 301,
        category: 'Structural & Civil Works',
        item_title: 'Exterior Elevation & Boundary Wall',
        status_id: 4,
        status_label: 'Not Applicable',
        remarks: 'Awaiting on-site field survey.'
      },
      {
        id: 302,
        category: 'Water & Gas Utilities',
        item_title: 'SNGPL Gas Connection & Meter',
        status_id: 4,
        status_label: 'Not Applicable',
        remarks: 'Verification scheduled for 18 Oct 2026.'
      }
    ]
  },
  {
    id: 4,
    formatted_id: 'INS-004',
    property_id: 3,
    formatted_property_id: 'PRP-003',
    property_title: 'End-to-End Test Property in Sector W',
    property_type: 'Residential House',
    society: 'Sector W, Phase 8',
    city: 'Lahore',
    property_size: 10,
    property_size_uom: 'Marla',
    property_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    demand_amount: '150,000',

    customer_id: 6,
    customer_name: 'Zulkifl khann',
    customer_mobile: '3319856453',
    customer_email: 'zulkifl.khann@example.com',

    inspection_employee_id: 2,
    employee_name: 'Super Admin',
    employee_designation: 'Senior Property Inspection Officer',
    employee_mobile: '03219876543',

    inspection_scheduled_date: '2026-10-16',
    inspection_scheduled_time: '03:30 PM',
    inspection_actual_date: '2026-10-16',
    inspection_actual_time: '04:00 PM',

    status: 'In Progress',
    overall_rating: 4.2,
    inspection_findings: 'Inspection ongoing. Field officer currently checking subterranean pest control barrier, drainage gradients, and thermal imaging of master bedroom ceiling.',
    inspection_remarks: 'Interim report generated. Awaiting electrical switchboard test results before final verification sign-off.',
    created_at: '2026-10-16T09:00:00Z',
    created_by_name: 'Super Admin',
    gps_coordinates: '31.4550° N, 74.4120° E',

    checklist: [
      {
        id: 401,
        category: 'Interior & Woodwork',
        item_title: 'Wardrobes, Kitchen Cabinets & Doors',
        status_id: 1,
        status_label: 'Verified',
        remarks: 'High gloss UV sheet woodwork with soft-close hinges installed properly.'
      },
      {
        id: 402,
        category: 'Thermal & Moisture Scan',
        item_title: 'Infrared Thermal Wall Scanning',
        status_id: 3,
        status_label: 'Partially Verified',
        remarks: 'Minor cold spot detected on east-facing balcony door threshold; resealing recommended.'
      }
    ]
  }
];

export const MOCK_AVAILABLE_PROPERTIES = [
  { id: 15, formatted_id: 'PRP-015', title: '500 Sq Yd Designer Bungalow', location: 'Sector F-7/2, Islamabad' },
  { id: 18, formatted_id: 'PRP-018', title: 'Corporate HQ Floor Space', location: 'Blue Area, Islamabad' },
  { id: 2, formatted_id: 'PRP-002', title: '1 Kanal Luxury Mediterranean Villa', location: 'DHA Phase 5, Lahore' },
  { id: 3, formatted_id: 'PRP-003', title: 'End-to-End Test Property in Sector W', location: 'Sector W, Phase 8, Lahore' }
];

export const MOCK_AVAILABLE_INSPECTORS = [
  { id: 2, name: 'Super Admin', designation: 'Senior Property Inspection Officer' }
];
