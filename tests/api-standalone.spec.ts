import { test, expect } from '@playwright/test';

// Hàm tái sử dụng: kiểm tra giá trị là chuỗi không rỗng
function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

// Hàm tái sử dụng: kiểm tra giá trị là số dương
function isPositiveNumber(v: unknown): boolean {
  return typeof v === 'number' && v > 0;
}

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

// Phần 1: Test API đơn lẻ - mỗi test case dùng Playwright request và xác minh cả status code lẫn body
test.describe('Phần 1: Test API đơn lẻ - Fake Store API', () => {
  let validCategories: string[] = [];

  // Dùng test.beforeAll để fetch danh sách categories một lần cho cả describe block
  test.beforeAll(async ({ request }) => {
    const res = await request.get('/products/categories');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    validCategories = body as string[];
  });

  // Yêu cầu 2 - TC-01: GET /products - Lấy danh sách sản phẩm và kiểm tra schema toàn bộ phần tử, đảm bảo id là duy nhất
  test('TC-01: GET /products - lấy danh sách sản phẩm, kiểm tra schema và id duy nhất', async ({ request }) => {
    const res = await request.get('/products');

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const body = await res.json() as Product[];

    // Xác nhận response body là Array và có độ dài lớn hơn 0
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const seenIds = new Set<number>();

    // Xác nhận với mỗi phần tử trong array (dùng for...of)
    for (const product of body) {
      // id là number
      expect(typeof product.id).toBe('number');
      // title là non-empty string (dùng helper isNonEmptyString)
      expect(isNonEmptyString(product.title)).toBe(true);
      // price là số dương (dùng helper isPositiveNumber)
      expect(isPositiveNumber(product.price)).toBe(true);
      // category là non-empty string
      expect(isNonEmptyString(product.category)).toBe(true);

      // Xác nhận toàn bộ id là duy nhất: assert expect(set.has(id)).toBe(false) trước khi add
      expect(seenIds.has(product.id)).toBe(false);
      seenIds.add(product.id);
    }
  });

  // Yêu cầu 3 - TC-02: GET /products/:id - Lấy sản phẩm theo ID, cross-validate category với endpoint /products/categories
  test('TC-02: GET /products/1 - kiểm tra chi tiết sản phẩm và cross-validate category', async ({ request }) => {
    // Gửi GET /products/1
    const res = await request.get('/products/1');

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const product = await res.json() as Product;

    // Xác nhận trường id trong response bằng 1
    expect(product.id).toBe(1);

    // Xác nhận title là non-empty string
    expect(isNonEmptyString(product.title)).toBe(true);

    // Xác nhận category phải nằm trong validCategories
    expect(validCategories).toContain(product.category);

    // Xác nhận rating object
    // rating.rate là number, > 0 và <= 5 (thang điểm rating tiêu chuẩn)
    expect(typeof product.rating.rate).toBe('number');
    expect(product.rating.rate).toBeGreaterThan(0);
    expect(product.rating.rate).toBeLessThanOrEqual(5);
    // rating.count là number, >= 0
    expect(typeof product.rating.count).toBe('number');
    expect(product.rating.count).toBeGreaterThanOrEqual(0);
  });

  // Yêu cầu 4 - TC-03: POST /products - Tạo sản phẩm mới, xác minh các field chính được echo đúng
  test('TC-03: POST /products - tạo sản phẩm mới, xác minh field echo đúng', async ({ request }) => {
    // Tạo payload gồm đủ 5 trường: title, price, description, image, category
    const payload = {
      title: 'Test Product Exam3',
      price: 99.99,
      description: 'Mô tả sản phẩm kiểm thử',
      image: 'https://fakestoreapi.com/img/test.jpg',
      category: 'electronics',
    };

    // Gửi POST /products với payload trên
    const res = await request.post('/products', { data: payload });

    // Xác nhận status là 200 hoặc 201
    expect([200, 201]).toContain(res.status());

    const body = await res.json() as Product;

    // Xác nhận response có id là number và lớn hơn 0
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);

    // Xác nhận 3 field chính trong response khớp với payload đã gửi: title, price, category
    expect(body.title).toBe(payload.title);
    expect(body.price).toBe(payload.price);
    expect(body.category).toBe(payload.category);
  });

  // Yêu cầu 5 - TC-04: DELETE /products/:id - Xoá sản phẩm và xác minh body trả về là object có schema đầy đủ
  test('TC-04: DELETE /products/6 - xoá sản phẩm, xác minh body trả về đầy đủ schema', async ({ request }) => {
    // Gửi DELETE /products/6
    const res = await request.delete('/products/6');

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const body = await res.json() as Product;

    // Xác nhận body không null, không undefined, có kiểu object, không phải Array
    expect(body).not.toBeNull();
    expect(body).not.toBeUndefined();
    expect(typeof body).toBe('object');
    expect(Array.isArray(body)).toBe(false);

    // Xác nhận id trong response bằng 6
    expect(body.id).toBe(6);

    // Xác nhận object trả về vẫn giữ các field sản phẩm cốt lõi
    // title là non-empty string
    expect(isNonEmptyString(body.title)).toBe(true);
    // price là số dương
    expect(isPositiveNumber(body.price)).toBe(true);
  });
});
