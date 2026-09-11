export const mockInspectionsList = [
  {
    inspectionId: "INS-1001",
    propertyId: "PRP-001",
    inspectionDate: "2026-09-10",
    inspectionTime: "11:00 AM",
    inspectedBy: {
      employeeId: 12,
      name: "Ahmed Khan",
      role: "Property Inspector"
    },
    findings: "The property was inspected thoroughly and the main visible structural components were reviewed. No immediate structural hazards were identified.",
    remarks: "Minor maintenance may be required in selected areas, particularly around the kitchen plumbing fixtures.",
    checklist: [
      {
        id: 1,
        item: "Electrical System",
        status: "Satisfactory",
        remarks: "All visible wiring appeared satisfactory. Panel is appropriately labeled."
      },
      {
        id: 2,
        item: "Plumbing",
        status: "Needs Attention",
        remarks: "Minor leakage observed near the washroom fitting in the master bath."
      },
      {
        id: 3,
        item: "HVAC System",
        status: "Satisfactory",
        remarks: "AC units are functioning within normal parameters."
      },
      {
        id: 4,
        item: "Roof & Exterior",
        status: "Not Checked",
        remarks: "Access to roof was restricted during the visit."
      }
    ]
  },
  {
    inspectionId: "INS-1002",
    propertyId: "PRP-002",
    inspectionDate: "2026-08-25",
    inspectionTime: "02:30 PM",
    inspectedBy: {
      employeeId: 15,
      name: "Ali Raza",
      role: "Senior Inspector"
    },
    findings: "The commercial plaza unit was inspected. Overall condition is excellent with modern fixtures.",
    remarks: "Ready for immediate occupancy. No significant issues found.",
    checklist: [
      {
        id: 1,
        item: "Flooring",
        status: "Satisfactory",
        remarks: "Tiles are intact with no visible cracks."
      },
      {
        id: 2,
        item: "Fire Safety Equipment",
        status: "Satisfactory",
        remarks: "Extinguishers are present and correctly pressurized."
      }
    ]
  }
];
