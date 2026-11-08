(function () {
'use strict';
/* The theme editor's colour picker: sixty colours in common web use, in the
   order the picker draws them. Named rather than bare hex because the name is
   what makes a swatch findable — "Denim" is easier to aim at than #1E40AF —
   and grouped because a 60-cell grid is read by region, not by list. Every
   entry is a solid 6-digit hex so the picker and the exported CSS agree.

   Values are from the Tailwind-scale palettes plus the classic CSS names
   everybody already knows (Coral, Turquoise, Gold). No alpha: a theme token
   that is translucent composites against whatever is behind it and cannot be
   previewed honestly in a swatch. */
const COLORS = [
  // ---- neutral: page, surface, ink ----
  ['Black', '#000000', 'Neutrals'],
  ['Charcoal', '#1F2937', 'Neutrals'],
  ['Slate', '#334155', 'Neutrals'],
  ['Gray', '#6B7280', 'Neutrals'],
  ['Silver', '#9CA3AF', 'Neutrals'],
  ['Light gray', '#D1D5DB', 'Neutrals'],
  ['Cloud', '#E5E7EB', 'Neutrals'],
  ['Smoke', '#F3F4F6', 'Neutrals'],
  ['White', '#FFFFFF', 'Neutrals'],
  ['Ivory', '#FFFBF0', 'Neutrals'],
  // ---- warm: red through yellow ----
  ['Red', '#EF4444', 'Warm'],
  ['Crimson', '#DC2626', 'Warm'],
  ['Maroon', '#991B1B', 'Warm'],
  ['Rose', '#F43F5E', 'Warm'],
  ['Raspberry', '#E11D48', 'Warm'],
  ['Pink', '#EC4899', 'Warm'],
  ['Magenta', '#D946EF', 'Warm'],
  ['Plum', '#86198F', 'Warm'],
  ['Orange', '#F97316', 'Warm'],
  ['Tangerine', '#FB923C', 'Warm'],
  ['Coral', '#FF7F50', 'Warm'],
  ['Peach', '#FDBA74', 'Warm'],
  ['Amber', '#F59E0B', 'Warm'],
  ['Honey', '#D97706', 'Warm'],
  ['Gold', '#FACC15', 'Warm'],
  ['Lemon', '#FDE047', 'Warm'],
  // ---- green ----
  ['Lime', '#84CC16', 'Green'],
  ['Olive', '#65A30D', 'Green'],
  ['Moss', '#4D7C0F', 'Green'],
  ['Green', '#22C55E', 'Green'],
  ['Forest', '#15803D', 'Green'],
  ['Emerald', '#10B981', 'Green'],
  ['Jade', '#059669', 'Green'],
  ['Sage', '#84A98C', 'Green'],
  ['Mint', '#6EE7B7', 'Green'],
  ['Sea green', '#0D9488', 'Green'],
  // ---- cool: teal through indigo ----
  ['Teal', '#14B8A6', 'Cool'],
  ['Turquoise', '#40E0D0', 'Cool'],
  ['Cyan', '#06B6D4', 'Cool'],
  ['Sky', '#0EA5E9', 'Cool'],
  ['Azure', '#0284C7', 'Cool'],
  ['Cerulean', '#0369A1', 'Cool'],
  ['Steel', '#0E7490', 'Cool'],
  ['Blue', '#3B82F6', 'Cool'],
  ['Royal', '#2563EB', 'Cool'],
  ['Cobalt', '#1D4ED8', 'Cool'],
  ['Denim', '#1E40AF', 'Cool'],
  ['Navy', '#1E3A8A', 'Cool'],
  ['Indigo', '#4F46E5', 'Cool'],
  // ---- violet / purple ----
  ['Iris', '#6366F1', 'Purple'],
  ['Violet', '#8B5CF6', 'Purple'],
  ['Lavender', '#A78BFA', 'Purple'],
  ['Orchid', '#C084FC', 'Purple'],
  ['Purple', '#9333EA', 'Purple'],
  ['Grape', '#7E22CE', 'Purple'],
  // ---- earth ----
  ['Brown', '#78350F', 'Earth'],
  ['Coffee', '#713F12', 'Earth'],
  ['Chocolate', '#7C2D12', 'Earth'],
  ['Clay', '#A16207', 'Earth'],
  ['Tan', '#D6B98C', 'Earth'],
];

const PALETTE = COLORS.map(([n, h, g]) => ({ n, h, g }));

if (typeof module === 'object' && module.exports) module.exports = { PALETTE };
else window.TE_PALETTE = PALETTE;

})();
