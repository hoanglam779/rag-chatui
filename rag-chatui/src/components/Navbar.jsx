import React from 'react'
import PropTypes from 'prop-types'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

const Navbar = props => {
  return (
    <>
    <nav class="bg-indigo-700 border-b border-indigo-500">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="flex h-20 items-center justify-between">
          <div
            class="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
          >
            {/* <!-- Logo --> */}
            <a class="flex flex-shrink-0 items-center mr-4" href="/">
              <img
                class="h-10 w-auto"
                src={logo}
                alt="React Jobs"
              />
              
              <span class="hidden md:block text-white text-2xl font-bold ml-2"
                >React RAG ChatUI</span>
            </a>
            <div class="md:ml-auto">
              <div class="flex space-x-2">
                {/* <Link
                  to="/"
                  class="text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
                  >Chatroom</Link>
                <Link
                  to="/file"
                  class="text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
                  >Context File</Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}
 Navbar.propTypes = {}

export default Navbar