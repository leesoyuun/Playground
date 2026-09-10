import { test, expect } from '@playwright/test';
import { MockChatServer } from '../src/features/chat/mock/data';

test('only 40 of 2000 mock messages load initially and new events append separately', async ({ page }) => {
  const errors: string[] = [];
  const backendRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/rfice\.com|rsupport\.com|\/api\//.test(request.url())) backendRequests.push(request.url()); });
  await page.goto('/chat');
  const list = page.getByTestId('rfice-message-list');
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  await expect(list.locator('[data-message-id]')).toHaveCount(40);
  await expect(list.locator('img')).not.toHaveCount(0);
  await expect(page.getByLabel('시작 상태')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /전체 .*개 누적/ })).toHaveCount(0);
  await expect(page.getByTestId('mock-api-status')).toContainText('Mock API 1회 호출');
  await page.screenshot({ path: 'test-results/chat-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '메시지 100개 추가', exact: true }).click();
  await expect(list).toHaveAttribute('data-loaded-count', '140');
  await expect(list.locator('[data-message-id]')).toHaveCount(140);
  await expect(page.getByRole('button', { name: '결과 JSON 저장' })).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '결과 JSON 저장' }).click();
  const download = await downloadPromise;
  await download.saveAs('test-results/chat-performance.json');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const report = JSON.parse(Buffer.concat(chunks).toString());
  expect(report.loadedMessages).toBe(140);
  expect(report.mockMessages).toBe(2100);
  expect(report.configuredMessages).toBe(2000);
  expect(report.viewport.width).toBe(1280);
  expect(report.messageDOM).toBe(140);
  expect(report.cachedEntries).toBe(140);
  expect(report.apiRequests).toEqual([{ order: 'DESC', responseSize: 40 }]);
  expect(report.frameSamples).toBeGreaterThan(0);
  expect(report.maxFrameMs).toBeGreaterThan(0);
  await page.getByRole('button', { name: '대화 초기화' }).click();
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  expect(backendRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('40-item paging preserves the visible anchor and accumulated data', async ({ page }) => {
  await page.goto('/chat');
  const list = page.getByTestId('rfice-message-list');
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  await list.evaluate(element => { element.scrollTop = 0; });
  const anchor = list.locator('[data-message-id]').first();
  const before = await anchor.evaluate(element => ({ id: element.id, top: element.getBoundingClientRect().top }));
  await expect(list).toHaveAttribute('data-loaded-count', '80');
  const after = await list.locator(`[id="${before.id}"]`).evaluate(element => element.getBoundingClientRect().top);
  // Source uses the first row height when scrollTop is zero.
  const height = await list.locator(`[id="${before.id}"]`).evaluate(element => element.clientHeight);
  expect(Math.abs(after - before.top)).toBeLessThan(height + 30);
  await expect(list.locator('[data-message-id]')).toHaveCount(80);
  await list.evaluate(element => { element.scrollTop = 0; });
  await expect(list).toHaveAttribute('data-loaded-count', '120');
  await expect(list.locator('[data-message-id]')).toHaveCount(120);
  await expect(page.getByTestId('mock-api-status')).toContainText('Mock API 3회 호출');
  await expect(list.locator('[data-message-id]').first()).toHaveAttribute('id', 'message-1881');
  await expect(list.locator('[data-message-id]').last()).toHaveAttribute('id', 'message-2000');
});

test('new arrivals preserve reading position and sent messages support reply, edit and delete', async ({ page }) => {
  await page.goto('/chat');
  const list = page.getByTestId('rfice-message-list');
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  await list.evaluate(element => { element.scrollTop = element.scrollHeight / 2; });
  await expect(page.getByRole('button', { name: '최신 메시지', exact: true })).toBeVisible();
  const before = await list.evaluate(element => element.scrollTop);
  await page.getByRole('button', { name: '메시지 100개 추가' }).click();
  await expect(list).toHaveAttribute('data-loaded-count', '140');
  expect(Math.abs(await list.evaluate(element => element.scrollTop) - before)).toBeLessThan(10);
  await expect(page.getByRole('button', { name: '새 메시지', exact: true })).toBeVisible();
  const input = page.getByRole('textbox', { name: '메시지', exact: true });
  await input.fill('내 테스트 메시지');
  await input.press('Enter');
  const own = list.locator('[data-message-id]').last();
  await expect(own).toContainText('내 테스트 메시지');
  await own.hover();
  await own.getByRole('button', { name: '답장하기' }).click();
  await input.fill('답장 테스트');
  await input.press('Enter');
  await expect(list.locator('[data-message-id]').last().locator('.rf-reply')).toContainText('내 테스트 메시지');
  const latest = list.locator('[data-message-id]').last();
  await latest.locator('.chat-font').last().hover();
  await latest.getByRole('button', { name: '메시지 메뉴' }).click();
  await latest.getByRole('button', { name: '수정하기' }).click();
  await latest.getByRole('textbox', { name: '메시지 수정 내용' }).fill('수정한 메시지');
  await latest.getByRole('button', { name: '저장', exact: true }).click();
  await expect(latest).toContainText('수정한 메시지');
  await latest.locator('.chat-font').last().hover();
  await latest.getByRole('button', { name: '메시지 메뉴' }).click();
  await latest.getByRole('button', { name: '삭제하기' }).click();
  await expect(latest).toContainText('삭제된 메시지입니다.');
});

test('mobile chat has no horizontal overflow and can change dataset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/chat');
  const list = page.getByTestId('rfice-message-list');
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  await page.getByLabel('메시지 구성').selectOption('text');
  await expect(list.locator('img')).toHaveCount(0);
  await page.getByLabel('Mock 메시지 수').selectOption('40');
  await expect(list).toHaveAttribute('data-loaded-count', '40');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByTestId('loaded-count')).toHaveText('40');
  await page.screenshot({ path: 'test-results/chat-mobile.png', fullPage: true });
});

