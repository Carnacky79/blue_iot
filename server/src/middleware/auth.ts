// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    role: string;
}

// Estendi la definizione di Request per includere le informazioni sull'utente
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

/**
 * Middleware per verificare il token JWT e autorizzare l'accesso
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Ottieni il token dall'header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    // Formato tipico: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = parts[1];

    try {
        // Verifica il token
        const secret = process.env.JWT_SECRET || 'your-default-secret-key';
        const payload = jwt.verify(token, secret) as TokenPayload;

        // Aggiunge l'utente alla richiesta
        req.user = {
            userId: payload.userId,
            role: payload.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware per verificare i ruoli dell'utente
 * @param roles Array di ruoli autorizzati
 */
export const roleMiddleware = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        }

        next();
    };
};
