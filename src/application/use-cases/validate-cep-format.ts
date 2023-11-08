import { Injectable } from "@nestjs/common";

interface ValidateCepFormatParams {
  cep: string
}

type ValidateCepFormatResponse = boolean

@Injectable()
export class ValidateCepFormat {
  constructor() { }

  async execute(params: ValidateCepFormatParams): Promise<ValidateCepFormatResponse> {
    const { cep } = params

    let regex1 = /^[\d]{2}\.[\d]{3}\.[\d]{3}$/;
    let regex2 = /^[\d]{2}\.[\d]{3}-[\d]{3}$/;
    let regex3 = /^[\d]{5}\.[\d]{3}$/;
    let regex4 = /^[\d]{5}\-[\d]{3}$/;
    let regex5 = /^[\d]{8}$/;

    if (regex1.test(cep) || regex2.test(cep) || regex3.test(cep) || regex4.test(cep) || regex5.test(cep)) {
      return true;
    } else {
      return false;
    }
  }
}