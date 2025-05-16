export interface ChatSupportTicket {
    firstName: string;
    lastName: string;
    company: string;
    emailAddress: string;
    phoneNumber: string;
    countryCode: string;
    country: string;
    issueDescription: string;
    serialNumber?: string;
    raywareType?: string;
    resinType?: string;
    existingTicket?: string;
    region: number;
}
