
```markdown
# Oẳn Tù Tì v2 (OTTv2)

## 🎮 Giới thiệu

**Oẳn Tù Tì v2 (OTTv2)** là trò chơi cờ oẳn tù tì trực tuyến trên bàn cờ 9×9, hỗ trợ hai người chơi thi đấu realtime trên nhiều thiết bị khác nhau nhờ thư viện **PlayHTML**.

Ứng dụng cho phép tạo và tham gia nhiều phòng chơi riêng biệt thông qua **Mã phòng (Room ID)** hoặc **URL link**.

---

### 🌐 Demo & Deploy

Bạn có thể trải nghiệm trò chơi tại:
👉 **[Link Demo - GitHub Pages](https://duckhiem5a3-hue.github.io/Web-programming-group-7-project-1/)**

---

## ✨ Tính năng nổi bật

* 🌐 **Phân chia Đa phòng (Multi-Room):** Tạo và tham gia nhiều ván game riêng biệt cùng lúc bằng Mã phòng (Room ID) hoặc chia sẻ Link.
* 📋 **Copy Link Mời Chơi:** Nút sao chép đường dẫn phòng chơi giúp mời bạn bè vào trận nhanh chóng.
* 🏁 **Trực quan hóa Ô Đích:** 
  * Ô **a1** được đánh dấu màu xanh nhạt + nhãn `a1 🏁` (Ô đích cho Phe Xanh).
  * Ô **i9** được đánh dấu màu đỏ nhạt + nhãn `i9 🏁` (Ô đích cho Phe Đỏ).
* 🔄 **Đồng bộ Realtime:** Cập nhật trạng thái bàn cờ và lượt đi giữa các thiết bị thông qua PlayHTML.
* 🏆 **Tự động kiểm tra thắng/thua:** Theo đúng luật chơi (chiếm ô đích hoặc ăn hết một loại quân của đối phương).
* 📱 **Giao diện Responsive:** Tối ưu hiển thị trên cả máy tính và điện thoại di động.

---

## 🛠️ Công nghệ sử dụng

* **HTML5 / CSS3 / JavaScript (ES6 Modules)**
* **PlayHTML** (Đồng bộ dữ liệu trạng thái ván đấu qua kênh WebSocket/Data Channel)
* **GitHub Pages** (Hosting & Deploy)

---

## 📁 Cấu trúc dự án

```text
OTTv2/
├── index.html   # Giao diện bàn cờ và khu vực Quản lý phòng
├── main.js      # Logic trò chơi, tạo/vào phòng & đồng bộ PlayHTML
├── style.css    # Layout bàn cờ, hiệu ứng chọn quân & đánh dấu ô đích a1/i9
└── README.md    # Tài liệu hướng dẫn dự án

```

---

## 🎲 Luật chơi & Điều kiện thắng

### 1. Di chuyển & Ăn quân

* Mỗi quân cờ có thể di chuyển **1 ô theo 8 hướng** (giống quân Vua trong Cờ Vua).
* **Quy tắc ăn quân:**
* ✊ **Đá** ăn ✌️ **Kéo**
* ✌️ **Kéo** ăn ✋ **Giấy**
* ✋ **Giấy** ăn ✊ **Đá**


* Hai quân cùng loại hoặc hai quân cùng đội **không thể ăn nhau** mà chỉ đứng chặn đường.

### 2. Điều kiện chiến thắng

Một đội sẽ giành chiến thắng ngay lập tức khi đạt một trong hai điều kiện:

1. **Đưa quân vào ô đích đối phương:**
* Phe **Đỏ** đưa bất kỳ quân nào vào ô **i9** (góc trên bên phải).
* Phe **Xanh** đưa bất kỳ quân nào vào ô **a1** (góc dưới bên trái).


2. **Triệt hạ quân đối phương:** Ăn sạch hoàn toàn **1 loại quân** (Đá, Giấy hoặc Kéo) của phe đối phương.

---

## 🌐 Cơ chế Phân phòng & Đồng bộ (PlayHTML)

Mỗi phòng chơi được định danh bằng một **Mã phòng** ngẫu nhiên trên đường dẫn URL (ví dụ: `?room=G6IV4Z`).

```text
Người chơi A (Tạo phòng G6IV4Z)
       │
       ├──► Link: [domain.com/?room=G6IV4Z](https://domain.com/?room=G6IV4Z)
       │
       ▼
  PlayHTML Room: "ottv2-room-G6IV4Z"
       ▲
       │
Người chơi B (Nhập mã hoặc Click link)

```

Trạng thái ván đấu được đồng bộ gồm:

```javascript
{
    board: boardState,     // Mảng 2D 9x9 lưu vị trí các quân cờ
    currentTeam: "red",    // Đội đang đến lượt ("red" hoặc "blue")
    isGameOver: false      // Trạng thái kết thúc trận đấu
}

```

---

## 🚀 Hướng dẫn chạy dự án

### Cách 1: Chạy trực tiếp qua Live Server (VS Code)

1. Mở thư mục dự án trong **VS Code**.
2. Cài đặt extension **Live Server**.
3. Chuột phải vào file `index.html` chọn **Open with Live Server**.

### Cách 2: Kiểm tra tính năng Multi-room

1. Mở đường dẫn trang web trên trình duyệt.
2. Bấm nút **📋 Copy Link mời** và gửi sang một tab/thiết bị khác.
3. Thử di chuyển quân trên thiết bị thứ nhất, bàn cờ trên thiết bị thứ hai sẽ tự động cập nhật.
4. Bấm **➕ Tạo phòng mới** nếu muốn bắt đầu một ván đấu riêng biệt khác.

---

## 👨‍💻 Thành viên thực hiện

**Group 7 – Web Programming Project 1**

| STT | Họ và tên | MSSV |
| --- | --- | --- |
| 1 | Lê Bá Minh Hiếu | 24020125 |
| 2 | Nguyễn Đức Khiêm | 24020180 |
| 3 | Dương Nguyễn Đức Huy | 24022799 |
| 4 | Nguyễn Doãn Dũng | 24020089 |

```

```
