
import React, { useCallback, useState } from 'react';
import { Background, Handle, Position, useReactFlow, useStoreApi } from 'reactflow';
import { MonitorClient } from './api-monitor-client';

const monitorClient = new MonitorClient();

function InputCheckUpdate({ data, isConnectable }) {
  const [checked, setChecked] = useState(data.isChecked);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  const delay = ms => new Promise(res => setTimeout(res, ms));

  
  const onChange = async (evt) => {
    const { nodeInternals } = store.getState();
    let checked = !data.isChecked
    setChecked(checked)
    data.isChecked = checked
    monitorClient.setStatusPr(data)    
    
    //await delay(2000);
    const nd = await monitorClient.findPr(data.label)
    data.monitorState = nd.data.monitorState

    console.log(nodeInternals.values())
    let initializeNode = [];

    Array.from(nodeInternals.values()).forEach((value, key) => {
      initializeNode.push(value)
    })

    console.log(initializeNode)
    
    //await delay(2000);
    let initialNodes = [];
    let {nodesPr, dependencies} = await monitorClient.getGraph()
    nodesPr.forEach(e => {
      console.log(e)
      const nodePosition = initializeNode.find(nd => parseInt(e.id) === parseInt(nd.id))

      let classColor = 'text-green-500 font-bold'
      if(e.data.monitorState === 'Concluded'){
        classColor = 'text-green-500 font-bold'
      }else {
        classColor = 'text-red-500 font-bold'
      }
      
      initialNodes.push({ id: ''+e.id, type: e.type, position: nodePosition.position, data: {onChange: onChange, classColor: classColor, ...e.data}, 
      style : { backgroundColor: '#eee' }})
    })

    setNodes(initialNodes);
  };


  const onChange2 = useCallback(async  (evt) => {
    let checked = !data.isChecked
    setChecked(checked)
    data.isChecked = checked
    monitorClient.setStatusPr(data)    
    await data.onChange(data.label)
  }, []);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400" >
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          <label className="toggle-switch">
            <input type="checkbox"  onChange={onChange} checked={data.isChecked}/ >
              <div className="toggle-switch-background">
                <div className={"toggle-switch-handle"}></div>
              </div>
          </label>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">PR: {data.label}</div>
          <div className="text-gray-500">Monitor Status: 
           <a className={data.classColor}> {data.monitorState}</a>
          </div>
        </div>
      </div>
      <div>

      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-16 !bg-teal-500"/>
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} className="w-16 !bg-teal-500" />
    </div>
  );
}

export default InputCheckUpdate;
