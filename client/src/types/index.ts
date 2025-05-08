// client/src/types/index.ts
export interface Company {
    id: string;
    name: string;
    address: string;
    contact: string;
    phone: string;
    email: string;
}

export interface Employee {
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    siteId?: string;
    tagId?: string;
}

export interface Asset {
    id: string;
    companyId: string;
    name: string;
    type: string;
    serialNumber: string;
    description: string;
    siteId?: string;
    tagId?: string;
}

export interface SiteMap {
    id: string;
    siteId: string;
    name: string;
    floorNumber: number;
    url: string;
    width: number;
    height: number;
    createdAt: string;
    updatedAt: string;
}

export interface Antenna {
    id: string;
    siteId: string;
    mapId: string;
    name: string;
    x: number;
    y: number;
    z: number;
    anchorId: string;
    status: 'online' | 'offline';
    lastSeenAt: string;
}

export interface TagAssignment {
    id: string;
    siteId: string;
    tagId: string;
    entityType: 'employee' | 'asset';
    entityId: string;
    assignedAt: string;
    assignedBy: string;
}

export interface TagPosition {
    tagId: string;
    x: number;
    y: number;
    z: number;
    mapId: string;
    timestamp: string;
    batteryLevel: number;
}

export interface User {
    id: string;
    username: string;
    email: string;
    companyId: string;
    role: 'admin' | 'user';
    firstName: string;
    lastName: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
}
