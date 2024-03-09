import { describe  } from "node:test";
import {expect, jest, test} from '@jest/globals';
import { CompositePr } from "../src/control/PrComposite";
import { MonitorManager } from "../src/control/last-versions/MonitorManager-map-version1.3";
import { PMonitorStatus, PrStatus } from "../src/control/PrStatus";

describe('GraphMap - Testing', () => {
    //afterEach(() => jest.clearAllMocks)

    let monitorManager: MonitorManager

    const createSut = (): MonitorManager => {
        let monitorManager = new MonitorManager(new Map<number, CompositePr>());
        return monitorManager
    }

    const createPr = (pr): CompositePr => {
        return new CompositePr(pr)
    }

    test('Adding a new Element', () =>{
        monitorManager = createSut();
        let pr1 = createPr(1)
        monitorManager.addElement(pr1)
        expect(monitorManager.find(1)).toEqual(pr1)
    });
    
    test('given new Dependency which the dependent doesn\'t exits then trows an error.', () =>{
        expect(() => {
            monitorManager.addDependency(createPr(3), 5)
          }).toThrow(Error)
    });

    test('given new Dependency which that doesn\'t yet exist in the graph then it should be added.', () =>{
        monitorManager.addDependency(createPr(3), 1)
        const pr3 = monitorManager.find(3)
        expect(monitorManager.find(pr3.pr)).toEqual(pr3)
    });

    test('given a dependency that has been added then dependent must contain the dependency.', () =>{
        const pr3 = monitorManager.find(3)
        const pr1 = monitorManager.find(1)
        expect(pr3.dependents[0]).toEqual(pr1)
    });

    test('given a dependency that has been added then the dependency must contain dependent.', () =>{
        const pr3 = monitorManager.find(3)
        const pr1 = monitorManager.find(1)
        expect(pr1.dependencies[0]).toEqual(pr3)
    });

    test('given a dependency that has been added then the dependent monitor status should be Failed.', () =>{
        const pr1 = monitorManager.find(1)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.FAILED)
    });

    test('given a dependency that has been added then the dependency monitor status should be Failed.', () =>{
        const pr3 = monitorManager.find(3)
        expect(pr3.monitorState.state).toEqual(PMonitorStatus.FAILED)
    });

    test('after a dependency has been added then monitorCheckStatus should be call once.', () =>{
        const monitorCheckStatus = jest.spyOn(monitorManager, 'checkMonitorStatus');
        monitorCheckStatus.mockImplementationOnce(() => monitorManager);
        monitorManager.addDependency(createPr(2), 3)
        expect(monitorCheckStatus).toHaveBeenCalledTimes(1);
    });

    test('after a status has been changed then monitorCheckStatus should be call once.', () =>{
        const monitorManager = createSut()
        monitorManager.addElement(createPr(4))
        const monitorCheckStatus = jest.spyOn(monitorManager, 'checkMonitorStatus');
        monitorCheckStatus.mockImplementationOnce(() => monitorManager);
        monitorManager.setNewStatus(4, PrStatus.CONCLUDED)
        expect(monitorCheckStatus).toHaveBeenCalledTimes(1);
    });

    test('Changing status to Concluded for element with dependencies which dependent is still unConclued then dependent monitor state is Failed', () =>{
        const pr3 = monitorManager.find(3)
        monitorManager.setNewStatus(pr3.pr, PrStatus.CONCLUDED)
        expect(pr3.dependents[0].monitorState.state).toEqual(PMonitorStatus.FAILED);
    });

    test('Changing status to Concluded for element with no concluded dependencies then and dependency monitor state is failed.', () =>{
        const pr3 = monitorManager.find(3)
        expect(pr3.monitorState.state).toEqual(PMonitorStatus.FAILED);
    });

    test('Changing status to Concluded for element with concluded dependencies then and dependency monitor state is Concluded.', () =>{
        const pr3 = monitorManager.find(3)
        monitorManager.setNewStatus(2,PrStatus.CONCLUDED)
        expect(pr3.monitorState.state).toEqual(PMonitorStatus.CONCLUDED);
    });

    test('Changing status to Concluded for element with concluded dependencies then concluded dependent monitor state is Concluded.', () =>{
        const pr1 = monitorManager.find(1)
        monitorManager.setNewStatus(1,PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.CONCLUDED);
    });

});

