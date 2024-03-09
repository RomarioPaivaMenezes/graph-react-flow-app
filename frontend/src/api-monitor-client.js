
export class MonitorClient {

  async getGraph() {
    let nodesPr = []
    let dependencies = []

    let count = 200

   await fetch('http://localhost:8080/monitor/api/getGraph', {
      method: 'GET',
      headers: {
      Accept: 'application/json',

      },
    }
   ).then((response) => response.json())
      .then((data) => data.forEach(element => {
        let checked = element.state === 'Created' ? false  : true
        let newNode = {
          id: element.pr,
          data: { label: element.pr, isChecked: checked, monitorState: element.monitorState.state },
          type: 'inputCheck',
          position: { x: 0, y: count },
        };
        
        count = count + 100
        nodesPr.push(newNode)

        element.dependencies.forEach(dep => {
          dependencies.push(dep)})

      }));

      return {nodesPr, dependencies}
  }

  async findPr(pr) {
    let nodePr
   await fetch('http://localhost:8080/monitor/api/findPr/'+parseInt(pr), {
      method: 'GET',
      headers: {
      Accept: 'application/json',

      },
    }
   ).then((response) => response.json())
      .then((element) =>  {

        let checked = element.state === 'Created' ? false  : true
        
        nodePr = {
          id: element.pr,
          data: { label: element.pr, isChecked: checked, monitorState: element.monitorState.state},
          type: 'inputCheck',
          //position: { x: 0, y: count },
        };
      });

      return nodePr
  }


  async addElement(prId) {

   await fetch('http://localhost:8080/monitor/api/addPr', {
      method: 'POST',
      body: JSON.stringify({
        pr:prId 
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    
  });

}

async addDependency(dependent, dependency) {

  await fetch('http://localhost:8080/monitor/api/setDependency', {
      method: 'POST',
      body: JSON.stringify({
        "dependency": dependency,
        "dependent": dependent
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    
  });

  }

async setStatusPr(data) {

  await fetch('http://localhost:8080/monitor/api/setStatus', {
      method: 'POST',
      body: JSON.stringify({
        status: data.isChecked,
        pr: data.label
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    
  });

  }


  async updateNode(node) {
    let  nodesPr = await this.findPr(parseInt(node.id))
      return {...nodesPr}
  }


  async updateNodes(initialNodes) {

    let { nodesPr } = await this.getGraph()
  
    if(nodesPr.length > 0) {
      nodesPr.forEach(e => {
        let node = initialNodes.find(element => {
          element.id === e.id
        })
  
        if(node) {
          node.monitorState = e.monitorState
          node.data = e.data
        }
  
      });
    }
    
  }
}


