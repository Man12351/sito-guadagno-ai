import { Resend } from 'resend';

// Inizializza Resend usando la chiave API che imposteremo su Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

// Definisci l'indirizzo email mittente (deve essere un dominio verificato su Resend)
// Per i test, puoi usare 'onboarding@resend.dev'
const fromEmail = 'Contatto dal Sito <onboarding@resend.dev>';

// Definisci l'indirizzo email dove vuoi ricevere i messaggi
const toEmail = 'guadagnaconlai@gmail.com'; // <--- CAMBIA QUESTO

export default async function handler(request, response) {
  // Gestione della richiesta pre-flight CORS per i browser
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Estrai i dati del form dal corpo della richiesta
  const { name, email, phone, message } = request.body;
  
  // Validazione base dei dati
  if (!name || !email || !phone) {
    return response.status(400).json({ error: 'Nome, Email e Telefono sono obbligatori.' });
  }

  try {
    // Invia l'email usando Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Nuovo contatto da ${name} - Guadagna con l'AI`,
      html: `
        <h1>Nuovo contatto ricevuto dal sito!</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message || 'Nessun messaggio inserito.'}</p>
      `,
    });

    // Se c'è un errore nell'invio, restituisci un errore 500
    if (error) {
      console.error('Errore Resend:', error);
      return response.status(500).json({ error: 'Errore durante l-invio dell-email.' });
    }

    // Se l'invio ha successo, restituisci l'ID dell'email inviata
    return response.status(200).json({ id: data.id });

  } catch (error) {
    console.error('Errore generico:', error);
    return response.status(500).json({ error: 'Si è verificato un errore sul server.' });
  }
}