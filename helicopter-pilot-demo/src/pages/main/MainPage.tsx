import React from "react";
import {authProvider} from "../../authProvider";

import "./style.css";
import {Schedules} from "../../components/schedules/schedules";
import {loadSchedulesAction} from "../../store/schedule/actions";
import {useDispatch} from "react-redux";


export function MainPage() {
    const dispatch = useDispatch();
    const {userName} = authProvider.getAccount();

    dispatch(loadSchedulesAction());

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
            <div className="main__page">
                <label>Schedules</label>
                <Schedules/>
            </div>
            <div className="auth-buttons">
                {accountUi()}
            </div>
        </div>
    );
}