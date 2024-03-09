import { CompositePr } from "../PrComposite";
import { PMonitorStatus, PrStatus } from "../PrStatus";
import { FactoryPrComponent } from "../factoryPrCompsite";

export class MonitorManager {

    listPendents: Array<CompositePr>
    prGraph: Array<CompositePr>

    constructor(prGraph: Array<CompositePr>) {
        this.prGraph = prGraph
    }

    find(pr: number): CompositePr {

        let father: CompositePr

        this.prGraph.every(element => {
            if (element.pr == pr) {
                father = element
                return false
            } else {
                father = element.find(pr)
                if (father) {
                    return false
                } else return true
            }
        });

        return father
    }

    //TODO: decide if use Object or Number
    addDependency(element: CompositePr, dependentId?: number) {

        if (!dependentId) {
            return this.addMainVertex(element)
        }

        let father = this.find(dependentId)

        if (!father) {
            //TODO: check if it's really necessary
            father = FactoryPrComponent.createFather(element, dependentId)
            return this.addMainVertex(father)
        } else {
            // given a new dependency, monitor status should be failed
            father.monitorState = {state: PMonitorStatus.FAILED}
            element.monitorState = {state: PMonitorStatus.FAILED}
        
            // add dependent to dependecy list
            element.dependents.push(father)
            // adding a new dependency
            return father.addDependency(element)
        }
    }

    addMainVertex(element: CompositePr) {
        this.prGraph.push(element)
    }

    removeChild(child: CompositePr) {
        if (!child.father) {
            this.remove(child)
        } else {
            child.father.removeChild(child)
        }
    }

    private remove(objectPr: CompositePr) {
        this.prGraph = this.prGraph.filter(function (objectItem) {
            return objectItem.pr !== objectPr.pr
        })
    }

    async setNewStatus(pr?: number, newState?: PrStatus) {
        const elementPr = this.find(pr)
        elementPr.state = newState
        this.monitorCheckStatus(elementPr)
    }

    monitorCheckStatus(mVertice: CompositePr) {

        let monitorStatus = false
        let mVertexDependent: CompositePr = mVertice

        if (mVertexDependent.state === PrStatus.CONCLUDED) {
            if (mVertexDependent.hasDependencies()) {
                this.listPendents = []
                monitorStatus = this.checkStatusBFS(mVertexDependent.dependencies)
            } else {
                monitorStatus = true
            }
        }

        if (mVertexDependent.state === PrStatus.CONCLUDED && monitorStatus) {
            mVertexDependent.monitorState.state = PMonitorStatus.CONCLUDED
        } else {
            mVertexDependent.monitorState.state = PMonitorStatus.FAILED
        }

        if(mVertice.dependents.length > 0){
            mVertice.dependents.forEach(dependent => {
                this.monitorCheckStatus(dependent)
            })
        }

    }

    checkStatusBFS(children: Array<CompositePr>) {

        let monitorStatus = false

        children.forEach(element => {
            if (element.state === PrStatus.CONCLUDED) {
                if (element.dependencies.length > 0) {

                    const unConcludedList = element.dependencies.filter(elementChild => {
                        elementChild.state !== PrStatus.CONCLUDED
                    })
                    monitorStatus = unConcludedList.length > 0 ? false : true

                    //Check children of chidren status
                    if (monitorStatus) {
                        element.dependencies.forEach(elementDependency => {
                            
                            const dependenciesToCheck = elementDependency.dependencies.filter(function (objectItem) {
                                return objectItem.pr !== elementDependency.pr
                            })

                            // checkStatysBfs for each child
                            if(dependenciesToCheck.length > 0){
                                monitorStatus = this.checkStatusBFS(dependenciesToCheck)
                            }
                        })
                    }
                }else {monitorStatus = true}
            } else { this.listPendents.push(element) }
        })

        return monitorStatus

    }

    removeDependent(){

    } 
    
    removePr(pr: number) {
       let toRemove = this.prGraph.filter(prs => {
            prs.pr === pr
            
            prs.dependents.some(dependent => {
                dependent.pr === pr
            })
            
            prs.dependencies.some(dependency => {
                dependency.pr === pr
            })
       })
    }

}