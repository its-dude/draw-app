import { InputBox } from "../components/InputBox";
import { FormHeader } from "../components/FormHeader";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/FormBottomWarning";
import React, { useState } from "react";
import axios from "axios";
import { Backend_URL } from "../config";
import { RequestFailed } from "../components/RequestFailed";
import { useNavigate } from "react-router-dom";

export function Signup({setUserId}:{setUserId: React.Dispatch<React.SetStateAction<string|null>>}) {

    const [firstName, setFirstName] = useState("")
    const [lastName, setlastName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [requestFailedMessage, setRequestFailedMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    const buttonOnClickHandler = () => {
        if (!firstName || !lastName || !username || !password) {
            return;
        }

        setIsLoading(true)

        axios.post(`${Backend_URL}/auth/signup`, {
            firstName,
            lastName,
            username,
            password
        },

        )
            .then((respone) => {
                setUserId(respone.data.userId)
                setIsLoading(false)
                localStorage.setItem('token', respone.data.token)
                navigate('/room')
            })
            .catch((err) => {
                if (err.response) {
                    setRequestFailedMessage(err.response.data.message);
                } else if (err.request) {
                    setRequestFailedMessage("No response from server");
                } else {
                    // Something else went wrong
                    setRequestFailedMessage(err.message);
                }
                setIsLoading(false)
            })
    }

    return <div className="w-screen h-screen flex justify-center items-center bg-pink-200">
        {/* main code started */}
        <div className="w-72 max-w-82 rounded-md border-0 shadow px-6 py-8 bg-white flex gap-4 flex-col justify-center ">
            <FormHeader heading="Sign Up" message="Create your account to start doodling " />
            <InputBox type="text" placeholder="firstName" onChange={(e) => setFirstName(e.target.value)} />
            <InputBox type="text" placeholder="lastName" onChange={(e) => setlastName(e.target.value)} />
            <InputBox type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
            <InputBox type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
            <Button buttonText="Create Account" onClick={buttonOnClickHandler} isLoading={isLoading} />
            <BottomWarning to="/signin" toText="sign in" message="Already have an account?" />
            {requestFailedMessage !== null && <RequestFailed requestFailedMessage={requestFailedMessage} />}
        </div>
    </div>
}