import { test, expect } from '@playwright/test';

test('home cards navigate to isolated experiments and browser history works', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('실험 모음');
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('navigation', { name: '실험 페이지' }).getByRole('link', { name: /채팅/ }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await page.getByRole('textbox', { name: '메시지', exact: true }).fill('실험 메시지');
  await page.getByRole('button', { name: '메시지 전송' }).click();
  await expect(page.getByText('실험 메시지', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: '메시지', exact: true }).fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: '메시지 전송' }).click();
  await expect(page.getByText('<script>alert(1)</script>', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /채팅 실험실/ })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});

test('notes persist on reload and timer can complete', async ({ page }) => {
  await page.goto('/notes');
  await page.getByRole('textbox', { name: '메모 내용' }).fill('저장 테스트');
  await page.reload();
  await expect(page.getByRole('textbox', { name: '메모 내용' })).toHaveValue('저장 테스트');
  await page.goto('/timer');
  await page.clock.install();
  await page.getByRole('button', { name: '시작하기' }).click();
  await page.clock.fastForward(300000);
  await expect(page.getByRole('timer')).toHaveText('00:00');
  await expect(page.getByRole('heading', { name: '실험 완료! 잠시 쉬어가세요.' })).toBeVisible();
  await page.getByRole('button', { name: '타이머 초기화' }).click();
  await expect(page.getByRole('timer')).toHaveText('05:00');
});

test('mobile collection supports search, categories and list navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  const collection = page.getByRole('navigation', { name: '실험 페이지' });
  await page.getByRole('button', { name: '생산성', exact: true }).click();
  await expect(collection.getByRole('link')).toHaveCount(2);
  await page.getByRole('textbox', { name: '실험 검색' }).fill('없는 실험');
  await expect(page.getByRole('status')).toContainText('일치하는 실험이 없어요.');
  await page.getByRole('button', { name: '모든 실험 보기' }).click();
  await expect(collection.getByRole('link')).toHaveCount(3);
  await page.getByRole('textbox', { name: '실험 검색' }).fill('메모');
  await expect(collection.getByRole('link')).toHaveCount(1);
  await page.getByRole('button', { name: '목록 보기', exact: true }).click();
  await expect(page.getByRole('button', { name: '목록 보기', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await collection.getByRole('link', { name: /메모/ }).click();
  await expect(page).toHaveURL(/\/notes$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
