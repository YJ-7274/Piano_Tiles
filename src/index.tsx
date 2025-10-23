import React from "react";
import ReactDOM from "react-dom";
import {createRoot} from 'react-dom/client'
import "@fontsource/anonymous-pro";
import './index.css';
import MainApp from "./MainApp";


// ReactDOM.render(
const container = document.getElementById("root");
const root =createRoot(container as HTMLElement);

root.render(
    <React.StrictMode>
        <MainApp />
    </React.StrictMode>,
);
