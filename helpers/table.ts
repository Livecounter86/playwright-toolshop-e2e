import type { Locator } from '@playwright/test';

// Cell of `row` in the column titled `column`: the position is taken from the table header on every retry,
// so moved or new columns don't break it; an unknown title matches nothing
export function cellInColumn(row: Locator, column: string) {
  const header = `ancestor::table/thead//th[normalize-space()="${column}"]`;
  return row.locator(`xpath=td[count(${header}/preceding-sibling::th) + 1][${header}]`);
}
