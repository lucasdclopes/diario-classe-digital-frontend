import { Component } from "react";
import { Container, Table, Form, Row, Col, InputGroup, FormControl, ButtonGroup, ToggleButton, Card } from 'react-bootstrap';
import './index.css';
import queryString from 'query-string';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import DateHelper from '../../helpers/DateHelper';
import ConfirmacaoModal from "../ConfirmacaoModal";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Paginacao from '../Paginacao';


export default class CadastroAlunos extends Component{

  constructor(props){
    super(props);

    this.state = {
      idAluno : 0,
      nome : "",
      cpf : "",
      rg : "",
      dtNascimento : "",
      sexo : "MASCULINO",
      nomeMae : "",
      cpfMae : "",
      telDDDMae : "00",
      telNroMae : "00",
      nomePai : "",
      cpfPai : "",
      telDDDPai : "00",
      telNroPai : "00",
      emailContato : "",
      celDDD : "00",
      celNro : "", 
      telDDD : "00",
      telNro : "",
      endLogradouro : "",
      endNumero : "",
      endComplemento : "",
      endCEP : "",
      endBairro : "",
      endCidade : "",
      endUF : "",
      nroMatricula : "",
      dtMatricula : "",
      nis : "",
      transportador : "",
      telDDDTransportador : "00",
      telNroTransportador : "", 
      unidadeEscolar : "",
      ubsRef : "",   
      alunos : [],    
      textoBusca : null, 
      paramBusca : null, 
      filtros : {
        cpf : null,
        nome : null,
        nomePai : null,
        nomeMae : null,
        nis : null,
        paginacaoRequest : {
          size: 15,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        }
      },
      isEdicao: false,
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },
      sucessoModal : {
        mensagem : '',
        show : false,
        redirect : ''
      }, 
      faltasAlunoModal : {
        idAluno : 0,
        detalhesAluno: null,
        show : false,
      },
      confirmacaoModal : {
        perguntaConfirmacao : '',
        show : false,
        titulo : '',
        callBackSim : null
      },      
    };

