// Chamadas da tela de relatórios (RelatorioController).
import { api } from './client.js';

// Gera (e guarda) um relatório da escola. Datas no formato "2026-10-01T00:00:00"; as duas são opcionais.
export const gerarRelatorio = (escolaId, dataInicio, dataFim) =>
  api.post(`/relatorios/escola/${escolaId}`, { dataInicio, dataFim });

export const listarRelatorios = (escolaId) => api.get(`/relatorios/escola/${escolaId}`);
