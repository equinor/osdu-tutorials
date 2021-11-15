import React from 'react';
import './styles.css';
import { authProvider } from '../../authProvider';
import {Search} from "../../components/well/Search";
import MyComponent from "../../components/intersection/intersection"

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
    const { name } = authProvider.getAccount();

    const accountUi = () => {
        if (name === null) {
            return (
                <a
                    className='auth-button'
                >
                    Login
                </a>
            );
        } else {
            return (
                <>
                    <span>Welcome {name}</span>
                    <a className='auth-button' href={`/logout?frontend_state=${encodeURIComponent(window.location.href)}`}>
                        Logout
                    </a>
                </>
            );
        }
    };

    return (
        <div className='main'>
            <div className='main__page'>
                {/* wells search with results */}
                <Search />

                <MyComponent className="main__intersection"/>

                {/* login-logout functionality. plain and simple */}
                <div className='main__auth-buttons'>
                    {accountUi()}
                </div>
            </div>
        </div>
    );
}
