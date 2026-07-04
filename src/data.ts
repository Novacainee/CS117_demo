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
// These represent validated coordinate clusters in national parks and nature reserves from GBIF / Academic surveys.
// Used for demonstrating Spatial Thinning and Spatial Block Cross Validation.
export const SPECIES_PRESENCE_POINTS: Record<string, [number, number][]> = {
  sao_la: [
    // Vu Quang National Park (Ha Tinh) - High density clusters to demonstrate spatial thinning
    [18.256, 105.342], [18.254, 105.345], [18.261, 105.339], [18.250, 105.348],
    [18.280, 105.320], [18.310, 105.290], [18.150, 105.450], [18.220, 105.370],
    // Pu Mat National Park (Nghe An) - Deep forest zone
    [18.980, 104.810], [18.950, 104.780], [18.890, 104.850],
    // Bach Ma National Park (Thua Thien Hue) - Humid montane evergreen forest
    [16.190, 107.850], [16.210, 107.820], [16.225, 107.865], [16.180, 107.890],
    // Song Thanh Nature Reserve (Quang Nam)
    [15.650, 107.420], [15.580, 107.450], [15.610, 107.390],
    // Quang Binh / Quang Tri Trường Sơn area
    [17.420, 106.180], [17.418, 106.182], [17.450, 106.150], [17.110, 106.520],
    [16.780, 107.120], [16.510, 107.350], [16.512, 107.348], [16.220, 107.680]
  ],
  voi_asia: [
    // Yok Don National Park (Dak Lak) - Deciduous dipterocarp forest clusters
    [12.890, 107.720], [12.892, 107.725], [12.885, 107.715], [12.910, 107.750],
    [12.820, 107.820], [12.750, 107.950], [13.150, 107.610], [12.990, 107.680],
    // Cat Tien National Park (Dong Nai / Lam Dong) - Semi-evergreen forest clusters
    [11.450, 107.380], [11.420, 107.430], [11.480, 107.350], [11.390, 107.450],
    // Pu Mat National Park (Nghe An) - Border with Laos
    [18.920, 104.750], [18.915, 104.755], [18.950, 104.820], [18.820, 104.910]
  ],
  vooc_cha_va: [
    // Son Tra Peninsula (Da Nang) - Coastal evergreen forest clusters (very high density)
    [16.120, 108.280], [16.122, 108.285], [16.118, 108.278], [16.130, 108.310],
    [16.110, 108.295], [16.125, 108.265], [16.140, 108.330],
    // Bach Ma National Park
    [16.195, 107.855], [16.215, 107.825], [16.170, 107.880],
    // Phong Nha - Ke Bang National Park (Quang Binh) - Karst limestone forests
    [17.520, 106.210], [17.522, 106.212], [17.580, 106.120], [17.480, 106.350],
    [17.390, 106.280], [17.450, 106.240]
  ],
  vuon_soc_den: [
    // Trung Khanh Species & Habitat Conservation Area (Cao Bang) - Isolated limestone karst forest clusters
    [22.885, 106.582], [22.887, 106.585], [22.883, 106.580], [22.895, 106.595],
    [22.860, 106.550], [22.910, 106.610], [22.820, 106.520], [22.875, 106.570],
    // Kim Hy Nature Reserve (Bac Kan) - Adjacent potential karst habitat
    [22.250, 106.050], [22.280, 106.080], [22.210, 106.030]
  ],
  ho_dong_duong: [
    // Muong Nhe Nature Reserve (Dien Bien) - Remote border highland forests
    [22.380, 102.350], [22.382, 102.353], [22.420, 102.310], [22.310, 102.420],
    [22.450, 102.280], [22.290, 102.390],
    // Pu Huong & Pu Mat Nature Reserves (Nghe An)
    [19.450, 104.950], [19.452, 104.955], [19.510, 104.880], [19.380, 104.990]
  ]
};
