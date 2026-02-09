import { AlertCircle } from 'lucide-react'

type ErrorDisplayProps = {
      err_msg?: string;
}

const ErrorDisplay = ({ err_msg }: ErrorDisplayProps) => {
      return (
            <div className='block relative bg-red-50 border border-red-200 w-full rounded-xl overflow-hidden'>
                  <div className="flex flex-col w-full relative h-full px-4 py-4">
                        <div className="flex flex-row gap-3 w-full h-full relative">
                              <div className="flex-shrink-0">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                              </div>
                              <div className="flex flex-col h-full flex-1">
                                    <p className='text-red-800 text-sm font-medium'>An Error occured.</p>
                                    <p className='text-red-600 text-sm'>{err_msg}</p>
                              </div>
                        </div>
                  </div>
            </div>
      )
}

export default ErrorDisplay