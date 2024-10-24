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

export type TopicData = {
    id: number;
    name: string;
}


export type TagData = {
    id: number;
    name: string;
    _count: {
        templates: number;
    }
}

export type TemplateData = {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    image?: string;
    mode: string,
    allowedUsers: UserData[],
    topic: TopicData,
    tags: TagData[],
    questions: QuestionData[],
    user: UserData,
    _count?: {
        form: number;
        comment: number;
        like: number;
    }
}

export type QuestionData = {
    type: string;
    question: string;
    description: string
}


export type AnsweredQuestionData = QuestionData & {answer: string | number | boolean | null;}

export type TableFormData = {
    id: number;
    user: UserData;
    createdAt: Date;
    template: {
        id: number;
        title: number;
        user: UserData
    }
}

export type FormData = {
    templateData: {
        id: number;
        title: string;
        description: string;
        createdAt: Date;
        image?: string;
        mode: string,
        topic: TopicData,
        tags: TagData[],
        user: UserData
    },
    formData: {
        id: number;
        createdAt: Date,
        user: UserData,
    },
    questions: AnsweredQuestionData[]
}

