/* Creative Commons Attribution 4.0 International (CC-BY-4.0) */
/* Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) */
/* This source code was getting from https://github.com/tastejs/todomvc-app-css/blob/03e753aa21bd555cbdc2aa09185ecb9905d1bf16/index.css */

// import styled, { css } from "styled-components";
import styled from "styled-components";

const WindowMaxWidthPercentage = 100;
const WindowMaxHeightPercentage = 100;
export const FullLayout = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  //height: 100vh;
  height: 100%;
  .anigraph-component-container{
    display: flex;
    height:100vh;
    width: 100vw;
  }
  
  #anigraph-app-div{
    max-height: ${WindowMaxHeightPercentage}%;
  }
  
  .anigraphcontainer {
    max-width: ${WindowMaxWidthPercentage}%;
    max-height: ${WindowMaxHeightPercentage}%;
    //aspect-ratio: 1;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    border-radius: 10px;
  }
  .h1{
    text-align: center;
  }
`;


export const Layout = styled.div`
  #transformationviewer-main{
    width: 95%;
  }
  .card{
    height: 90%;
    border: none;
  }
  .anigraphcontainer{
    max-height: 94%;
    max-width: 94%;
    aspect-ratio: 20/11;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    border: black;
    border-radius: 3px;
    border-style: solid;
    overflow: hidden;
  }
  
  .anigraph-parent{
    height: 100%;
  }

  .visualization-row{
    height: 600px;
  }
  
  .scene-description{
    font-size: 10pt;
    line-height: 12pt;
    //max-height: 150px;
    //min-height: 200px;
    //overflow: scroll;
  }
  h5 {
    font-size: 11pt;
  }
`;
