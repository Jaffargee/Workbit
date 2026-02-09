import React from 'react'
import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const EmailAuth = () => {
      return (
            <div className="flex flex-col w-full relative">
                  <Link to={'/auth/signup'} className="flex flex-col overflow-hidden rounded-full h-[50px] border-1 border-slate-300 w-full px-4">
                        <div className="flex flex-row items-center justify-center w-full h-full relative gap-4">
                              <span>
                                    <Mail />
                              </span>
                              <span className="text-gray-600 text-center font-semibold">Continue with Email</span>
                        </div>
                  </Link>
            </div>
      )
}

export default EmailAuth