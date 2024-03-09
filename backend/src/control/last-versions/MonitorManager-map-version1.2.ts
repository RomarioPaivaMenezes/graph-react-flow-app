import { CompositePr } from "../PrComposite";
import { PMonitorStatus, PrStatus } from "../PrStatus";

export class MonitorManager {

    prGraph: Map<number, CompositePr>

    constructor(prGraph: Map<number, CompositePr>) {
        this.prGraph = prGraph
    }

    find(pr: number): CompositePr {
            return this.prGraph.get(pr)
    }

    //TODO: decide if use Object or Number
    addDependency(element: CompositePr, dependentId?: number): void {
    
        if (!dependentId) {
            return this.addElement(element)
        }

        let dependent = this.find(dependentId)

        if(dependent){
            dependent.addDependency(element)
            dependent.monitorState = {state: PMonitorStatus.FAILED}
            element.addDependents(dependent)

            if(!this.prGraph.has(element.pr)){
                this.addElement(element)
              //  element.monitorState = {state: PMonitorStatus.FAILED}
            }

            this.checkMonitorStatus(dependent)
        }else {
            throw Error('Depedent not found!')
        }
        
    }

    addElement(element: CompositePr) {
        this.prGraph.set(element.pr, element)
    }

    async setNewStatus(pr?: number, newState?: PrStatus) {
        const elementPr = this.find(pr)
        elementPr.state = newState
        this.checkMonitorStatus(elementPr)
    }

    checkMonitorStatus(element: CompositePr) {

        let monitorStatus = false

        if (element.state === PrStatus.CONCLUDED) {
            if (element.hasDependencies()) {
                monitorStatus = this.checkStatusBFS(element.dependencies)
            } else {
                monitorStatus = true
            }
        }

        if (element.state === PrStatus.CONCLUDED && monitorStatus) {
            element.monitorState.state = PMonitorStatus.CONCLUDED
        } else {
            element.monitorState.state = PMonitorStatus.FAILED
        }

        if(element.hasDependents){
            element.dependents.forEach(dependent => {
                this.checkMonitorStatus(dependent)
            })
        }

    }

    checkStatusBFS(children: Array<CompositePr>) {

        let monitorStatus = false

        //TODO: find each correct state

         //exclude bilateral dependency
         const dependenciesToMonitore = children.filter(function (objectItem) {
          return (objectItem.state === PrStatus.CONCLUDED && objectItem.monitorState.state !== PMonitorStatus.CONCLUDED)
        })

        dependenciesToMonitore.forEach(element => {
            if (element.state === PrStatus.CONCLUDED) {
                if (element.hasDependencies()) {

                    let hasUnConcludedDepedencies = element.dependencies.some(dependency => dependency.state !== PrStatus.CONCLUDED)

                    //Check dependecies of dependencies
                    if (!hasUnConcludedDepedencies) {
                        element.dependencies.forEach(elementDependency => {
                            
                            if(elementDependency.monitorState.state === PMonitorStatus.CONCLUDED){
                                return
                            }

                            //exclude bilateral dependency
                            const dependenciesToCheck = elementDependency.dependencies.filter(function (objectItem) {
                                return objectItem.pr !== elementDependency.pr
                            })

                            // checkStatysBfs for each child
                            if(dependenciesToCheck.length > 0){
                                monitorStatus = this.checkStatusBFS(dependenciesToCheck)
                            }else {
                                if(elementDependency.state = PrStatus.CONCLUDED){
                                    monitorStatus = true
                                }
                            }
                        })
                    }                 
                    
                }else {monitorStatus = true}
                //return if find any unconcluded
            }else {return monitorStatus = false}
        })

        return monitorStatus

    }

}