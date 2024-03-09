
export interface EventType {
    org: string,
    repo: string,
    pr: number | null;
    description: string
}