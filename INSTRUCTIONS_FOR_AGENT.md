# HƯỚNG DẪN KỸ THUẬT & ĐẶC TẢ BÀI TOÁN: DỰ BÁO SINH CẢNH LOÀI TẠI VIỆT NAM
## (TECHNICAL SPECIFICATION & INSTRUCTIONS FOR CODING AGENT)

Tài liệu này đóng vai trò là một **System Prompt / Technical Specification** hoàn chỉnh để hướng dẫn một AI Agent khác (hoặc chính bạn) phát triển toàn diện hệ thống **WebGIS Dự báo Sinh cảnh Loài (Habitat Suitability Prediction)** tại Việt Nam.

---

## 1. PHÁT BIỂU BÀI TOÁN (PROBLEM STATEMENT)

### 1.1. Mục tiêu tối thượng (Objective)
Xây dựng một hệ thống học máy (Machine Learning Pipeline) tích hợp ứng dụng WebGIS tương tác nhằm dự báo xác suất sinh cảnh phù hợp cho một loài sinh vật mục tiêu tại bất kỳ tọa độ địa lý nào trong ranh giới đất liền Việt Nam:
$$P(Y = 1 \mid X) \in [0, 1]$$
* Trong đó:
  * $Y = 1$: Loài có mặt (Presence).
  * $Y = 0$: Loài vắng mặt (Absence).
  * $X$: Vector chứa các thuộc tính môi trường vĩ mô (Macro-environmental features) trích xuất từ các lớp bản đồ Raster địa lý (Địa hình, Thảm phủ thực vật, Khí hậu, Khoảng cách hạ tầng).

### 1.2. Các yêu cầu phi chức năng cốt lõi (Core Non-Functional Requirements)
* **REQ-1 (Độ chính xác - Accuracy)**: Mô hình học máy phải đạt tối thiểu **85% Accuracy** trên tập kiểm thử phân tách theo khối không gian độc lập (Spatial Block Hold-out).
* **REQ-2 (Thời gian phản hồi - Latency)**: Thời gian truy vấn, trích xuất đặc trưng và trả về điểm số dự báo hiển thị lên bản đồ WebGIS phải dưới **3.0 giây** cho một vùng truy vấn có bán kính lên tới $100\text{ km}$.
* **REQ-3 (Ràng buộc lãnh thổ)**: Từ chối xử lý các truy vấn nằm ngoài biên giới địa lý đất liền/đảo ven bờ của Việt Nam.
* **REQ-4 (Bảo mật loài cực kỳ nguy cấp)**: Đối với các loài được phân loại là Cực kỳ nguy cấp (CR - Critically Endangered) như **Sao la (Pseudoryx nghetinhensis)**, tọa độ thực địa chi tiết phải được ẩn/làm mờ (jittering/blurring) trên bản đồ tương tác đối với người dùng phổ thông, và chỉ hiển thị đầy đủ khi bật chế độ "Ranger/Admin Mode".

---

## 2. KIẾN TRÚC TOÁN HỌC & ĐƯỜNG ỐNG DỮ LIỆU (ALGORITHMIC PIPELINE)

Hệ thống bao gồm 5 Module độc lập tương tác chặt chẽ với nhau:

```
[M1: Quản lý thiên lệch mẫu] ➔ [M2: Trích xuất & Lọc VIF] ➔ [M3: Huấn luyện Không gian] ➔ [M4: Tối ưu Ngưỡng] ➔ [M5: WebGIS & Trực quan]
```

### M1. Quản lý thiên lệch không gian (Spatial Sampling Management)
1. **Spatial Thinning (Lọc thưa không gian)**:
   * Do dữ liệu thực địa thường bị tập trung quá đông ở các vùng dễ đi lại (thiên lệch quan sát), ta áp dụng một lưới địa lý kích thước $1\text{ km} \times 1\text{ km}$ (khoảng $0.00833^\circ$ địa lý).
   * Trên mỗi ô lưới, nếu có nhiều hơn 1 điểm hiện diện ($Y=1$), hệ thống chỉ giữ lại 1 điểm đại diện để giảm thiểu trọng số sai lệch.
2. **Constrained Pseudo-absence Generation (Sinh mẫu giả vắng mặt ràng buộc)**:
   * Do thực tế khảo sát hiếm khi ghi nhận điểm vắng mặt ($Y=0$), hệ thống tự động sinh dữ liệu giả vắng mặt theo tỷ lệ **1 Presence : 2 Pseudo-absences**.
   * Các điểm sinh ra phải thỏa mãn:
     * Khoảng cách địa lý tới điểm hiện diện gần nhất $\ge 2\text{ km}$ (để tránh rò rỉ sinh cảnh lõi).
     * Phù hợp với giới hạn độ cao thực tế của loài (ví dụ: $[0, 1500]\text{ m}$).

### M2. Trích xuất thuộc tính Raster & Lọc đa cộng tuyến
1. **Raster Spatial Sampling**: Trích xuất giá trị tại điểm từ 6 lớp Raster môi trường:
   * **Elevation** (Độ cao địa hình - mét)
   * **Slope** (Độ dốc địa hình - độ)
   * **Aspect** (Hướng sườn địa hình - độ từ $0$ đến $360$)
   * **NDVI** (Chỉ số thảm thực vật - từ $-1$ đến $1$)
   * **Temperature** (Nhiệt độ trung bình - $^\circ\text{C}$)
   * **Distance-to-road** (Khoảng cách đến đường giao thông gần nhất - mét)
