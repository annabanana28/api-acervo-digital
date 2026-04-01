import { Router, type Request, type Response } from "express";
import AlunoController from "./controller/AlunoController.js";
import LivroController from "./controller/LivroController.js";
import EmprestimoController from "./controller/EmprestimoController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

const router = Router();

/**
 * Endpoint padrão
 */
router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        mensagem: `Aplicação online. Timestamp: ${new Date()}`
    });
});


// ==================== 🔐 AUTH ====================

// LOGIN
router.post("/api/login", AlunoController.login);


// ==================== 👨‍🎓 ALUNOS ====================

// 🔓 cadastro (NÃO protegido)
router.post("/api/alunos", AlunoController.cadastrar);

// 🔒 protegidas
router.get("/api/alunos", authMiddleware, AlunoController.todos);
router.get("/api/alunos/:id", authMiddleware, AlunoController.aluno);
router.delete("/api/alunos/:id", authMiddleware, AlunoController.remover);
router.put("/api/alunos/:id", authMiddleware, AlunoController.atualizar);


// ==================== 📚 LIVROS ====================

router.get("/api/livros", authMiddleware, LivroController.todos);
router.get("/api/livros/:id", authMiddleware, LivroController.livro);
router.post("/api/livros", authMiddleware, LivroController.cadastrar);
router.delete("/api/livros/:id", authMiddleware, LivroController.remover);
router.put("/api/livros/:id", authMiddleware, LivroController.atualizar);


// ==================== 📦 EMPRÉSTIMOS ====================

router.get("/api/emprestimos", authMiddleware, EmprestimoController.todos);
router.get("/api/emprestimos/:id", authMiddleware, EmprestimoController.emprestimo);
router.post("/api/emprestimos", authMiddleware, EmprestimoController.cadastrar);
router.delete("/api/emprestimos/:id", authMiddleware, EmprestimoController.remover);
router.put("/api/emprestimos/:id", authMiddleware, EmprestimoController.atualizar);


export { router };