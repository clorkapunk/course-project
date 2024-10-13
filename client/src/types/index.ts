export type UserData = {
    id: number;
    isActive: boolean;
    role: number;
    username: string;
    email: string;
}

export type ApiErrorResponse = {
    status: number,
    data: {
        errors: [],
        message: string,
        code: string;
    },
}

export type AuthResponse = {
    accessToken: string;
}

export interface JwtPayload {
    role: number;
    username: string;
    id: number;
    email: string;
}

export type AdminHistoryResponseData = {
    page: number;
    pages: number;
    total: number;
    limit: number;
    data: AdminHistoryData[]
}

export type AdminHistoryData = {
    id: number;
    initiator: UserData,
    victim: UserData,
    action_type: string,
    new_value: string,
    createdAt: Date,

}


