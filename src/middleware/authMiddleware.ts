import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensagem: "Token não informado." });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ mensagem: "Formato inválido." });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2 || !partes[1]) {
        return res.status(401).json({ mensagem: "Token inválido." });
    }

    const token: string = partes[1];

    try {
        jwt.verify(token, "SEGREDO_SUPER_SECRETO");
        return next();
    } catch {
        return res.status(401).json({ mensagem: "Token inválido." });
    }
}