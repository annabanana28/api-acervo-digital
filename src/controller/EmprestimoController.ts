// Importa a classe Emprestimo do model — é daqui que vêm os métodos de acesso ao banco de dados
import Emprestimo from "../model/Emprestimo.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo EmprestimoDTO para tipar os dados recebidos do front-end
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";

// Define a classe EmprestimoController que HERDA da classe Emprestimo
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class EmprestimoController extends Emprestimo {

    /**
    * Método para listar todos os empréstimos.
    * Retorna um array de empréstimos com informações dos alunos e dos livros.
    */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Chama o método do model para buscar todos os empréstimos ativos no banco
            // O resultado já vem com os dados de aluno e livro embutidos (graças ao JOIN da query)
            const listaDeEmprestimos = await Emprestimo.listarEmprestimos();

            // ✅ MELHORIA: verificação explícita se a lista está vazia
            // Se não houver empréstimos, retorna 404 (Not Found) com mensagem clara
            // Sem isso, o front-end receberia um array vazio com status 200, sem saber se é erro ou não
            if (listaDeEmprestimos.length === 0) {
                return res.status(404).json({ mensagem: "Nenhum empréstimo encontrado." });
            }

            // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
            return res.status(200).json(listaDeEmprestimos);
        } catch (error) {
            // ✅ MELHORIA: prefixo [EmprestimoController] para facilitar rastreamento nos logs
            console.error(`[EmprestimoController] Erro ao listar empréstimos: ${error}`);
            // Retorna mensagem de erro com status HTTP 500 (Internal Server Error)
            return res.status(500).json({ mensagem: "Erro ao listar os empréstimos." });
        }
    }

    /**
     * Retorna informações de um empréstimo
     */
    static async emprestimo(req: Request, res: Response) {
        try {
            const idEmprestimo: number = parseInt(req.params.id as string);
            const emprestimo = await Emprestimo.listarEmprestimo(idEmprestimo);
            res.status(200).json(emprestimo);
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);
            res.status(500).json("Erro ao recuperar as informações do aluno.");
        }
    }

    /**
     * Cadastra um novo empréstimo.
     */
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: EmprestimoDTO = req.body;
            const emprestimo = new Emprestimo(
                dadosRecebidos.aluno.id_aluno,
                dadosRecebidos.livro.id_livro,
                new Date(dadosRecebidos.data_emprestimo),
                dadosRecebidos.status_emprestimo ?? "",
                dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : undefined
            );
            const result = await Emprestimo.cadastrarEmprestimo(emprestimo);
            if (result) {
                return res.status(201).json({ mensagem: 'Empréstimo cadastrado com sucesso.' });
            } else {
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
            }
        } catch (error) {
            console.error('Erro ao cadastrar empréstimo:', error);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o empréstimo.' });
        }
    }

    /**
     * Atualiza um empréstimo existente.
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: EmprestimoDTO = req.body;
            const idEmprestimo = parseInt(req.params.id as string);
            const result = await Emprestimo.atualizarEmprestimo(
                idEmprestimo,
                dadosRecebidos.aluno.id_aluno,
                dadosRecebidos.livro.id_livro,
                new Date(dadosRecebidos.data_emprestimo),
                dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : new Date(),
                dadosRecebidos.status_emprestimo ?? ""
            );
            if (result) {
                return res.status(200).json({ mensagem: 'Empréstimo atualizado com sucesso.' });
            } else {
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar empréstimo:', error);
            return res.status(500).json({ mensagem: 'Erro ao atualizar o empréstimo.' });
        }
    }

    /**
    * Método para remover um empréstimo do banco de dados
    */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idEmprestimo = parseInt(req.params.id as string);
            const resultado = await Emprestimo.removerEmprestimo(idEmprestimo);
            if (resultado) {
                return res.status(200).json({ mensagem: 'Empréstimo removido com sucesso!' });
            } else {
                return res.status(500).json({ mensagem: 'Erro ao remover empréstimo!' });
            }
        } catch (error) {
            console.log(`Erro ao remover o Empréstimo ${error}`);
            return res.status(500).json({ mensagem: "Erro ao remover empréstimo." });
        }
    }
}

export default EmprestimoController;