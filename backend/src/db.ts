import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'support.db');

export const db: DatabaseType = new Database(dbPath);

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      customer_email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      classification TEXT,
      urgency TEXT,
      sentiment TEXT,
      ai_response TEXT,
      reasoning TEXT,
      actions_taken TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS customer_insights (
      email TEXT PRIMARY KEY,
      preferences TEXT,
      history_summary TEXT,
      interaction_count INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS processing_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      step TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database initialized at:', dbPath);
}

// Ticket operations
export interface Ticket {
  id: string;
  customer_email: string;
  subject?: string;
  message: string;
  classification?: string;
  urgency?: string;
  sentiment?: string;
  ai_response?: string;
  reasoning?: string;
  actions_taken?: string;
  status: string;
  created_at: string;
  processed_at?: string;
}

export function createTicket(ticket: Omit<Ticket, 'created_at' | 'status'>): Ticket {
  const stmt = db.prepare(`
    INSERT INTO tickets (id, customer_email, subject, message, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);
  stmt.run(ticket.id, ticket.customer_email, ticket.subject || null, ticket.message);
  return getTicket(ticket.id)!;
}

export function getTicket(id: string): Ticket | undefined {
  const stmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
  return stmt.get(id) as Ticket | undefined;
}

export function updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
  const fields = Object.keys(updates)
    .filter(k => updates[k as keyof Ticket] !== undefined)
    .map(k => `${k} = ?`);
  
  if (fields.length === 0) return getTicket(id);

  const values = Object.keys(updates)
    .filter(k => updates[k as keyof Ticket] !== undefined)
    .map(k => updates[k as keyof Ticket]);

  const stmt = db.prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values, id);
  return getTicket(id);
}

export function getAllTickets(limit = 50): Ticket[] {
  const stmt = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as Ticket[];
}

export function getTicketsByStatus(status: string): Ticket[] {
  const stmt = db.prepare('SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC');
  return stmt.all(status) as Ticket[];
}

// Customer insights operations
export interface CustomerInsight {
  email: string;
  preferences?: string;
  history_summary?: string;
  interaction_count: number;
  last_updated: string;
}

export function getCustomerInsight(email: string): CustomerInsight | undefined {
  const stmt = db.prepare('SELECT * FROM customer_insights WHERE email = ?');
  return stmt.get(email) as CustomerInsight | undefined;
}

export function upsertCustomerInsight(insight: Partial<CustomerInsight> & { email: string }): CustomerInsight {
  const existing = getCustomerInsight(insight.email);
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE customer_insights 
      SET preferences = COALESCE(?, preferences),
          history_summary = COALESCE(?, history_summary),
          interaction_count = interaction_count + 1,
          last_updated = CURRENT_TIMESTAMP
      WHERE email = ?
    `);
    stmt.run(insight.preferences || null, insight.history_summary || null, insight.email);
  } else {
    const stmt = db.prepare(`
      INSERT INTO customer_insights (email, preferences, history_summary, interaction_count)
      VALUES (?, ?, ?, 1)
    `);
    stmt.run(insight.email, insight.preferences || null, insight.history_summary || null);
  }
  
  return getCustomerInsight(insight.email)!;
}

// Processing logs
export function addProcessingLog(ticketId: string, step: string, details: string) {
  const stmt = db.prepare(`
    INSERT INTO processing_logs (ticket_id, step, details)
    VALUES (?, ?, ?)
  `);
  stmt.run(ticketId, step, details);
}

export function getProcessingLogs(ticketId: string) {
  const stmt = db.prepare('SELECT * FROM processing_logs WHERE ticket_id = ? ORDER BY timestamp ASC');
  return stmt.all(ticketId);
}

// Analytics
export function getAnalytics() {
  const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number };
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM tickets GROUP BY status
  `).all() as { status: string; count: number }[];
  const byClassification = db.prepare(`
    SELECT classification, COUNT(*) as count FROM tickets WHERE classification IS NOT NULL GROUP BY classification
  `).all() as { classification: string; count: number }[];
  const byUrgency = db.prepare(`
    SELECT urgency, COUNT(*) as count FROM tickets WHERE urgency IS NOT NULL GROUP BY urgency
  `).all() as { urgency: string; count: number }[];
  
  return {
    total: totalTickets.count,
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
    byClassification: Object.fromEntries(byClassification.map(r => [r.classification, r.count])),
    byUrgency: Object.fromEntries(byUrgency.map(r => [r.urgency, r.count])),
  };
}

