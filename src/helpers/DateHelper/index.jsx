export default class DateHelper {

  static dateParaFormatoPtBr = (data) => {
    return ((data.getDate() )) + "/" + ('0' + (data.getMonth() + 1)).slice(-2) + "/" + data.getFullYear();
  }

}