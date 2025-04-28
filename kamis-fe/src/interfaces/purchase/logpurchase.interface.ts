export interface LogPurchaseInterface {
    id: string; // UUID string
    user: string;
    action: string;
    actionDate: string; // ISO date string (e.g. "2025-03-18T10:30:00Z")
}
