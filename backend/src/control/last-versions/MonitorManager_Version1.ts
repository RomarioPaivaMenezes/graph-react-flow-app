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
    addAdjacentVertex(element: CompositePr, fatherId?: number) {

        if (!fatherId) {
            return this.addMainVertex(element)
        }

        let father = this.find(fatherId)

        if (!father) {
            //TODO: check if it's really necessary
            father = FactoryPrComponent.createFather(element, fatherId)
            return this.addMainVertex(father)
        } else {
            const mVertice = this.findVertexFather(father)

            if (mVertice) {
                element.monitorState = mVertice.monitorState
            } else { element.monitorState = { state: PMonitorStatus.FAILED } }

            element.father = father
            return father.addDependency(element)
        }
    }

    addMainVertex(element: CompositePr) {
        this.prGraph.push(element)
    }

    addBilateralVertex(bilateralDependent: CompositePr, bilateralDependency?: CompositePr){

        if(bilateralDependency.father){
            const dependencyMainVertice = this.findVertexFather(bilateralDependency)
            const depedentMainVertice = this.findVertexFather(bilateralDependent)

            if(depedentMainVertice.pr !== dependencyMainVertice.pr){
                bilateralDependency.dependents.push(bilateralDependent)
            }

        }else{
            const depedentMainVertice = this.findVertexFather(bilateralDependent)
            bilateralDependency.father = bilateralDependent.father
            bilateralDependency.monitorState = depedentMainVertice.monitorState
        }
        bilateralDependent.addDependency(bilateralDependency)
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

    // Find mVertice reverse-recursive
    findVertexFather(mVertice: CompositePr) {
        let mVerticeFather

        if (this.isfatherADependency(mVertice)) {
            mVerticeFather = this.findVertexFather(mVertice.father)
        } else return mVertice

        return mVerticeFather
    }

    isfatherADependency(mVertice: CompositePr){
        let father 
        if (mVertice.father) {
            father = mVertice.dependencies.find(element =>{
                element.pr === element.father.pr
            })
        }
        return father;
    }

    monitorCheckStatus(mVertice: CompositePr) {

        let monitorStatus = false
        let mVertexFather: CompositePr = this.findVertexFather(mVertice)

        if (mVertexFather.state === PrStatus.CONCLUDED) {

            if (mVertexFather.hasDependencies()) {
                this.listPendents = []
                monitorStatus = this.checkStatusBFS(mVertexFather.dependencies)
            } else {
                if (mVertexFather.state === PrStatus.CONCLUDED) {
                    monitorStatus = true
                }
            }
        }

        if (mVertexFather.state === PrStatus.CONCLUDED && monitorStatus) {
            mVertexFather.monitorState.state = PMonitorStatus.CONCLUDED
        } else {
            mVertexFather.monitorState.state = PMonitorStatus.FAILED
        }

        if(mVertice.dependents.length > 0){
            mVertice.dependents.forEach(bdv => {
                this.monitorCheckStatus(bdv)
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
                        element.dependencies.forEach(elementChild => {
                            // remove bilateral dependency
                            const childrenCheck = elementChild.dependencies.filter(function (objectItem) {
                                return objectItem.pr !== elementChild.pr
                            })
                            // checkStatysBfs for each child
                            monitorStatus = this.checkStatusBFS(childrenCheck)
                        })
                    }
                }else {monitorStatus = true}
            } else { this.listPendents.push(element) }
        })

        return monitorStatus

    }

}