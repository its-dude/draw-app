import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react"

type InputType = {
    placeholder: HTMLInputTypeAttribute,
    type: HTMLInputTypeAttribute,
    onChange: ChangeEventHandler<HTMLInputElement>
}

export function InputBox({placeholder, type, onChange}: InputType){
    return  <input onChange={onChange} className="border-0 shadow py-2 px-1 rounded outline-0" type={type} placeholder={placeholder} />
}