# Conhecimento — Design System

Fonte de verdade visual da fatia A (textos + chat). Estilo: **Minimalism & Swiss**. Superfície: **web desktop (browser)**, `apps/web`, Next.js + Tailwind 4.

As buscas `--design-system` devolveram paletes de landing (creme/âmbar, slate/azul claro). **Não aplicar.** O produto já é um workspace dark de conhecimento; os tokens abaixo documentam a identidade em uso e os ajustes de UX.

## Dials

| Dial | Valor | Significado |
|------|-------|-------------|
| Variance | 3 | Centrado, sem assimetria ornamental |
| Motion | 3 | Micro-interação 150–250ms; respeitar `prefers-reduced-motion` |
| Density | 6 | Ritmo 8/16/24/32; alvos ≥44px |

## Tokens

```css
--background: #090b10;
--foreground: #e8edf5;
--surface: #10141c;
--surface-raised: #161b25;
--muted: #8b95a8;
--border: #2a3344;
--accent: #2dd4bf;
--accent-hover: #5eead4;
--accent-fg: #042f2e;
--accent-soft: #134e4a;
--danger: #fb7185;
--danger-soft: #3f1720;
--ring: #2dd4bf;
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--duration: 200ms;
```

Tipografia: **Geist** (já no `layout`) + Geist Mono para markdown/código. Não trocar por Inter/Atkinson só porque o gerador sugeriu.

Ícones: SVG outline, stroke 1.5, família única (Heroicons-like). Nunca emoji como ícone de sistema.

## Regras que a UI deve cumprir

1. Contraste de texto ≥4.5:1; anel de foco visível (`focus-visible`, 2px, offset 2px).
2. Skip link para `#conteudo`; `aria-current` na nav ativa.
3. Alvos clicáveis ≥44×44px; `cursor-pointer`; 8px entre alvos.
4. Labels visíveis (não só placeholder); erros com `role="alert"` junto do campo/ação.
5. Confirmar antes de apagar; sucesso breve (`aria-live="polite"`).
6. Loading com espaço reservado (skeleton / `aria-busy`), sem CLS.
7. Nav primária: ícone + rótulo; Chat e Textos no mesmo sítio em todas as rotas.
8. Pessoa **e** empresa no chrome (Arthur Bamberg · Bamberg Desenvolvimento de Software; Canoas/RS; CNPJ; telefone).

## Anti-padrões

- `outline-none` sem substituto
- Ícone sem nome acessível
- Hover como único affordance
- Apagar no editor sem confirmação
- Palete light de “docs landing” neste workspace
