import { PrStatus , PMonitorStatus} from "../PrStatus"
import { PrComponent} from "../PullRequest"

export class CompositePr implements PrComponent {
    
    pr = 0
    father = null
    monitorState = { state: PMonitorStatus.FAILED}
    state = PrStatus.CREATED
    dependencies: Array<CompositePr> =  []    
    dependents: Array<CompositePr> =  []

    constructor(pr: number, father?:CompositePr){
        this.pr = pr;
        if(father){
            this.father = father;
        }
    }

    find(pr: number){
        let childFound = null
        if (pr) {
           if(this.pr === pr){
            return
           }
            childFound = this.dependencies.find(element => {
                    return element.pr === pr
            })

            if(childFound){
                return childFound
            }else {
                    this.dependencies.forEach(element => {
                        if(!childFound){
                            childFound = element.find(pr)
                        }
                    })
            }
            return childFound
        }
    }

    addDependency(child: CompositePr){
        this.dependencies.push(child)
    }

    addDependents(child: CompositePr){
        this.dependents.push(child)
    }

    remove(child: CompositePr){
        this.dependencies = this.dependencies.filter(function (objectItem) {
            return objectItem.pr !== child.pr
        })

        this.dependents = this.dependents.filter(function (objectItem) {
            return objectItem.pr !== child.pr
        })
    }

    hasDependencies(): boolean {
       return this.dependencies.length > 0 ? true : false
    }

    hasDependents(): boolean {
        return this.dependents.length > 0 ? true : false
     }

     
     createSnapshot() {
        let clonePr: CompositePr =  new CompositePr(this.pr)
        clonePr.monitorState = this.monitorState
        clonePr.state = this.state
        clonePr.monitorState = this.monitorState
        //clonePr.checked = this.checked
        clonePr.dependencies.push(...this.dependencies)
        clonePr.dependents.push(...this.dependents)
        return clonePr
     }
}