test('scroll benchmark completes and returns a measured report', async ({ page }) => {
  await page.goto('/chat');
  await page.getByLabel('Mock 메시지 수').selectOption('40');
  await expect(page.getByTestId('loaded-count')).toHaveText('40');
  await page.getByRole('button', { name: '8초 스크롤 측정' }).click();
  await expect(page.getByRole('button', { name: '측정 중지' })).toBeVisible();
  await expect(page.getByRole('button', { name: '결과 JSON 저장' })).toBeEnabled({ timeout: 15000 });
  await expect(page.getByRole('status')).toContainText('8초 자동 스크롤');
  await expect(page.getByTestId('mock-api-status')).toContainText('Mock API 1회 호출');
});

test('timed reception delivers individual mock events and finishes its measurement', async ({ page }) => {
  await page.goto('/chat');
  await page.getByLabel('Mock 메시지 수').selectOption('40');
  await expect(page.getByTestId('loaded-count')).toHaveText('40');
  await page.getByRole('button', { name: '10초 실시간 수신 · 초당 10개' }).click();
  await expect(page.getByRole('button', { name: '결과 JSON 저장' })).toBeEnabled({ timeout: 17000 });
  const loaded = Number(await page.getByTestId('rfice-message-list').getAttribute('data-loaded-count'));
  expect(loaded).toBeGreaterThan(40);
  expect(loaded).toBeLessThanOrEqual(140);
  await expect(page.getByRole('status')).toContainText('10초 실시간 수신');
});


test('mock API returns at most 40 per cursor, traverses all 2000 and ends without gaps', async () => {
  const server = new MockChatServer(2000, 'text');
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await server.fetchMessages(cursor ? { id: cursor, order: 'DESC' } : undefined);
    expect(page.content).toHaveLength(40);
    ids.push(...page.content.map(message => message.roomMessageId));
    cursor = page.nextPage;
  } while (cursor);
  expect(server.requests).toHaveLength(50);
  expect(ids).toEqual(Array.from({ length: 2000 }, (_, index) => `message-${2000 - index}`));
  const partial = new MockChatServer(45, 'text');
  const first = await partial.fetchMessages();
  const last = await partial.fetchMessages({ id: first.nextPage, order: 'DESC' });
  expect(first.content).toHaveLength(40);
  expect(last.content).toHaveLength(5);
  expect(last.nextPage).toBeUndefined();
  first.content[0].deleted = true;
  expect(partial.messages.at(-1)?.deleted).toBe(false);
});
