export const mockMessagesList = [
  {
    id: "MSG-1001",
    direction: "inbox",
    sender: {
      id: "PPC-MGMT",
      name: "PPC Management"
    },
    recipient: {
      id: "CUSTOMER",
      name: "Customer"
    },
    subject: "Property Verification Update",
    body: "Your property is currently under review by PPC Management. We will notify you once the verification is complete and the property is eligible for listing.",
    createdAt: "2026-09-10T10:30:00",
    isRead: false,
    replyToMessageId: null
  },
  {
    id: "MSG-1002",
    direction: "outbox",
    sender: {
      id: "CUSTOMER",
      name: "Customer"
    },
    recipient: {
      id: "PPC-SUPPORT",
      name: "PPC Support"
    },
    subject: "Property Visit Question",
    body: "I wanted to confirm the scheduled visit timing for my property tomorrow. Could you please provide an estimated arrival time?",
    createdAt: "2026-09-09T15:15:00",
    isRead: true,
    replyToMessageId: null
  },
  {
    id: "MSG-1003",
    direction: "outbox",
    sender: {
      id: "CUSTOMER",
      name: "Customer"
    },
    recipient: {
      id: "PPC-MGMT",
      name: "PPC Management"
    },
    subject: "Re: Property Verification Update",
    body: "Thank you. Please let me know once the review is completed. I am looking forward to getting the property listed as soon as possible.",
    createdAt: "2026-09-10T11:00:00",
    isRead: true,
    replyToMessageId: "MSG-1001"
  },
  {
    id: "MSG-1004",
    direction: "inbox",
    sender: {
      id: "PPC-SUPPORT",
      name: "PPC Support"
    },
    recipient: {
      id: "CUSTOMER",
      name: "Customer"
    },
    subject: "Welcome to PPC Customer Portal",
    body: "Welcome to your new PPC portal! You can use this dashboard to manage your properties, requests, property visits, and communicate directly with us.",
    createdAt: "2026-09-01T09:00:00",
    isRead: true,
    replyToMessageId: null
  }
];
