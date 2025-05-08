// server/src/routes/auth.ts
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Verifica che username e password siano stati forniti
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // In un'implementazione reale, qui verificheremmo le credenziali nel database
        // Per ora, accettiamo qualsiasi combinazione per semplicità
        // Simuliamo un utente trovato
        const user = {
            id: 'user1',
            username,
            email: `${username}@example.com`,
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            companyId: 'company1'
        };

        // Genera il token JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-default-secret-key',
            { expiresIn: '1d' } // Scadenza: 1 giorno
        );

        // Invia la risposta
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                companyId: user.companyId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Profilo utente (richiede autenticazione)
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        // In un'implementazione reale, qui otterremmo i dettagli utente dal database
        // Per ora, restituiamo dati di esempio basati sull'ID utente dalla richiesta autenticata
        res.json({
            id: req.user?.userId,
            username: 'johndoe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: req.user?.role,
            companyId: 'company1'
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

// Cambio password (richiede autenticazione)
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Verifica che oldPassword e newPassword siano stati forniti
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }

        // In un'implementazione reale, qui verificheremmo la vecchia password e aggiorneiremmo la nuova
        // Per ora, fingiamo che l'operazione sia riuscita

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
});

export default router;
