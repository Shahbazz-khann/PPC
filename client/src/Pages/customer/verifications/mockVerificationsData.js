export const mockVerificationsList = [
  {
    verificationId: "VER-1001",
    propertyId: "PRP-001",
    approvalStage: {
      id: 3,
      name: "Approved"
    },
    verificationDate: "2026-09-10",
    verificationTime: "11:30 AM",
    verifiedBy: {
      employeeId: 11,
      name: "Ahmed Khan",
      role: "Management"
    },
    findings: "Property particulars and submitted documentation were reviewed. The location and specifications match the provided details.",
    remarks: "Property approved for listing. Eligible to be displayed in the PPC property directory."
  },
  {
    verificationId: null,
    propertyId: "PRP-002",
    approvalStage: {
      id: 1,
      name: "Pending"
    },
    verificationDate: null,
    verificationTime: null,
    verifiedBy: null,
    findings: null,
    remarks: null
  },
  {
    verificationId: "VER-1002",
    propertyId: "PRP-003",
    approvalStage: {
      id: 2,
      name: "Under Review"
    },
    verificationDate: "2026-09-11",
    verificationTime: "10:00 AM",
    verifiedBy: {
      employeeId: 12,
      name: "Ali Raza",
      role: "Management"
    },
    findings: null,
    remarks: null
  },
  {
    verificationId: "VER-1003",
    propertyId: "PRP-004", // Assuming we have a mock property 4, if not it will degrade gracefully
    approvalStage: {
      id: 4,
      name: "Rejected"
    },
    verificationDate: "2026-09-08",
    verificationTime: "03:00 PM",
    verifiedBy: {
      employeeId: 14,
      name: "Sara Malik",
      role: "Management"
    },
    findings: "Submitted property particulars were reviewed against the actual physical coordinates.",
    remarks: "Some required property information needs correction. The ownership document provided appears incomplete."
  }
];
