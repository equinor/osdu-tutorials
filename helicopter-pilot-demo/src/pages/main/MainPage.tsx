import React from "react";
import {authProvider} from "../../authProvider";

import "./style.css";
import {loadSchedulesAction} from "../../store/schedule/actions";
import {useDispatch} from "react-redux";
import {loadHeliportsAction} from "../../store/heliport/actions";
import {Heliports} from "../../components/heliports/heliports";


export function MainPage() {
    const dispatch = useDispatch();
    const {userName} = authProvider.getAccount();

    dispatch(loadSchedulesAction());
    dispatch(loadHeliportsAction())

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
               <Heliports/>
            </div>
            <div className="auth-buttons">
                {accountUi()}
            </div>
        </div>
    );
}