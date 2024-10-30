import React, { useState } from 'react';
import Dashboard from './page/Dashboard';
import LoaderComponent from "./components/LoaderComponent"
import { Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';


const App = (nonceUserField) => {
    const logoUrl = ajaxUrls.plugin_url + "includes/images/logo_edeXa.svg";

    const [isLoader, setIsloader] = useState(false)
    return (<div>
        <Toaster />
        {isLoader ? <LoaderComponent /> : null}
        <div className="d-flex justify-content-between padding-20" >
            <div className="div-left mt-2">
                <a href="https://edexa.network/" className="edexa-logo-link" target="_blank">
                <img src={logoUrl} className='edexa-logo-image ' />
            </a>
            </div>
            <div className="div-right mt-2">
                <div>Don’t have an API Credentials?</div>
                <div><a href="https://accounts.edexa.com/" className="edexa-logo-link" target="_blank">
                <strong>Login / Register</strong>
                </a></div>
            </div>
        </div>
        <hr />
        <div className='bstam-dashboard d-flex justify-content-center align-items-center'>
            <Dashboard setIsloader={setIsloader} setUserField={nonceUserField}/>
        </div>
    </div>
    );
}



export default App;