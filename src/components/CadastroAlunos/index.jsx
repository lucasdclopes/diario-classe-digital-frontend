import { Component } from "react";
import { Container, Table, Form, Row, Col } from 'react-bootstrap';
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
      nomePai : null,
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
      ra : null,
      alunos : [],      
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

    this.obterLista = () => {
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
          nomeMae : data.nomeMae,
          nomePai : data.nomePai,
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
          ra : data.ra,

          isEdicao: true
        }));
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

     this.handleChange = (e) => {
      const name = e.target.name;
      const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
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
                          <Form.Select aria-label="Floating label" onChange={this.handleChange}>
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

                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.nomeMae">
                    <Form.Label>Nome da mãe</Form.Label>
                    <Form.Control type="text" placeholder={"Nome completo da mãe do aluno"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nomeMae} name="nomeMae" required autoComplete="false"
                    />
                  </Form.Group>

                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.nomePai">
                   <Form.Label>Nome do pai</Form.Label>
                    <Form.Control type="text" placeholder={"Nome completo do pai do aluno"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.nomePai} name="nomePai" required autoComplete="false"
                    />        
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.rg">
                    <Form.Label>RG</Form.Label>
                    <Form.Control type="number" placeholder={"Digite o RG sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.rg} name="rg" required autoComplete="false"
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.cpf">
                    <Form.Label>CPF</Form.Label>
                    <Form.Control type="number" placeholder={"Digite o CPF sem pontuação. Somente números"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.cpf} name="cpf" required autoComplete="false"
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} className="inputNovoAluno" controlId="alunoForm.ra">
                    <Form.Label>RA</Form.Label>
                    <Form.Control type="text" placeholder={"RA"} disabled={!this.state.isEdicao}  
                    onChange={this.handleChange} value={this.state.ra} name="ra" required autoComplete="false"
                    />
                  </Form.Group>
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
                  onChange={this.handleChange} value={this.state.endCidade} name="eendCidadend" required autoComplete="false"
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
                        <Form.Select aria-label="Floating label" onChange={this.handleChange}>
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

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Button onClick={this.novoAluno} disabled={this.state.isEdicao}>Nova</Button>
              <Button variant="success" className="btnSalvarAluno" onClick={this.salvarAluno} disabled={!this.state.isEdicao}>Salvar</Button>
              <Button variant="secondary" className="btnCancelar" onClick={() => {window.location = './cadastro-alunos'}} disabled={!this.state.isEdicao}>Cancelar</Button>
              <Button variant="danger" className="btnDeletarAluno" onClick={this.deletarAluno} disabled={this.state.idAluno == 0}>Deletar</Button>
              
            </Col>
          </Row>

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Alunos Cadastrados </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Número de Matricula</th>
                      <th>Número do RA</th>
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
                        <td>{aluno.ra}</td>
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

              <Modal show={this.state.faltasAlunoModal.show} onHide={this.fecharFaltasAlunoModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Total de faltas</Modal.Title>
                </Modal.Header>
                {this.state.faltasAlunoModal.detalhesAluno &&
                <Modal.Body>
                    <h5>Data da consulta: {DateHelper.dateParaFormatoPtBr(new Date())}</h5>
                    <br/>
                    <h5>Informações do aluno:</h5>
                    <br/>
                    <p><strong>Total de faltas</strong>: {this.state.faltasAlunoModal.detalhesAluno.totalFaltas}</p>
                    <p><strong>Nome</strong>: {this.state.faltasAlunoModal.detalhesAluno.nome} </p>
                    <p><strong>CPF</strong>: {this.state.faltasAlunoModal.detalhesAluno.cpf} </p>
                    <p><strong>Data de Nascimento</strong>: {this.state.faltasAlunoModal.detalhesAluno.dtNascimento}</p>
                    <p><strong>Sexo</strong>: {this.state.faltasAlunoModal.detalhesAluno.sexo}</p>
                    <p><strong>Número de Matricula</strong>: {this.state.faltasAlunoModal.detalhesAluno.nroMatricula}</p>
                    <p><strong>Número de RA</strong>: {this.state.faltasAlunoModal.detalhesAluno.ra}</p>
                    <p><strong>Email</strong>: {this.state.faltasAlunoModal.detalhesAluno.emailContato}</p>
                </Modal.Body>
                }
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.fecharFaltasAlunoModal}>
                  Fechar
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