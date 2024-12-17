import React from 'react'
import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import bot from '/geekbot-svgrepo-com.svg'
import trash from '/trash-can-with-cover-svgrepo-com.svg'
import spinner from '/svg-spinners--ring-resize.svg'
import '../App.css'
import axios from 'axios'
import '@chatui/core/es/styles/index.less';
import Chat, { Avatar, Bubble, useMessages } from '@chatui/core';
import { Button, IconButton } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'
import { setShims } from 'groq-sdk/_shims/registry.mjs'

let initialMessages = []
if (typeof(Storage)!=='undefined' && localStorage.getItem('history') !== null) {
  initialMessages = initialMessages.concat(JSON.parse(localStorage.getItem('history')))
}


const ChatRoom = () => {

  const [uploadProgress, setuploadProgress] = React.useState({started: false, percentage: 0})
  const [file, setfile] = React.useState(null)
  const [list_file, setlist_file] = React.useState([])
  const [uploadStatus, setuploadStatus] = React.useState(null)
  const [showSpinner, setshowSpinner] = React.useState(true) 

  const fetchlist = async () => {
  const response = await axios.get('http://127.0.0.1:5000/list_file')  
  setlist_file(response.data)
  setshowSpinner(false)}
  useEffect(() => {fetchlist()}, [])

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!file) {
      console.log("no file")
      setuploadStatus('No file selected')
      return;}
    // setfile(e.target.files[0])
    console.log(file)
    const formData = new FormData()
    formData.append('file', file)
    setshowSpinner(true)
    setuploadStatus("Uploading...")
    setuploadProgress(prevState =>  {return {...prevState, started: true}})
    axios.post('http://127.0.0.1:5000/file_upload', formData,
    // axios.post('http://httpbin.org/post', formData,
      {
        onUploadProgress: (uploadProgress) => {
          console.log('Upload uploadProgress: ' + Math.round(uploadProgress.loaded / uploadProgress.total * 100) + '%')
          setuploadProgress(prevState =>  {return {...prevState, percentage: uploadProgress.uploadProgress * 100}})
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then((response) => {
      console.log(response.data)
      setuploadStatus('Uploaded Successfully')
      setshowSpinner(false)
      window.location.reload();
    }).catch((error) => {
      console.log(error)
      setshowSpinner(false)
      setuploadStatus(error.message)
    })
  }

  const delete_file = (name) => {
    console.log("deleting "+name)
    setshowSpinner(true)
    axios.get('http://127.0.0.1:5000/file_delete', {params: {name: name}})
    .then((response) => {
      console.log(response.data)
      fetchlist()
      window.location.reload();
      setshowSpinner(false)
    })
    .catch((error) => {
      console.log(error)
      setshowSpinner(false)
    })
  }

  let mess = initialMessages;
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);

  const save_messages_history = () => {
    // console.log('logged');
    // console.log(mess);
    localStorage.setItem('history', JSON.stringify(mess));
    // if (localStorage.getItem('history') === null) {
  }
  const del_history = () => {
    console.log('delete history');
    localStorage.removeItem('history');
    window.location.reload();
  }

  async function handleSend(type, val) {
    setTyping(true);
    if (type === 'text' && val.trim()) {
        setTyping(true);
        const user_message = {
            type: 'text',
            content: { text: val },
            position: 'right',
          }
        appendMsg(user_message);
        setTyping(true);
        mess.push(user_message)
        
        // console.log(mess)
        let his = mess.slice(0,-1).map((item) => {
          if (item.type === 'text') {
            return item.content.text
          }
        }).join('\n')
        his = his.concat('\n<|question|>', val)
        // console.log(his)

        const rep = await axios.get('http://127.0.0.1:5000/chat', {params: {history: his}})
        const reply =  {
          type: 'text',
          content: { text: rep.data },
          user: { avatar: 'https://www.svgrepo.com/show/353774/geekbot.svg'},
        }

        appendMsg(reply);
        mess.push(reply)
        save_messages_history();
      }
      setTyping(false);
  }

  function renderMessageContent(msg) {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

    return (
    <div class="flex h-4/5">
    {/* <div class="flex">
         <a href="https://vite.dev" target="_blank">
           <img src={viteLogo} className="logo" alt="Vite logo" />
         </a>
         <a href="https://react.dev" target="_blank">
           <img src={reactLogo} className="logo react" alt="React logo" />
    </div> */}
    {/* <div class="w-7/12 bg-gray-400 pl-2 pt-2 pb-2"> */}
    <div class="w-[45rem] max-w-7xl">
    <Chat
      navbar={{ title: 'Chatbot name'}}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
      placeholder='Type a message...'
      locale='en-US'
    />
    </div>
    <div class="w-px bg-gray-400"></div>
    {/* <button onClick={log_messages}>log mess</button> */}
    {/* <button onClick={del_history} class="w-5/12">Delete Chat History</button> */}
    <div class="w-5/12 bg-gray-400 content-end">
      {/* <div class="h-12  border-8">Sources</div> */}
      <div onClick={del_history} class="text-indigo-200 cursor-pointer bg-gray-900 focus:outline-none hover:bg-gray-600 hover:text-gray-900 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2 m-2">Delete Chat History</div>
    
      <div class="bg-gray-200 flex flex-col m-2 p-2 rounded h-3/5 overflow-y-scroll">
        <div class="text-sm text-indigo-900 font-bold">List of files</div>
        {list_file.map((file) => {
        return <div class="flex bg-white m-2 p-2 space-x-2 rounded">
        <div class="text-sm text-black">{file}</div>
        <img class="w-5 h-45 self-end cursor-pointer hover:text-red hover:fill-current"  src={trash} onClick={() => {delete_file(file)}}></img>
        </div>
      })}
      {showSpinner ? <img src={spinner} class="logo" alt="Vite logo" /> : null}
        
    </div>
    
    <form method='POST' name='file_form' class='flex flex-col object-bottom bg-gray-200 p-2 rounded m-2'>
        {/* <input name='user_chat' value={message} onChange={(e) => setMessage(e.target.value)}></input> */}
        <div class="text-sm text-indigo-900 font-extrabold">Upload File</div>
        <input type='file' class="text-sm text-gray-900 w-full" name='file' id='file' accept='.doc,.docx,.txt' onChange={(e) => {setfile(e.target.files[0]);}}></input>
        <input type='submit' class="text-gray-900 cursor-pointer bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2 m-2" onClick={(e) => uploadFile(e)} text='Upload'></input>
    </form>
    </div>


    {/* <div>{import.meta.env.VITE_nword}</div> */}
    </div>
    // <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
  )
}

export default ChatRoom