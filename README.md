ShopClothes - E-commerce Platform
ShopClothes là một nền tảng thương mại điện tử full-stack được xây dựng bằng công nghệ MERN (MongoDB, Express, React, Node.js). Hệ thống hỗ trợ đầy đủ các tính năng mua sắm, quản lý giỏ hàng, xác thực người dùng (Local & Google OAuth) và quản lý danh mục sản phẩm đa cấp.

Công nghệ sử dụng
Frontend
Framework: React (Vite)

Styling: Tailwind CSS

Routing: React Router DOM

State Management: Context API (AuthContext, CartContext)

Icons: Lucide React

HTTP Client: Fetch API / Axios

Backend
Runtime: Node.js

Framework: Express.js

Database: MongoDB (Mongoose)

Authentication: Passport.js (Google Strategy), JWT (JSON Web Token)

Security: Bcrypt (hashing passwords), CORS

Chức năng chính
Xác thực (Authentication):

Đăng ký / Đăng nhập tài khoản thường.

Đăng nhập nhanh bằng Google (OAuth2).

Quên mật khẩu / Đặt lại mật khẩu qua OTP.

JWT Authentication cho các route bảo mật.

Sản phẩm & Danh mục:

Hiển thị danh sách sản phẩm, chi tiết sản phẩm.

Danh mục sản phẩm đa cấp (Tree structure).

Tìm kiếm sản phẩm theo tên.

Giỏ hàng (Cart):

Thêm, sửa, xóa sản phẩm trong giỏ.

Đồng bộ giỏ hàng với tài khoản người dùng.

Người dùng (User):

Xem và cập nhật thông tin cá nhân (Profile).

Xem lịch sử đơn hàng.
