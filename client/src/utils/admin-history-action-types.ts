interface HistoryActionTypes {
    readonly [key: string]: string; // Allow any string as a key
}
const HistoryActionTypes: HistoryActionTypes = {
    ChangeRole: 'change_role',
    ChangeStatus: 'change_status'
} as const

export default HistoryActionTypes
