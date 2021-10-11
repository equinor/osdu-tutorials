import React, {useState} from "react";
import {authProvider} from "../../authProvider";

import "./style.css";
import 'antd/dist/antd.css';
import {useDispatch} from "react-redux";
import {Heliports} from "../../components/heliports/heliports";
import {BarChart} from "../../components/charts/barChart";
import {loadSchedulesAction} from "../../store/schedule/actions";


export function MainPage() {
    const dispatch = useDispatch();
    const {userName} = authProvider.getAccount();
    //dispatch(loadHeliportsAction())
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
                <Heliports/>
            </div>

            <div className="main__chart-area">
                <BarChart/>
            </div>

            <div className="auth-buttons">
                {accountUi()}
            </div>
        </div>
    );
}