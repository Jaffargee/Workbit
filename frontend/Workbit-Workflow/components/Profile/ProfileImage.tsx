import { BadgeCheck, Mail } from "lucide-react"

type Props = {
      user: any
}

const ProfileImage = ({ user }: Props) => {
      return (
            <div className="relative w-40 h-40 md:w-40 md:h-40 flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-white p-1 shadow-xl relative">
                        <div className="w-full select-none h-full rounded-full bg-blue-100 border-4 border-blue-50 flex items-center justify-center text-blue-600 text-7xl font-black">
                              {user.username.charAt(0).toUpperCase()}
                        </div>
                  </div>
                  {user.is_verified && (
                        <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white">
                              <BadgeCheck size={20} />
                        </div>
                  )}
            </div>
      )
}

export const ProfileData = ({ user }: Props) => {
      return (
            <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-900">
                              {user.username}
                        </h2>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                              {user.user_type}
                        </span>
                  </div>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Mail size={16} /> {user.email}
                  </p>
            </div>
      )
}

export default ProfileImage