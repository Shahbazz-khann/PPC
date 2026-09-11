export const mockVisitsList = [
  {
    id: "VIS-1001",
    propertyId: "PRP-001", // Linked to mock property 1 (House in DHA)
    scheduledDate: "2026-10-15",
    scheduledTime: "11:00 AM",
    actualDate: null,
    actualTime: null,
    conductedBy: {
      employeeId: 10,
      name: "Ahmed Khan",
      role: "PPC Representative"
    },
    visitorRemarks: "",
    employeeRemarks: ""
  },
  {
    id: "VIS-1002",
    propertyId: "PRP-002", // Linked to mock property 2 (Commercial Plaza)
    scheduledDate: "2026-09-05",
    scheduledTime: "02:00 PM",
    actualDate: "2026-09-05",
    actualTime: "02:15 PM",
    conductedBy: {
      employeeId: 12,
      name: "Ali Raza",
      role: "Property Inspector"
    },
    visitorRemarks: "The property location was suitable. Needs some minor paint touchups.",
    employeeRemarks: "Customer attended and inspected the property. Guided through the main features."
  },
  {
    id: "VIS-1003",
    propertyId: "PRP-003", // Linked to mock property 3 (Plot in Bahria)
    scheduledDate: "2026-09-08",
    scheduledTime: "04:30 PM",
    actualDate: "2026-09-08",
    actualTime: "04:45 PM",
    conductedBy: {
      employeeId: 15,
      name: "Zainab Ali",
      role: "Property Consultant"
    },
    visitorRemarks: "", // Empty so customer can add remarks
    employeeRemarks: "Site visit completed. Customer is interested in the adjacent plot as well."
  }
];
