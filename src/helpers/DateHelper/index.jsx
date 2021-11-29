export default class DateHelper {

  static dateParaFormatoPtBr = (data) => {
    return ((data.getDate() )) + "/" + ((data.getMonth() + 1)) + "/" + data.getFullYear();
  }

}