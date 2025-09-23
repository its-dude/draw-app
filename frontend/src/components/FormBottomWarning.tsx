import { Link } from "react-router-dom"

type BottomWarningType = {
    message: string
    to: string
    toText: string
}

export function BottomWarning({ message, to, toText }: BottomWarningType) {
    return <div className="text-sm  text-gray-400 font-semibold">
        {message} <Link className="text-blue-600" to={to}>{toText}</Link>
    </div>
}