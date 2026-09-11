export let mockPropertyDemands = [
  {
    demandId: "DEM-1001",
    propertyId: "PRP-001",
    customerId: "CUST-001",
    effectiveDate: "2026-07-01",
    currency: "PKR",
    saleAmount: 55000000,
    rentAmount: null
  },
  {
    demandId: "DEM-1002",
    propertyId: "PRP-001",
    customerId: "CUST-001",
    effectiveDate: "2026-08-15",
    currency: "PKR",
    saleAmount: 50000000,
    rentAmount: null
  },
  {
    demandId: "DEM-1003",
    propertyId: "PRP-001",
    customerId: "CUST-001",
    effectiveDate: "2026-09-11",
    currency: "PKR",
    saleAmount: 52000000,
    rentAmount: null
  },
  {
    demandId: "DEM-2001",
    propertyId: "PRP-002",
    customerId: "CUST-001",
    effectiveDate: "2026-09-01",
    currency: "PKR",
    saleAmount: null,
    rentAmount: 250000
  }
];

export const appendMockDemand = (newDemand) => {
  mockPropertyDemands = [...mockPropertyDemands, newDemand];
};
