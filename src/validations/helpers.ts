export function trimString(input: unknown) {
    return typeof input === 'string' ? input.trim() : input
}

export function toLowerTrimmed(input: unknown) {
    return typeof input === 'string' ? input.trim().toLowerCase() : input
}

export function toDateOrNull(input: unknown) {
    if (input == null || input === '') return null
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input
    if (typeof input === 'string') {
        const s = input.trim()

        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
        if (m) {
            const [_, y, mo, d] = m
            const dt = new Date(Date.UTC(+y, +mo - 1, +d))
            return isNaN(dt.getTime()) ? null : dt
        }

        const dt = new Date(s)
        return isNaN(dt.getTime()) ? null : dt
    }
    return null
}

export function isNotInFuture(dateValue: Date | null | undefined) {
    if (dateValue == null) return true
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime()))
        return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dateValue.getTime() <= today.getTime()
}
