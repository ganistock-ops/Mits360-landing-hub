/**
 * MITS 360 Market Intelligence - Alpha Terminal Mock EOD Dataset
 * Universes: Nifty 50, F&O Stocks, Nifty 100, Nifty 500
 * Core Sectors: 10 Indian Core Sectors with realistic EOD market values
 */

const SECTOR_DATA = [
  { id: "banking", name: "Nifty Bank", code: "BANKING", change: 1.24, marketCapCr: 3840000, icon: "landmark" },
  { id: "it", name: "Nifty IT", code: "IT", change: -0.82, marketCapCr: 2950000, icon: "cpu" },
  { id: "auto", name: "Nifty Auto", code: "AUTO", change: 1.88, marketCapCr: 1820000, icon: "car" },
  { id: "energy", name: "Nifty Energy", code: "ENERGY", change: 0.65, marketCapCr: 3120000, icon: "zap" },
  { id: "metals", name: "Nifty Metal", code: "METALS", change: 2.45, marketCapCr: 1240000, icon: "layers" },
  { id: "pharma", name: "Nifty Pharma", code: "PHARMA", change: -0.45, marketCapCr: 1450000, icon: "activity" },
  { id: "fmcg", name: "Nifty FMCG", code: "FMCG", change: 0.18, marketCapCr: 2180000, icon: "shopping-bag" },
  { id: "realty", name: "Nifty Realty", code: "REALTY", change: 3.12, marketCapCr: 480000, icon: "home" },
  { id: "finserv", name: "Nifty Fin Services", code: "FINSERV", change: 1.05, marketCapCr: 3410000, icon: "shield" },
  { id: "infra", name: "Nifty Infra", code: "INFRA", change: 0.92, marketCapCr: 1980000, icon: "truck" }
];

