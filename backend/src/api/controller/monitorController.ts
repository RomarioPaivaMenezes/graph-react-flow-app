import { MonitorManager } from "../../control/MonitorManager-map-version1.5";
import { CompositePr } from "../../control/PrComposite";
import { PrStatus } from "../../control/PrStatus";

export class MonitorControler {

    static monitorManager = new MonitorManager(new Map<number, CompositePr>())   

    constructor(){
        MonitorControler.monitorManager.addElement(new CompositePr(1));
    }

    static async getGraph(request, response) {
        let jsonObject = [];
            MonitorControler.monitorManager.prGraph.forEach((value, key) => {

            let newObject = { ...value };

            let dependencyStructure = []
            value.dependencies.forEach( dep =>{
                dependencyStructure.push({ id: ''+value.pr+dep.pr, source: ''+value.pr, target: ''+dep.pr})
            })

            let dependentsStructure = []
            value.dependents.forEach( dep =>{
                dependentsStructure.push({ id: ''+value.pr+dep.pr, source: ''+value.pr, target: ''+dep.pr})
            })

            newObject.dependencies = dependencyStructure
            newObject.dependents = dependentsStructure

        jsonObject.push(newObject);
    });

       const graphJson = JSON.parse(JSON.stringify(jsonObject))
       if(graphJson){
          return response.status(200).send(jsonObject);
       }else{
          return response.status(200).send(JSON.stringify(`{"message": "Graph is empty"}`));
       }
    }


    static async getPr(request, response) {

        const prId: number = parseInt(request.params.prId)
        let foundedPr = MonitorControler.monitorManager.find(prId)

        let newObject = { ...foundedPr };

        let dependencyStructure = []
        foundedPr.dependencies.forEach( dep =>{
            dependencyStructure.push({ id: ''+foundedPr.pr+dep.pr, source: ''+foundedPr.pr, target: ''+dep.pr})
        })

        let dependentsStructure = []
        foundedPr.dependents.forEach( dep =>{
            dependentsStructure.push({ id: ''+foundedPr.pr+dep.pr, source: ''+foundedPr.pr, target: ''+dep.pr})
        })

        newObject.dependencies = dependencyStructure
        newObject.dependents = dependentsStructure

       if(foundedPr){
          return response.status(200).send(JSON.parse(JSON.stringify({ ...newObject })));
       }else{
          return response.status(200).send(JSON.parse(`{"message": "PR not found"}`));
       }
    }


    static async addNewPr(request, response) { 
        try {
            const prJson = request.body;
            let newPr = new CompositePr(prJson.pr)
            MonitorControler.monitorManager.addElement(newPr)    
        } catch (error) {
           return response.status(200).send(JSON.stringify("{error: true}"));    
        }
        return response.status(200).send(JSON.stringify("{error: false}"));
    }

    static async addDependency(request, response) { 
        try {
            const prJson = request.body;  
            let dependency = MonitorControler.monitorManager.find(parseInt(prJson.dependency))
            MonitorControler.monitorManager.addDependency(dependency, parseInt(prJson.dependent))    
        } catch (error) {
           return response.status(200).send(JSON.stringify("{error: true}"));    
        }
        return response.status(200).send(JSON.stringify("{error: false}"));
    }

    static async setStatus(request, response) { 
        try {
            const prJson = request.body;       
                let state 

                if(prJson.status){
                    state = PrStatus.CONCLUDED
                }else {
                    state = PrStatus.CREATED
                }
            
                MonitorControler.monitorManager.setNewStatus(parseInt(prJson.pr), state)            
        } catch (error) {
           return response.status(200).send(JSON.stringify("{error: true}"));    
        }
        return response.status(200).send(JSON.stringify("{error: false}"));
    }

    
}

