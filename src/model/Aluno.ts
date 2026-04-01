import type AlunoDTO from "../dto/AlunoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Aluno {

    private id_aluno: number = 0;
    private ra: string = "";
    private nome: string;
    private sobrenome: string;
    private data_nascimento: Date;
    private endereco: string;
    private email: string;
    private celular: string;
    private senha: string; // 🔐 NOVO
    private status_aluno: boolean = true;

    constructor(
        _nome: string,
        _sobrenome: string,
        _data_nascimento: Date,
        _endereco: string,
        _email: string,
        _celular?: string,
        _senha?: string // 🔐 NOVO
    ) {
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        this.celular = _celular ?? "";
        this.senha = _senha ?? ""; // 🔐 NOVO
    }

    // ==================== GETTERS E SETTERS ====================

    public getIdAluno(): number {
        return this.id_aluno;
    }

    public setIdAluno(id_aluno: number): void {
        this.id_aluno = id_aluno;
    }

    public getRa(): string {
        return this.ra;
    }

    public setRa(ra: string): void {
        this.ra = ra;
    }

    public getNome(): string {
        return this.nome;
    }

    public setNome(nome: string): void {
        this.nome = nome;
    }

    public getSobrenome(): string {
        return this.sobrenome;
    }

    public setSobrenome(sobrenome: string): void {
        this.sobrenome = sobrenome;
    }

    public getDataNascimento(): Date {
        return this.data_nascimento;
    }

    public setDataNascimento(data_nascimento: Date): void {
        this.data_nascimento = data_nascimento;
    }

    public getEndereco(): string {
        return this.endereco;
    }

    public setEndereco(endereco: string): void {
        this.endereco = endereco;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getCelular(): string {
        return this.celular;
    }

    public setCelular(celular: string): void {
        this.celular = celular;
    }

    // 🔐 SENHA
    public getSenha(): string {
        return this.senha;
    }

    public setSenha(senha: string): void {
        this.senha = senha;
    }

    public getStatusAluno(): boolean {
        return this.status_aluno;
    }

    public setStatusAluno(status_aluno: boolean): void {
        this.status_aluno = status_aluno;
    }

    // ==================== MÉTODOS ====================

    static async listarAlunos(): Promise<AlunoDTO[]> {
        try {
            const query = `
                SELECT id_aluno, ra, nome, sobrenome, data_nascimento,
                       endereco, email, celular, status_aluno
                FROM aluno
                WHERE status_aluno = TRUE;
            `;

            const result = await database.query(query);

            return result.rows.map((a: any) => ({
                id_aluno: a.id_aluno,
                ra: a.ra,
                nome: a.nome,
                sobrenome: a.sobrenome,
                data_nascimento: a.data_nascimento,
                endereco: a.endereco,
                email: a.email,
                celular: a.celular,
                status_aluno: a.status_aluno
            }));

        } catch (error) {
            console.error(`[AlunoModel] Erro ao listar alunos: ${error}`);
            throw error;
        }
    }

    static async listarAluno(id_aluno: number): Promise<AlunoDTO | null> {
        try {
            const query = `SELECT * FROM aluno WHERE id_aluno = $1`;
            const result = await database.query(query, [id_aluno]);

            if (result.rows.length === 0) return null;

            return result.rows[0];
        } catch (error) {
            console.error(`Erro ao buscar aluno: ${error}`);
            return null;
        }
    }

    // 🔐 BUSCAR POR EMAIL (LOGIN)
    static async buscarPorEmail(email: string): Promise<any | null> {
        try {
            const query = `
                SELECT * FROM aluno
                WHERE email = $1 AND status_aluno = TRUE;
            `;

            const result = await database.query(query, [email.toLowerCase()]);

            if (result.rows.length === 0) return null;

            return result.rows[0]; // inclui senha

        } catch (error) {
            console.error(`[AlunoModel] Erro ao buscar por email: ${error}`);
            return null;
        }
    }

    // 🔐 CADASTRAR COM SENHA
    static async cadastrarAluno(aluno: Aluno): Promise<boolean> {
        try {
            const query = `
                INSERT INTO aluno 
                (nome, sobrenome, data_nascimento, endereco, email, celular, senha)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id_aluno;
            `;

            const result = await database.query(query, [
                aluno.getNome().toUpperCase(),
                aluno.getSobrenome().toUpperCase(),
                aluno.getDataNascimento(),
                aluno.getEndereco().toUpperCase(),
                aluno.getEmail().toLowerCase(),
                aluno.getCelular(),
                aluno.getSenha() // 🔐
            ]);

            return (result.rowCount ?? 0) > 0;

        } catch (error) {
            console.error(`Erro ao cadastrar aluno: ${error}`);
            return false;
        }
    }

    static async removerAluno(id_aluno: number): Promise<boolean> {
        try {
            const query = `
                UPDATE aluno
                SET status_aluno = FALSE
                WHERE id_aluno = $1;
            `;

            const result = await database.query(query, [id_aluno]);
            return (result.rowCount ?? 0) > 0;

        } catch (error) {
            console.error(`[AlunoModel] Erro ao remover aluno: ${error}`);
            return false;
        }
    }

    static async atualizarAluno(aluno: Aluno): Promise<boolean> {
        try {
            const query = `
                UPDATE aluno SET
                    nome = $1,
                    sobrenome = $2,
                    data_nascimento = $3,
                    endereco = $4,
                    celular = $5,
                    email = $6
                WHERE id_aluno = $7;
            `;

            const result = await database.query(query, [
                aluno.getNome().toUpperCase(),
                aluno.getSobrenome().toUpperCase(),
                aluno.getDataNascimento(),
                aluno.getEndereco().toUpperCase(),
                aluno.getCelular(),
                aluno.getEmail().toLowerCase(),
                aluno.getIdAluno()
            ]);

            return (result.rowCount ?? 0) > 0;

        } catch (error) {
            console.error(`[AlunoModel] Erro ao atualizar aluno: ${error}`);
            return false;
        }
    }
}

export default Aluno;