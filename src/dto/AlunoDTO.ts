export default interface AlunoDTO {

    id_aluno?: number,
    ra?: string,

    nome: string,
    sobrenome: string,
    data_nascimento: Date,
    endereco: string,

    email: string,

    celular?: string,


    senha?: string,

    status_aluno?: boolean
}