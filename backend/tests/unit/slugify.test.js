import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/utils/slugify.js';

describe('Slugify Utility', () => {
  it('deve converter uma string para slug corretamente', () => {
    expect(slugify('Hollow Knight: Silksong')).toBe('hollow-knight-silksong');
    expect(slugify('  Meu Jogo  Legal  ')).toBe('meu-jogo-legal');
    expect(slugify('Ação & Aventura 2026!')).toBe('ao-aventura-2026');
  });
});
