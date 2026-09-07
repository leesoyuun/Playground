import { test, expect } from '@playwright/test';

test('home icons navigate to isolated experiments and browser history works', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '일단, 놀아볼까요?' })).toBeVisible();
  await page.getByRole('navigation', { name: '실험 페이지' }).getByRole('link', { name: /채팅/ }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await page.getByRole('textbox', { name: '메시지', exact: true }).fill('실험 메시지');
  await page.getByRole('button', { name: '메시지 전송' }).click();
  await expect(page.getByText('보내주신 메시지: 실험 메시지', { exact: true })).toBeVisible();
  await page.getByLabel('응답 방식').selectOption('fixed');
  await page.getByRole('textbox', { name: '메시지', exact: true }).fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: '메시지 전송' }).click();
  await expect(page.getByText('메시지를 받았어요. 이 응답을 원하는 로직으로 바꿔보세요!', { exact: true })).toBeVisible();
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

test('mobile home and list remain usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '아이콘 움직임 멈추기' }).click();
  await expect(page.getByRole('button', { name: '아이콘 움직임 재생' })).toBeVisible();
  await page.getByRole('button', { name: /모든 실험/ }).click();
  await page.locator('.experiment-list').getByRole('link', { name: /메모/ }).click();
  await expect(page).toHaveURL(/\/notes$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
