import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// 1. Rota de busca principal que o front-end chama (/api/search)
app.post('/api/search', async (req, res) => {
  try {
    const { origin, destination, date } = req.body;
    const duffelApiKey = process.env.DUFFEL_API_KEY;

    const originAirport = { code: origin || 'CWB', city: 'Curitiba', name: 'Afonso Pena', state: 'PR', country: 'Brasil' };
    const destinationAirport = { code: destination || 'GIG', city: 'Rio de Janeiro', name: 'Galeão', state: 'RJ', country: 'Brasil' };

    if (!duffelApiKey) {
      return res.json({
        originAirport,
        destinationAirport,
        offers: []
      });
    }

    // Chamada real à API da Duffel
    const duffelResponse = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin: origin || 'CWB',
              destination: destination || 'GIG',
              departure_date: date || '2026-11-20'
            }
          ],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy'
        }
      })
    });

    const flightData = await duffelResponse.json();

    if (!duffelResponse.ok) {
      console.error('Erro na Duffel API:', flightData);
      return res.status(duffelResponse.status).json(flightData);
    }

    // Retorna no formato que o Garimpa Trip espera
    res.json({
      originAirport,
      destinationAirport,
      duffelOffers: flightData.data || {}
    });

  } catch (error) {
    console.error('Erro interno em /api/search:', error);
    res.status(500).json({ error: 'Erro ao processar busca de voos.' });
  }
});

// 2. Rota de suporte para alertas (evita o erro 404 no console)
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: [] });
});

app.post('/api/alerts', (req, res) => {
  res.json({ success: true, message: 'Alerta registado com sucesso.' });
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor do Garimpa Trip a rodar na porta ${PORT}`);
});