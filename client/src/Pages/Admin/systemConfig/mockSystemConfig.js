/**
 * Mock & Initial Reference Data for Admin System Configuration
 * Synchronized directly with PostgreSQL system_configurations schema.
 */

export const INITIAL_CONFIG_STATS = {
  "totalSettings": 35,
  "totalCategories": 6,
  "publicSettings": 11,
  "restrictedSettings": 24,
  "isMaintenanceActive": false
};

export const INITIAL_CONFIGURATIONS = [
  {
    "config_id": "1",
    "category": "general",
    "config_key": "platform_name",
    "config_value": "Pakistan Property Care (PPC)",
    "data_type": "string",
    "display_label": "Platform Name",
    "description": "Public portal display name.",
    "is_public": true,
    "updated_by": "14",
    "updated_at": "2026-10-26T06:22:17.117Z"
  },
  {
    "config_id": "2",
    "category": "general",
    "config_key": "platform_tagline",
    "config_value": "Real Estate Care & Investment Advisory",
    "data_type": "string",
    "display_label": "Platform Tagline",
    "description": "Brand slogan shown across header and meta.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.692Z"
  },
  {
    "config_id": "3",
    "category": "general",
    "config_key": "support_email",
    "config_value": "support@pakistanpropertycare.com",
    "data_type": "string",
    "display_label": "Official Support Email",
    "description": "Primary contact email for customer correspondence.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.694Z"
  },
  {
    "config_id": "4",
    "category": "general",
    "config_key": "support_phone",
    "config_value": "+92 300 1234567",
    "data_type": "string",
    "display_label": "Official Support Helpline",
    "description": "Helpline phone number for customer inquiries.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.695Z"
  },
  {
    "config_id": "5",
    "category": "general",
    "config_key": "office_address",
    "config_value": "Main Jinnah Avenue, Blue Area, Islamabad, Pakistan",
    "data_type": "string",
    "display_label": "Headquarters Address",
    "description": "Official corporate office location.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.696Z"
  },
  {
    "config_id": "6",
    "category": "general",
    "config_key": "default_currency",
    "config_value": "PKR",
    "data_type": "string",
    "display_label": "Default Currency",
    "description": "Base currency used across portal valuations and demands.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.696Z"
  },
  {
    "config_id": "7",
    "category": "general",
    "config_key": "system_timezone",
    "config_value": "Asia/Karachi",
    "data_type": "string",
    "display_label": "System Timezone",
    "description": "Server local time zone for scheduling visits and inspections.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.697Z"
  },
  {
    "config_id": "21",
    "category": "maintenance",
    "config_key": "maintenance_mode",
    "config_value": "false",
    "data_type": "boolean",
    "display_label": "Maintenance Mode",
    "description": "Puts the public website in maintenance mode while allowing admin access.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.704Z"
  },
  {
    "config_id": "22",
    "category": "maintenance",
    "config_key": "maintenance_message",
    "config_value": "Pakistan Property Care is currently undergoing scheduled system maintenance. Please check back shortly.",
    "data_type": "string",
    "display_label": "Maintenance Notice Message",
    "description": "Message displayed to users when maintenance is enabled.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.705Z"
  },
  {
    "config_id": "25",
    "category": "maintenance",
    "config_key": "api_logging_level",
    "config_value": "info",
    "data_type": "string",
    "display_label": "Audit & API Logging Level",
    "description": "Verbosity of server logs (debug, info, warn, error).",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.706Z"
  },
  {
    "config_id": "30",
    "category": "maintenance",
    "config_key": "auto_db_backup_daily",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "Automated Daily Database Backups",
    "description": "Nightly automated snapshots of PostgreSQL database.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.517Z"
  },
  {
    "config_id": "31",
    "category": "maintenance",
    "config_key": "health_check_interval_sec",
    "config_value": "60",
    "data_type": "number",
    "display_label": "System Health Check Interval (Sec)",
    "description": "Frequency of internal ping checks.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.518Z"
  },
  {
    "config_id": "23",
    "category": "notifications",
    "config_key": "enable_email_notifications",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "Email Notifications Gateway",
    "description": "Master switch for outgoing customer email alerts.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.705Z"
  },
  {
    "config_id": "24",
    "category": "notifications",
    "config_key": "enable_sms_notifications",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "SMS Gateway Integration",
    "description": "Master switch for automated SMS notifications.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.706Z"
  },
  {
    "config_id": "26",
    "category": "notifications",
    "config_key": "admin_alert_email",
    "config_value": "alerts@pakistanpropertycare.com",
    "data_type": "string",
    "display_label": "Admin Operational Alerts Email",
    "description": "Destination address for critical inspection and customer request alerts.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.513Z"
  },
  {
    "config_id": "27",
    "category": "notifications",
    "config_key": "in_app_alerts_enabled",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "In-App Realtime Alerts",
    "description": "Push realtime notifications to browser client.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.515Z"
  },
  {
    "config_id": "32",
    "category": "policies",
    "config_key": "terms_of_service_url",
    "config_value": "/terms",
    "data_type": "string",
    "display_label": "Terms of Service URL",
    "description": "Relative or absolute URL to public Terms of Service.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.518Z"
  },
  {
    "config_id": "33",
    "category": "policies",
    "config_key": "privacy_policy_url",
    "config_value": "/privacy",
    "data_type": "string",
    "display_label": "Privacy Policy URL",
    "description": "Relative or absolute URL to public Privacy Policy.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.519Z"
  },
  {
    "config_id": "34",
    "category": "policies",
    "config_key": "cookie_consent_required",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "Cookie Consent Banner",
    "description": "Show GDPR/PECA compliant cookie consent on first visit.",
    "is_public": true,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.520Z"
  },
  {
    "config_id": "35",
    "category": "policies",
    "config_key": "data_retention_period_months",
    "config_value": "36",
    "data_type": "number",
    "display_label": "Data Retention Period (Months)",
    "description": "Archive window for customer inquiry and visit history.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.520Z"
  },
  {
    "config_id": "10",
    "category": "security",
    "config_key": "max_login_attempts",
    "config_value": "5",
    "data_type": "number",
    "display_label": "Max Failed Login Attempts",
    "description": "Failed password attempt threshold before temporary lockout.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.699Z"
  },
  {
    "config_id": "11",
    "category": "security",
    "config_key": "password_min_length",
    "config_value": "8",
    "data_type": "number",
    "display_label": "Minimum Password Length",
    "description": "Minimum character length required for user account passwords.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.700Z"
  },
  {
    "config_id": "12",
    "category": "security",
    "config_key": "require_strong_passwords",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "Require Strong Passwords",
    "description": "Enforce uppercase, lowercase, numbers, and symbols.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.700Z"
  },
  {
    "config_id": "8",
    "category": "security",
    "config_key": "session_timeout_minutes",
    "config_value": "120",
    "data_type": "number",
    "display_label": "Session Inactivity Timeout (Minutes)",
    "description": "Duration before idle user session expires automatically.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.698Z"
  },
  {
    "config_id": "9",
    "category": "security",
    "config_key": "otp_expiry_seconds",
    "config_value": "300",
    "data_type": "number",
    "display_label": "OTP Expiration (Seconds)",
    "description": "Validity window for password reset and authentication codes.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.698Z"
  },
  {
    "config_id": "13",
    "category": "services",
    "config_key": "visit_buffer_hours",
    "config_value": "24",
    "data_type": "number",
    "display_label": "Minimum Visit Booking Notice (Hours)",
    "description": "Lead time required before scheduling a property walkthrough.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.701Z"
  },
  {
    "config_id": "14",
    "category": "services",
    "config_key": "auto_assign_inspection",
    "config_value": "false",
    "data_type": "boolean",
    "display_label": "Auto-Assign Field Officers",
    "description": "Automatically route new inspection tasks to available officers.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.701Z"
  },
  {
    "config_id": "15",
    "category": "services",
    "config_key": "max_property_images",
    "config_value": "15",
    "data_type": "number",
    "display_label": "Max Images per Property",
    "description": "Maximum allowed photos per real estate listing.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.702Z"
  },
  {
    "config_id": "16",
    "category": "services",
    "config_key": "watermark_property_images",
    "config_value": "true",
    "data_type": "boolean",
    "display_label": "Apply PPC Image Watermark",
    "description": "Automatically overlay official logo watermark on uploaded photos.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.702Z"
  },
  {
    "config_id": "17",
    "category": "services",
    "config_key": "featured_properties_limit",
    "config_value": "12",
    "data_type": "number",
    "display_label": "Featured Properties Showcase Limit",
    "description": "Number of featured properties displayed on the homepage.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.703Z"
  },
  {
    "config_id": "18",
    "category": "services",
    "config_key": "max_image_upload_mb",
    "config_value": "10",
    "data_type": "number",
    "display_label": "Max Image Upload Size (MB)",
    "description": "Maximum allowed file size for image uploads.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.703Z"
  },
  {
    "config_id": "19",
    "category": "services",
    "config_key": "max_video_upload_mb",
    "config_value": "50",
    "data_type": "number",
    "display_label": "Max Video Upload Size (MB)",
    "description": "Maximum allowed file size for property walkthrough videos.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.703Z"
  },
  {
    "config_id": "20",
    "category": "services",
    "config_key": "allowed_image_formats",
    "config_value": "jpg,jpeg,png,webp",
    "data_type": "string",
    "display_label": "Allowed Image Formats",
    "description": "Comma-separated accepted photo extensions.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:19:49.704Z"
  },
  {
    "config_id": "28",
    "category": "services",
    "config_key": "request_priority_sla_hours",
    "config_value": "48",
    "data_type": "number",
    "display_label": "Customer Request SLA (Hours)",
    "description": "Target turnaround time for new customer requests.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.515Z"
  },
  {
    "config_id": "29",
    "category": "services",
    "config_key": "auto_assign_property_visits",
    "config_value": "false",
    "data_type": "boolean",
    "display_label": "Auto-Assign Field Officers",
    "description": "Automatically route property visits to nearby active employees.",
    "is_public": false,
    "updated_by": null,
    "updated_at": "2026-10-26T06:32:42.516Z"
  }
];

export const CONFIG_CATEGORIES = [
  { 
    key: 'general', 
    label: 'General', 
    subtitle: 'Branding, language, timezone',
    icon: 'Sliders'
  },
  { 
    key: 'security', 
    label: 'Security', 
    subtitle: 'Access, login, password rules',
    icon: 'ShieldCheck'
  },
  { 
    key: 'notifications', 
    label: 'Notifications', 
    subtitle: 'Email, SMS, in-app alerts',
    icon: 'Bell'
  },
  { 
    key: 'services', 
    label: 'Service Rules', 
    subtitle: 'Requests, priorities, assignments',
    icon: 'Wrench'
  },
  { 
    key: 'maintenance', 
    label: 'Maintenance', 
    subtitle: 'Backups, health, system status',
    icon: 'Database'
  },
  { 
    key: 'policies', 
    label: 'Policies', 
    subtitle: 'Terms, privacy, consent',
    icon: 'FileText'
  },
];
