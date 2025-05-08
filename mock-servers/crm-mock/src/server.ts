// mock-servers/crm-mock/src/server.ts
import express from 'express';
import cors from 'cors';

// Configurazione
const PORT = 4002;

// Crea l'app Express
const app = express();
app.use(cors());
app.use(express.json());

// Dati simulati
const companies = [
    {
        id: 'company1',
        name: 'Construction Corp Inc.',
        address: '123 Builder Street, New York, NY',
        contact: 'John Builder',
        phone: '+1-234-567-8901',
        email: 'info@constructioncorp.com'
    }
];

const employees = [
    {
        id: '1',
        companyId: 'company1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Construction Worker',
        department: 'Operations',
        siteId: 'site1'
    },
    {
        id: '2',
        companyId: 'company1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        position: 'Site Manager',
        department: 'Management',
        siteId: 'site1'
    },
    {
        id: '3',
        companyId: 'company1',
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone: '+1234567892',
        position: 'Electrician',
        department: 'Technical',
        siteId: 'site1'
    },
    {
        id: '4',
        companyId: 'company1',
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        phone: '+1234567893',
        position: 'Safety Officer',
        department: 'Safety',
        siteId: 'site2'
    },
    {
        id: '5',
        companyId: 'company1',
        name: 'David Kim',
        email: 'david.kim@example.com',
        phone: '+1234567894',
        position: 'Architect',
        department: 'Design',
        siteId: 'site2'
    }
];

const assets = [
    {
        id: '101',
        companyId: 'company1',
        name: 'Excavator #1',
        type: 'Heavy Equipment',
        serialNumber: 'EX-2023-001',
        description: 'Caterpillar 320 Excavator',
        siteId: 'site1'
    },
    {
        id: '102',
        companyId: 'company1',
        name: 'Concrete Mixer',
        type: 'Heavy Equipment',
        serialNumber: 'CM-2023-002',
        description: 'Mobile concrete mixer truck',
        siteId: 'site1'
    },
    {
        id: '103',
        companyId: 'company1',
        name: 'Power Generator',
        type: 'Equipment',
        serialNumber: 'PG-2023-003',
        description: 'Portable power generator 5000W',
        siteId: 'site1'
    },
    {
        id: '104',
        companyId: 'company1',
        name: 'Toolbox A',
        type: 'Tool',
        serialNumber: 'TB-2023-004',
        description: 'Complete set of hand tools',
        siteId: 'site1'
    },
    {
        id: '105',
        companyId: 'company1',
        name: 'Safety Equipment Kit',
        type: 'Safety Equipment',
        serialNumber: 'SE-2023-005',
        description: 'Safety helmets, vests and gear',
        siteId: 'site2'
    },
    {
        id: '106',
        companyId: 'company1',
        name: 'Crane #2',
        type: 'Heavy Equipment',
        serialNumber: 'CR-2023-006',
        description: 'Mobile crane for heavy lifting',
        siteId: 'site2'
    }
];

// Rotte API

// Autenticazione
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // In un'implementazione mock, accettiamo qualsiasi credenziale valida
    const token = `mock-token-${Date.now()}`;

    res.json({
        token,
        user: {
            id: 'user1',
            username,
            email: `${username}@example.com`,
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            companyId: 'company1'
        }
    });
});

// Informazioni azienda
app.get('/companies/:companyId', (req, res) => {
    const { companyId } = req.params;
    const company = companies.find(c => c.id === companyId);

    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
});

// Dipendenti azienda
app.get('/companies/:companyId/employees', (req, res) => {
    const { companyId } = req.params;
    const { siteId } = req.query;

    let result = employees.filter(e => e.companyId === companyId);

    if (siteId) {
        result = result.filter(e => e.siteId === siteId);
    }

    res.json(result);
});

// Asset azienda
app.get('/companies/:companyId/assets', (req, res) => {
    const { companyId } = req.params;
    const { siteId } = req.query;

    let result = assets.filter(a => a.companyId === companyId);

    if (siteId) {
        result = result.filter(a => a.siteId === siteId);
    }

    res.json(result);
});

// Rotta di stato
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'CRM Mock Server is running' });
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`CRM Mock Server running on port ${PORT}`);
});