const STOCKS_DATA = [
  // BANKING
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "banking", price: 1684.50, change: 1.42, volume: "18.4M", volMul: 1.35, high: 1692.00, low: 1665.10, high52: 1794.00, low52: 1363.55, pe: 19.8, delivery: "64.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "banking", price: 1248.80, change: 2.15, volume: "15.1M", volMul: 1.62, high: 1254.00, low: 1222.00, high52: 1301.00, low52: 915.00, pe: 18.2, delivery: "58.1%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "SBIN", name: "State Bank of India", sector: "banking", price: 812.30, change: 0.95, volume: "22.8M", volMul: 1.10, high: 819.50, low: 804.00, high52: 912.00, low52: 555.00, pe: 10.4, delivery: "49.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "banking", price: 1774.20, change: -0.38, volume: "4.2M", volMul: 0.88, high: 1792.00, low: 1765.00, high52: 1925.00, low52: 1544.00, pe: 21.6, delivery: "61.3%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", sector: "banking", price: 1198.60, change: 1.68, volume: "9.6M", volMul: 1.25, high: 1205.00, low: 1178.50, high52: 1339.65, low52: 975.00, pe: 14.1, delivery: "53.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", sector: "banking", price: 1342.10, change: -1.85, volume: "6.8M", volMul: 1.45, high: 1370.00, low: 1335.00, high52: 1694.00, low52: 1280.00, pe: 13.5, delivery: "42.1%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "FEDERALBNK", name: "The Federal Bank Ltd", sector: "banking", price: 198.40, change: 2.80, volume: "14.2M", volMul: 1.82, high: 201.20, low: 193.50, high52: 206.00, low52: 132.00, pe: 11.2, delivery: "51.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank", sector: "banking", price: 74.25, change: -0.90, volume: "31.0M", volMul: 0.95, high: 75.80, low: 73.60, high52: 94.00, low52: 70.50, pe: 17.8, delivery: "38.9%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "PNB", name: "Punjab National Bank", sector: "banking", price: 112.40, change: 1.90, volume: "45.1M", volMul: 1.30, high: 114.20, low: 109.80, high52: 142.90, low52: 67.00, pe: 8.9, delivery: "36.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "BANKBARODA", name: "Bank of Baroda", sector: "banking", price: 248.50, change: 1.15, volume: "16.5M", volMul: 1.05, high: 251.00, low: 245.20, high52: 298.00, low52: 188.00, pe: 6.8, delivery: "44.2%", universes: ["fno", "nifty100", "nifty500"] },

  // IT SECTOR
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "it", price: 4235.00, change: -0.65, volume: "2.8M", volMul: 0.90, high: 4280.00, low: 4210.00, high52: 4585.00, low52: 3313.00, pe: 31.4, delivery: "68.4%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "INFY", name: "Infosys Ltd", sector: "it", price: 1886.40, change: -1.12, volume: "7.4M", volMul: 1.15, high: 1915.00, low: 1878.00, high52: 1991.45, low52: 1358.35, pe: 28.5, delivery: "62.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", sector: "it", price: 1785.60, change: 0.42, volume: "3.1M", volMul: 1.02, high: 1802.00, low: 1770.00, high52: 1850.00, low52: 1205.00, pe: 26.2, delivery: "57.3%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "WIPRO", name: "Wipro Ltd", sector: "it", price: 532.10, change: -1.75, volume: "8.9M", volMul: 1.20, high: 544.00, low: 529.00, high52: 579.90, low52: 375.00, pe: 24.1, delivery: "48.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", sector: "it", price: 1612.00, change: -0.95, volume: "2.4M", volMul: 0.98, high: 1635.00, low: 1602.00, high52: 1690.00, low52: 1098.00, pe: 42.0, delivery: "54.1%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "LTIM", name: "LTIMindtree Ltd", sector: "it", price: 5980.00, change: 1.10, volume: "1.2M", volMul: 1.40, high: 6040.00, low: 5910.00, high52: 6442.00, low52: 4515.00, pe: 34.8, delivery: "59.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd", sector: "it", price: 5240.00, change: 2.30, volume: "980K", volMul: 1.75, high: 5310.00, low: 5120.00, high52: 5500.00, low52: 3300.00, pe: 48.2, delivery: "46.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "COFORGE", name: "Coforge Ltd", sector: "it", price: 7450.00, change: -2.40, volume: "850K", volMul: 1.60, high: 7680.00, low: 7390.00, high52: 8100.00, low52: 4287.00, pe: 46.5, delivery: "51.8%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "MPHASIS", name: "Mphasis Ltd", sector: "it", price: 2980.00, change: -1.35, volume: "1.1M", volMul: 0.90, high: 3040.00, low: 2960.00, high52: 3200.00, low52: 2150.00, pe: 32.1, delivery: "43.0%", universes: ["fno", "nifty100", "nifty500"] },

  // AUTO SECTOR
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "auto", price: 978.40, change: 2.85, volume: "14.8M", volMul: 1.70, high: 986.00, low: 950.00, high52: 1179.00, low52: 605.00, pe: 9.8, delivery: "47.8%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "M&M", name: "Mahindra & Mahindra", sector: "auto", price: 3045.00, change: 3.40, volume: "4.5M", volMul: 1.95, high: 3068.00, low: 2940.00, high52: 3220.00, low52: 1480.00, pe: 29.4, delivery: "56.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "MARUTI", name: "Maruti Suzuki India", sector: "auto", price: 12280.00, change: 0.85, volume: "820K", volMul: 1.05, high: 12390.00, low: 12150.00, high52: 13680.00, low52: 9735.00, pe: 26.5, delivery: "64.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", sector: "auto", price: 11450.00, change: 1.95, volume: "650K", volMul: 1.40, high: 11580.00, low: 11200.00, high52: 12774.00, low52: 4850.00, pe: 36.2, delivery: "58.4%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd", sector: "auto", price: 4790.00, change: 1.20, volume: "910K", volMul: 1.15, high: 4835.00, low: 4720.00, high52: 5100.00, low52: 3260.00, pe: 32.8, delivery: "52.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", sector: "auto", price: 5420.00, change: -0.75, volume: "740K", volMul: 0.85, high: 5490.00, low: 5390.00, high52: 6245.00, low52: 2925.00, pe: 27.1, delivery: "49.1%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "TVSMOTOR", name: "TVS Motor Company", sector: "auto", price: 2720.00, change: 2.65, volume: "1.9M", volMul: 1.55, high: 2750.00, low: 2640.00, high52: 2950.00, low52: 1450.00, pe: 48.0, delivery: "43.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "BHARATFORG", name: "Bharat Forge Ltd", sector: "auto", price: 1410.00, change: -1.25, volume: "1.4M", volMul: 0.90, high: 1445.00, low: 1395.00, high52: 1825.00, low52: 980.00, pe: 39.5, delivery: "41.0%", universes: ["fno", "nifty100", "nifty500"] },

  // ENERGY SECTOR
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "energy", price: 2985.00, change: 0.82, volume: "9.2M", volMul: 1.18, high: 3010.00, low: 2962.00, high52: 3217.90, low52: 2221.00, pe: 27.9, delivery: "61.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "NTPC", name: "NTPC Ltd", sector: "energy", price: 418.60, change: 1.35, volume: "18.5M", volMul: 1.25, high: 422.00, low: 411.50, high52: 448.00, low52: 232.00, pe: 17.5, delivery: "55.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "POWERGRID", name: "Power Grid Corp", sector: "energy", price: 338.40, change: 0.45, volume: "14.1M", volMul: 0.92, high: 341.50, low: 335.00, high52: 366.25, low52: 195.00, pe: 19.8, delivery: "63.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", sector: "energy", price: 294.50, change: -1.10, volume: "24.0M", volMul: 1.05, high: 299.80, low: 292.10, high52: 344.75, low52: 178.00, pe: 7.2, delivery: "45.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BPCL", name: "Bharat Petroleum Corp", sector: "energy", price: 352.80, change: -0.85, volume: "12.8M", volMul: 0.88, high: 358.00, low: 350.50, high52: 395.00, low52: 165.00, pe: 7.8, delivery: "48.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "COALINDIA", name: "Coal India Ltd", sector: "energy", price: 492.10, change: 1.70, volume: "15.6M", volMul: 1.32, high: 497.00, low: 483.00, high52: 543.55, low52: 275.00, pe: 8.5, delivery: "52.8%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "IOC", name: "Indian Oil Corp", sector: "energy", price: 174.20, change: 0.25, volume: "19.2M", volMul: 0.94, high: 176.50, low: 172.80, high52: 196.80, low52: 86.00, pe: 7.4, delivery: "46.1%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "TATAPOWER", name: "Tata Power Co Ltd", sector: "energy", price: 442.50, change: 2.10, volume: "16.4M", volMul: 1.45, high: 448.00, low: 432.00, high52: 494.85, low52: 236.00, pe: 34.0, delivery: "40.5%", universes: ["fno", "nifty100", "nifty500"] },

  // METALS SECTOR
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", sector: "metals", price: 156.40, change: 3.15, volume: "42.0M", volMul: 1.85, high: 158.20, low: 151.80, high52: 184.60, low52: 114.60, pe: 28.5, delivery: "48.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", sector: "metals", price: 984.50, change: 2.60, volume: "5.4M", volMul: 1.50, high: 994.00, low: 958.00, high52: 1040.00, low52: 742.00, pe: 24.1, delivery: "51.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "HINDALCO", name: "Hindalco Industries", sector: "metals", price: 712.00, change: 2.90, volume: "9.8M", volMul: 1.65, high: 720.00, low: 692.00, high52: 772.00, low52: 450.00, pe: 14.8, delivery: "54.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "VEDL", name: "Vedanta Ltd", sector: "metals", price: 472.30, change: 3.80, volume: "26.5M", volMul: 2.10, high: 478.00, low: 452.00, high52: 524.00, low52: 208.00, pe: 11.2, delivery: "39.4%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "JINDALSTEL", name: "Jindal Steel & Power", sector: "metals", price: 998.00, change: 1.85, volume: "4.2M", volMul: 1.30, high: 1012.00, low: 978.00, high52: 1080.00, low52: 620.00, pe: 16.5, delivery: "46.8%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "NMDC", name: "NMDC Ltd", sector: "metals", price: 228.40, change: -0.45, volume: "11.2M", volMul: 0.85, high: 232.00, low: 226.50, high52: 286.00, low52: 138.00, pe: 10.1, delivery: "42.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "SAIL", name: "Steel Authority of India", sector: "metals", price: 134.80, change: -1.15, volume: "28.0M", volMul: 1.10, high: 138.00, low: 133.20, high52: 175.00, low52: 82.00, pe: 13.4, delivery: "34.5%", universes: ["fno", "nifty500"] },

  // PHARMA SECTOR
  { symbol: "SUNPHARMA", name: "Sun Pharma Industries", sector: "pharma", price: 1845.00, change: 0.75, volume: "3.2M", volMul: 1.05, high: 1862.00, low: 1828.00, high52: 1960.00, low52: 1080.00, pe: 38.2, delivery: "61.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "DRREDDY", name: "Dr. Reddy's Labs", sector: "pharma", price: 6540.00, change: -1.25, volume: "920K", volMul: 1.12, high: 6650.00, low: 6490.00, high52: 7100.00, low52: 5210.00, pe: 19.5, delivery: "57.4%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "CIPLA", name: "Cipla Ltd", sector: "pharma", price: 1610.00, change: -0.80, volume: "1.8M", volMul: 0.90, high: 1634.00, low: 1598.00, high52: 1702.00, low52: 1132.00, pe: 28.0, delivery: "63.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", sector: "pharma", price: 5410.00, change: 1.45, volume: "710K", volMul: 1.35, high: 5480.00, low: 5310.00, high52: 5650.00, low52: 3350.00, pe: 72.4, delivery: "52.8%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", sector: "pharma", price: 6890.00, change: -1.65, volume: "680K", volMul: 1.20, high: 7040.00, low: 6840.00, high52: 7400.00, low52: 4725.00, pe: 78.5, delivery: "55.1%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "MANKIND", name: "Mankind Pharma", sector: "pharma", price: 2540.00, change: 2.10, volume: "1.4M", volMul: 1.65, high: 2580.00, low: 2470.00, high52: 2750.00, low52: 1680.00, pe: 44.0, delivery: "46.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "LUPIN", name: "Lupin Ltd", sector: "pharma", price: 2180.00, change: -0.35, volume: "1.5M", volMul: 0.88, high: 2210.00, low: 2160.00, high52: 2315.00, low52: 1100.00, pe: 35.6, delivery: "49.0%", universes: ["fno", "nifty100", "nifty500"] },

  // FMCG SECTOR
  { symbol: "ITC", name: "ITC Ltd", sector: "fmcg", price: 504.80, change: 0.85, volume: "16.4M", volMul: 1.15, high: 509.00, low: 499.50, high52: 528.50, low52: 399.30, pe: 28.5, delivery: "65.4%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "fmcg", price: 2840.00, change: -0.30, volume: "2.1M", volMul: 0.85, high: 2865.00, low: 2820.00, high52: 3035.00, low52: 2172.00, pe: 64.2, delivery: "71.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "NESTLEIND", name: "Nestle India Ltd", sector: "fmcg", price: 2480.00, change: -0.60, volume: "840K", volMul: 0.92, high: 2510.00, low: 2465.00, high52: 2770.00, low52: 2145.00, pe: 72.8, delivery: "68.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BRITANNIA", name: "Britannia Industries", sector: "fmcg", price: 5920.00, change: 0.40, volume: "510K", volMul: 0.98, high: 5970.00, low: 5880.00, high52: 6470.00, low52: 4430.00, pe: 61.5, delivery: "58.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "TATACONSUM", name: "Tata Consumer Products", sector: "fmcg", price: 1185.00, change: 1.15, volume: "2.9M", volMul: 1.22, high: 1198.00, low: 1168.00, high52: 1269.00, low52: 818.00, pe: 82.0, delivery: "54.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "DABUR", name: "Dabur India Ltd", sector: "fmcg", price: 624.00, change: -1.45, volume: "3.5M", volMul: 1.30, high: 636.00, low: 620.00, high52: 672.00, low52: 489.00, pe: 54.0, delivery: "59.8%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "GODREJCP", name: "Godrej Consumer Products", sector: "fmcg", price: 1475.00, change: 0.90, volume: "1.6M", volMul: 1.05, high: 1492.00, low: 1455.00, high52: 1540.00, low52: 970.00, pe: 65.0, delivery: "62.4%", universes: ["fno", "nifty100", "nifty500"] },

  // REALTY SECTOR
  { symbol: "DLF", name: "DLF Ltd", sector: "realty", price: 875.40, change: 3.85, volume: "8.4M", volMul: 2.20, high: 884.00, low: 842.00, high52: 967.60, low52: 490.00, pe: 52.0, delivery: "45.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "GODREJPROP", name: "Godrej Properties", sector: "realty", price: 3180.00, change: 4.10, volume: "2.8M", volMul: 2.45, high: 3220.00, low: 3040.00, high52: 3400.00, low52: 1515.00, pe: 84.5, delivery: "38.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty Ltd", sector: "realty", price: 1890.00, change: 2.25, volume: "1.9M", volMul: 1.60, high: 1915.00, low: 1840.00, high52: 2060.00, low52: 1070.00, pe: 36.4, delivery: "42.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "LODHA", name: "Macrotech Developers (Lodha)", sector: "realty", price: 1240.00, change: 1.90, volume: "3.1M", volMul: 1.35, high: 1260.00, low: 1210.00, high52: 1600.00, low52: 700.00, pe: 45.0, delivery: "48.2%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "PHOENIXLTD", name: "Phoenix Mills Ltd", sector: "realty", price: 1680.00, change: -0.65, volume: "1.1M", volMul: 0.90, high: 1710.00, low: 1665.00, high52: 1900.00, low52: 890.00, pe: 41.2, delivery: "52.0%", universes: ["fno", "nifty500"] },
  { symbol: "PRESTIGE", name: "Prestige Estates Projects", sector: "realty", price: 1740.00, change: 3.20, volume: "2.4M", volMul: 1.80, high: 1775.00, low: 1680.00, high52: 2075.00, low52: 560.00, pe: 58.0, delivery: "36.0%", universes: ["fno", "nifty500"] },

  // FINANCIAL SERVICES
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "finserv", price: 7420.00, change: 1.85, volume: "2.4M", volMul: 1.45, high: 7490.00, low: 7280.00, high52: 8190.00, low52: 6350.00, pe: 30.5, delivery: "58.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", sector: "finserv", price: 1880.00, change: 1.15, volume: "3.2M", volMul: 1.10, high: 1898.00, low: 1855.00, high52: 1980.00, low52: 1420.00, pe: 36.8, delivery: "53.2%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "CHOLAFIN", name: "Cholamandalam Invest & Fin", sector: "finserv", price: 1540.00, change: 2.40, volume: "2.1M", volMul: 1.70, high: 1565.00, low: 1500.00, high52: 1620.00, low52: 1050.00, pe: 32.0, delivery: "49.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd", sector: "finserv", price: 3410.00, change: 0.95, volume: "1.8M", volMul: 1.15, high: 3450.00, low: 3370.00, high52: 3650.00, low52: 1810.00, pe: 16.5, delivery: "61.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd", sector: "finserv", price: 1985.00, change: -1.30, volume: "1.2M", volMul: 0.88, high: 2025.00, low: 1968.00, high52: 2150.00, low52: 1220.00, pe: 17.2, delivery: "44.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "PFC", name: "Power Finance Corp", sector: "finserv", price: 475.00, change: -0.70, volume: "14.5M", volMul: 0.95, high: 482.00, low: 471.00, high52: 580.00, low52: 215.00, pe: 6.2, delivery: "41.0%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "RECLTD", name: "REC Ltd", sector: "finserv", price: 542.00, change: 0.20, volume: "13.2M", volMul: 0.90, high: 549.00, low: 538.00, high52: 654.00, low52: 245.00, pe: 7.1, delivery: "43.5%", universes: ["fno", "nifty100", "nifty500"] },

  // INFRASTRUCTURE
  { symbol: "LT", name: "Larsen & Toubro Ltd", sector: "infra", price: 3620.00, change: 1.45, volume: "3.4M", volMul: 1.25, high: 3650.00, low: 3565.00, high52: 3919.90, low52: 2850.00, pe: 34.5, delivery: "60.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", sector: "infra", price: 1450.00, change: 2.10, volume: "5.8M", volMul: 1.40, high: 1468.00, low: 1418.00, high52: 1621.00, low52: 750.00, pe: 32.0, delivery: "48.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "infra", price: 3020.00, change: -0.80, volume: "2.9M", volMul: 0.92, high: 3075.00, low: 2990.00, high52: 3450.00, low52: 2140.00, pe: 88.0, delivery: "39.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", sector: "infra", price: 11420.00, change: 0.65, volume: "480K", volMul: 0.95, high: 11550.00, low: 11310.00, high52: 12100.00, low52: 7850.00, pe: 44.2, delivery: "58.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "GRASIM", name: "Grasim Industries Ltd", sector: "infra", price: 2680.00, change: 1.30, volume: "1.4M", volMul: 1.15, high: 2710.00, low: 2640.00, high52: 2875.00, low52: 1820.00, pe: 31.0, delivery: "52.4%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BEL", name: "Bharat Electronics Ltd", sector: "infra", price: 295.40, change: 2.85, volume: "28.5M", volMul: 1.90, high: 299.50, low: 287.00, high52: 340.50, low52: 125.00, pe: 49.0, delivery: "44.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "infra", price: 4480.00, change: -1.95, volume: "2.8M", volMul: 1.30, high: 4620.00, low: 4440.00, high52: 5675.00, low52: 1910.00, pe: 36.0, delivery: "41.2%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "GMRINFRA", name: "GMR Airports Infra", sector: "infra", price: 96.50, change: -2.10, volume: "34.0M", volMul: 1.45, high: 99.80, low: 95.20, high52: 104.00, low52: 55.00, pe: 65.0, delivery: "35.0%", universes: ["fno", "nifty500"] },

  // Additional constituents for depth in Nifty 500 & Nifty 100
  { symbol: "TITAN", name: "Titan Company Ltd", sector: "fmcg", price: 3745.00, change: 1.90, volume: "1.8M", volMul: 1.30, high: 3780.00, low: 3680.00, high52: 3886.95, low52: 2980.00, pe: 88.0, delivery: "64.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "infra", price: 1635.00, change: 0.95, volume: "7.1M", volMul: 1.10, high: 1648.00, low: 1618.00, high52: 1712.00, low52: 890.00, pe: 62.0, delivery: "68.5%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", sector: "fmcg", price: 3240.00, change: -1.60, volume: "1.9M", volMul: 1.25, high: 3310.00, low: 3220.00, high52: 3568.00, low52: 2670.00, pe: 56.0, delivery: "58.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "KALYANKJIL", name: "Kalyan Jewellers", sector: "fmcg", price: 680.00, change: 4.80, volume: "12.0M", volMul: 2.80, high: 694.00, low: 645.00, high52: 740.00, low52: 220.00, pe: 75.0, delivery: "41.0%", universes: ["fno", "nifty500"] },
  { symbol: "TRENT", name: "Trent Ltd", sector: "fmcg", price: 7450.00, change: 3.65, volume: "2.1M", volMul: 1.95, high: 7560.00, low: 7180.00, high52: 8345.00, low52: 2000.00, pe: 165.0, delivery: "52.0%", universes: ["nifty50", "fno", "nifty100", "nifty500"] },
  { symbol: "ZOMATO", name: "Zomato Ltd", sector: "it", price: 275.50, change: 4.20, volume: "52.0M", volMul: 2.40, high: 280.00, low: 262.00, high52: 298.00, low52: 98.00, pe: 110.0, delivery: "37.5%", universes: ["fno", "nifty100", "nifty500"] },
  { symbol: "SUZLON", name: "Suzlon Energy Ltd", sector: "energy", price: 82.40, change: -3.40, volume: "85.0M", volMul: 2.10, high: 86.50, low: 81.20, high52: 86.50, low52: 22.00, pe: 68.0, delivery: "32.0%", universes: ["fno", "nifty500"] },
  { symbol: "IREDA", name: "Indian Renewable Energy", sector: "finserv", price: 232.00, change: -2.85, volume: "38.0M", volMul: 1.70, high: 242.00, low: 228.00, high52: 310.00, low52: 50.00, pe: 42.0, delivery: "29.0%", universes: ["fno", "nifty500"] },
  { symbol: "MAZDOCK", name: "Mazagon Dock Shipbuilders", sector: "infra", price: 4420.00, change: 5.20, volume: "4.8M", volMul: 2.90, high: 4510.00, low: 4180.00, high52: 5860.00, low52: 1750.00, pe: 38.0, delivery: "34.0%", universes: ["fno", "nifty500"] },
  { symbol: "COCHINSHIP", name: "Cochin Shipyard Ltd", sector: "infra", price: 1720.00, change: 4.15, volume: "6.2M", volMul: 2.50, high: 1760.00, low: 1640.00, high52: 2979.00, low52: 450.00, pe: 45.0, delivery: "31.0%", universes: ["fno", "nifty500"] },
  { symbol: "RVNL", name: "Rail Vikas Nigam Ltd", sector: "infra", price: 548.00, change: -3.10, volume: "22.0M", volMul: 1.60, high: 574.00, low: 541.00, high52: 647.00, low52: 135.00, pe: 58.0, delivery: "28.5%", universes: ["fno", "nifty500"] },
  { symbol: "BHEL", name: "Bharat Heavy Electricals", sector: "infra", price: 278.00, change: 1.75, volume: "26.0M", volMul: 1.25, high: 284.00, low: 272.00, high52: 335.00, low52: 115.00, pe: 120.0, delivery: "33.0%", universes: ["fno", "nifty100", "nifty500"] }
];

const MARKET_METRICS = {
  nifty50: { name: "NIFTY 50", value: "25,388.90", change: "+0.78%", delta: "+196.40", adv: 34, dec: 14, unch: 2, totalValueCr: "82,450 Cr", high52: 18, low52: 0 },
  fno: { name: "F&O STOCKS", value: "184 Contracts", change: "+0.92%", delta: "Strong ADR", adv: 124, dec: 54, unch: 6, totalValueCr: "1,94,300 Cr", high52: 42, low52: 3 },
  nifty100: { name: "NIFTY 100", value: "26,140.20", change: "+0.85%", delta: "+220.15", adv: 68, dec: 28, unch: 4, totalValueCr: "1,12,600 Cr", high52: 29, low52: 1 },
  nifty500: { name: "NIFTY 500", value: "23,945.75", change: "+0.96%", delta: "+227.80", adv: 342, dec: 142, unch: 16, totalValueCr: "1,68,900 Cr", high52: 84, low52: 7 }
};

const TICKER_PULSE = [
  { symbol: "NIFTY 50", price: "25,388.90", change: "+0.78%", isPositive: true },
  { symbol: "BANK NIFTY", price: "52,145.30", change: "+1.24%", isPositive: true },
  { symbol: "SENSEX", price: "83,184.80", change: "+0.71%", isPositive: true },
  { symbol: "INDIA VIX", price: "12.82", change: "-4.18%", isPositive: false, isVix: true },
  { symbol: "NIFTY IT", price: "42,890.10", change: "-0.82%", isPositive: false },
  { symbol: "NIFTY AUTO", price: "26,420.50", change: "+1.88%", isPositive: true },
  { symbol: "NIFTY REALTY", price: "1,085.40", change: "+3.12%", isPositive: true },
  { symbol: "NIFTY METAL", price: "9,640.25", change: "+2.45%", isPositive: true }
];
