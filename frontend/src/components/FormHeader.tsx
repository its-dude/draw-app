type HeaderType = {
    heading: string,
    message: string
}

export function FormHeader({heading, message}: HeaderType) {
    return <div className="flex flex-col gap-1 items-center mb-8" >
        <h1 className="text-4xl font-semibold">{heading}</h1>
        <p className="text-sm text-gray-400 font-semibold">{message}</p>
    </div>
}