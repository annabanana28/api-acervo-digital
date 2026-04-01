import Aluno from "../model/Aluno.js";
import { type Request, type Response } from "express";
import type AlunoDTO from "../dto/AlunoDTO.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// função simples para validar domínio do email
function validarEmail(email: string): boolean {
    return email.endsWith("@adigital.com.br");
}

class AlunoController extends Aluno {

    static async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });
            }

            if (!validarEmail(email)) {
                return res.status(400).json({
                    mensagem: "O email deve ser @adigital.com.br"
                });
            }

            const aluno = await Aluno.buscarPorEmail(email);

            if (!aluno) {
                return res.status(401).json({ mensagem: "Usuário não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senha, aluno.senha);

            if (!senhaValida) {
                return res.status(401).json({ mensagem: "Senha inválida." });
            }

            const token = jwt.sign(
                { id: aluno.id, email: aluno.email },
                "SEGREDO_SUPER_SECRETO",
                { expiresIn: "1h" }
            );

            return res.status(200).json({ token });

        } catch (error) {
            console.error(`[AlunoController] Erro no login: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao realizar login." });
        }
    }

   
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaDeAlunos = await Aluno.listarAlunos();

            if (listaDeAlunos.length === 0) {
                return res.status(404).json({ mensagem: "Nenhum aluno encontrado." });
            }

            return res.status(200).json(listaDeAlunos);
        } catch (error) {
            console.error(`[AlunoController] Erro ao listar alunos: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao recuperar a lista de alunos." });
        }
    }

   
    static async aluno(req: Request, res: Response): Promise<Response> {
        try {
            const idAluno = parseInt(req.params.id as string);

            if (isNaN(idAluno)) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            }

            const aluno = await Aluno.listarAluno(idAluno);

            if (!aluno) {
                return res.status(404).json({ mensagem: "Aluno não encontrado." });
            }

            return res.status(200).json(aluno);
        } catch (error) {
            console.error(`[AlunoController] Erro ao buscar aluno: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações do aluno." });
        }
    }

    
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: AlunoDTO = req.body;

            if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome) {
                return res.status(400).json({ mensagem: "Nome e sobrenome são obrigatórios." });
            }

            if (!dadosRecebidos.email || !dadosRecebidos.senha) {
                return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });
            }

            if (!validarEmail(dadosRecebidos.email)) {
                return res.status(400).json({
                    mensagem: "Email deve ser @adigital.com.br"
                });
            }

            // 🔐 hash da senha
            const senhaHash = await bcrypt.hash(dadosRecebidos.senha, 10);

            const novoAluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email,
                dadosRecebidos.celular
            );

            
            novoAluno.setSenha(senhaHash);

            const result = await Aluno.cadastrarAluno(novoAluno);

            if (result) {
                return res.status(201).json({ mensagem: "Aluno cadastrado com sucesso." });
            } else {
                return res.status(500).json({ mensagem: "Erro ao cadastrar aluno." });
            }

        } catch (error) {
            console.error(`[AlunoController] Erro ao cadastrar aluno: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao cadastrar o aluno." });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idAluno = parseInt(req.params.id as string);

            if (isNaN(idAluno)) {
                return res.status(400).json({ mensagem: "ID inválido." });
            }

            const result = await Aluno.removerAluno(idAluno);

            if (result) {
                return res.status(200).json({ mensagem: "Aluno removido com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Aluno não encontrado." });
            }
        } catch (error) {
            console.error(`[AlunoController] Erro ao remover aluno: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao remover aluno." });
        }
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idAluno = parseInt(req.params.id as string);

            if (isNaN(idAluno)) {
                return res.status(400).json({ mensagem: "ID inválido." });
            }

            const dadosRecebidos: AlunoDTO = req.body;

            if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome) {
                return res.status(400).json({ mensagem: "Nome e sobrenome são obrigatórios." });
            }

            const aluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email ?? '',
                dadosRecebidos.celular
            );

            aluno.setIdAluno(idAluno);

            const result = await Aluno.atualizarAluno(aluno);

            if (result) {
                return res.status(200).json({ mensagem: "Atualizado com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Aluno não encontrado." });
            }
        } catch (error) {
            console.error(`[AlunoController] Erro ao atualizar aluno: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao atualizar aluno." });
        }
    }
}

export default AlunoController;