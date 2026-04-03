import { WifiOff } from 'lucide-react'

const NetworkError = () => {
      return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                  <div className="h-[150px] w-[150px] bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <WifiOff size={80} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-600">
                        Network Failure!
                  </h2>
                  <p className="text-gray-500 mt-2">
                        Check your internet connection and try again.
                  </p>
                  <button onClick={() => window.location.reload()} className="mt-8 bg-slate-50 border-slate-500 border-1 text-slate-500 px-8 py-2 rounded-full cursor-pointer hover:bg-slate-100 select-none shadow-sm transition-all">
                        Retry
                  </button>
            </div>
      )
}

export default NetworkError