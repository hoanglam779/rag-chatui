import React from 'react'
import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import spinner from '/svg-spinners--ring-resize.svg'
import '../App.css'
import axios from 'axios'
import '@chatui/core/es/styles/index.less';
// 引入组件
import Chat, { Bubble, useMessages } from '@chatui/core';
// 引入样式
import '@chatui/core/dist/index.css';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'

const FileManager = () => {

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
    
        }).catch((error) => {
          console.log(error)
          setuploadStatus(error.message)
        })
      }
  const delete_file = (name) => {
    console.log("delete "+name)
    fetchlist()
  }
  return (
    <>
    
    {/* <div class="container_title">Uploaded Files</div> */}
    {uploadProgress.started && <uploadProgress value={uploadProgress.percentage} max="100"></uploadProgress>}
    {uploadStatus && <span>{uploadStatus}</span>}

    <div class="container">
    <div class="container_title">Uploaded Files</div>
    
    {list_file.map((file) => {
      return <div class="file_card">
      <div>{file}</div>
      <button onClick={() => {delete_file(file)}}>delete</button>
      </div>
    })}
    
    {showSpinner ? <img src={spinner} class="logo" alt="Vite logo" /> : null}

    <form method='POST' name='file_form' class="upload_container">
        {/* <input name='user_chat' value={message} onChange={(e) => setMessage(e.target.value)}></input> */}
        <input type='file' name='file' id='file' accept='.doc,.docx' onChange={(e) => {setfile(e.target.files[0]);}}></input>
        <input type='submit' onClick={(e) => uploadFile(e)} text='Upload'></input>
    </form>
    </div>
    </>
  )
}

export default FileManager