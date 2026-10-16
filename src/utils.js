// Data de hoje no formato do backend (aaaa-mm-dd), no fuso do usuário.
export const hojeISO = () => new Date().toLocaleDateString('sv-SE');

// Primeira letra do nome, para o avatar.
export const inicial = (nome) => (nome || '?').trim().charAt(0).toUpperCase();

// "2026-10-14" -> "14/10/2026"
export const formatarData = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
