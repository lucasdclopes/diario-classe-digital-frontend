import { Component } from "react";
import MenuLogado from "../MenuLogado";
import CalendarioAulas from "../CalendarioAulas";

export default class AreaDoUsuario extends Component {

  constructor(props){
    super(props);

  }

  render(){
    return (
      <div>
        <MenuLogado/>
        <CalendarioAulas/>
      </div>
    );
  }

}