import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import spinner from '/svg-spinners--ring-resize.svg'
import './App.css'
import axios from 'axios'
import React from 'react';
import '@chatui/core/es/styles/index.less';
import Chat, { Bubble, Navbar, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'
import ChatRoom from './pages/ChatRoom'
import MainLayout from './layouts/MainLayout'
import FileManager from './pages/FileManager'

let initialMessages = []
if (typeof(Storage)!=='undefined' && localStorage.getItem('history') !== null) {
  initialMessages = JSON.parse(localStorage.getItem('history'))
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout/>}>
    <Route index element={<ChatRoom/>  } />
    <Route path="/file" element={<FileManager/>  } />
    </Route>
  )
)

function App() {
  return <>
  
  <RouterProvider router={router} />
  </>
  
}

export default App
