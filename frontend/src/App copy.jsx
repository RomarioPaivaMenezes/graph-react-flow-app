import React, { useCallback } from 'react';
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

const getNodeId = () => `randomnode_${+new Date()}`;

const initialNodes = [
  { id: '1', type: 'inputCheck', position: { x: 0, y: 0 }, data: { label: '1', isChecked: 'false' }},
  { id: '2', type: 'inputCheck', position: { x: 0, y: 100 }, data: { label: '2', isChecked: 'false' }},
];

const nodeTypes = { inputCheck: InputCheckUpdate }; 

const initialEdges = [{ id: 'e1-2', source: '1', target: '2'}];
 
export default function Flow() {
  
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
 
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
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
    const newNode = {
      id: getNodeId(),
      data: { label: getNodeId(), isChecked: 'false' },
      type: 'inputCheck',
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight,
      },
      monitorState: 'Failed'
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
       // fitView
       // style={rfStyle}
      >
        <Panel position="top-right">
          <button onClick={onAdd}>add node</button>
      </Panel>
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