    this.closeErroModal = () => {
      this.setState({
        erroModal : {
          mensagemErro : '',
          showModalErro : false,
          titulo : ''
        }
      });
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

    this.closeSucessoModal = () => {
      if (this.state.sucessoModal.redirect) {
        window.location = this.state.sucessoModal.redirect;
      }

      this.setState({
        sucessoModal : {
          mensagem : '',
          show : false
        }
      });
    }

    this.obterLista = () => {
      console.log('obterLista');
      HttpService.listarAlunos(this.state.filtros)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            alunos : response.data,
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
        let httpServiceHandler = new HttpServiceHandler();
        httpServiceHandler.validarExceptionHTTP(error.response,this);

        if (error.response.status == 404){
          this.setState(prevState => ({
            ...prevState,
            alunos : []
          }));
        }
      })
      this.limparFiltros();
    }

    this.abrirConfirmacaoModal = () => {
      this.setState({
        confirmacaoModal : {
          perguntaConfirmacao : 'Deseja realmente excluir o aluno? Isto NÃO poderá ser desfeito',
          show : true,
          titulo : 'Deletar aluno',
        }
      });
    }

    this.handleSimConfirmacaoModal = () => {
      HttpService.deletarAluno(this.state.idAluno)
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Aluno removido com sucesso.',
              show : true
            }
          });

        this.setState(prevState => ({
          ...prevState,
          idAluno : 0,
          isEdicao : false,
          alunos : []
        }), () => {
          this.obterLista();
        });

        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      })
      .finally(() => {
        this.closeConfirmacaoModal();
      });

    }

    this.closeConfirmacaoModal = () => {
      this.setState({
        confirmacaoModal : {
          perguntaConfirmacao : '',
          show : false,
          titulo : '',
          callBackSim : null
        }
      });
    }

    this.abrirSucessoModal = (msg,redirect) => {
      this.setState({
        sucessoModal : {
          mensagem : msg,
          show : true,
          redirect : redirect
        }
      });
    }

    this.novoAluno = () => {
        this.setState({
            idAluno : 0,
            isEdicao: true
          });
    }

    this.exibirAluno = (idAluno) => {
      console.log('buscando aluno');
      this.limparDados();
      HttpService.exibirAluno(idAluno)
      .then((response) => {

        let data = response.data;
        this.setState(prevState => ({
          ...prevState,  
          idAluno : data.idAluno,
          nome : data.nome,
          cpf : data.cpf,
          rg : data.rg,
          dtNascimento : data.dtNascimento,
          sexo : data.sexo,

          nomeMae : data.mae === null? null : data.mae.nome,
          cpfMae : data.mae === null? null : data.mae.cpf,
          telDDDMae : data.mae === null? null :  data.mae.telContato === null? null : data.mae.telContato.telDDD,
          telNroMae : data.mae === null? null : data.mae.telContato === null? null : data.mae.telContato.telNro,

          nomePai : data.pai === null? null : data.pai.nome,
          cpfPai : data.pai === null? null : data.pai.cpf,
          telDDDPai : data.pai === null? null :  data.pai.telContato === null? null : data.pai.telContato.telDDD,
          telNroPai : data.pai === null? null : data.pai.telContato === null? null : data.pai.telContato.telNro,

          emailContato : data.emailContato,
          celDDD : data.telCelular !== null? data.telCelular.telDDD : null,
          celNro : data.telCelular !== null? data.telCelular.telNro : null,
          telDDD : data.telFixo !== null? data.telFixo.telDDD : null,
          telNro : data.telFixo !== null? data.telFixo.telNro : null,

          endLogradouro : data.endResidencial !== null? data.endResidencial.endLogradouro : null,
          endNumero : data.endResidencial !== null? data.endResidencial.endNumero : null,
          endComplemento : data.endResidencial !== null? data.endResidencial.endComplemento : null,
          endCEP : data.endResidencial !== null? data.endResidencial.endCEP : null,
          endBairro : data.endResidencial !== null? data.endResidencial.endBairro : null,
          endCidade : data.endResidencial !== null? data.endResidencial.endCidade : null,
          endUF : data.endResidencial !== null? data.endResidencial.endUF : null,
          nroMatricula : data.nroMatricula,
          dtMatricula : data.dtMatricula,
          nis : data.nis,
          transportador : data.transportador,
          telDDDTransportador : data.telTransportador !== null? data.telTransportador.telDDD : null,
          telNroTransportador : data.telTransportador !== null? data.telTransportador.telNro : null,
          unidadeEscolar : data.unidadeEscolar,
          ubsRef : data.ubsRef,

          isEdicao: true
        }));
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

    this.salvarAluno = (e) => {

      HttpService.salvarAluno({
        nis : this.state.nis,
        nroMatricula : this.state.nroMatricula,
        dtMatricula : this.state.dtMatricula,
        nome : this.state.nome,
        cpf : this.state.cpf,
        rg : this.state.rg,
        dtNascimento : this.state.dtNascimento,
        sexo : this.state.sexo,
        emailContato : this.state.emailContato,        
        mae : { 
          nome : this.state.nomeMae,
          cpf : this.state.cpfMae,
          telContato : { 
            telDDD : this.state.telDDDMae,    
            telNro : this.state.telNroMae
          }
        },
        pai : {
            nome : this.state.nomePai,
            cpf : this.state.cpfPai,
            telContato : { 
              telDDD : this.state.telDDDPai,    
              telNro : this.state.telNroPai
            }
        },
        telCelular : { 
          telDDD : this.state.celDDD,telNro : this.state.celNro
        },
        telFixo : { 
          telDDD : this.state.telDDD,telNro : this.state.telNro
        },
        endResidencial : {
          endLogradouro : this.state.endLogradouro,
          endNumero : this.state.endNumero,
          endComplemento : this.state.endComplemento,
          endCEP : this.state.endCEP,
          endBairro : this.state.endBairro,
          endCidade : this.state.endCidade,
          endUF : this.state.endUF
        },
        transportador: this.state.transportador,
        telTransportador : { 
          telDDD : this.state.telDDDTransportador,    
          telNro : this.state.telNroTransportador
        },
        unidadeEscolar: this.state.unidadeEscolar,
        ubsRef: this.state.ubsRef
      },
      this.state.idAluno
      )
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Aluno cadastrado com sucesso.',
              show : true
            }
          });
        }

      this.setState(prevState => ({
        ...prevState,
        idAluno : 0,
        isEdicao : false,
        alunos : []
      }), () => {
        this.obterLista();
      });

      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      }); 


    }
    this.deletarAluno = (e) => {
      this.abrirConfirmacaoModal();
    }

    this.buscarAluno = (e) => {

      
      console.log('paramBusca ' + this.state.paramBusca);
      console.log('textoBusca ' + this.state.textoBusca);
      console.log('filtros ' + this.state.filtros);

      let textoParaBusca = this.state.textoBusca;


      if (this.state.textoBusca === null){
        console.log('this.state.textoBusca === null ');
        this.setState(prevState => ({
          ...prevState
          }
        ),() => {this.obterLista();}
        );
        return;
      }

      switch (this.state.paramBusca) {
        case '1':
          console.log('s1');
          this.setState(prevState => ({
            ...prevState,
            filtros : {
              ...prevState.filtros,
              nome : textoParaBusca
              }
            }
          ),() => {this.obterLista();}
          );
          break;
        case '2':
          console.log('s2');
          this.setState(prevState => ({
            ...prevState,
            filtros : {
              ...prevState.filtros,
              cpf : textoParaBusca
              }
            }
            ),() => {this.obterLista();}
            );
          break;
        case '3':
          console.log('s3');
          this.setState(prevState => ({
            ...prevState,
            filtros : {
              ...prevState.filtros,
              nomeMae : textoParaBusca
              }
            }
            ),() => {this.obterLista();}
            );
          break;
        case '4':
          console.log('s4');
          this.setState(prevState => ({
            ...prevState,
            filtros : {
              ...prevState.filtros,
              nomePai : textoParaBusca
              }
            }
            ),() => {this.obterLista();}
            );
          break;
          case '5':
            console.log('s5');
            this.setState(prevState => ({
              ...prevState,
              filtros : {
                ...prevState.filtros,
                nis : textoParaBusca
                }
              }
              ),() => {this.obterLista();}
              );
            break;
        default:
          console.log('sd');
          this.setState(prevState => ({
            ...prevState,
            paramBusca: 1,
            filtros : {
              ...prevState.filtros,
              nome : textoParaBusca
              }
            }
            ),() => {this.obterLista();}
            );
        } 
    }

    this.handleChange = (e) => {
      /*
      console.log(this.state.paramBusca);
      console.log(e.target.type);
      console.log(e.target.value);
      console.log('e.target.name ' + e.target.name);*/

      const name = e.target.name;
      const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    this.handleChangeNumerico = (e) => {
    /*  
      console.log('num ' + this.state.paramBusca);
      console.log('num ' + e.target.type);
      console.log('num ' + e.target.value);
      console.log('num e.target.name ' + e.target.name);*/

      const re = /^[0-9\b]+$/;
      if (e.target.value === '' || re.test(e.target.value)) {
        console.log('noif');
        const name = e.target.name;
        const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
        this.setState({ 
          [name]: value 
        });
     } 
    }

    this.radiosBusca = [
      { name: 'Nome', value: '1' },
      { name: 'CPF', value: '2' },
      { name: 'Nome da Mãe', value: '3' },
      { name: 'Nome do Pai', value: '4' },
      { name: 'NIS', value: '5' },
    ];

  
    this.limparFiltros = (e) => {
      console.log('limpando filtros');
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          cpf : null,
          nome : null,
          nomePai : null,
          nomeMae : null,
          nis : null 
          }
        }
      ));
    }

    this.limparDados = (e) => {
      console.log('limpando dados');
      this.setState(prevState => ({
        ...prevState,
        idAluno : 0,
        nome : "",
        cpf : "",
        rg : "",
        dtNascimento : "",
        sexo : "MASCULINO",
        nomeMae : "",
        cpfMae : "",
        telDDDMae : "00",
        telNroMae : "00",
        nomePai : "",
        cpfPai : "",
        telDDDPai : "00",
        telNroPai : "00",
        emailContato : "",
        celDDD : "00",
        celNro : "00", 
        telDDD : "00",
        telNro : "00",
        endLogradouro : "",
        endNumero : "",
        endComplemento : "",
        endCEP : "",
        endBairro : "",
        endCidade : "",
        endUF : "",
        nroMatricula : "",
        dtMatricula : "",
        nis : "",
        transportador : "",
        telDDDTransportador : "00",
        telNroTransportador : "00", 
        unidadeEscolar : "",
        ubsRef : ""    
      }  
      )
      );
    }

  }


  

  render(){
    return (
      <div>

        <Container className="containerListaAlunosTurma" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="Aluno">Alunos</h3>
            </Col>
          </Row>

        
          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Form>
                <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.dadosPessoais">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" placeholder={"Digite o nome completo"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nome} name="nome" required autoComplete="false" maxLength="100"
                    />
                </Form.Group>

                <Row className="mb-3">
                <Form.Group as={Col} controlId="alunoForm.sexo">
                  {
                    (!this.state.isEdicao) &&
                    <div>
                      
                          <Form.Label>Sexo</Form.Label>
                          <Form.Control type="text" placeholder={this.state.sexo} disabled value={this.state.sexo}/>

                    </div>
                  }
                  {
                    (this.state.isEdicao) &&
                    <div>
                        <br/>
                        <FloatingLabel className="inputNovoAluno" controlId="floatingSelectGrid" label="Sexo">
                          <Form.Select aria-label="Floating label" onChange={this.handleChange} value={this.state.sexo} name="sexo" >
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMININO">Feminino</option>
                            <option value="DESCONHECIDO">Outro</option>
                          </Form.Select>
                        </FloatingLabel>      
                                  
                    </div>
                  }
                </Form.Group>  
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.dtNascimento">
                    <Form.Label>Data de nascimento</Form.Label>
                    <Form.Control type="text" placeholder={"DD/MM/AAAA"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.dtNascimento} name="dtNascimento" required autoComplete="false" maxLength="10"
                    />  
                  </Form.Group>

                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.email">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control type="email" placeholder={"email para contato"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.emailContato} name="emailContato" required autoComplete="false" maxLength="100"
                    />  
                  </Form.Group>
                </Row>

                <div>
                <Card className="mb-3">
                  <Card.Header>Dados da Mãe</Card.Header>
                  <Row className="mb-3">
      
                    <Col xs={5}>
                    <Form.Group className="ps-2" controlId="alunoForm.nomeMae">
                      <Form.Label>Nome da mãe</Form.Label>
                      <Form.Control type="text" placeholder={"Nome completo da mãe do Aluno"} disabled={!this.state.isEdicao}   
                      onChange={this.handleChange} value={this.state.nomeMae} name="nomeMae" required autoComplete="false" maxLength="100"
                      />
                    </Form.Group>
                    </Col>

                    <Col xs={3}>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.cpfMae} name="cpfMae" required autoComplete="false" maxLength="11"
                      />
                    </Col>


                    <Col xs={1}>
                      <Form.Label>DDD</Form.Label>
                      <Form.Control type="text" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.telDDDMae} name="telDDDMae" required autoComplete="false" maxLength="3" 
                      />
                    </Col>

                    <Col xs={3}>
                    <Form.Group className="pe-2" controlId="alunoForm.telNroMae">
                      <Form.Label>Número de contato</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.telNroMae} name="telNroMae" required autoComplete="false" maxLength="9"
                      />
                    </Form.Group>
                    </Col>
                  </Row>  
                </Card>
                </div>                

                <div>
                <Card className="mb-3">
                  <Card.Header>Dados do Pai</Card.Header>
                  <Row className="mb-3">
                  <Col xs={5}>
                  <Form.Group className="ps-2" controlId="alunoForm.nomePai">
                    <Form.Label>Nome</Form.Label>
                      <Form.Control type="text" placeholder={"Nome completo do pai do Aluno"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.nomePai} name="nomePai" autoComplete="false" maxLength="100"
                      />   
                    </Form.Group>       
                    </Col>

                    <Col xs={3}>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.cpfPai} name="cpfPai" autoComplete="false" maxLength="11"
                      />
                    </Col>
                    <Col xs={1}>
                      <Form.Label>DDD</Form.Label>
                      <Form.Control type="text" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.telDDDPai} name="telDDDPai" autoComplete="false" maxLength="3" 
                      />
                    </Col>
                    <Col xs={3}>
                    <Form.Group className="pe-2" controlId="alunoForm.telNroPai">
                      <Form.Label>Número de contato</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.telNroPai} name="telNroPai" autoComplete="false" maxLength="9" 
                      />
                    </Form.Group>   
                    </Col>

                  </Row>
                </Card>  
                </div>

                <Card className="mb-3">
                <Card.Header>Documentos do Aluno</Card.Header>
                <Row className="mb-3">
                  <Col>
                  <Form.Group className="ps-2" controlId="alunoForm.rg">
                    <Form.Label>RG</Form.Label>
                    <Form.Control type="text" placeholder={"Digite o RG sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.rg} name="rg" required autoComplete="false" maxLength="10"
                    />
                  </Form.Group></Col>
                  <Col>
                  <Form.Group controlId="alunoForm.cpf">
                    <Form.Label>CPF</Form.Label>
                    <Form.Control type="text" placeholder={"Digite o CPF sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.cpf} name="cpf" required autoComplete="false" maxLength="11"
                    />
                  </Form.Group></Col>
                  
                  <Col>
                  <Form.Group className="pe-2" controlId="alunoForm.nis">
                    <Form.Label>NIS</Form.Label>
                    <Form.Control type="text" placeholder={"NIS. Sem pontaução"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.nis} name="nis" required autoComplete="false" maxLength="11"
                    />
                  </Form.Group></Col>
                </Row>
                </Card>

                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.nroMatricula">
                    <Form.Label>Número de Matricula</Form.Label>
                    <Form.Control type="text" placeholder={"Identificação da matricula"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nroMatricula} name="nroMatricula" required autoComplete="false" maxLength="50"
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.dtMatricula">
                    <Form.Label>Data da Matricula</Form.Label>
                    <Form.Control type="text" placeholder={"DD/MM/AAAA"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.dtMatricula} name="dtMatricula" required autoComplete="false" maxLength="10"
                    />                  
                  </Form.Group>
                </Row>

                <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.telefones">

                  <Row>
                    <Col>
                      <Form.Label>DDD Celular</Form.Label>
                      <Form.Control type="text" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.celDDD} name="celDDD" required autoComplete="false" maxLength="3" 
                      />
                    </Col>

                    <Col xs={8}>
                      <Form.Label>Número do celular</Form.Label>
                      <Form.Control type="text" placeholder={"999999999. Somente números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChangeNumerico} value={this.state.celNro} name="celNro" required autoComplete="false" maxLength="9" 
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col>                
                    <Form.Label>DDD Telefone fixo</Form.Label>
                    <Form.Control type="text" placeholder={"011"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.telDDD} name="telDDD" autoComplete="false" maxLength="3" 
                    />
                    </Col>

                    <Col xs={8}>                 
                    <Form.Label>Telefone fixo</Form.Label>
                    <Form.Control type="text" placeholder={"99999999. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.telNro} name="telNro" autoComplete="false" maxLength="9" 
                    />
                    </Col>  
                  </Row>
                                

                </Form.Group>

                <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.Enderecos">
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control type="text" placeholder={"Rua tal tal tal"} disabled={!this.state.isEdicao}  
                  onChange={this.handleChange} value={this.state.endLogradouro} name="endLogradouro" required autoComplete="false"  maxLength="200"
                  />

                  <Row>
                    <Col>                      
                    <Form.Label>Número</Form.Label>
                    <Form.Control type="text" placeholder={"99999"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endNumero} name="endNumero" required autoComplete="false"  maxLength="20"
                    />
                    </Col>                      
                    <Col>  
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control type="text" placeholder={"Casa 1 / ap10 / cj10"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endComplemento} name="endComplemento" autoComplete="false"  maxLength="50"
                    />
                    </Col>                      
                    <Col>  
                    <Form.Label>CEP</Form.Label>
                    <Form.Control type="text" placeholder={"11111111. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.endCEP} name="endCEP" required autoComplete="false"  maxLength="8"
                    />
                    </Col>                      
                  </Row>

                  <Row>
                    <Col>                      
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control type="text" placeholder={"Insira o Bairro"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endBairro} name="endBairro" required autoComplete="false"  maxLength="50"
                    />
                    </Col>                    
                    <Col>  
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control type="text" placeholder={"São Paulo"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endCidade} name="endCidade" required autoComplete="false"  maxLength="50"
                    />    
                    </Col>  
                    <Col>                    
                    {
                      (!this.state.isEdicao) &&
                      <div>
                        <Form.Group as={Col} controlId="alunoForm.UF">
                            <Form.Label>UF</Form.Label>
                            <Form.Control type="text" placeholder={this.state.endUF} disabled value={this.state.endUF}/>
                        </Form.Group>
                      </div>
                    }
                    {
                      (this.state.isEdicao) &&
                      <div>
                        <br/>
                        <FloatingLabel className="inputNovoAluno" controlId="floatingSelectGrid" label="UF" >
                          <Form.Select aria-label="Floating label" onChange={this.handleChange}  value={this.state.endUF} name="endUF" >
                          <option value="AC">Acre</option> <option value="AL">Alagoas</option> <option value="AP">Amapá</option> <option value="AM">Amazonas</option> <option value="BA">Bahia</option> 
                          <option value="CE">Ceará</option> <option value="DF">Distrito Federal</option> <option value="ES">Espírito Santo</option> <option value="GO">Goiás</option> 
                          <option value="MA">Maranhão</option> <option value="MT">Mato Grosso</option> <option value="MS">Mato Grosso do Sul</option> <option value="MG">Minas Gerais</option> 
                          <option value="PA">Pará</option> <option value="PB">Paraíba</option> <option value="PR">Paraná</option> <option value="PE">Pernambuco</option> <option value="PI">Piauí</option> 
                          <option value="RJ">Rio de Janeiro</option> <option value="RN">Rio Grande do Norte</option> <option value="RS">Rio Grande do Sul</option> <option value="RO">Rondônia</option> 
                          <option value="RR">Roraima</option> <option value="SC">Santa Catarina</option> <option value="SP">São Paulo</option> <option value="SE">Sergipe</option> 
                          <option value="TO">Tocantins</option>
                          </Form.Select>
                        </FloatingLabel>                    
                      </div>
                    }      
                  </Col>                        
                </Row>     
                  
                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.ubsref">
                    <Form.Label>UBS de referência</Form.Label>
                    <Form.Control type="text" placeholder={"UBS de referência"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.ubsRef} name="ubsRef" required autoComplete="false"  maxLength="200"
                    />
                  </Form.Group>

                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.unidadeEscolar ">
                    <Form.Label>Unidade Escolar</Form.Label>
                    <Form.Control type="text" placeholder={"UBS de referência"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.unidadeEscolar} name="unidadeEscolar" required autoComplete="false"  maxLength="200"
                    />
                  </Form.Group>
                </Row>

                <Card className="mb-3">
                <Card.Header>Dados do Transportador</Card.Header>
                <Row className="mb-3">
                  <Col>
                  <Form.Group className="ps-2" controlId="alunoForm.transportador">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" placeholder={"Nome do transportador"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.transportador} name="transportador" required autoComplete="false" maxLength="100"
                    />
                  </Form.Group></Col>
                  <Col>
                  <Form.Group controlId="alunoForm.transportadorDDD">
                    <Form.Label>DDD</Form.Label>
                    <Form.Control type="text" placeholder={"DDD"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.telDDDTransportador} name="telDDDTransportador" autoComplete="false" maxLength="3"
                    />
                  </Form.Group></Col>
                  
                  <Col>
                  <Form.Group className="pe-2" controlId="alunoForm.transportadorTelNro">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChangeNumerico} value={this.state.telNroTransportador} name="telNroTransportador" autoComplete="false" maxLength="9"
                    />
                  </Form.Group></Col>
                </Row>
                </Card>

                </Form.Group>
              
              </Form>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Button onClick={this.novoAluno} disabled={this.state.isEdicao}>Novo</Button>
              <Button variant="success" className="btnSalvarAluno" onClick={this.salvarAluno} disabled={!this.state.isEdicao}>Salvar</Button>
              <Button variant="secondary" className="btnCancelar" onClick={() => {window.location = './cadastro-alunos'}} disabled={!this.state.isEdicao}>Cancelar</Button>
              <Button variant="danger" className="btnDeletarAluno" onClick={this.deletarAluno} disabled={this.state.idAluno == 0}>Deletar</Button>            
            </Col>
          </Row>


          <Col style={{marginTop : "60px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <InputGroup >
            <FormControl 
              placeholder="Buscar pela opção abaixo"
              aria-label="Buscar pela opção abaixo"
              aria-describedby="Buscar"
              name = "textoBusca"
              value = {this.textoBusca}
              onChange={this.handleChange} 
            />

            <Button id="btnBuscar"
             onClick={this.buscarAluno}
            >
              Buscar
            </Button>
          </InputGroup>
          </Col>

          <Col style={{marginTop : "10px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <ButtonGroup>
            {this.radiosBusca.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant={this.state.paramBusca === radio.value ? 'outline-primary' : 'outline-secondary'}
                name="paramBusca"
                value={radio.value}
                checked={this.state.paramBusca === radio.value}
                onChange={this.handleChange}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
          </Col>

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Alunos Cadastrados </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Nome da mãe</th>
                      <th>Número de Matricula</th>
                      <th>Número do NIS</th>
                      <th>Faltas</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.alunos.map((aluno) => {
                    return (
                        
                        <tr key={aluno.idAluno}>
                        <td>{aluno.idAluno}</td>
                        <td>{aluno.nome}</td>
                        <td>{aluno.nomeMae}</td>
                        <td>{aluno.nroMatricula}</td>
                        <td>{aluno.NIS}</td>
                        <td style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button onClick={() => {this.exibirAluno(aluno.idAluno)}}>Selecionar Aluno</Button>
                        </td>
                        </tr>
                    )
                    })
                }
                </tbody>
              </Table>
            </Col>
          </Row>

          <Paginacao there={this} />

            <Modal show={this.state.sucessoModal.show} onHide={this.closeSucessoModal}>
              <Modal.Header closeButton>
                <Modal.Title>Sucesso</Modal.Title>
              </Modal.Header>
              <Modal.Body>{this.state.sucessoModal.mensagem}</Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={this.closeSucessoModal}>
                  Ok
                  </Button>
              </Modal.Footer>
              </Modal>
            
            <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>
            <ConfirmacaoModal closeConfirmacaoModal={this.closeConfirmacaoModal} handleSimConfirmacaoModal={this.handleSimConfirmacaoModal} confirmacaoModal={this.state.confirmacaoModal}></ConfirmacaoModal>
          </Container>
      </div>
    )
  }

  componentDidMount() {
    const parsed = queryString.parse(window.location.search);

      
    this.obterLista();
    if (parsed.idAluno !== null && typeof parsed.idAluno != "undefined") {
      this.exibirAluno(parsed.idAluno);
    }
    
  }


}