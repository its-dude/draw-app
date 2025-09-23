
export function RequestFailed({requestFailedMessage}: {requestFailedMessage:string}) {
    return <div className="text-red-400 font-semibold text-sm">{requestFailedMessage}</div>
}