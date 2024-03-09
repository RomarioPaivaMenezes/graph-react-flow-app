import { afterEach, describe, it } from "node:test";
import {expect, jest, test} from '@jest/globals';
import { CompositePr } from "../src/control/PrComposite";
import { MonitorManager } from "../src/control/last-versions/MonitorManager-array-version";
import { PrStatus } from "../src/control/PrStatus";

describe('Vertex Testing', () => {
    afterEach(() => jest.clearAllMocks)

    test('given a new vertex which there is no father then should be added', () =>{
        let graphList: Array<CompositePr> = []
        let monitorManager = new MonitorManager(graphList);
    
        let pr = new CompositePr(1)

        monitorManager.addMainVertex(pr)
        expect(graphList.length).toBeGreaterThan(0)
    });

    test('given a new vertex which there is a father then should be added', () =>{
        let graphList: Array<CompositePr> = []
        let monitorManager = new MonitorManager(graphList);
    
        let pr1 = new CompositePr(1)
        monitorManager.addMainVertex(pr1)

        let pr2 = new CompositePr(2)
        monitorManager.addDependency(pr2, 1)

        expect(pr1.dependencies.length).toBeGreaterThan(0)
    });


    test('adding bilateral dependencies, both has different father', () =>{
        let graphList: Array<CompositePr> = []
        let monitorManager = new MonitorManager(graphList);
    
        let pr1 = new CompositePr(1)
        monitorManager.addMainVertex(pr1)

        let pr2 = new CompositePr(2)
        monitorManager.addDependency(pr2, pr1.pr)

        let pr3 = new CompositePr(3)
        monitorManager.addDependency(pr3, pr1.pr)
        
        let pr4 = new CompositePr(4)
        monitorManager.addMainVertex(pr4)

        let pr5 = new CompositePr(5)
        monitorManager.addDependency(pr5, pr4.pr)

        let pr6 = new CompositePr(6)
        monitorManager.addDependency(pr6, pr4.pr)

        expect(pr1.dependencies.length).toBeGreaterThan(0)
    });

    test('adding bilateral dependencies, dependency doesn\'t have father', () =>{
        let graphList: Array<CompositePr> = []
        let monitorManager = new MonitorManager(graphList);
    
        let pr1 = new CompositePr(1)
        monitorManager.addMainVertex(pr1)

        let pr2 = new CompositePr(2)
        monitorManager.addDependency(pr2, pr1.pr)

        let pr3 = new CompositePr(3)
        monitorManager.addDependency(pr3, pr1.pr)
        
        let pr4 = new CompositePr(4)
        monitorManager.addMainVertex(pr4)

        let pr5 = new CompositePr(5)
        monitorManager.addDependency(pr5, pr4.pr)

        let pr6 = new CompositePr(6)
        monitorManager.addDependency(pr6, pr4.pr)

    });


    test('adding bilateral dependencies, dependency doesn\'t have father then run checkMonitor', () =>{
        let graphList: Array<CompositePr> = []
        let monitorManager = new MonitorManager(graphList);
    
        let pr1 = new CompositePr(1)
        monitorManager.addMainVertex(pr1)

        let pr2 = new CompositePr(2)
        monitorManager.addDependency(pr2, pr1.pr)

        let pr3 = new CompositePr(3)
        monitorManager.addDependency(pr3, pr1.pr)
        
        let pr4 = new CompositePr(4)
        monitorManager.addDependency(pr4, pr3.pr)

        let pr5 = new CompositePr(5)
        monitorManager.addDependency(pr5, pr3.pr)

        let pr6 = new CompositePr(6)
        monitorManager.addDependency(pr6, pr5.pr)

        monitorManager.setNewStatus(pr3.pr, PrStatus.CONCLUDED)
        monitorManager.setNewStatus(pr5.pr, PrStatus.CONCLUDED)
        monitorManager.setNewStatus(pr4.pr, PrStatus.CONCLUDED)
        monitorManager.setNewStatus(pr6.pr, PrStatus.CONCLUDED)

        console.log(pr1)
        console.log(pr2)

    });

});

