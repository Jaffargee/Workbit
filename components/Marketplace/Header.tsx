import { JobData } from "@/types/types";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Header = ({ job }: { job: JobData }) => {
      return (
            <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start space-y-2">
                  
                  <Link to={"/marketplace"} className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 text-slate-500 font-bold hover:text-blue-600 transition-colors overflow-hidden" >
                        <div className="flex flex-row items-center w-full h-full relative gap-2">
                              <span>
                                    <ArrowLeft size={20} />
                              </span>
                              <span>Back to Marketplace</span>
                        </div>
                  </Link>

                  <div className="flex items-center gap-4 text-slate-400 text-sm font-medium max-sm:px-4 max-sm:w-full max-sm:justify-end">
                        <div className="inline-block relative">
                              <div className="flex items-center gap-1">
                                    <span>
                                          <Eye size={14} />
                                    </span>
                                    <span>{job.view_count ?? 0} views</span>
                              </div>
                        </div>
                        <div className="inline-block relative">
                              <div className="flex items-center gap-1">
                                    <span>
                                          <Clock size={14} />
                                    </span>
                                    <span>
                                          Posted{" "}
                                          {new Date(job.posted_at).toLocaleDateString()}
                                    </span>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Header;
