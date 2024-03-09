import { PrStatus , PMonitorStatus} from "./PrStatus"
import { PrComponent} from "./PullRequest"

export class CompositePr implements PrComponent {
    
    pr = 0
    monitorState = { state: PMonitorStatus.FAILED}
    state = PrStatus.CREATED
    dependencies: Array<CompositePr> =  []    
    dependents: Array<CompositePr> =  []

    constructor(pr: number){
        this.pr = pr;
    }

    addDependency(child: CompositePr){
        this.dependencies.push(child)
    }

    addDependents(child: CompositePr){
        this.dependents.push(child)
    }

    hasDependencies(): boolean {
       return this.dependencies.length > 0 ? true : false
    }

    hasDependents(): boolean {
        return this.dependents.length > 0 ? true : false
     }

}