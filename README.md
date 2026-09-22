# Oẳn Tù Tì v2 (OTTv2)

## Giới thiệu

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

## Luật chơi

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

## Thành viên

**Group 7 - Web Programming Project 1**

| STT | Họ và tên | MSSV |
| --: | --- | ---: |
| 1 | Lê Bá Minh Hiếu | 24020125 |
| 2 | Nguyễn Đức Khiêm | 24020180 |
| 3 | Dương Nguyễn Đức Huy | 24022799 |
| 4 | Nguyễn Doãn Dũng | 24020089 |
