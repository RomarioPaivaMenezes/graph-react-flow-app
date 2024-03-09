import { PMonitorStatus as PMonitorStatus, PrStatus } from "./PrStatus";

export class MonitorStatus {
    state : PMonitorStatus
}

export interface PrComponent {
    pr: number, 
    monitorState: MonitorStatus
    state: PrStatus,
    dependencies: Array<PrComponent>
    dependents: Array<PrComponent> 
}