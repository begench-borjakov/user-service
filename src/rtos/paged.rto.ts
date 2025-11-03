export interface PagedRto<TItem> {
    items: TItem[]
    page: number
    limit: number
    total: number
}
