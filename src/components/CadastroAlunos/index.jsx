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
      nome : null,
      cpf : null,
      rg : null,
      dtNascimento : null,
      sexo : null,
      nomeMae : null,
      cpfMae : null,
      telDDDMae : null,
      telNroMae : null,
      nomePai : null,
      cpfPai : null,
      telDDDPai : null,
      telNroPai : null,
      emailContato : null,
      celDDD : null,
      celNro : null, 
      telDDD : null,
      telNro : null,
      endLogradouro : null,
      endNumero : null,
      endComplemento : null,
      endCEP : null,
      endBairro : null,
      endCidade : null,
      endUF : null,
      nroMatricula : null,
      dtMatricula : null,
      nis : null,
      transportador : null,
      unidadeEscolar : null,
      UBSRef : null,
      alunos : [],    
      textoBusca : null, 
      paramBusca : null, 
      filtros : {
        cpf : null,
        nome : null,
        nomePai : null,
        nomeMae : null,
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
          
          nomeMae : data.mae.nome,
          cpfMae : data.mae.cpf,
          telDDDMae : data.mae.telContato.telDDD,
          telNroMae : data.mae.telContato.telNro,

          nomePai : data.pai.nome,
          cpfPai : data.pai.cpf,
          telDDDPai : data.pai.telContato.telDDD,
          telNroPai : data.pai.telContato.telNro,

          emailContato : data.emailContato,
          celDDD : data.telCelular.celDDD,
          celNro : data.telCelular.celNro,
          telDDD : data.telFixo.telDDD,
          telNro : data.telFixo.telNro,
          endLogradouro : data.endResidencial.endLogradouro,
          endNumero : data.endResidencial.endNumero,
          endComplemento : data.endResidencial.endComplemento,
          endCEP : data.endResidencial.endCEP,
          endBairro : data.endResidencial.endBairro,
          endCidade : data.endResidencial.endCidade,
          endUF : data.endResidencial.endUF,
          nroMatricula : data.nroMatricula,
          dtMatricula : data.dtMatricula,
          nis : data.nis,
          transportador : data.transportador,
          unidadeEscolar : data.unidadeEscolar,
          UBSRef : data.UBSRef,

          isEdicao: true
        }));
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

    this.salvarAluno = (e) => {

      HttpService.salvarAluno({
        ra : this.state.ra,
        nroMatricula : this.state.nroMatricula,
        dtMatricula : this.state.dtMatricula,
        nome : this.state.nome,
        cpf : this.state.cpf,
        rg : this.state.rg,
        dtNascimento : this.state.dtNascimento,
        sexo : this.state.sexo,
        nomeMae : this.state.nomeMae,
        nomePai : this.state.nomePai,
        emailContato : this.state.emailContato,
        telCelular : { 
          telDDD : this.state.telDDD,telNro : this.state.telNro
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
        }
      },
      this.state.idAluno)
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
      const name = e.target.name;
      const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));

      console.log(this.state.paramBusca);
      console.log(e.target.type);
      console.log(e.target.value);
      console.log('e.target.name ' + e.target.name);
    }

    this.radiosBusca = [
      { name: 'Nome', value: '1' },
      { name: 'CPF', value: '2' },
      { name: 'Nome da Mãe', value: '3' },
      { name: 'Nome do Pai', value: '4' },
    ];

  
    this.limparFiltros = (e) => {
      console.log('limpando');
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          cpf : null,
          nome : null,
          nomePai : null,
          nomeMae : null  
          }
        }
      ));
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
                    onChange={this.handleChange} value={this.state.nome} name="nome" required autoComplete="false"
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
                          <Form.Select aria-label="Floating label" onChange={this.handleChange} value={this.state.sexo}>
                            <option value="">Nenhum</option>
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
                    <Form.Control type="text" placeholder={"Data de nascimento"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.dtNascimento} name="dtNascimento" required autoComplete="false"
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
                      onChange={this.handleChange} value={this.state.nomeMae} name="nomeMae" required autoComplete="false"
                      />
                    </Form.Group>
                    </Col>

                    <Col xs={3}>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.cpfMae} name="cpfMae" required autoComplete="false"
                      />
                    </Col>


                    <Col xs={1}>
                      <Form.Label>DDD</Form.Label>
                      <Form.Control type="number" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.telDDDMae} name="telDDDMae" required autoComplete="false"
                      />
                    </Col>

                    <Col xs={3}>
                    <Form.Group className="pe-2" controlId="alunoForm.telNroMae">
                      <Form.Label>Número de contato</Form.Label>
                      <Form.Control type="number" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.telNroMae} name="telNroMae" required autoComplete="false"
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
                      onChange={this.handleChange} value={this.state.nomePai} name="nomePai" required autoComplete="false"
                      />   
                    </Form.Group>       
                    </Col>

                    <Col xs={3}>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control type="text" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.cpfPai} name="cpfPai" required autoComplete="false"
                      />
                    </Col>
                    <Col xs={1}>
                      <Form.Label>DDD</Form.Label>
                      <Form.Control type="number" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.telDDDPai} name="telDDDPai" required autoComplete="false"
                      />
                    </Col>
                    <Col xs={3}>
                    <Form.Group className="pe-2" controlId="alunoForm.telNroPai">
                      <Form.Label>Número de contato</Form.Label>
                      <Form.Control type="number" placeholder={"Apenas números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.telNroPai} name="telNroPai" required autoComplete="false"
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
                    <Form.Control type="number" placeholder={"Digite o RG sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.rg} name="rg" required autoComplete="false"
                    />
                  </Form.Group></Col>
                  <Col>
                  <Form.Group controlId="alunoForm.cpf">
                    <Form.Label>CPF</Form.Label>
                    <Form.Control type="number" placeholder={"Digite o CPF sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.cpf} name="cpf" required autoComplete="false"
                    />
                  </Form.Group></Col>
                  
                  <Col>
                  <Form.Group className="pe-2" controlId="alunoForm.nis">
                    <Form.Label>NIS</Form.Label>
                    <Form.Control type="text" placeholder={"NIS. Sem pontaução"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nis} name="nis" required autoComplete="false"
                    />
                  </Form.Group></Col>
                </Row>
                </Card>

                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.nroMatricula">
                    <Form.Label>Número de Matricula</Form.Label>
                    <Form.Control type="text" placeholder={"Identificação da matricula"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nroMatricula} name="nroMatricula" required autoComplete="false"
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.dtMatricula">
                    <Form.Label>Data da Matricula</Form.Label>
                    <Form.Control type="text" placeholder={"Data da matricula"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.dtMatricula} name="dtMatricula" required autoComplete="false"
                    />                  
                  </Form.Group>
                </Row>

                <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.telefones">

                  <Row>
                    <Col>
                      <Form.Label>DDD Celular</Form.Label>
                      <Form.Control type="number" placeholder={"011"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.celDDD} name="celDDD" required autoComplete="false"
                      />
                    </Col>

                    <Col xs={8}>
                      <Form.Label>Número do celular</Form.Label>
                      <Form.Control type="number" placeholder={"999999999. Somente números"} disabled={!this.state.isEdicao}  
                      onChange={this.handleChange} value={this.state.celNro} name="celNro" required autoComplete="false"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col>                
                    <Form.Label>DDD Telefone fixo</Form.Label>
                    <Form.Control type="number" placeholder={"011"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.telDDD} name="telDDD" required autoComplete="false"
                    />
                    </Col>

                    <Col xs={8}>                 
                    <Form.Label>Telefone fixo</Form.Label>
                    <Form.Control type="number" placeholder={"99999999. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.telNro} name="telNro" required autoComplete="false"
                    />
                    </Col>  
                  </Row>
                                

                </Form.Group>

                <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.Enderecos">
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control type="text" placeholder={"Rua tal tal tal"} disabled={!this.state.isEdicao}  
                  onChange={this.handleChange} value={this.state.endLogradouro} name="endLogradouro" required autoComplete="false"
                  />

                  <Row>
                    <Col>                      
                    <Form.Label>Número</Form.Label>
                    <Form.Control type="text" placeholder={"99999"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endNumero} name="endNumero" required autoComplete="false"
                    />
                    </Col>                      
                    <Col>  
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control type="text" placeholder={"Casa 1 / ap10 / cj10"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endComplemento} name="endComplemento" required autoComplete="false"
                    />
                    </Col>                      
                    <Col>  
                    <Form.Label>CEP</Form.Label>
                    <Form.Control type="text" placeholder={"11111111. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endCEP} name="endCEP" required autoComplete="false"
                    />
                    </Col>                      
                  </Row>

                  <Row>
                    <Col>                      
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control type="text" placeholder={"Insira o Bairro"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endBairro} name="endBairro" required autoComplete="false"
                    />
                    </Col>                    
                    <Col>  
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control type="text" placeholder={"São Paulo"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.endCidade} name="endCidade" required autoComplete="false"
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
                        <FloatingLabel className="inputNovoAluno" controlId="floatingSelectGrid" label="UF">
                          <Form.Select aria-label="Floating label" onChange={this.handleChange}  value={this.state.endUF}>
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

          <Col style={{marginTop : "60px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
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
                        <td>{aluno.nroMatricula}</td>
                        <td>{aluno.nis}</td>
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