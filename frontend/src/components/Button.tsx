import type { MouseEventHandler } from "react"

type ButtonType = {
    buttonText: string,
    onClick: MouseEventHandler<HTMLButtonElement>,
    isLoading: boolean
}

export function Button({buttonText, onClick, isLoading}: ButtonType){
    return <button
  disabled={isLoading} 
  onClick={onClick}
  className="
    py-2 px-4 rounded 
    text-white 
    bg-blue-500 hover:bg-blue-600 
    disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:bg-blue-300
  "
>
  {buttonText}
</button>

}