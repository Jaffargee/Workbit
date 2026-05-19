import { JobData } from '@/types/types'
import { ExternalLink, Zap } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const InstructionCard = ({ job }: { job: JobData }) => {
      return (
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap size={20} className="text-amber-500" />{" "}Proof Instructions
                  </h3>
                  <div className="prose prose-slate max-w-none bg-amber-50/50 p-6 rounded-3xl border border-amber-100 text-slate-700 leading-relaxed">
                        {job.proof_instructions}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">

                        <Link
                              to={job.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-slate-900 text-white py-2 rounded-full font-semibold text-lg flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                        >
                              <div className="flex flex-row items-center justify-center relative w-full h-full gap-2">
                                    <div className="flex h-full relative items-center justify-center">
                                          <span>Open Task Link</span>
                                    </div>
                                    <div className="flex h-full relative items-center justify-center">
                                          <ExternalLink size={20} />
                                    </div>
                              </div>
                        </Link>

                  </div>
            </div>
      )
}

export default InstructionCard