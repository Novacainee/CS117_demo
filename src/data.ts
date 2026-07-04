/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Species } from './types';

export const SUPPORTED_SPECIES: Species[] = [
  {
    id: 'sao_la',
    name: 'Sao La',
    scientificName: 'Pseudoryx nghetinhensis',
    iucnStatus: 'CR',
    statusLabel: 'Cực kỳ nguy cấp (Critically Endangered)',
    description: 'Sao La được mệnh danh là Kỳ lân châu Á, phát hiện lần đầu vào năm 1992 tại Vườn Quốc gia Vũ Quang (Hà Tĩnh). Sống dọc theo dãy Trường Sơn hiểm trở nằm ở biên giới Việt - Lào.',
    preferredElevation: [200, 1200],
    preferredTemp: [18, 24],
    preferredNdvi: [0.65, 0.95],
    preferredSlope: [15, 45],
    isHighlySensitive: true,
  },
  {
    id: 'voi_asia',
    name: 'Voi Châu Á',
    scientificName: 'Elephas maximus',
    iucnStatus: 'EN',
    statusLabel: 'Nguy cấp (Endangered)',
    description: 'Phân bố chủ yếu tại khu vực Tây Nguyên (Đắk Lắk) và miền tây Nghệ An. Đang bị đe dọa nghiêm trọng bởi nạn phá rừng, mất hành lang di cư và xung đột với con người.',
    preferredElevation: [100, 800],
    preferredTemp: [22, 28],
    preferredNdvi: [0.55, 0.85],
    preferredSlope: [2, 18],
    isHighlySensitive: false,
  },
  {
    id: 'vooc_cha_va',
    name: 'Voọc Chà Vá Chân Nâu',
    scientificName: 'Pygathrix nemaeus',
    iucnStatus: 'CR',
    statusLabel: 'Cực kỳ nguy cấp (Critically Endangered)',
    description: 'Loài linh trưởng có màu sắc rực rỡ nhất thế giới, được coi là Nữ hoàng linh trưởng. Thường thấy tại bán đảo Sơn Trà (Đà Nẵng) và VQG Phong Nha - Kẻ Bàng (Quảng Bình).',
    preferredElevation: [50, 600],
    preferredTemp: [20, 26],
    preferredNdvi: [0.6, 0.9],
    preferredSlope: [10, 35],
    isHighlySensitive: true,
  },
  {
    id: 'vuon_soc_den',
    name: 'Vượn Sóc Đen Đông Bắc',
    scientificName: 'Nomascus nasutus',
    iucnStatus: 'CR',
    statusLabel: 'Cực kỳ nguy cấp (Critically Endangered)',
    description: 'Một trong những loài linh trưởng hiếm nhất thế giới. Chỉ còn tồn tại quần thể cực nhỏ khoảng hơn 100 cá thể tại khu bảo tồn loài sinh cảnh Trùng Khánh (Cao Bằng).',
    preferredElevation: [400, 1000],
    preferredTemp: [16, 22],
    preferredNdvi: [0.7, 0.9],
    preferredSlope: [20, 50],
    isHighlySensitive: true,
  },
  {
    id: 'ho_dong_duong',
    name: 'Hổ Đông Dương',
    scientificName: 'Panthera tigris corbetti',
    iucnStatus: 'CR',
    statusLabel: 'Cực kỳ nguy cấp (Cực hiếm)',
    description: 'Loài thú ăn thịt lớn nhất, từng có phân bố rộng khắp Việt Nam nhưng hiện tại cực kỳ hiếm gặp ngoài tự nhiên. Cần bảo tồn nghiêm ngặt sinh cảnh rừng đặc dụng biên giới.',
    preferredElevation: [300, 1500],
    preferredTemp: [18, 25],
    preferredNdvi: [0.6, 0.9],
    preferredSlope: [10, 30],
    isHighlySensitive: true,
  },
];

// Realistic presence points inside Vietnam's forests for each species
// These will be used for demonstrating Spatial Thinning and Spatial Block Cross Validation
export const SPECIES_PRESENCE_POINTS: Record<string, [number, number][]> = {
  sao_la: [
    // Vu Quang, Ha Tinh area
    [18.256, 105.342], [18.254, 105.345], [18.261, 105.339], [18.250, 105.348], // close points to show thinning
    [18.280, 105.320], [18.310, 105.290], [18.150, 105.450],
    // Quang Binh / Quang Tri Trường Sơn area
    [17.420, 106.180], [17.418, 106.182], [17.450, 106.150], [17.110, 106.520],
    [16.780, 107.120], [16.510, 107.350], [16.512, 107.348], [16.220, 107.680],
  ],
  voi_asia: [
    // Yok Don National Park, Dak Lak
    [12.890, 107.720], [12.892, 107.725], [12.885, 107.715], [12.910, 107.750],
    [12.820, 107.820], [12.750, 107.950], [13.150, 107.610],
    // Pu Mat National Park, Nghe An
    [18.920, 104.750], [18.915, 104.755], [18.950, 104.820], [18.820, 104.910],
  ],
  vooc_cha_va: [
    // Son Tra Peninsula, Da Nang
    [16.120, 108.280], [16.122, 108.285], [16.118, 108.278], [16.130, 108.310],
    // Bach Ma National Park
    [16.190, 107.850], [16.210, 107.820],
    // Phong Nha Ke Bang, Quang Binh
    [17.520, 106.210], [17.522, 106.212], [17.580, 106.120], [17.480, 106.350],
  ],
  vuon_soc_den: [
    // Trung Khanh, Cao Bang
    [22.885, 106.582], [22.887, 106.585], [22.883, 106.580], [22.895, 106.595],
    [22.860, 106.550], [22.910, 106.610], [22.820, 106.520],
  ],
  ho_dong_duong: [
    // Muong Nhe, Dien Bien
    [22.380, 102.350], [22.382, 102.353], [22.420, 102.310], [22.310, 102.420],
    // Pu Huong, Nghe An
    [19.450, 104.950], [19.452, 104.955], [19.510, 104.880],
  ]
};
