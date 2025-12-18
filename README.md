                CÁC KIẾN THỨC THU ĐƯỢC SAU BÀI TẬP 1

1. Biết thêm về cách sử dụng hàm console.assert()
+ Cách dùng : console.assert(condition , log)
+ Nếu điều kiện đúng thì hàm không chạy. Nếu điều kiện sai => báo lỗi.
+ Ta nên viết condition là true. Nếu không đúng thì sẽ báo log.

2. Biết cách gọi dữ liệu bằng AJAX
+ Cách dùng $.ajax(url,type,data,beforeRun,success,fail)
+ url : đường dẫn của api
+ type : phương thức : GET,POST,PATCH,PUT,...
+ data : các params của tham số
+ beforeRun : thêm các tham số trước khi gửi đi,thường là token
+ success :  trả về khi thành công
+ fail : trả về khi thất bại
+ ngoài ra nó có thể trả về theo kiểu của promise : then,catch,finally.

3. Học thêm về cách sử lý dữ liệu với filter,map.
+ data.filter(item => condition) : lọc dữ liệu theo điều kiện
+ data.map(item => item.key) : lọc ra một số trường
+ có thể kết hợp filter,map và một số phương thức khác như includes(), reverse(), toLowerCase(),toUpperCase(),split(),replaces(),... để có thể tương tác với mảng dữ liệu

4. Hiểu được một phần cách vẽ biểu đồ bằng CanVas
+ let ctx = canvas.getContext('2d') : lấy được context
+  ctx.fillText(value + unit, x + barWidth / 2, y - 5) : Để thêm text
+ ctx.fillRect(x, y, barWidth, barHeight): để vẽ cột 