2. **Cyclic Encoding (Mã hóa hướng sườn)**:
   * Hướng sườn địa hình (Aspect) có tính chất tuần hoàn tuần hoàn tại biên $0^\circ \equiv 360^\circ$. Để mô hình học máy hiểu chính xác, ta mã hóa lượng giác sang 2 chiều liên tục:
     $$\text{Aspect}_{\sin} = \sin\left(\frac{\theta \cdot \pi}{180}\right), \quad \text{Aspect}_{\cos} = \cos\left(\frac{\theta \cdot \pi}{180}\right)$$
3. **VIF Multicollinearity Filtering (Lọc đa cộng tuyến)**:
   * Tính toán Hệ số phóng đại phương sai (Variance Inflation Factor - VIF) cho từng thuộc tính liên tục:
     $$\text{VIF}_j = \frac{1}{1 - R_j^2}$$
     Trong đó $R_j^2$ là hệ số xác định khi hồi quy biến $X_j$ theo tất cả các biến còn lại.
   * Lặp lại quy trình loại bỏ biến có $\text{VIF} > 20$ cao nhất cho đến khi tất cả các biến giữ lại đạt $\text{VIF} \le 20$.

### M3. Huấn luyện chống rò rỉ thông tin không gian (Spatial Block Hold-out)
1. **Spatial Block CV**:
   * Chia vùng nghiên cứu thành các khối lưới không gian kích thước $2^\circ \times 2^\circ$.
   * Tách tập dữ liệu huấn luyện và tập kiểm thử theo khối địa lý (`GroupShuffleSplit` dựa trên `Block_ID`) để triệt tiêu hiện tượng tự tương quan không gian (spatial autocorrelation) vốn gây ra việc phóng đại độ chính xác ảo.
2. **Stacking Ensemble**:
   * Mô hình sử dụng kỹ thuật Stacking:
     * **Base Learners**: XGBoost & LightGBM (tối ưu hóa siêu tham số 2 giai đoạn bằng Optuna).
     * **Meta Learner**: Logistic Regression đóng vai trò tổ hợp trọng số phi tuyến để đưa ra kết quả xác suất cuối cùng.

### M4. Tối ưu hóa ngưỡng động theo kịch bản (Dynamic Threshold Optimization)
Hệ thống không cố định ngưỡng nhị phân tại $0.5$. Thay vào đó, tìm ngưỡng $t^*$ tối ưu hóa điểm $F_2$-score để ưu tiên bảo tồn (giảm thiểu lỗi bỏ sót loài - False Negative):
$$t^* = \arg\max_{t \in [0, 1]} F_2\left(y, \mathbb{I}(\hat{P} \ge t)\right)$$
Trong đó:
$$F_2 = \frac{5 \cdot \text{Precision} \cdot \text{Recall}}{4 \cdot \text{Precision} + \text{Recall}}$$
* **Kịch bản 1: Bảo tồn diện rộng (Conservation Focus)**: Ưu tiên Recall cao (ngưỡng cắt thấp hơn $t^* \approx 0.40 - 0.45$) nhằm quét sạch toàn bộ vùng tiềm năng có thể có loài.
* **Kịch bản 2: Tuần tra tiết kiệm (Patrol Efficiency)**: Ưu tiên Precision cao (ngưỡng cắt cao hơn $t^* \approx 0.60 - 0.65$) để tối ưu hóa nguồn lực kiểm lâm tuần tra đúng địa điểm sinh cảnh lõi.

---

## 3. THIẾT KẾ HỆ THỐNG MÃ NGUỒN (SYSTEM IMPLEMENTATION DETAILS)

Để đảm bảo khả năng chạy thực tế và đạt độ mượt mà cao, AI Agent cần triển khai trên nền tảng **React (Vite) + Tailwind CSS + Node.js (Express) full-stack**:

### 3.1. Phân chia tệp tin (File Architecture)
* `/server.ts`: Điểm khởi chạy của backend, tích hợp Express API proxy cho dịch vụ Gemini, và chạy các mô phỏng giải thuật sinh thái thực tế.
* `/src/types.ts`: Đặc tả các Interface của Species, Prediction, PipelineLogs, và AI Conversation.
* `/src/components/InteractiveMap.tsx`: Bản đồ WebGIS Việt Nam chất lượng cao sử dụng thư viện Leaflet (nhúng trực tiếp từ CDN thông qua React refs để đảm bảo tương thích 100% với React 19).
* `/src/components/QueryForm.tsx`: Form điều khiển đầu vào (tọa độ, bán kính, kịch bản, loài đích).
* `/src/components/PredictionResult.tsx`: Hiển thị điểm số sinh cảnh HSS, phân tích đặc trưng sinh thái và chỉ số VIF.
* `/src/components/PipelineRunner.tsx`: Trình chạy giả lập huấn luyện và thu thập dữ liệu Raster thời gian thực có hiển thị tiến trình trực quan.
* `/src/components/ConservationAssistant.tsx`: Trợ lý AI bảo tồn thiên nhiên tích hợp mô hình Gemini 3.5-Flash để phản hồi các thắc mắc chuyên sâu về bảo vệ loài dựa trên kết quả sinh cảnh vừa dự đoán.

### 3.2. Ràng buộc Biên giới Việt Nam (Bounding Box Constraint)
Tâm tọa độ truy vấn phải được kiểm tra hợp lệ:
* Vĩ độ: $8.18^\circ \text{N} \le \text{Latitude} \le 23.39^\circ \text{N}$
* Kinh độ: $102.14^\circ \text{E} \le \text{Longitude} \le 109.50^\circ \text{E}$

---
*Tài liệu đặc tả này đã được chuẩn hóa toán học và nghiệp vụ lâm nghiệp sinh thái. Hãy lập trình mã nguồn đáp ứng chính xác 100% các yêu cầu trên.*
