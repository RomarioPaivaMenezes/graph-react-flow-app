import { verify } from "crypto";
import { CompositePr } from "./PrComposite";
import { PMonitorStatus as PrDependencyStatus, PrStatus } from "./PrStatus";

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
            }

            this.checkMonitorStatus(dependent)
        } else {
            //TODO: Handle errors
            throw Error('Depedent not found!')
        }

    }

    addElement(element: CompositePr) {
        this.prGraph.set(element.pr, element)
        this.checkMonitorStatus(element)
    }

    async setNewStatus(pr?: number, newState?: PrStatus) {
        console.debug(`Inicializing Monitor for: PR${pr}`)
        const elementPr = this.find(pr)
        elementPr.state = newState
        await this.checkMonitorStatus(elementPr)
    }

    async checkMonitorStatus(element: CompositePr) {

        //TODO: Handle non-existence
        let monitorStatus = false

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
            // create snapshot of dependents list
            const dependents: Array<CompositePr> = [...element.dependents]

            dependents.forEach((dependent, index) => {

                let hasBilateralDependency = dependent.dependencies.some(dependency => dependency.pr === element.pr)
               
                if (hasBilateralDependency) {
                    element.dependents.splice(index, 1)
                }

                this.checkMonitorStatus(dependent)
            })

            //restore Pr dependents list state
            element.dependents = dependents
        }

    }

    checkStatusBFS(element: CompositePr) {

        //TODO: to find each correct state

        let monitorStatus = false
        //create snapshot of dependencies list
        let dependencies: Array<CompositePr> = [...element.dependencies]

        //Process only PrStatus Concluded and PrDependencyStatus UnConcluded
        const dependenciesToMonitore = dependencies.filter(function (objectItem) {
            return objectItem.state === PrStatus.CONCLUDED && objectItem.monitorState.state !== PrDependencyStatus.CONCLUDED
        })

        //Check if there are any PrStatus UnConcluded
        let hasUnConcludedDepedencies = dependencies.some(dependency => dependency.state !== PrStatus.CONCLUDED)

        if (dependenciesToMonitore.length === 0 && !hasUnConcludedDepedencies) { return true }

        dependenciesToMonitore.forEach(firstLayerDependency => {

            let hasBilateralDependency = firstLayerDependency.dependencies.some(dependency => dependency.pr === element.pr)

            if (hasBilateralDependency) {
                element.dependencies = element.dependencies.filter(objectItem => objectItem.pr !== firstLayerDependency.pr)
            }

            monitorStatus = this.checkStatusBFS(firstLayerDependency)
            
            //restore Pr dependencies list state
            element.dependencies = dependencies
        })
        
        return (monitorStatus && !hasUnConcludedDepedencies) ?  true : false;
    }

}