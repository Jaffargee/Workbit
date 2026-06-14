import { CheckCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Verified = () => {
      return (
            <div className="space-y-8 animate-in fade-in duration-500 h-[100vh] w-full flex flex-1">
                  <div className="flex flex-col h-full w-full relative items-center justify-center">
                        <div className="flex flex-col space-y-6">
                              <div className="block relative flex flex-col items-center justify-center">
                                    <CheckCircle size={150} color="green" />
                              </div>
                              <div className="flex relative flex-col gap-2 px-4">
                                    <p className="text-[2rem] text-center">
                                          <span className="text-gray-800">
                                                Email Verfication
                                          </span>
                                    </p>
                                    <p className="text-wrap text-center">
                                          Your email address was successfully
                                          verified. You can continue using the
                                          application.
                                    </p>
                                    <div className="flex flex-col w-full relative items-center justify-center my-2">
                                          <Link
                                                to={'/auth/login'}
                                                className="px-7 py-3 bg-slate-200 border-1 border-slate-300 rounded-full"
                                          >
                                                <div className="flex flex-col w-full h-full relative items-center justify-center text-center">
                                                      <span>
                                                            Continue to Login
                                                      </span>
                                                </div>
                                          </Link>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Verified;
