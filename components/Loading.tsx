import { Loader2 } from 'lucide-react'
import React from 'react'
import workbitImg from '@/assets/workbit.webp';

const Loading = () => {
      return (
            <div className="block relative">
                  <img src={workbitImg} alt="Workbit Loading" height={70} width={150} />
                  <div className="absolute rounded-full bg-[#2f60bb] workbit-animation h-[2px] z-100 bottom-[-1rem]"></div>
            </div>
      )
}


export default Loading;