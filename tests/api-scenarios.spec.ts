import { test, expect } from '@playwright/test';

// Hàm tái sử dụng: kiểm tra giá trị là chuỗi không rỗng (copy từ Phần 1 để file self-contained)
function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

// Hàm tái sử dụng: kiểm tra giá trị là số dương (copy từ Phần 1 để file self-contained)
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
}

interface User {
  id: number;
  email: string;
  name: { firstname: string; lastname: string };
}

interface CartProduct {
  productId: number;
  quantity: number;
}

interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
}

// Yêu cầu 6 - TC-05: Luồng duyệt và đặt hàng (User Browsing Flow)
// Mỗi bước chạy tuần tự, kết quả bước trước được dùng cho bước sau
test('TC-05: Luồng duyệt và đặt hàng - User Browsing Flow', async ({ request }) => {
  let productId: number;
  let userId: number;

  // Bước 1: Lấy sản phẩm theo category electronics - gửi GET /products/category/electronics
  await test.step('Bước 1: Lấy sản phẩm theo category electronics', async () => {
    const res = await request.get('/products/category/electronics');

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const products = await res.json() as Product[];

    // Xác nhận response body là Array và có độ dài lớn hơn 0
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    // Xác nhận với mỗi phần tử trong array: category === 'electronics' (đảm bảo filter của server đúng)
    for (const p of products) {
      expect(p.category).toBe('electronics');
    }

    // Xác nhận id của phần tử đầu tiên có kiểu number, lưu vào biến productId
    expect(typeof products[0].id).toBe('number');
    productId = products[0].id;
  });

  // Bước 2: Xem chi tiết sản phẩm - gửi GET /products/{productId} (dùng productId từ Bước 1)
  await test.step('Bước 2: Xem chi tiết sản phẩm', async () => {
    const res = await request.get(`/products/${productId}`);

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const product = await res.json() as Product;

    // Xác nhận id trong response bằng productId (đối chiếu với Bước 1)
    expect(product.id).toBe(productId);
    // Xác nhận category bằng 'electronics' (đối chiếu với filter ở Bước 1)
    expect(product.category).toBe('electronics');
    // Xác nhận price là số dương
    expect(isPositiveNumber(product.price)).toBe(true);
    // Xác nhận title là non-empty string
    expect(isNonEmptyString(product.title)).toBe(true);
  });

  // Bước 3: Lấy thông tin người dùng - gửi GET /users/1
  await test.step('Bước 3: Lấy thông tin người dùng', async () => {
    const res = await request.get('/users/1');

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const user = await res.json() as User;

    // Xác nhận id bằng 1
    expect(user.id).toBe(1);
    // Xác nhận email là non-empty string và chứa ký tự @ (kiểm tra format email cơ bản)
    expect(isNonEmptyString(user.email)).toBe(true);
    expect(user.email).toContain('@');
    // Xác nhận name.firstname và name.lastname đều là non-empty string
    expect(isNonEmptyString(user.name.firstname)).toBe(true);
    expect(isNonEmptyString(user.name.lastname)).toBe(true);

    // Lưu id vào biến userId
    userId = user.id;
  });

  // Bước 4: Tạo giỏ hàng - gửi POST /carts với body { userId, date, products } (dùng userId từ Bước 3 và productId từ Bước 1)
  await test.step('Bước 4: Tạo giỏ hàng', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      userId,
      date: today,
      products: [{ productId, quantity: 2 }],
    };

    const res = await request.post('/carts', { data: payload });

    // Xác nhận status là 200 hoặc 201
    expect([200, 201]).toContain(res.status());

    const cart = await res.json() as Cart;

    // Xác nhận response có id với kiểu number
    expect(typeof cart.id).toBe('number');
    // Xác nhận userId trong response bằng userId đã gửi (server echo đúng)
    expect(cart.userId).toBe(userId);
    // Xác nhận products là Array, độ dài bằng 1
    expect(Array.isArray(cart.products)).toBe(true);
    expect(cart.products.length).toBe(1);
    // Xác nhận products[0].productId bằng productId đã gửi
    expect(cart.products[0].productId).toBe(productId);
    // Xác nhận products[0].quantity bằng 2
    expect(cart.products[0].quantity).toBe(2);
  });
});

