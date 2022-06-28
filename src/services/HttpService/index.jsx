import axios from 'axios';
import UsuarioLogadoDto from '../../dto/UsuarioLogadoDto';


const host = window.location.protocol + "//" + window.location.host;
const urlBase = 'http://localhost:8080/api'; //<- testes local
//const urlBase = host + '/api'; //<- build acesso na rede
const defaultHeaders = {
  headers : {
    "Content-Type": "application/json",
    "Accept-Language" : "pt-br",
    "token" : UsuarioLogadoDto.getTokenAcesso() ? UsuarioLogadoDto.getTokenAcesso() : ""
  }
}
const defaultConfig = {
  headers : defaultHeaders.headers 
}


export default class HttpService{

  static queryPaginacao = (paginacao) => {
    return (!paginacao.size || !paginacao.page) ? '' : 'size=' + paginacao.size + '&page=' + (paginacao.page - 1); 
  } 

  static gerarParams = (arrParams) => {
    return (arrParams.length > 0) ? '?'+arrParams.join('&'):'';
  }

  static exibirAula = async (idAula) => {
    let url = urlBase + '/aulas/'+idAula;

    let response = await axios.get(url,defaultConfig);
    return response;

  }

  static listarAulas = async (filtros) => {
    let url = urlBase + '/aulas';
    let queryParams = [];

    if (filtros.idProfessor) {
      queryParams.push('idProfessor=' + filtros.idProfessor);
    }
    if (filtros.paginacaoRequest) {
      queryParams.push(HttpService.queryPaginacao(filtros.paginacaoRequest));
    }

    if (filtros.statusAula) {
      queryParams.push('statusAula=' + filtros.statusAula);
    }

    url += HttpService.gerarParams(queryParams);

    //console.log("url -> ",url);

    let response = await axios.get(url,defaultConfig);
    return response;
  }
  
  static listarCalendarioAulas = async (filtros) => {
    let url = urlBase + '/calendario-aulas';
    let queryParams = [];

    if (filtros.diaSemana){
      const d = new Date();
      const weekday = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
      let day = weekday[d.getDay()];
      queryParams.push('diaSemana=' + day);
    }

    if (filtros.idProfessor) {
      queryParams.push('idProfessor=' + filtros.idProfessor);
    }

    if (filtros.idTurma) {
      queryParams.push('idTurma=' + filtros.idTurma);
    }

    if (filtros.paginacaoRequest) {
      queryParams.push(HttpService.queryPaginacao(filtros.paginacaoRequest));
    }

    url += HttpService.gerarParams(queryParams);

    let response = await axios.get(url,defaultConfig);
    return response;
  }
  static iniciarAula =  (postData) => {
    let url = urlBase + '/aulas';
    let config = defaultConfig;
    
    return axios.post(url,postData,config);
  }

  static salvarChamadaAtual = (idAula, listaChamada) => {

    let json = [];

    listaChamada.forEach((dadosAluno) => {
      json.push({
        idAluno : dadosAluno.aluno.idCadastro,
        isPresente : dadosAluno.presente === null ? true : dadosAluno.presente
      });
    })

    let url = urlBase + '/aulas/'+idAula+"/presencas";
    let config = defaultConfig;
    
    return axios.put(url,json,config);
  }

  static finalizarAula = (idAula) => {
    let url = urlBase + '/aulas/'+idAula+"/finalizar";
    let config = defaultConfig;
    return axios.put(url,{},config);
  }

  static logar = (postData) => {
    return axios.post(urlBase + '/logar', postData,defaultHeaders);
  }

  static listarTurmas = async (filtros) => {
    let url = urlBase + '/turmas';
    let queryParams = [];

    if (filtros.descTurma) {
      queryParams.push('descTurma=' + filtros.descTurma);
    }
    if (filtros.tpPeriodo) {
      queryParams.push('tpPeriodo=' + filtros.tpPeriodo);
    }
    if (filtros.tpNivelEnsino) {
      queryParams.push('tpNivelEnsino=' + filtros.tpNivelEnsino);
    }
    if (filtros.paginacaoRequest) {
      queryParams.push(HttpService.queryPaginacao(filtros.paginacaoRequest));
    }

    url += HttpService.gerarParams(queryParams);

    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static exibirTurma = async (idTurma) => {
    let url = urlBase + '/turmas/' +idTurma;
    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static deletarTurma = async (idTurma) => {
    console.log("vou deletar a turma "+idTurma);
    let url = urlBase + '/turmas/' +idTurma;
    let response = await axios.delete(url,defaultConfig);
    return response;
  }

  static salvarTurma =  (postData) => {
    let url = urlBase + '/turmas';
    let config = defaultConfig;
    return axios.post(url,postData,config);
  }

  static exibirAluno = async (idAluno) => {
    let url = urlBase + '/alunos/' +idAluno;
    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static calcularFaltasAluno = async (idAluno) => {
    let url = urlBase + '/alunos/' +idAluno + '/calculo-faltas';
    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static listarAlunos = async (filtros) => {
    let url = urlBase + '/alunos';
    let queryParams = [];

    if (filtros.descTurma) {
      queryParams.push('cpf=' + filtros.cpf);
    }
    if (filtros.tpPeriodo) {
      queryParams.push('nome=' + filtros.tpPeriodo);
    }
    if (filtros.paginacaoRequest) {
      queryParams.push(HttpService.queryPaginacao(filtros.paginacaoRequest));
    }

    url += HttpService.gerarParams(queryParams);

    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static exibirAluno = async (idAluno) => {
    let url = urlBase + '/alunos/' +idAluno;
    let response = await axios.get(url,defaultConfig);
    return response;
  }
}