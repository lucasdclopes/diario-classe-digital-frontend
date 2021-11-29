import { Component } from "react";
import { Container, Table } from 'react-bootstrap';
import HttpService from "../../services/HttpService";
import HttpServiceHandler from "../../services/HttpServiceHandler";
import MenuLogado from "../MenuLogado";
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ErroModal from "../ErroModal";

import './index.css';
import Paginacao from "../Paginacao";

export default class ListaTurmas extends Component {
  constructor(){
    super();

    this.state = {
      listaTurmas : [],
      filtros : {
        idTurma : null,
        descTurma : null,
        tpPeriodo : null,
        tpNivelEnsino: null,
        paginacaoRequest : {
          size: 15,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        }
      },
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      }
    };

    this.obterLista = () => {
      HttpService.listarTurmas(this.state.filtros)
      .then((response) => {
        if (response) {
          this.setState(prevState => ({
            ...prevState,
            listaTurmas : response.data,
            filtros : {
              ...prevState.filtros,
              paginacaoResponse : {
                quantidade : parseInt(response.headers['page-quantidade']),
                hasProxima : response.headers['page-has-proxima'] === 'true' ? true : false
              }
            }
          }));
        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      })
    }

    this.selecionarPagina = (numeroPagina) => {
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          paginacaoRequest : {
            ...prevState.filtros.paginacaoRequest,
            page : numeroPagina
          }
        }
      }), () => {
        this.obterLista();
      });
    }

    this.incrementarPagina = (incremento) => {
      let incrementoPagina = this.state.filtros.paginacaoRequest.page + incremento;

      if (incrementoPagina > 0)
        this.selecionarPagina(incrementoPagina);
    }

    this.handleFiltroStatusChange = (e) => {
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          tpNivelEnsino : e.target.value
        }
      }), () => {
        this.obterLista();
      })
    }

    this.abrirDetalhesTurma = (idTurma) => {
      window.location = './turma?idTurma=' + idTurma;
    }

    this.closeErroModal = () => {
      this.setState({
        erroModal : {
          mensagemErro : '',
          showModalErro : false,
          titulo : ''
        }
      });
    }

  }

  render(){
    return (
      <div>
        <Container className="containerListaTurmas">
          <MenuLogado/>
          

          <Row style={{marginBottom: "20px"}}>
            <Col sm={{span : 4}}>
              <h1>Lista de turmas.</h1>
            </Col>
            <Col sm={{span : 4, offset: 4}}>
              <FloatingLabel controlId="floatingSelectGrid" label="Filtro de nível de ensino">
                <Form.Select aria-label="Floating label select example" onChange={this.handleFiltroStatusChange}>
                  <option value="">Nenhum</option>
                  <option value="INFANTIL">Infantil</option>
                  <option value="FUNDAMENTAL_I">Fundamental I</option>
                  <option value="FUNDAMENTAL_II">Fundamental II</option>
                  <option value="MEDIO">Médio</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
          </Row>

          

          <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Turma</th>
                  <th>Ensino</th>
                  <th>Período</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {
                  this.state.listaTurmas.map((turma) => {
                    return (
                        
                      <tr key={turma.idTurma}>
                        <td>{turma.idTurma}</td>
                        <td>{turma.descTurma}</td>
                        <td>{turma.tpNivelEnsino}</td>
                        <td>{turma.tpPeriodo}</td>
                        <td style={{textAlign : "center"}}>
                          {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                          <Button onClick={() => {this.abrirDetalhesTurma(turma.idTurma)}}>Detalhes Turma</Button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>

            </Table>

            <Paginacao there={this}/>

            <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>

        </Container>
      </div>
    );
  }

  componentDidMount() {
    this.obterLista();
  }
}