// Yêu cầu 7 - TC-06: Luồng quản lý sản phẩm (Product CRUD Flow)
// Mỗi bước chạy tuần tự, kết quả bước trước được dùng cho bước sau
test('TC-06: Luồng quản lý sản phẩm - Product CRUD Flow', async ({ request }) => {
  let createdId: number;

  const newProduct = {
    title: 'Test Product for Exam',
    price: 99.99,
    description: 'A product created by automated API test.',
    image: 'https://i.pravatar.cc',
    category: 'electronics',
  };

  // Bước 1: Tạo sản phẩm mới - gửi POST /products với body hợp lệ (gồm title, price, description, image, category)
  await test.step('Bước 1: Tạo sản phẩm mới', async () => {
    const res = await request.post('/products', { data: newProduct });

    // Xác nhận status là 200 hoặc 201
    expect([200, 201]).toContain(res.status());

    const body = await res.json() as Product;

    // Xác nhận response có id kiểu number, lưu vào biến createdId
    expect(typeof body.id).toBe('number');
    createdId = body.id;

    // Xác nhận mọi field trong response (title, price, description, image, category) khớp với payload đã gửi
    expect(body.title).toBe(newProduct.title);
    expect(body.price).toBe(newProduct.price);
    expect(body.description).toBe(newProduct.description);
    expect(body.image).toBe(newProduct.image);
    expect(body.category).toBe(newProduct.category);
  });

  // Bước 2: Cập nhật sản phẩm - gửi PUT /products/{createdId} với price mới, description mới, giữ nguyên title, image, category
  await test.step('Bước 2: Cập nhật sản phẩm (PUT)', async () => {
    const updatedPrice = 79.99;
    const updatedDescription = 'Mô tả đã được cập nhật';

    const res = await request.put(`/products/${createdId}`, {
      data: {
        title: newProduct.title,
        price: updatedPrice,
        description: updatedDescription,
        image: newProduct.image,
        category: newProduct.category,
      },
    });

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const body = await res.json() as Product;

    // Xác nhận id vẫn bằng createdId (không đổi sau PUT)
    expect(body.id).toBe(createdId);
    // Xác nhận price bằng price mới
    expect(body.price).toBe(updatedPrice);
    // Xác nhận description bằng description mới
    expect(body.description).toBe(updatedDescription);
  });

  // Bước 3: Cập nhật một phần - gửi PATCH /products/{createdId} chỉ với { title: "<new_title>" }
  await test.step('Bước 3: Cập nhật một phần (PATCH)', async () => {
    const newTitle = 'Tiêu đề mới sau PATCH';

    const res = await request.patch(`/products/${createdId}`, {
      data: { title: newTitle },
    });

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    const body = await res.json() as Pick<Product, 'id' | 'title'>;

    // Xác nhận id vẫn bằng createdId
    expect(body.id).toBe(createdId);
    // Xác nhận title trong response khớp với giá trị mới
    expect(body.title).toBe(newTitle);
    // Lưu ý: mock API trả về chỉ {id, title} sau PATCH, không assert các field khác có giữ nguyên hay không
  });

  // Bước 4: Xoá sản phẩm - gửi DELETE /products/{createdId}
  await test.step('Bước 4: Xoá sản phẩm (DELETE)', async () => {
    const res = await request.delete(`/products/${createdId}`);

    // Xác nhận status là 200
    expect(res.status()).toBe(200);

    // Đọc res.text() trước; nếu text bắt đầu bằng { thì parse JSON và xác nhận body
    const text = await res.text();

    if (text.startsWith('{')) {
      const body = JSON.parse(text) as Product;
      // Xác nhận body không null, không undefined
      expect(body).not.toBeNull();
      expect(body).not.toBeUndefined();
      // Xác nhận id trong body bằng createdId
      expect(body.id).toBe(createdId);
    }
    // Nếu text rỗng → test vẫn pass (hành vi đúng của mock với id chưa tồn tại)
  });
});
