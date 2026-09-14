/**
 * MITS 360 Market Intelligence - Alpha Terminal Core Application Logic
 * Interactive State Engine & Dynamic EOD Pipeline Consumer
 */

(function () {
  'use strict';

  // --- Dynamic Dataset Container ---
  // Starts with fallback/default mock data, dynamically replaced when market_summary.json loads
  let liveData = {
    isLive: false,
    meta: {
      market_date: "14-Sep-2026",
      source: "MITS 360 Mock EOD Dataset"
    },
    ticker_pulse: typeof TICKER_PULSE !== 'undefined' ? TICKER_PULSE : [],
    universes: typeof MARKET_METRICS !== 'undefined' ? MARKET_METRICS : {},
    sectors: typeof SECTOR_DATA !== 'undefined' ? SECTOR_DATA : [],
    stocks: typeof STOCKS_DATA !== 'undefined' ? STOCKS_DATA : []
  };

  // --- Application State ---
  const state = {
    currentUniverse: 'nifty50',
    heatmapMode: 'grouped', // 'grouped' | 'flat'
    sectorFilter: 'best',   // 'best' | 'worst' | 'all'
    selectedSectorId: 'banking',
    searchQuery: '',
    selectedStock: null
  };

  // --- DOM Elements ---
  const el = {
    // Clock & Status
    terminalClock: document.getElementById('terminalClock'),
    tickerPulseStrip: document.getElementById('tickerPulseStrip'),
    dataSourceBadge: document.getElementById('dataSourceBadge'),
    
    // Universe Tabs
    universeTabs: document.querySelectorAll('.tab-btn'),
    activeUniverseName: document.getElementById('activeUniverseName'),
    
    // Breadth & ADR
    adrRatioVal: document.getElementById('adrRatioVal'),
    adrSentimentTag: document.getElementById('adrSentimentTag'),
    advCountVal: document.getElementById('advCountVal'),
    decCountVal: document.getElementById('decCountVal'),
    unchCountVal: document.getElementById('unchCountVal'),
    adrSegmentAdv: document.getElementById('adrSegmentAdv'),
    adrSegmentUnch: document.getElementById('adrSegmentUnch'),
    adrSegmentDec: document.getElementById('adrSegmentDec'),
    statTotalValue: document.getElementById('statTotalValue'),
    stat52wHighs: document.getElementById('stat52wHighs'),
    stat52wLows: document.getElementById('stat52wLows'),

    // Heatmap
    heatmapContainer: document.getElementById('heatmapContainer'),
    heatmapModeToggles: document.querySelectorAll('[data-heatmap-mode]'),
    searchInput: document.getElementById('terminalSearch'),

    // Movers & Shakers
    sectorFilterToggles: document.querySelectorAll('[data-sector-filter]'),
    sectorsList: document.getElementById('sectorsList'),
    drilldownSectorName: document.getElementById('drilldownSectorName'),
    drilldownSectorPill: document.getElementById('drilldownSectorPill'),
    gainersList: document.getElementById('gainersList'),
    losersList: document.getElementById('losersList'),

    // Drawer / Modal
    stockDrawer: document.getElementById('stockDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    drawerTicker: document.getElementById('drawerTicker'),
    drawerCompany: document.getElementById('drawerCompany'),
    drawerPrice: document.getElementById('drawerPrice'),
    drawerChange: document.getElementById('drawerChange'),
    drawerSector: document.getElementById('drawerSector'),
    drawerVolume: document.getElementById('drawerVolume'),
    drawerVolMul: document.getElementById('drawerVolMul'),
    drawerDelivery: document.getElementById('drawerDelivery'),
    drawerPE: document.getElementById('drawerPE'),
    drawerDayLow: document.getElementById('drawerDayLow'),
    drawerDayHigh: document.getElementById('drawerDayHigh'),
    drawerDayFill: document.getElementById('drawerDayFill'),
    drawerDayThumb: document.getElementById('drawerDayThumb'),
    drawer52Low: document.getElementById('drawer52Low'),
    drawer52High: document.getElementById('drawer52High'),
    drawer52Fill: document.getElementById('drawer52Fill'),
    drawer52Thumb: document.getElementById('drawer52Thumb')
  };

  // --- Utility Functions ---
  function formatINR(val) {
    return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getHeatClass(change) {
    if (change >= 2.5) return 'heat-super-bull';
    if (change >= 0.75) return 'heat-bull';
    if (change > 0.05) return 'heat-neutral-bull';
    if (change >= -0.05) return 'heat-neutral';
    if (change >= -0.75) return 'heat-neutral-bear';
    if (change >= -2.5) return 'heat-bear';
    return 'heat-super-bear';
  }

  // --- Clock & Header Telemetry ---
  function updateHeaderTelemetry() {
    const marketDate = liveData.meta.market_date || "Today";
    const statusText = liveData.isLive 
      ? `NSE EOD Verified • ${marketDate}`
      : `EOD Preview (Demo) • ${marketDate}`;
      
    if (el.terminalClock) {
      el.terminalClock.textContent = statusText;
    }

    if (el.dataSourceBadge) {
      el.dataSourceBadge.textContent = liveData.isLive ? 'LIVE NSE EOD' : 'DEMO MODE';
      el.dataSourceBadge.className = `alpha-badge ${liveData.isLive ? 'live' : ''}`;
    }

    // Populate Ticker Pulse Marquee
    if (el.tickerPulseStrip && liveData.ticker_pulse.length > 0) {
      el.tickerPulseStrip.innerHTML = liveData.ticker_pulse.map(item => {
        let pillClass = item.isPositive ? 'bullish' : 'bearish';
        let icon = item.isPositive ? '▲' : '▼';
        if (item.isVix) {
          pillClass = 'vix-neutral';
          icon = '•';
        }
        return `
          <div class="pulse-item">
            <span class="pulse-name">${item.symbol}</span>
            <span class="pulse-val">${item.price}</span>
            <span class="delta-pill ${pillClass}">
              ${icon} ${item.change}
            </span>
          </div>
        `;
      }).join('');
    }
  }

  // --- Universe & Market Breadth Engine ---
  function updateMarketBreadth() {
    const metrics = liveData.universes[state.currentUniverse];
    if (!metrics) return;

    // Filter stocks belonging to current universe
    const universeStocks = liveData.stocks.filter(s => s.universes.includes(state.currentUniverse));
    
    let advances = metrics.adv;
    let declines = metrics.dec;
    let unchanged = metrics.unch;
    let adrRatio = metrics.adr;

    // Recalculate if metric values are missing
    if (advances === undefined) {
      advances = universeStocks.filter(s => s.change > 0).length;
      declines = universeStocks.filter(s => s.change < 0).length;
      unchanged = universeStocks.filter(s => s.change === 0).length;
      adrRatio = declines > 0 ? (advances / declines).toFixed(2) : advances.toFixed(2);
    }

    const totalCount = advances + declines + unchanged || 1;
    const advPct = ((advances / totalCount) * 100).toFixed(1);
    const unchPct = ((unchanged / totalCount) * 100).toFixed(1);
    const decPct = ((declines / totalCount) * 100).toFixed(1);

    // Update Breadth DOM
    if (el.activeUniverseName) el.activeUniverseName.textContent = metrics.name || state.currentUniverse.toUpperCase();
    if (el.adrRatioVal) el.adrRatioVal.textContent = `${adrRatio}x`;

    const isBullish = advances >= declines;
    if (el.adrSentimentTag) {
      el.adrSentimentTag.textContent = isBullish ? 'BULLISH DOMINANCE' : 'BEARISH DOMINANCE';
      el.adrSentimentTag.className = `adr-sentiment-tag ${isBullish ? 'bullish' : 'bearish'}`;
    }

    if (el.advCountVal) el.advCountVal.textContent = advances;
    if (el.decCountVal) el.decCountVal.textContent = declines;
    if (el.unchCountVal) el.unchCountVal.textContent = unchanged;

    if (el.adrSegmentAdv) el.adrSegmentAdv.style.width = `${advPct}%`;
    if (el.adrSegmentUnch) el.adrSegmentUnch.style.width = `${unchPct}%`;
    if (el.adrSegmentDec) el.adrSegmentDec.style.width = `${decPct}%`;

    if (el.statTotalValue) el.statTotalValue.textContent = metrics.totalValueCr || '₹94,200 Cr';
    if (el.stat52wHighs) el.stat52wHighs.textContent = metrics.high52 !== undefined ? metrics.high52 : advances;
    if (el.stat52wLows) el.stat52wLows.textContent = metrics.low52 !== undefined ? metrics.low52 : declines;
  }

  // --- Heatmap Engine ---
  function renderHeatmap() {
    let stocks = liveData.stocks.filter(s => s.universes.includes(state.currentUniverse));

    // Apply search filter if active
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      stocks = stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }

    if (!el.heatmapContainer) return;

    if (stocks.length === 0) {
      el.heatmapContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono);">
          No constituents found matching "${state.searchQuery}" in ${state.currentUniverse.toUpperCase()}
        </div>
      `;
      return;
    }

    if (state.heatmapMode === 'flat') {
      // Sort by % change descending
      const sorted = [...stocks].sort((a, b) => b.change - a.change);
      el.heatmapContainer.innerHTML = `
        <div class="heatmap-tiles-grid">
          ${sorted.map(s => renderTileHTML(s)).join('')}
        </div>
      `;
    } else {
      // Grouped by Sector
      const sectorsMap = {};
      liveData.sectors.forEach(sec => {
        sectorsMap[sec.id] = { ...sec, stocks: [] };
      });

      stocks.forEach(stock => {
        if (sectorsMap[stock.sector]) {
          sectorsMap[stock.sector].stocks.push(stock);
        } else {
          // fallback group
          if (!sectorsMap['infra']) sectorsMap['infra'] = { id: 'infra', name: 'Infrastructure & Misc', stocks: [] };
          sectorsMap['infra'].stocks.push(stock);
        }
      });

      let html = '';
      Object.values(sectorsMap).forEach(sec => {
        if (!sec.stocks || sec.stocks.length === 0) return;

        // Sort sector's stocks by % change descending
        sec.stocks.sort((a, b) => b.change - a.change);

        const avgChange = (sec.stocks.reduce((acc, s) => acc + s.change, 0) / sec.stocks.length).toFixed(2);
        const isPos = avgChange >= 0;
        const colorClass = isPos ? 'val-green' : 'val-red';

        html += `
          <div class="heatmap-sector-group">
            <div class="sector-group-header">
              <span class="sector-name-label">${sec.name} (${sec.stocks.length})</span>
              <span class="sector-delta-mini ${colorClass}">${isPos ? '+' : ''}${avgChange}%</span>
            </div>
            <div class="heatmap-tiles-grid">
              ${sec.stocks.map(s => renderTileHTML(s)).join('')}
            </div>
          </div>
        `;
      });

      el.heatmapContainer.innerHTML = html;
    }

    // Attach click listeners to all rendered tiles
    el.heatmapContainer.querySelectorAll('.heat-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const symbol = tile.getAttribute('data-symbol');
        const stock = liveData.stocks.find(s => s.symbol === symbol);
        if (stock) openStockDrawer(stock);
      });
    });
  }

  function renderTileHTML(stock) {
    const heatClass = getHeatClass(stock.change);
    const sign = stock.change > 0 ? '+' : '';
    return `
      <div class="heat-tile ${heatClass}" data-symbol="${stock.symbol}" title="${stock.name} (${stock.symbol})\nPrice: ₹${stock.price}\nChange: ${sign}${stock.change}%\nVolume: ${stock.volume}">
        <div class="tile-top">
          <span class="tile-ticker">${stock.symbol}</span>
          <span class="tile-change">${sign}${stock.change}%</span>
        </div>
        <div class="tile-bottom">
          <span class="tile-price">₹${Number(stock.price).toFixed(2)}</span>
          <span class="tile-vol">${stock.volume}</span>
        </div>
      </div>
    `;
  }

  // --- Movers & Shakers Engine: Top 10 Core Sectors ---
  function renderMoversAndShakers() {
    if (!el.sectorsList) return;

    let sectors = [...liveData.sectors];

    // Compute sector metrics based on current stocks if not precomputed
    sectors.forEach(sec => {
      const secStocks = liveData.stocks.filter(s => s.sector === sec.id);
      if (sec.advCount === undefined) {
        sec.advCount = secStocks.filter(s => s.change > 0).length;
        sec.decCount = secStocks.filter(s => s.change < 0).length;
        sec.stockCount = secStocks.length;
        sec.change = secStocks.length > 0 
          ? (secStocks.reduce((a, b) => a + b.change, 0) / secStocks.length)
          : sec.change;
      }
    });

    // Apply Best vs Worst filter
    if (state.sectorFilter === 'best') {
      sectors.sort((a, b) => b.change - a.change);
    } else if (state.sectorFilter === 'worst') {
      sectors.sort((a, b) => a.change - b.change);
    }

    // Set active selected sector if currently null or not in list
    if (!sectors.some(s => s.id === state.selectedSectorId) && sectors.length > 0) {
      state.selectedSectorId = sectors[0].id;
    }

    // Render Sector Rows
    el.sectorsList.innerHTML = sectors.map((sec, idx) => {
      const isSelected = sec.id === state.selectedSectorId;
      const sign = sec.change > 0 ? '+' : '';
      const colorClass = sec.change >= 0 ? 'val-green' : 'val-red';
      const totalStocks = (sec.advCount + sec.decCount) || sec.stockCount || 1;
      const advRatio = Math.round((sec.advCount / totalStocks) * 100);
      const decRatio = 100 - advRatio;

      return `
        <div class="sector-row-card ${isSelected ? 'selected' : ''}" data-sector-id="${sec.id}">
          <span class="sector-rank-badge">#${idx + 1}</span>
          <div class="sector-info-col">
            <div class="sector-info-name">${sec.name}</div>
            <div class="sector-mcap">${sec.stockCount || totalStocks} Constituents</div>
          </div>
          <div class="sector-row-change ${colorClass}">
            ${sign}${Number(sec.change).toFixed(2)}%
          </div>
          <div class="sector-row-adr">
            <div class="sector-mini-track">
              <div class="sector-mini-adv" style="width: ${advRatio}%"></div>
              <div class="sector-mini-dec" style="width: ${decRatio}%"></div>
            </div>
            <div class="sector-adr-ratio-text">${sec.advCount} Adv / ${sec.decCount} Dec</div>
          </div>
          <div class="sector-arrow">›</div>
        </div>
      `;
    }).join('');

    // Attach click listeners to sector rows
    el.sectorsList.querySelectorAll('.sector-row-card').forEach(row => {
      row.addEventListener('click', () => {
        state.selectedSectorId = row.getAttribute('data-sector-id');
        renderMoversAndShakers();
        renderSectorDrilldown();
      });
    });

    renderSectorDrilldown();
  }

  // --- Dynamic Sector Drilldown (Gainers & Losers) ---
  function renderSectorDrilldown() {
    const sector = liveData.sectors.find(s => s.id === state.selectedSectorId) || liveData.sectors[0];
    if (!sector) return;

    // Update Drilldown Header
    const sign = sector.change > 0 ? '+' : '';
    const colorClass = sector.change >= 0 ? 'bullish' : 'bearish';
    if (el.drilldownSectorName) el.drilldownSectorName.textContent = sector.name;
    if (el.drilldownSectorPill) {
      el.drilldownSectorPill.textContent = `${sign}${Number(sector.change).toFixed(2)}%`;
      el.drilldownSectorPill.className = `delta-pill ${colorClass}`;
    }

    // Gainers & Losers
    let gainers = sector.gainers;
    let losers = sector.losers;

    // If not precomputed, compute from live stocks
    if (!gainers || !losers) {
      const secStocks = liveData.stocks.filter(s => s.sector === sector.id);
      gainers = [...secStocks].sort((a, b) => b.change - a.change).slice(0, 5);
      losers = [...secStocks].sort((a, b) => a.change - b.change).slice(0, 5);
    }

    // Gainers List
    if (el.gainersList) {
      if (gainers.length === 0 || gainers[0].change <= 0) {
        el.gainersList.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); padding: 8px;">No positive gainers today</div>`;
      } else {
        el.gainersList.innerHTML = gainers.map(s => renderMoverStockItemHTML(s)).join('');
      }
    }

    // Losers List
    if (el.losersList) {
      if (losers.length === 0 || losers[0].change >= 0) {
        el.losersList.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); padding: 8px;">No negative decliners today</div>`;
      } else {
        el.losersList.innerHTML = losers.map(s => renderMoverStockItemHTML(s)).join('');
      }
    }

    // Attach click to mover items to inspect
    document.querySelectorAll('.mover-stock-item').forEach(item => {
      item.addEventListener('click', () => {
        const symbol = item.getAttribute('data-symbol');
        const stock = liveData.stocks.find(s => s.symbol === symbol);
        if (stock) openStockDrawer(stock);
      });
    });
  }

  function renderMoverStockItemHTML(stock) {
    const sign = stock.change > 0 ? '+' : '';
    const isPos = stock.change >= 0;
    const colorClass = isPos ? 'val-green' : 'val-red';
    return `
      <div class="mover-stock-item" data-symbol="${stock.symbol}">
        <div class="mover-info-left">
          <span class="mover-symbol">${stock.symbol}</span>
          <span class="mover-vol">Vol: ${stock.volume || '1.2M'} (${stock.volMul || '1.2'}x avg)</span>
        </div>
        <div class="mover-info-right">
          <span class="mover-price">₹${Number(stock.price).toFixed(2)}</span>
          <span class="mover-delta ${colorClass}">${sign}${Number(stock.change).toFixed(2)}%</span>
        </div>
      </div>
    `;
  }

  // --- Stock Detail Quick-Inspection Drawer ---
  function openStockDrawer(stock) {
    state.selectedStock = stock;

    if (el.drawerTicker) el.drawerTicker.textContent = stock.symbol;
    if (el.drawerCompany) el.drawerCompany.textContent = stock.name;
    if (el.drawerPrice) el.drawerPrice.textContent = formatINR(stock.price);

    const sign = stock.change > 0 ? '+' : '';
    if (el.drawerChange) {
      el.drawerChange.textContent = `${sign}${Number(stock.change).toFixed(2)}%`;
      el.drawerChange.className = `drawer-change-large font-mono ${stock.change >= 0 ? 'heat-super-bull' : 'heat-super-bear'}`;
    }

    const sectorObj = liveData.sectors.find(s => s.id === stock.sector);
    if (el.drawerSector) el.drawerSector.textContent = sectorObj ? sectorObj.name : stock.sector.toUpperCase();
    if (el.drawerVolume) el.drawerVolume.textContent = stock.volume || 'N/A';
    if (el.drawerVolMul) el.drawerVolMul.textContent = `${stock.volMul || '1.2'}x vs 20D Avg`;
    if (el.drawerDelivery) el.drawerDelivery.textContent = stock.delivery || '52.4%';
    if (el.drawerPE) el.drawerPE.textContent = `${stock.pe || 24.5}x`;

    // Day Range Calculation
    const dayLow = stock.low || stock.price * 0.98;
    const dayHigh = stock.high || stock.price * 1.02;
    const dayRange = dayHigh - dayLow;
    const dayPct = dayRange > 0 ? Math.min(100, Math.max(0, ((stock.price - dayLow) / dayRange) * 100)) : 50;
    
    if (el.drawerDayLow) el.drawerDayLow.textContent = formatINR(dayLow);
    if (el.drawerDayHigh) el.drawerDayHigh.textContent = formatINR(dayHigh);
    if (el.drawerDayFill) el.drawerDayFill.style.width = `${dayPct}%`;
    if (el.drawerDayThumb) el.drawerDayThumb.style.left = `${dayPct}%`;

    // 52W Range Calculation
    const yrLow = stock.low52 || stock.price * 0.7;
    const yrHigh = stock.high52 || stock.price * 1.25;
    const yrRange = yrHigh - yrLow;
    const yrPct = yrRange > 0 ? Math.min(100, Math.max(0, ((stock.price - yrLow) / yrRange) * 100)) : 50;

    if (el.drawer52Low) el.drawer52Low.textContent = formatINR(yrLow);
    if (el.drawer52High) el.drawer52High.textContent = formatINR(yrHigh);
    if (el.drawer52Fill) el.drawer52Fill.style.width = `${yrPct}%`;
    if (el.drawer52Thumb) el.drawer52Thumb.style.left = `${yrPct}%`;

    // Show Drawer
    if (el.stockDrawer) el.stockDrawer.classList.add('open');
    if (el.drawerBackdrop) el.drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeStockDrawer() {
    if (el.stockDrawer) el.stockDrawer.classList.remove('open');
    if (el.drawerBackdrop) el.drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  // --- Dynamic EOD JSON Loader ---
  async function loadMarketSummaryJSON() {
    try {
      const response = await fetch('data/market_summary.json?nocache=' + Date.now());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} when fetching market_summary.json`);
      }
      const data = await response.json();
      console.log('[+] Successfully loaded live EOD data from data/market_summary.json:', data.meta);

      liveData = {
        isLive: true,
        meta: data.meta,
        ticker_pulse: data.ticker_pulse || [],
        universes: data.universes || {},
        sectors: data.sectors || [],
        stocks: data.stocks || []
      };

      // Set default selected sector to top performer in live data
      if (liveData.sectors.length > 0) {
        state.selectedSectorId = liveData.sectors[0].id;
      }
    } catch (err) {
      console.warn('[-] Could not load data/market_summary.json (falling back to mock dataset):', err.message);
      liveData.isLive = false;
    }

    // Refresh UI with loaded data
    updateHeaderTelemetry();
    updateMarketBreadth();
    renderHeatmap();
    renderMoversAndShakers();
  }

  // --- Event Listeners Binding ---
  function bindEvents() {
    // Universe Tabs
    el.universeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.universeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentUniverse = tab.getAttribute('data-universe');
        updateMarketBreadth();
        renderHeatmap();
        renderMoversAndShakers();
      });
    });

    // Heatmap View Mode Toggle (Grouped vs Flat)
    el.heatmapModeToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        el.heatmapModeToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.heatmapMode = btn.getAttribute('data-heatmap-mode');
        renderHeatmap();
      });
    });

    // Sector Filter Toggle (Best vs Worst vs All)
    el.sectorFilterToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        el.sectorFilterToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sectorFilter = btn.getAttribute('data-sector-filter');
        renderMoversAndShakers();
      });
    });

    // Quick Search Input
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderHeatmap();
      });
    }

    // Drawer Close Triggers
    if (el.drawerCloseBtn) el.drawerCloseBtn.addEventListener('click', closeStockDrawer);
    if (el.drawerBackdrop) el.drawerBackdrop.addEventListener('click', closeStockDrawer);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeStockDrawer();
    });
  }

  // --- Initial Launch ---
  function init() {
    bindEvents();
    // Fetch live market_summary.json
    loadMarketSummaryJSON();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
