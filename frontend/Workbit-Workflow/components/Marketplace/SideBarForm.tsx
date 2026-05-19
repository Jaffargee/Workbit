import { JobData } from '@/types/types'
import { AlertCircle, CheckCircle2, FileWarning, MessageCircleWarning, UploadCloud } from 'lucide-react'
import { useState } from 'react'

const SideBarForm = ({ job, handleOnSubmit }) => {

      const [proof, setProof] = useState("");
      const [p_url, setPUrl] = useState("");
      const [selectedImage, setSelectedImage] = useState<{ img1: any, img2: any, img3: any }>({ img1: null, img2: null, img3: null });
      const [imagePreview, setImagePreview] = useState<{ img1: string | null, img2: string | null, img3: string | null }>({ img1: null, img2: null, img3: null });     

      const handleImageChange = (e: any, pos?: 0 | 1 | 2) => {
            const file = e.target.files[0];

            if (file) {
                  const previewUrl = URL.createObjectURL(file);
                  if (pos === 0) {
                        setSelectedImage({...selectedImage, img1: file});
                        setImagePreview({...imagePreview, img1: previewUrl});
                  } else if(pos === 1) {
                        setSelectedImage({...selectedImage, img2: file});
                        setImagePreview({...imagePreview, img2: previewUrl});
                  } else {
                        setSelectedImage({...selectedImage, img3: file});
                        setImagePreview({...imagePreview, img3: previewUrl});
                  }
            }
      }

      return (
            <form onSubmit={(e) => handleOnSubmit(e, { proof, p_url, selectedImage })} className="space-y-6 p-4">
                  
                  <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">
                              Submit Proof
                        </h3>
                        <p className="text-xs text-slate-500 font-medium"> Please provide accurate proof as instructed to ensure your payout is approved.</p>
                  </div>

                  <div className="space-y-4">

                        <label htmlFor='screenshot1' className={`relative flex min-h-[100px] w-full rounded-xl overflow-hidden border-2 ${imagePreview && imagePreview.img1?.length > 0 ? 'border-slate-100 border-solid' : 'border-dashed border-blue-600'}`}>
                              <div className='flex flex-1 flex-col relative w-full cursor-pointer overflow-hidden'>
                                    <div className="block w-full relative">
                                          <img src={imagePreview.img1} alt={imagePreview.img1} />
                                    </div>
                                    <input required type='file' onChange={(e) => handleImageChange(e, 0)} className='h-full w-full absolute top-0 left-0 hidden z-[1000] p-4' id='screenshot1' name='screenshot1' />
                                    <div className="flex items-center justify-center p-4 h-full w-full gap-3 text-blue-600 text-xl">
                                          <UploadCloud size={30} />{" "}Upload Before Screenshot
                                    </div>
                              </div>
                        </label>

                        <label htmlFor='screenshot2' className={`relative flex min-h-[100px] w-full rounded-xl overflow-hidden border-2 ${imagePreview && imagePreview.img2?.length > 0 ? 'border-slate-100 border-solid' : 'border-dashed border-blue-600'}`}>
                              <div className='flex flex-1 flex-col relative w-full cursor-pointer overflow-hidden'>
                                    <div className="block w-full relative">
                                          <img src={imagePreview.img2} alt={imagePreview.img2} />
                                    </div>
                                    <input required type='file' onChange={(e) => handleImageChange(e, 1)} className='h-full w-full absolute top-0 left-0 hidden z-[1000] p-4' id='screenshot2' name='screenshot2' />
                                    <div className="flex items-center justify-center p-4 h-full w-full gap-3 text-blue-600 text-xl">
                                          <UploadCloud size={30} />{" "}Upload After Screenshot
                                    </div>
                              </div>
                        </label>

                        <label htmlFor='screenshot3' className={`relative flex min-h-[100px] w-full rounded-xl overflow-hidden border-2 ${imagePreview && imagePreview.img2?.length > 0 ? 'border-slate-100 border-solid' : 'border-dashed border-blue-600'}`}>
                              <div className='flex flex-1 flex-col relative w-full cursor-pointer overflow-hidden'>
                                    <div className="block w-full relative">
                                          <img src={imagePreview.img3} alt={imagePreview.img3} />
                                    </div>
                                    <input required type='file' onChange={(e) => handleImageChange(e, 2)} className='h-full w-full absolute top-0 left-0 hidden z-[1000] p-4' id='screenshot3' name='screenshot3' />
                                    <div className="flex items-center justify-center p-4 h-full w-full gap-3 text-blue-600 text-xl">
                                          <UploadCloud size={30} />{" "}Upload Profile Screenshot
                                    </div>
                              </div>
                        </label>

                        <label className="block space-y-2">
                              <div className="text-sm font-bold text-slate-700">
                                    <span>Profile Url</span>
                              </div>
                              <input
                                    required
                                    placeholder="Your profile url"
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                                    value={p_url}
                                    id='p_url'
                                    name='p_url'
                                    onChange={(e) => setPUrl(e.target.value)}
                              />
                              <div className="flex flex-row w-full relative gap-2">
                                    <div className="h-full relative flex flex-col">
                                          <MessageCircleWarning size={18} color='#d08700' />
                                    </div>
                                    <div className="flex h-full flex-row items-center flex-1">
                                          <span className='text-sm text-yellow-600'>Please ensure this is a valid social account for verification and payment processing.</span>
                                    </div>
                              </div>
                        </label>

                        <label className="block space-y-2">
                              <div className="text-sm font-bold text-slate-700">
                                    <span>Proof Details (Optional)</span>
                              </div>
                              <textarea
                                    required
                                    placeholder='Addtional Context.'
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500 min-h-[150px] transition-all"
                                    value={proof}
                                    onChange={(e) =>
                                          setProof(e.target.value)
                                    }
                              />
                        </label>

                        {job.requires_screenshot && (
                              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-xs text-blue-700 font-semibold flex items-center gap-2">
                                          <AlertCircle size={30} /> {" "} Remember to upload your screenshot here and provide your social username/ID for verification.
                                    </p>
                              </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-full text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200" >
                              <div className="h-full w-full relative flex flex-row items-center justify-center">
                                    <span>Finish & Submit</span>
                              </div>
                        </button>
                        
                  </div>
            </form>
      )
}



export default SideBarForm