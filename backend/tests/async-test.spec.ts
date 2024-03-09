import { describe  } from "node:test";
import {expect, jest, test} from '@jest/globals';
import { CompositePr } from "../src/control/PrComposite";
import { MonitorManager } from "../src/control/MonitorManager-map-version1.5";
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

    test('Async Test', async () => {
        monitorManager = createSut();
        let pr1 = createPr(1)

        let pr2 = createPr(2)
        let pr3 = createPr(3)
        let pr4 = createPr(4)

        monitorManager.addElement(pr1)
        monitorManager.setNewStatus(pr1.pr, PrStatus.CONCLUDED)
        monitorManager.addDependency(pr2, pr1.pr)
        monitorManager.addDependency(pr3, pr1.pr)
        monitorManager.addDependency(pr4, pr1.pr)

        const delaySetNewStatus = (ms, pr) => new Promise((res) => { 
            setTimeout(res, ms)
            monitorManager.setNewStatus(pr.pr, PrStatus.CONCLUDED)
        });

        delaySetNewStatus(10000, pr2)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.FAILED)
        
        monitorManager.setNewStatus(pr3.pr, PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.FAILED)
        
        monitorManager.setNewStatus(pr4.pr, PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.CONCLUDED)

    });

    test('Sync Test', async () => {

        monitorManager = createSut();
        let pr1 = createPr(1)

        let pr2 = createPr(2)
        let pr3 = createPr(3)
        let pr4 = createPr(4)

        monitorManager.addElement(pr1)
        monitorManager.setNewStatus(pr1.pr, PrStatus.CONCLUDED)
        monitorManager.addDependency(pr2, pr1.pr)
        monitorManager.addDependency(pr3, pr1.pr)
        monitorManager.addDependency(pr4, pr1.pr)

        //PR2 Concluded
        monitorManager.setNewStatus(pr2.pr, PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.FAILED)
        
        monitorManager.setNewStatus(pr3.pr, PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.FAILED)
        
        monitorManager.setNewStatus(pr4.pr, PrStatus.CONCLUDED)
        expect(pr1.monitorState.state).toEqual(PMonitorStatus.CONCLUDED)

    });
})
