# Oẳn Tù Tì v2 (OTTv2)

## 🎮 Giới thiệu

**Oẳn Tù Tì v2 (OTTv2)** là một trò chơi oẳn tù tì được xây dựng bằng HTML, CSS và JavaScript, hỗ trợ đồng bộ trạng thái trò chơi giữa nhiều thiết bị thông qua PlayHTML.

### 🌐 Demo

Bạn có thể truy cập phiên bản đã deploy tại:

**[👉 Chơi Oẳn Tù Tì v2](https://duckhiem5a3-hue.github.io/Web-programming-group-7-project-1/)**

---

## ✨ Tính năng

* 🎮 Trò chơi Oẳn Tù Tì trên bàn cờ 9×9.
* 🔴🔵 Hai đội: Đỏ và Xanh.
* ✊ Đá, ✋ Giấy, ✌️ Kéo.
* 🔄 Luân phiên lượt chơi giữa hai đội.
* 🌐 Đồng bộ trạng thái trò chơi giữa các thiết bị.
* 🏆 Kiểm tra điều kiện chiến thắng tự động.
* 📱 Giao diện responsive, hỗ trợ cả máy tính và điện thoại.

## 🛠️ Công nghệ sử dụng

* **HTML5**
* **CSS3**
* **JavaScript**
* **PlayHTML** – đồng bộ dữ liệu giữa các phiên trình duyệt.

## 📁 Cấu trúc dự án

```text
OTTv2/
├── index.html
├── main.js
├── style.css
└── README.md
```

## 🌐 Cơ chế đồng bộ

Ứng dụng sử dụng **PlayHTML** để chia sẻ trạng thái trò chơi giữa những người chơi.

Trạng thái được đồng bộ bao gồm:

```javascript
{
    board: boardState,
    currentTeam: currentTeam,
    isGameOver: isGameOver
}
```

Khi một người chơi thực hiện nước đi:

```text
Thiết bị A
   ↓
Thực hiện nước đi
   ↓
Cập nhật game state
   ↓
PlayHTML
   ↓
Thiết bị B
   ↓
Cập nhật bàn cờ
```

Nhờ đó, các thiết bị đang truy cập cùng phòng có thể nhìn thấy trạng thái trò chơi được cập nhật.

## 🎯 Luật di chuyển

* Mỗi quân chỉ có thể di chuyển sang ô liền kề.
* Không thể di chuyển vào quân cùng loại.
* Hai quân khác đội có thể giao chiến.
* Kết quả giao chiến dựa trên luật:

```text
✊ Đá thắng ✌️ Kéo
✋ Giấy thắng ✊ Đá
✌️ Kéo thắng ✋ Giấy
```

## 🏆 Điều kiện chiến thắng

Người chơi có thể chiến thắng khi:

* Đưa quân đến vị trí đích tương ứng.
* Hoặc loại bỏ được các loại quân của đối phương theo luật của trò chơi.

## 🚀 Chạy project

### Cách 1: Chạy trực tiếp

Mở file:

```text
index.html
```

bằng trình duyệt.

### Cách 2: Sử dụng VS Code

Cài extension **Live Server**, sau đó:

```text
Right click index.html
→ Open with Live Server
```

## 🌐 Deploy

Project hiện đã được deploy bằng **GitHub Pages**.

**Link:**
https://duckhiem5a3-hue.github.io/Web-programming-group-7-project-1/

Bạn có thể mở link trên nhiều thiết bị để kiểm tra khả năng đồng bộ trò chơi.

## 🧪 Kiểm tra đồng bộ

1. Mở link deploy trên **thiết bị A**.
2. Mở cùng link trên **thiết bị B**.
3. Thực hiện một nước đi trên thiết bị A.
4. Kiểm tra bàn cờ trên thiết bị B.
5. Trạng thái bàn cờ và lượt chơi sẽ được đồng bộ.

> Lưu ý: phiên bản hiện tại sử dụng một room cố định là `ottv2-main-room`, vì vậy những người truy cập cùng phiên bản deploy sẽ tham gia cùng một room.

## 🔮 Hướng phát triển

Một số tính năng có thể phát triển trong tương lai:

* Tạo phòng riêng.
* Tham gia phòng bằng mã phòng.
* Phân quyền người chơi Đỏ/Xanh.
* Lobby trước khi bắt đầu trận.
* Chức năng chơi lại.
* Hiển thị người chơi đang online.
* Đồng hồ đếm ngược lượt.
* Lịch sử nước đi.
* Chat giữa người chơi.
* Lưu lịch sử trận đấu.

## 🎓 Mục tiêu học tập

Project được thực hiện nhằm thực hành:

* HTML/CSS/JavaScript.
* Xử lý sự kiện trong JavaScript.
* Quản lý state của ứng dụng.
* Đồng bộ dữ liệu giữa các client.
* Làm việc với Git/GitHub.
* Deploy project bằng GitHub Pages.
* Làm việc nhóm và quản lý source code.

## 👨‍💻 Thành viên

**Group 7 – Web Programming Project 1**

| STT | Họ và tên            |     MSSV |
| --: | -------------------- | -------: |
|   1 | Lê Bá Minh Hiếu      | 24020125 |
|   2 | Nguyễn Đức Khiêm     | 24020180 |
|   3 | Dương Nguyễn Đức Huy | 24022799 |
|   4 | Nguyễn Doãn Dũng     | 24020089 |

