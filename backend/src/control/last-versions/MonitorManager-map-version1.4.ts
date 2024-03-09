import { verify } from "crypto";
import { CompositePr } from "../last-versions/PrComposite-version-1.4";
import { PMonitorStatus as PrDependencyStatus, PrStatus } from "../PrStatus";

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

        if (dependent) {
            dependent.addDependency(element)
            dependent.monitorState = { state: PrDependencyStatus.FAILED }
            element.addDependents(dependent)

            if (!this.prGraph.has(element.pr)) {
                this.addElement(element)
                //  element.monitorState = {state: PMonitorStatus.FAILED}
            }

            this.checkMonitorStatus(dependent)
        } else {
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

        //&& element.monitorState.state !== PrDependencyStatus.CONCLUDED
        if (element.state === PrStatus.CONCLUDED) {
            if (element.hasDependencies()) {
                monitorStatus = this.checkStatusBFS(element)
            } else {
                monitorStatus = true
            }
        }

        if (element.state === PrStatus.CONCLUDED && monitorStatus) {
            element.monitorState.state = PrDependencyStatus.CONCLUDED
        } else {
            element.monitorState.state = PrDependencyStatus.FAILED
        }

        if (element.hasDependents()) {
            let dependentTemp: CompositePr = element.createSnapshot();

            element.dependents.forEach((dependent, index) => {
                let hasBilateralDependency = dependent.dependencies.some(dependency => dependency.pr === element.pr)
                if (hasBilateralDependency) {
                    element.dependents.splice(index, 1)
                }
            })

            dependentTemp.dependents.forEach(dependent => {
                this.checkMonitorStatus(dependent)
            })

            //restore Pr
            element.dependents = dependentTemp.dependents
            element = dependentTemp;
        }

    }

    checkStatusBFS(elementPr: CompositePr) {

        let monitorStatus = false
        let children = elementPr.dependencies

        //TODO: find each correct state

        //Process only PrStatus Concluded and PrDependencyStatus UnConcluded
        const dependenciesToMonitore = children.filter(function (objectItem) {
            return objectItem.state === PrStatus.CONCLUDED && objectItem.monitorState.state !== PrDependencyStatus.CONCLUDED
        })

        //Check if there are any PrStatus UnConcluded
        let hasUnConcludedDepedencies = children.some(dependency => dependency.state !== PrStatus.CONCLUDED)

        if (dependenciesToMonitore.length === 0 && !hasUnConcludedDepedencies) {
            return true
        }

        let dependentTemp: CompositePr = elementPr.createSnapshot();

        dependenciesToMonitore.forEach(firstLayerDependency => {

            let hasBilateralDependency = firstLayerDependency.dependencies.some(dependency => dependency.pr === elementPr.pr)

            if (hasBilateralDependency) {
                elementPr.dependencies = elementPr.dependencies.filter(objectItem => objectItem.pr !== firstLayerDependency.pr)
            }

            monitorStatus = this.checkStatusBFS(firstLayerDependency)

            //restore Pr State
            elementPr.dependencies = dependentTemp.dependencies
        })

        if (monitorStatus && !hasUnConcludedDepedencies) {
            return true
        } else return false        

    }

}