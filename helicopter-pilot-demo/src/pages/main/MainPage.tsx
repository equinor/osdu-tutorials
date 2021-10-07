import React from "react";
import {authProvider} from "../../authProvider";

import "./style.css";
import {Schedules} from "../../components/schedules/schedules";


export function MainPage() {
    const {userName} = authProvider.getAccount();

    const accountUi = () => {
        if (userName === null) {
            return (
                <a className='auth-button' href="/">
                    Login
                </a>
            );
        } else {
            return (
                <>
                    <span>Welcome {userName}</span>
                    <a className='auth-button' href={`/logout?frontend_state=${encodeURIComponent(window.location.href)}`}>
                        Logout
                    </a>
                </>
            );
        }
    };

    return (
        <div className="main">
            <div>
                <Schedules/>
            </div>
            <div className="auth-buttons">
                {accountUi()}
            </div>
        </div>
    );
}