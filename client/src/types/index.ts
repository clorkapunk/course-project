export type ApiErrorResponse = {
    status: number,
    data: {
        errors: [],
        message: string
    }
}

export type UserData = {
    username: string;
    id: number;
    isActivated: boolean;
    email: string;
    roles: number[]
}

export type AuthResponse = {
    accessToken: string;
}

export interface JwtPayload {
    roles: string[];
    username: string;
    id: number;
}


