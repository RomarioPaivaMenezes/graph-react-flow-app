import React, { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  Panel,
  applyEdgeChanges, applyNodeChanges
} from 'reactflow';
 
import './tailwind-config.js';
import 'reactflow/dist/style.css';
import InputCheckUpdate from './InputCheckUpdate.jsx';
import './index.css';
import { MonitorClient } from './api-monitor-client.js';

const monitorClient = new MonitorClient()
let countId = 1
let onChange

let {nodesPr, dependencies} = await monitorClient.getGraph()

const initialNodes = []
/*nodes.forEach(e => {
  initialNodes.push({ id: ''+e.id, type: e.type, position: e.position, data: {onChange: onChange, ...e.data}})
})*/

//initialNodes.push( { id: '1', type: 'inputCheck', position: { x: 0, y: 0 }, data: { label: '1', isChecked: 'false' }, monitorState: 'false'})

//[{ id: 'e1-2', source: '1', target: '2'}];
let initialEdges = dependencies
let monitorState = 'Failed'
const nodeTypes = { inputCheck: InputCheckUpdate }; 
 
async function findPr(node){
 return  await monitorClient.updateNode(node)
}
export default function Flow() {

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  let [monitorStatus, setMonitorStatus] = useState(monitorState);


  useEffect(() => {
    
    const onChange = async (label) => {
      console.log(label)
      let node = initialNodes.find(nd => label === nd.data.label)
      let newPr = await findPr(node)
      console.log(`Aqui esta o resultado ${JSON.stringify(newPr)}`)
      monitorState = newPr.data.monitorState
      console.log(`Esse é o PR monitor state: ${newPr.data.monitorState}`)
      setMonitorStatus(monitorState);

      console.log(`Esse é o monitor state: ${monitorStatus}`)
      
    };

    nodesPr.forEach(e => {
      let classColor = 'text-green-500 font-bold'
      if(e.data.monitorState === 'Concluded'){
        classColor = 'text-green-500 font-bold'
      }else {
        classColor = 'text-red-500 font-bold'
      }
      initialNodes.push({ id: ''+e.id, type: e.type, position: e.position, data: {onChange: onChange, classColor: classColor, ...e.data}, 
        style : { backgroundColor: '#eee' }})
    })



    setNodes(initialNodes)
    setEdges(initialEdges)
 
    }, [setEdges]);
    

  const onNodesChange = useCallback((changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [setNodes]
  );
  
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
    }, [setEdges]);
  

  const onConnect = useCallback(
   async (connection) => {
     
     monitorClient.addDependency(connection.source, connection.target)
    /* let {nodesPr, dependencies} = await monitorClient.getGraph()

      nodesPr.forEach(e => {
        let classColor = 'text-green-500 font-bold'
        if(e.data.monitorState === 'Concluded'){
          classColor = 'text-green-500 font-bold'
        }else {
          classColor = 'text-red-500 font-bold'
        }
        initialNodes.push({ id: ''+e.id, type: e.type, position: e.position, data: {onChange: onChange, classColor: classColor, ...e.data}, 
          style : { backgroundColor: '#eee' }})
      })

      setNodes(initialNodes)*/
      
    setEdges((eds) => addEdge(connection, eds))},
    [setEdges],
    );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);


  const onAdd = useCallback(() => {

    let prId = countId++
    
    monitorClient.addElement(prId)
    const newNode = {
      id: ''+prId,
      data: { label: ''+prId, isChecked: false, monitorState: 'Failed', onChange: onChange },
      type: 'inputCheck',
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight,
      },
    };
    
    monitorClient.updateNodes(initialNodes)

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    //<div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        className="bg-teal-50"
       // fitView
       //style={rfStyle}
      >
          <Panel position="top-right">
            <button onClick={onAdd}>add node</button>
          </Panel>
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    //</div>
  );

  }
  





