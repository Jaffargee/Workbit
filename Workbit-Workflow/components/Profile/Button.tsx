
type Props = {
      text?: string,
      className?: string,
}

const Button = ({ text, className, ...rest }: Props) => {
      return (
            <button {...rest} className={`relative overflow-hidden z-10 px-6 py-3 rounded-full font-bold transition-all cursor-pointer ${className}`}>
                  <div className="flex h-full w-full items-center justify-center flex-col">
                        <span>{text}</span>
                  </div>
            </button>
      )
}

export default Button