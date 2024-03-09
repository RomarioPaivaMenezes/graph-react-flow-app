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
        this.checkMonitorStatus(element)
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
                monitorStatus = this.checkStatusBFS(element)
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
            let hasBilateralDependency = element.dependencies.some(dependency => dependency.pr === dependent.pr)
            
            if(hasBilateralDependency){
                let dependentTemp: CompositePr = this.removeBilaterality(element, dependent)
                this.checkMonitorStatus(dependentTemp)
            }else {
                this.checkMonitorStatus(dependent)
            }
            })
        }

        if(element.hasDependents){
            element.dependencies
        }

    }

    removeBilaterality(element: CompositePr, dependent: CompositePr): CompositePr{

        let dependentTemp: CompositePr =  new CompositePr(dependent.pr)
        dependentTemp.monitorState = dependent.monitorState
        dependentTemp.state = dependent.state

        dependentTemp.dependencies =  dependent.dependencies.filter(objectItem => objectItem.pr !== element.pr) 
        dependentTemp.dependents = dependent.dependents.filter(objectItem  => objectItem.pr !== element.pr)      

        return dependentTemp as CompositePr
    }

    checkStatusBFS(elementPr : CompositePr) {

        let monitorStatus = false
        let children = elementPr.dependencies

        //TODO: find each correct state

         //exclude monitor status concluded
         const dependenciesToMonitore = children.filter(function (objectItem) {
          return objectItem.state === PrStatus.CONCLUDED && objectItem.monitorState.state !== PMonitorStatus.CONCLUDED
        })

        let hasUnConcludedDepedencies = children.some(dependency => dependency.state !== PrStatus.CONCLUDED)

        if(dependenciesToMonitore.length === 0 && !hasUnConcludedDepedencies) {
            return true
        }

        dependenciesToMonitore.forEach(element => {
                if (element.hasDependencies()) {
                    
                 let hasBilateralDependency = element.dependencies.some(dependency => dependency.pr === elementPr.pr)
                        
                if(hasBilateralDependency){
                    element = this.removeBilaterality(elementPr,element)
                }
                    
                    const dependenciesToMonitore = element. dependencies.filter(objectItem =>
                        objectItem.state === PrStatus.CONCLUDED && objectItem.monitorState.state !== PMonitorStatus.CONCLUDED)

                      if(dependenciesToMonitore.length > 0){
                      dependenciesToMonitore.forEach(elementDependency => {

                            //exclude bilateral dependency
                            const dependenciesToCheck = elementDependency.dependencies.filter(function (objectItem) {
                                return objectItem.pr !== elementDependency.pr
                            })

                            // checkStatusBfs for each child
                            if(dependenciesToCheck.length > 0){
                                dependenciesToCheck.forEach(deepDependenty => {
                                    monitorStatus = this.checkStatusBFS(deepDependenty)
                                })
                                
                            }else {
                                // if element doesn't have dependencies and its state is Conclued then monitorStatus true
                                monitorStatus = true
                            }
                        })        
                    }else {  monitorStatus = true }    
                    
                }else {
                    // if element doesn't have dependencies and its state is Conclued then monitorStatus true
                    monitorStatus = true
                }
        })

        if(monitorStatus && !hasUnConcludedDepedencies) {
            return true
        }else return false

        return monitorStatus

    }

}