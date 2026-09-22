
```markdown
# Oẳn Tù Tì v2 (OTTv2)

## Giới thiệu

<<<<<<< MinhHieu
OTTv2 là trò chơi chiến thuật nhiều người chơi trên bàn cờ 9x9, được xây dựng bằng HTML, CSS và JavaScript. Trạng thái phòng và ván đấu được đồng bộ giữa các trình duyệt thông qua PlayHTML.

Demo: [Chơi Oẳn Tù Tì v2](https://duckhiem5a3-hue.github.io/Web-programming-group-7-project-1/)

## Tính năng

- Sảnh chờ với 3 lựa chọn:
  - **Ghép ngẫu nhiên:** vào một phòng đang có 1 người; nếu chưa có phòng chờ thì tạo phòng mới.
  - **Nhập mã phòng:** chỉ vào được phòng tồn tại và đang có đúng 1 người chờ.
  - **Tạo phòng mới:** luôn tạo một phòng mới với mã riêng.
- Mỗi phòng tối đa 2 người chơi.
- Người đầu tiên là phe Đỏ, người thứ hai là phe Xanh.
- Bàn cờ chỉ hiển thị sau khi người chơi đã vào phòng.
- Hiển thị rõ người chơi đang là quân Đỏ hay quân Xanh.
- Đồng bộ bàn cờ và lượt chơi giữa hai người.
- Phòng rỗng được xóa khỏi lobby.
- Khi một người rời phòng, bàn cờ reset và slot được giải phóng.
- Nút chơi lại yêu cầu cả hai người cùng đồng ý.
- Ô đích của phe Đỏ là `a1`; ô đích của phe Xanh là `i9`.
- Giao diện hỗ trợ máy tính và thiết bị di động.
=======
**Oẳn Tù Tì v2 (OTTv2)** là trò chơi cờ oẳn tù tì trực tuyến trên bàn cờ 9×9, hỗ trợ hai người chơi thi đấu realtime trên nhiều thiết bị khác nhau nhờ thư viện **PlayHTML**.

Ứng dụng cho phép tạo và tham gia nhiều phòng chơi riêng biệt thông qua **Mã phòng (Room ID)** hoặc **URL link**.

---

### 🌐 Demo & Deploy

Bạn có thể trải nghiệm trò chơi tại:
👉 **[Link Demo - GitHub Pages](https://duckhiem5a3-hue.github.io/Web-programming-group-7-project-1/)**
>>>>>>> main

## Luật chơi

<<<<<<< MinhHieu
- Mỗi lượt, người chơi chọn một quân thuộc phe của mình rồi chọn một ô liền kề theo 8 hướng.
- Không được di chuyển vào quân cùng phe.
- Khi hai quân khác phe giao chiến, luật thắng là:

```text
Đá thắng Kéo
Giấy thắng Đá
Kéo thắng Giấy
```

- Phe Đỏ thắng khi đưa quân Đỏ vào `a1`.
- Phe Xanh thắng khi đưa quân Xanh vào `i9`.
- Một phe cũng có thể thắng khi đối phương mất một loại quân theo điều kiện của trò chơi.

## Cách chơi

1. Mở trang web hoặc link demo.
2. Chọn một trong ba cách vào phòng ở sảnh chờ.
3. Nếu tạo phòng hoặc ghép ngẫu nhiên, gửi link có mã phòng cho người chơi thứ hai khi cần.
4. Chờ đủ 2 người. Người đầu tiên chơi phe Đỏ, người thứ hai chơi phe Xanh.
5. Chỉ phe đúng lượt mới có thể chọn và di chuyển quân.

### Chơi lại

Khi muốn bắt đầu lại ván:

1. Một người bấm **Chơi lại từ đầu**.
2. Người còn lại bấm **Đồng ý chơi lại**.
3. Bàn cờ chỉ reset sau khi cả hai người đã xác nhận.

## Công nghệ

- HTML5
- CSS3
- JavaScript ES Modules
- [PlayHTML](https://unpkg.com/playhtml) để đồng bộ dữ liệu giữa các trình duyệt
- GitHub Pages để deploy

## Kiến trúc đồng bộ

Ứng dụng sử dụng hai loại kênh PlayHTML:

- `ottv2-lobby`: lưu danh sách phòng và người chơi trong từng phòng.
- `ottv2-game-state-{roomCode}`: lưu trạng thái bàn cờ của từng phòng.

Trạng thái ván đấu gồm các dữ liệu chính:

```javascript
{
    board: boardState,
    currentTeam: "red" | "blue",
    isGameOver: boolean,
    resetVotes: string[]
}
```

Mỗi người chơi gửi heartbeat định kỳ. Nếu người chơi rời trang hoặc không còn heartbeat trong một khoảng thời gian, người đó được loại khỏi phòng. Khi phòng không còn người, bản ghi phòng bị xóa khỏi lobby.

## Cấu trúc dự án

```text
Web-programming-group-7-project-1/
├── index.html   # Giao diện sảnh chờ và bàn cờ
├── main.js      # Logic phòng, đồng bộ và luật chơi
├── style.css    # Giao diện responsive
└── README.md    # Tài liệu dự án
```

## Chạy local

Khuyến nghị chạy bằng một web server local vì ứng dụng sử dụng JavaScript module và tải PlayHTML từ CDN.

### VS Code Live Server

1. Cài extension **Live Server**.
2. Mở file `index.html`.
3. Chọn **Open with Live Server**.

### Web server khác

Từ thư mục dự án, có thể dùng một web server tĩnh bất kỳ. Ví dụ với Python:

```bash
python -m http.server 8000
```

Sau đó mở:

```text
http://localhost:8000
```

## Kiểm tra nhiều người chơi

1. Mở ứng dụng trên hai trình duyệt hoặc hai cửa sổ riêng.
2. Người chơi thứ nhất chọn **Tạo phòng mới** hoặc **Ghép ngẫu nhiên**.
3. Người chơi thứ hai nhập mã phòng hoặc chọn **Ghép ngẫu nhiên**.
4. Kiểm tra hai người nhận lần lượt phe Đỏ và phe Xanh.
5. Thử đóng một cửa sổ để kiểm tra slot phòng được giải phóng và bàn cờ reset.
=======
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
>>>>>>> main

## Thành viên

<<<<<<< MinhHieu
**Group 7 - Web Programming Project 1**

| STT | Họ và tên | MSSV |
| --: | --- | ---: |
| 1 | Lê Bá Minh Hiếu | 24020125 |
| 2 | Nguyễn Đức Khiêm | 24020180 |
| 3 | Dương Nguyễn Đức Huy | 24022799 |
| 4 | Nguyễn Doãn Dũng | 24020089 |
=======
| STT | Họ và tên | MSSV |
| --- | --- | --- |
| 1 | Lê Bá Minh Hiếu | 24020125 |
| 2 | Nguyễn Đức Khiêm | 24020180 |
| 3 | Dương Nguyễn Đức Huy | 24022799 |
| 4 | Nguyễn Doãn Dũng | 24020089 |

```

```
>>>>>>> main
