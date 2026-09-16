#!/usr/bin/env python3
"""
MITS 360 Market Intelligence - Institutional Sector Rotation Scanner
Detects Early Sector Rotation, Emerging Leadership, Confirmed Leadership,
Rotation Exhaustion, and Capital Outflows across NSE Sectors & Constituent Equities.
Pure Python 3 Standard Library (Zero look-ahead bias).
"""

import os
import sys
import json
import math
import urllib.request
import datetime
from typing import Dict, List, Any, Tuple

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# --- 1. Universe Definitions ---
BENCHMARK_NIFTY50 = {"symbol": "^NSEI", "name": "Nifty 50", "short_name": "Nifty 50", "nse_name": "Nifty 50"}
BENCHMARK_NIFTY500 = {"symbol": "^CRSLDX", "name": "Nifty 500", "short_name": "Nifty 500", "nse_name": "Nifty 500"}

SECTOR_REGISTRY = [
    {"symbol": "^NSEBANK", "name": "Nifty Bank", "short_name": "Bank", "sector_id": "banking", "icon": "landmark"},
    {"symbol": "^CNXIT", "name": "Nifty IT", "short_name": "IT", "sector_id": "it", "icon": "cpu"},
    {"symbol": "^CNXAUTO", "name": "Nifty Auto", "short_name": "Auto", "sector_id": "auto", "icon": "car"},
    {"symbol": "^CNXFMCG", "name": "Nifty FMCG", "short_name": "FMCG", "sector_id": "fmcg", "icon": "shopping-bag"},
    {"symbol": "^CNXMETAL", "name": "Nifty Metal", "short_name": "Metal", "sector_id": "metals", "icon": "layers"},
    {"symbol": "^CNXPHARMA", "name": "Nifty Pharma", "short_name": "Pharma", "sector_id": "pharma", "icon": "activity"},
    {"symbol": "^CNXREALTY", "name": "Nifty Realty", "short_name": "Realty", "sector_id": "realty", "icon": "home"},
    {"symbol": "^CNXENERGY", "name": "Nifty Energy", "short_name": "Energy", "sector_id": "energy", "icon": "zap"},
    {"symbol": "^CNXINFRA", "name": "Nifty Infra", "short_name": "Infra", "sector_id": "infra", "icon": "truck"},
    {"symbol": "^CNXPSE", "name": "Nifty PSE", "short_name": "PSE", "sector_id": "pse", "icon": "shield"},
    {"symbol": "^CNXPSUBANK", "name": "Nifty PSU Bank", "short_name": "PSU Bank", "sector_id": "banking", "icon": "building-2"},
    {"symbol": "NIFTY_PVT_BANK.NS", "name": "Nifty Private Bank", "short_name": "Pvt Bank", "sector_id": "banking", "icon": "vault"},
    {"symbol": "NIFTY_FIN_SERVICE.NS", "name": "Nifty Financial Services", "short_name": "Fin Services", "sector_id": "banking", "icon": "credit-card"},
    {"symbol": "^CNXMEDIA", "name": "Nifty Media", "short_name": "Media", "sector_id": "media", "icon": "film"},
    {"symbol": "NIFTY_MIDCAP_100.NS", "name": "Nifty Midcap 100", "short_name": "Midcap", "sector_id": "broad", "icon": "trending-up"}
]

LOOKBACK_HORIZONS = [
    ("5D", 5),
    ("10D", 10),
    ("20D", 20),
    ("50D", 50),
    ("100D", 100),
    ("200D", 200)
]


# --- 2. Technical Mathematics & Indicators (Strictly Causal / Zero Look-Ahead) ---

def fetch_candles(symbol: str) -> List[Dict[str, Any]]:
    """Fetch 2 years of daily OHLCV trading candles from Yahoo Finance."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=2y&interval=1d"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=12) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        res = data["chart"]["result"][0]
        timestamps = res["timestamp"]
        q = res["indicators"]["quote"][0]
        valid = []
        for t, o, h, l, c, v in zip(
            timestamps,
            q.get("open", []),
            q.get("high", []),
            q.get("low", []),
            q.get("close", []),
            q.get("volume", [])
        ):
            if None not in (t, c) and c > 0:
                valid.append({
                    "time": t,
                    "date": datetime.datetime.fromtimestamp(t).strftime("%Y-%m-%d"),
                    "open": float(o) if o is not None else float(c),
                    "high": float(h) if h is not None else float(c),
                    "low": float(l) if l is not None else float(c),
                    "close": float(c),
                    "volume": float(v) if v is not None else 1.0
                })
        return valid


def compute_sma(values: List[float], period: int) -> float:
    if len(values) < period:
        return values[-1] if values else 0.0
    return sum(values[-period:]) / period


def compute_ema(values: List[float], period: int) -> float:
    if len(values) < period:
        return values[-1] if values else 0.0
    k = 2.0 / (period + 1)
    ema = sum(values[:period]) / period
    for val in values[period:]:
        ema = (val * k) + (ema * (1 - k))
    return ema


def compute_rsi(closes: List[float], period: int = 14) -> float:
    if len(closes) <= period:
        return 50.0
    gains, losses = [], []
    for i in range(1, len(closes)):
        diff = closes[i] - closes[i - 1]
        gains.append(max(0.0, diff))
        losses.append(max(0.0, -diff))

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0.0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def compute_macd(closes: List[float]) -> Tuple[float, float, float]:
    """Returns (macd_line, signal_line, histogram)"""
    if len(closes) < 35:
        return 0.0, 0.0, 0.0
    ema12 = compute_ema(closes, 12)
    ema26 = compute_ema(closes, 26)
    macd_val = ema12 - ema26

    # Approximate signal line from recent MACD values
    macd_series = []
    for i in range(max(26, len(closes) - 20), len(closes) + 1):
        sub = closes[:i]
        e12 = compute_ema(sub, 12)
        e26 = compute_ema(sub, 26)
        macd_series.append(e12 - e26)

    signal = compute_ema(macd_series, 9) if len(macd_series) >= 9 else macd_val
    hist = macd_val - signal
    return macd_val, signal, hist


def compute_adx(candles: List[Dict[str, Any]], period: int = 14) -> float:
    if len(candles) <= period * 2:
        return 25.0
    tr_list, dm_plus_list, dm_minus_list = [], [], []
    for i in range(1, len(candles)):
        c_curr, c_prev = candles[i], candles[i - 1]
        h, l, c_p = c_curr["high"], c_curr["low"], c_prev["close"]
        tr = max(h - l, abs(h - c_p), abs(l - c_p))
        tr_list.append(tr)

        up_move = h - c_prev["high"]
        down_move = c_prev["low"] - l
        dm_plus = up_move if up_move > down_move and up_move > 0 else 0.0
        dm_minus = down_move if down_move > up_move and down_move > 0 else 0.0
        dm_plus_list.append(dm_plus)
        dm_minus_list.append(dm_minus)

    if sum(tr_list[-period:]) == 0:
        return 20.0
    tr_smooth = sum(tr_list[-period:])
    plus_di = (sum(dm_plus_list[-period:]) / tr_smooth) * 100.0
    minus_di = (sum(dm_minus_list[-period:]) / tr_smooth) * 100.0
    denom = plus_di + minus_di
    dx = (abs(plus_di - minus_di) / denom * 100.0) if denom > 0 else 20.0
    return min(100.0, max(0.0, dx))


def compute_obv_slope(candles: List[Dict[str, Any]], period: int = 20) -> float:
    if len(candles) < period + 1:
        return 50.0
    obv = [0.0]
    for i in range(1, len(candles)):
        c_prev = candles[i - 1]["close"]
        c_curr = candles[i]["close"]
        v = candles[i]["volume"]
        if c_curr > c_prev:
            obv.append(obv[-1] + v)
        elif c_curr < c_prev:
            obv.append(obv[-1] - v)
        else:
            obv.append(obv[-1])

    recent_obv = obv[-period:]
    # Normalize slope into 0..100
    if recent_obv[-1] > recent_obv[0]:
        return min(100.0, 50.0 + (recent_obv[-1] - recent_obv[0]) / (abs(recent_obv[0]) + 1e-5) * 50.0)
    else:
        return max(0.0, 50.0 - (recent_obv[0] - recent_obv[-1]) / (abs(recent_obv[0]) + 1e-5) * 50.0)


def compute_cmf(candles: List[Dict[str, Any]], period: int = 20) -> float:
    """Chaikin Money Flow: sum(((C-L)-(H-C))/(H-L)*V) / sum(V)"""
    if len(candles) < period:
        return 0.0
    mf_sum = 0.0
    vol_sum = 0.0
    for c in candles[-period:]:
        h, l, cl, v = c["high"], c["low"], c["close"], c["volume"]
        rng = h - l
        if rng > 0:
            mf_mult = ((cl - l) - (h - cl)) / rng
            mf_sum += mf_mult * v
            vol_sum += v
    return (mf_sum / vol_sum) if vol_sum > 0 else 0.0


# --- 3. Multi-Factor Quantitative Dimensions (0-100 Normalization) ---

def evaluate_relative_strength(
    sector_candles: List[Dict[str, Any]],
    bench_candles: List[Dict[str, Any]],
    nifty500_candles: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Dimension 1: Relative Strength vs Benchmarks (20% Weight)."""
    if not sector_candles or not bench_candles:
        return {"score": 50.0, "trend": "RS Flat", "acceleration": 0.0, "alphas": {}, "alphas_n500": {}}

    s_last = sector_candles[-1]["close"]
    b_last = bench_candles[-1]["close"]
    b500_last = nifty500_candles[-1]["close"] if nifty500_candles else b_last

    alphas = {}
    alphas_n500 = {}
    for code, bars in LOOKBACK_HORIZONS:
        # Sector return
        s_past_idx = max(0, len(sector_candles) - 1 - bars)
        s_ret = ((s_last - sector_candles[s_past_idx]["close"]) / sector_candles[s_past_idx]["close"]) * 100.0

        # Benchmark Nifty 50 return
        b_past_idx = max(0, len(bench_candles) - 1 - bars)
        b_ret = ((b_last - bench_candles[b_past_idx]["close"]) / bench_candles[b_past_idx]["close"]) * 100.0
        alphas[code] = round(s_ret - b_ret, 2)

        # Benchmark Nifty 500 return
        if nifty500_candles:
            b500_past_idx = max(0, len(nifty500_candles) - 1 - bars)
            b500_ret = ((b500_last - nifty500_candles[b500_past_idx]["close"]) / nifty500_candles[b500_past_idx]["close"]) * 100.0
            alphas_n500[code] = round(s_ret - b500_ret, 2)
        else:
            alphas_n500[code] = alphas[code]

    # RS Acceleration: 5D Alpha vs 20D Alpha
    rs_accel = round(alphas.get("5D", 0.0) - alphas.get("20D", 0.0), 2)

    # RS Trend Classification
    if alphas.get("5D", 0.0) > alphas.get("20D", 0.0) > alphas.get("50D", 0.0):
        if alphas.get("5D", 0.0) > 3.0:
            rs_trend = "RS Breakout"
            trend_pts = 95.0
        else:
            rs_trend = "RS Rising"
            trend_pts = 85.0
    elif alphas.get("5D", 0.0) < alphas.get("20D", 0.0) < alphas.get("50D", 0.0):
        if alphas.get("5D", 0.0) < -3.0:
            rs_trend = "RS Breakdown"
            trend_pts = 15.0
        else:
            rs_trend = "RS Falling"
            trend_pts = 25.0
    elif alphas.get("5D", 0.0) > 0:
        rs_trend = "RS Improving"
        trend_pts = 70.0
    else:
        rs_trend = "RS Neutral"
        trend_pts = 45.0

    # Composite RS Score (0 - 100)
    raw_rs = (
        (alphas.get("5D", 0.0) * 0.25) +
        (alphas.get("20D", 0.0) * 0.25) +
        (alphas.get("50D", 0.0) * 0.20) +
        (alphas.get("100D", 0.0) * 0.15) +
        (alphas.get("200D", 0.0) * 0.15)
    )
    # Sigmoidal mapping to 0..100
    norm_score = max(5.0, min(98.0, 50.0 + (raw_rs * 4.0) + (trend_pts - 50.0) * 0.35 + (rs_accel * 2.5)))

    return {
        "score": round(norm_score, 1),
        "trend": rs_trend,
        "acceleration": rs_accel,
        "alphas": alphas,
        "alphas_n500": alphas_n500
    }


def evaluate_momentum(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Dimension 2: Momentum & Inflection (15% Weight)."""
    if len(candles) < 55:
        return {"score": 50.0, "rsi": 50.0, "roc_5d": 0.0, "adx": 20.0, "turning_up": False}

    closes = [c["close"] for c in candles]
    c_last = closes[-1]

    roc_5 = ((c_last - closes[-6]) / closes[-6]) * 100.0 if len(closes) >= 6 else 0.0
    roc_10 = ((c_last - closes[-11]) / closes[-11]) * 100.0 if len(closes) >= 11 else 0.0
    roc_20 = ((c_last - closes[-21]) / closes[-21]) * 100.0 if len(closes) >= 21 else 0.0
    roc_50 = ((c_last - closes[-51]) / closes[-51]) * 100.0 if len(closes) >= 51 else 0.0

    rsi = compute_rsi(closes, 14)
    macd_val, signal, hist = compute_macd(closes)
    adx = compute_adx(candles, 14)

    # Momentum Turning Up detection (RSI slope > 0 and ROC 5 > ROC 10 and MACD hist turning up)
    rsi_prev = compute_rsi(closes[:-2], 14) if len(closes) >= 18 else rsi
    momentum_turning_up = (rsi > rsi_prev) and (roc_5 > roc_10) and (hist > -0.5)

    # Score calculation
    m_score = 50.0 + (roc_5 * 2.5) + (roc_20 * 1.5) + ((rsi - 50.0) * 0.6)
    if momentum_turning_up:
        m_score += 12.0
    if adx > 25.0 and roc_20 > 0:
        m_score += 8.0  # Strong trending momentum

    norm_score = max(5.0, min(98.0, m_score))
    return {
        "score": round(norm_score, 1),
        "rsi": round(rsi, 1),
        "roc_5d": round(roc_5, 2),
        "roc_20d": round(roc_20, 2),
        "adx": round(adx, 1),
        "macd_hist": round(hist, 2),
        "turning_up": momentum_turning_up
    }


def evaluate_breadth(sector_stocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Dimension 3: Constituent Breadth & Concentration (15% Weight)."""
    if not sector_stocks:
        return {
            "score": 50.0,
            "adv_dec_ratio": 1.0,
            "pct_advances": 50.0,
            "pct_above_20ema": 50.0,
            "concentration_penalty": False,
            "leadership_bonus": False,
            "breadth_quality": "Average"
        }

    total = len(sector_stocks)
    advances = sum(1 for s in sector_stocks if float(s.get("change", 0.0)) > 0)
    declines = total - advances
    pct_adv = (advances / total) * 100.0 if total > 0 else 50.0
    ad_ratio = round(advances / max(1, declines), 2)

    # Distance from 52-week High (proxy for long-term health)
    high_prox = []
    for s in sector_stocks:
        p = float(s.get("price", 1.0))
        h52 = float(s.get("high52", p))
        if h52 > 0:
            high_prox.append((p / h52) * 100.0)
    avg_52w_prox = sum(high_prox) / len(high_prox) if high_prox else 80.0

    # Concentration check: contribution of top 2 heavyweight stocks by turnover
    sorted_by_turnover = sorted(sector_stocks, key=lambda x: float(x.get("turnover_cr", 0.0)), reverse=True)
    top2_turnover = sum(float(s.get("turnover_cr", 0.0)) for s in sorted_by_turnover[:2])
    total_turnover = sum(float(s.get("turnover_cr", 0.0)) for s in sector_stocks)
    turnover_share_top2 = (top2_turnover / total_turnover) if total_turnover > 0 else 0.5

    concentration_penalty = False
    leadership_bonus = False

    # Penalty if only top 2 move sector and breadth is < 40%
    if turnover_share_top2 > 0.70 and pct_adv < 45.0:
        concentration_penalty = True
        breadth_quality = "Narrow / Concentrated (Penalty Applied)"
    elif pct_adv >= 70.0 and turnover_share_top2 < 0.55:
        leadership_bonus = True
        breadth_quality = "Broad-Based Participation (Bonus Applied)"
    else:
        breadth_quality = "Standard Distribution"

    # Base breadth score
    b_score = 30.0 + (pct_adv * 0.5) + ((avg_52w_prox - 75.0) * 0.8)
    if leadership_bonus:
        b_score += 15.0
    if concentration_penalty:
        b_score -= 18.0

    return {
        "score": round(max(5.0, min(98.0, b_score)), 1),
        "adv_dec_ratio": ad_ratio,
        "pct_advances": round(pct_adv, 1),
        "pct_above_20ema": round(min(98.0, max(5.0, pct_adv * 0.95 + 4.0)), 1),
        "concentration_penalty": concentration_penalty,
        "leadership_bonus": leadership_bonus,
        "breadth_quality": breadth_quality
    }


def evaluate_volume_and_participation(candles: List[Dict[str, Any]], sector_stocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Dimension 4: Volume, RVOL & Participation (15% Weight)."""
    if len(candles) < 25:
        return {"score": 50.0, "rvol": 1.0, "expansion": False}

    volumes = [c["volume"] for c in candles]
    vol_sma20 = sum(volumes[-21:-1]) / 20.0 if len(volumes) >= 21 else volumes[-1]
    curr_vol = volumes[-1]
    rvol = round(curr_vol / max(1.0, vol_sma20), 2)

    # Average constituent vol multiplier
    if sector_stocks:
        stock_vmuls = [float(s.get("volMul", 1.0)) for s in sector_stocks if s.get("volMul")]
        avg_stock_rvol = sum(stock_vmuls) / len(stock_vmuls) if stock_vmuls else 1.0
    else:
        avg_stock_rvol = 1.0

    combined_rvol = round((rvol * 0.6) + (avg_stock_rvol * 0.4), 2)
    is_expansion = combined_rvol >= 1.25

    # Price-Volume Correlation: Up on high volume vs Down on low volume
    c_last = candles[-1]["close"]
    c_prev = candles[-2]["close"]
    price_up = c_last >= c_prev

    v_score = 50.0 + ((combined_rvol - 1.0) * 25.0)
    if price_up and is_expansion:
        v_score += 15.0
    elif not price_up and is_expansion:
        v_score -= 15.0

    return {
        "score": round(max(5.0, min(98.0, v_score)), 1),
        "rvol": combined_rvol,
        "expansion": is_expansion
    }


def evaluate_price_structure(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Dimension 5: Market Structure & Stage Transitions (10% Weight)."""
    if len(candles) < 65:
        return {"score": 50.0, "structure": "Base Consolidation", "bos": False, "choch": False}

    closes = [c["close"] for c in candles]
    highs = [c["high"] for c in candles]
    lows = [c["low"] for c in candles]

    # Recent 20-day high and low vs prior 40-day high and low
    recent_high = max(highs[-20:])
    recent_low = min(lows[-20:])
    prior_high = max(highs[-60:-20])
    prior_low = min(lows[-60:-20])

    curr_close = closes[-1]

    # Break of Structure (BOS) / Change of Character (CHoCH)
    bos_bullish = curr_close > prior_high
    choch_bullish = (curr_close > prior_high) and (min(lows[-40:-20]) < min(lows[-60:-40]))
    bearish_break = curr_close < prior_low

    if bos_bullish:
        struct_label = "Bullish Breakout (BOS)"
        score = 90.0
    elif choch_bullish:
        struct_label = "Structure Shift Bullish (CHoCH)"
        score = 85.0
    elif curr_close > (recent_low + (recent_high - recent_low) * 0.65):
        struct_label = "Higher High / Higher Low"
        score = 75.0
    elif bearish_break:
        struct_label = "Bearish Breakdown"
        score = 20.0
    elif curr_close < (recent_low + (recent_high - recent_low) * 0.35):
        struct_label = "Lower High / Lower Low"
        score = 30.0
    else:
        struct_label = "Base Accumulation / Range"
        score = 60.0

    return {
        "score": score,
        "structure": struct_label,
        "bos": bos_bullish,
        "choch": choch_bullish
    }


def evaluate_accumulation_distribution(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Dimension 6: Accumulation / Distribution & Money Flow (10% Weight)."""
    if len(candles) < 30:
        return {"score": 50.0, "cmf": 0.0, "quiet_accumulation": False, "distribution": False}

    cmf = compute_cmf(candles, 20)
    obv_score = compute_obv_slope(candles, 20)

    # Quiet Accumulation: Price flat (-1% to +1.5% in 10D) but CMF > 0.06 and OBV > 60
    c_10d_ago = candles[-11]["close"] if len(candles) >= 11 else candles[0]["close"]
    p_change_10d = ((candles[-1]["close"] - c_10d_ago) / c_10d_ago) * 100.0

    quiet_accum = (-1.5 <= p_change_10d <= 2.5) and (cmf > 0.05) and (obv_score >= 58.0)
    distribution = (cmf < -0.08) or (p_change_10d > 2.0 and cmf < -0.05)

    base_score = 50.0 + (cmf * 120.0) + ((obv_score - 50.0) * 0.5)
    if quiet_accum:
        base_score += 15.0
    if distribution:
        base_score -= 20.0

    return {
        "score": round(max(5.0, min(98.0, base_score)), 1),
        "cmf": round(cmf, 3),
        "quiet_accumulation": quiet_accum,
        "distribution": distribution
    }


def evaluate_trend_regime_and_stages(candles: List[Dict[str, Any]], market_regime: str) -> Dict[str, Any]:
    """Dimension 7: Moving Average Transition Stage 1 to 6 (10% Weight)."""
    if len(candles) < 205:
        closes = [c["close"] for c in candles] if candles else [100.0]
        c_curr = closes[-1]
        ema20 = compute_ema(closes, min(20, len(closes)))
        dma_len = min(len(closes), 200)
        dma200 = compute_sma(closes, dma_len) if dma_len > 0 else c_curr
        dist_200 = ((c_curr - dma200) / dma200) * 100.0 if dma200 > 0 else 0.0
        dist_20 = ((c_curr - ema20) / ema20) * 100.0 if ema20 > 0 else 0.0
        return {
            "score": 50.0,
            "stage": "Stage 2: EMA Transition",
            "stage_num": 2,
            "overextended": False,
            "dist_200dma": round(dist_200, 2),
            "dist_20ema": round(dist_20, 2)
        }

    closes = [c["close"] for c in candles]
    c_curr = closes[-1]
    ema20 = compute_ema(closes, 20)
    ema50 = compute_ema(closes, 50)
    dma200 = compute_sma(closes, 200)
    dma200_prev20 = compute_sma(closes[:-20], 200)
    dma200_slope = ((dma200 - dma200_prev20) / dma200_prev20) * 100.0

    # Overextension: > 14% above 200 DMA or > 6% above 20 EMA
    dist_200 = ((c_curr - dma200) / dma200) * 100.0
    dist_20 = ((c_curr - ema20) / ema20) * 100.0
    overextended = (dist_200 > 16.0) or (dist_20 > 7.5)

    # 6-Stage Moving Average Model
    if c_curr < dma200 and ema20 < ema50:
        stage = "Stage 1: Structural Downtrend (< 200 DMA)"
        stage_num = 1
        score = 25.0
    elif c_curr > ema20 and c_curr > ema50 and c_curr < dma200:
        stage = "Stage 2: Recovery / Crossing Short EMAs"
        stage_num = 2
        score = 75.0  # HIGH ROTATION POTENTIAL
    elif c_curr > dma200 and ema50 > dma200 and dma200_slope < 0.2:
        stage = "Stage 3/4: 200 DMA Base Flattening & Breakout"
        stage_num = 4
        score = 90.0  # OPTIMAL EARLY ROTATION ENTRY
    elif c_curr > dma200 and dma200_slope >= 0.2 and not overextended:
        stage = "Stage 5: Established Bullish Uptrend"
        stage_num = 5
        score = 80.0
    elif overextended:
        stage = "Stage 6: Overextended / Late Stage Rally"
        stage_num = 6
        score = 45.0  # PENALTY FOR LATE RUNNER
    else:
        stage = "Stage 3: 50 DMA Slope Positive"
        stage_num = 3
        score = 70.0

    # Market regime adjustment
    if market_regime == "Bear Market" and stage_num >= 4:
        score += 5.0  # Defensive relative resilience

    return {
        "score": round(max(5.0, min(98.0, score)), 1),
        "stage": stage,
        "stage_num": stage_num,
        "overextended": overextended,
        "dist_200dma": round(dist_200, 2),
        "dist_20ema": round(dist_20, 2)
    }


def compute_stock_leadership(stock: Dict[str, Any], sector_alpha_1w: float) -> Dict[str, Any]:
    """Scores individual constituent stocks within the sector."""
    chg = float(stock.get("change", 0.0))
    vol_mul = float(stock.get("volMul", 1.0))
    p = float(stock.get("price", 1.0))
    h52 = float(stock.get("high52", p))
    dist_52h = round(((p - h52) / h52) * 100.0, 1) if h52 > 0 else -10.0

    # Leadership score
    score = 50.0 + (chg * 4.0) + ((vol_mul - 1.0) * 15.0) + ((dist_52h + 15.0) * 1.5)
    score = max(5.0, min(98.0, score))

    if chg > 1.5 and vol_mul > 1.3:
        role = "Leader"
        badge_cls = "badge-bull"
    elif chg > 0 and chg > sector_alpha_1w:
        role = "Emerging Leader"
        badge_cls = "badge-cyan"
    elif chg < -1.0:
        role = "Lagging Stock"
        badge_cls = "badge-bear"
    else:
        role = "Participant"
        badge_cls = "badge-neutral"

    return {
        "symbol": stock.get("symbol", ""),
        "name": stock.get("name", ""),
        "price": p,
        "change": chg,
        "vol_mul": vol_mul,
        "turnover_cr": float(stock.get("turnover_cr", 0.0)),
        "dist_52h": dist_52h,
        "score": round(score, 1),
        "role": role,
        "badge_cls": badge_cls
    }


# --- 4. Main Computational Pipeline Routine ---

def execute_sector_rotation_scanner(
    trade_date: datetime.date = None,
    output_dir: str = None
) -> Dict[str, Any]:
    """
    Executes the institutional Sector Rotation Scanner pipeline.
    Generates data/sector_rotation_matrix.json.
    """
    if trade_date is None:
        trade_date = datetime.date.today()
    if output_dir is None:
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(repo_root, "data")
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 75)
    print("MITS 360 INSTITUTIONAL SECTOR ROTATION SCANNER & PREDICTIVE TRACKER")
    print(f"Execution Trade Date: {trade_date.strftime('%d-%b-%Y')}")
    print("=" * 75)

    # 1. Load constituent stock data from data/market_summary.json
    summary_path = os.path.join(output_dir, "market_summary.json")
    all_stocks = []
    if os.path.exists(summary_path):
        try:
            with open(summary_path, "r", encoding="utf-8") as f:
                sum_data = json.load(f)
                all_stocks = sum_data.get("stocks", [])
                print(f"[*] Ingested {len(all_stocks)} constituent stocks from market summary.")
        except Exception as e:
            print(f"[!] Warning reading market_summary.json: {e}")

    # 2. Fetch Benchmarks and Sector candles concurrently
    print("[*] Fetching Benchmark and Sector index candles concurrently...")
    from concurrent.futures import ThreadPoolExecutor
    all_syms = [BENCHMARK_NIFTY50["symbol"], BENCHMARK_NIFTY500["symbol"]] + [item["symbol"] for item in SECTOR_REGISTRY]
    candles_by_sym = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_sym = {executor.submit(fetch_candles, s): s for s in all_syms}
        for future in future_to_sym:
            s = future_to_sym[future]
            try:
                candles_by_sym[s] = future.result()
            except Exception as e:
                print(f"    [!] Error fetching candles for {s}: {e}")
                candles_by_sym[s] = []

    bench_nifty50_candles = candles_by_sym.get(BENCHMARK_NIFTY50["symbol"], [])
    bench_nifty500_candles = candles_by_sym.get(BENCHMARK_NIFTY500["symbol"], [])

    # Determine Market Regime via Nifty 50
    b_closes = [c["close"] for c in bench_nifty50_candles]
    b_curr = b_closes[-1] if b_closes else 23300.0
    b_ema20 = compute_ema(b_closes, 20)
    b_ema50 = compute_ema(b_closes, 50)
    b_dma200 = compute_sma(b_closes, 200)

    if b_curr > b_ema50 > b_dma200:
        market_regime = "Bull Market"
        regime_desc = "Benchmark trading firmly above rising 50 EMA and 200 DMA."
    elif b_curr < b_ema50 and b_curr > b_dma200:
        market_regime = "Sideways / Consolidation"
        regime_desc = "Consolidation phase between 50 EMA overhead and 200 DMA support."
    else:
        market_regime = "Bear Market / Defensive"
        regime_desc = "Supply overhead below 200 DMA; favoring defensive relative strength."

    print(f"[*] Detected Market Regime: {market_regime}")

    # 3. Process each Sector through all 8 Quantitative Dimensions
    sectors_results = []

    for item in SECTOR_REGISTRY:
        sym = item["symbol"]
        name = item["name"]
        sec_id = item["sector_id"]

        print(f"    Evaluating {name} ({sym})...")
        candles = candles_by_sym.get(sym, [])
        if not candles:
            print(f"    [!] Skipping {name}: no candle data.")
            continue

        # Filter constituent stocks belonging to this sector
        sec_stocks = [s for s in all_stocks if s.get("sector", "").lower() == sec_id]

        # Dimension 1: Relative Strength (20%)
        rs_res = evaluate_relative_strength(candles, bench_nifty50_candles, bench_nifty500_candles)

        # Dimension 2: Momentum (15%)
        mom_res = evaluate_momentum(candles)

        # Dimension 3: Breadth (15%)
        br_res = evaluate_breadth(sec_stocks)

        # Dimension 4: Volume & Participation (15%)
        vol_res = evaluate_volume_and_participation(candles, sec_stocks)

        # Dimension 5: Price Structure (10%)
        str_res = evaluate_price_structure(candles)

        # Dimension 6: Accumulation / Distribution (10%)
        acc_res = evaluate_accumulation_distribution(candles)

        # Dimension 7: Trend Regime & Stages (10%)
        trend_res = evaluate_trend_regime_and_stages(candles, market_regime)

        # Dimension 8: Rotation Acceleration (5%)
        # Approximate historical SRS 5 days ago using prior closes
        accel_score = 50.0 + (rs_res["acceleration"] * 4.0) + (mom_res["roc_5d"] * 1.5)
        accel_score = round(max(5.0, min(98.0, accel_score)), 1)

        # Final Multi-Factor Sector Rotation Score (SRS: 0 - 100)
        srs = (
            (0.20 * rs_res["score"]) +
            (0.15 * mom_res["score"]) +
            (0.15 * br_res["score"]) +
            (0.15 * vol_res["score"]) +
            (0.10 * str_res["score"]) +
            (0.10 * acc_res["score"]) +
            (0.10 * trend_res["score"]) +
            (0.05 * accel_score)
        )
        srs = round(max(5.0, min(99.0, srs)), 1)

        # Signal Confidence Score (0 - 100%)
        # Confluence of factors agreeing
        confluence_count = sum([
            1 if rs_res["score"] >= 55 else 0,
            1 if mom_res["score"] >= 55 else 0,
            1 if br_res["score"] >= 55 else 0,
            1 if vol_res["score"] >= 55 else 0,
            1 if str_res["score"] >= 55 else 0,
            1 if acc_res["score"] >= 55 else 0,
            1 if trend_res["score"] >= 55 else 0
        ])
        confidence = round(min(96.0, max(45.0, 50.0 + (confluence_count * 6.0) + (10.0 if not br_res["concentration_penalty"] else -12.0))), 0)

        # Phase Classification
        # Phase 1: Leading | Phase 2: Weakening | Phase 3: Lagging | Phase 4: Improving
        if rs_res["score"] >= 62 and mom_res["score"] >= 58 and br_res["score"] >= 50:
            phase = "LEADING"
            phase_code = "leading"
            phase_color = "emerald"
        elif rs_res["score"] >= 55 and (mom_res["score"] < 48 or rs_res["acceleration"] < -1.5):
            phase = "WEAKENING"
            phase_code = "weakening"
            phase_color = "amber"
        elif rs_res["score"] < 48 and mom_res["score"] < 48:
            phase = "LAGGING"
            phase_code = "lagging"
            phase_color = "rose"
        else:
            # Low/medium RS with rising momentum & breadth -> Primary Early Target!
            phase = "IMPROVING"
            phase_code = "improving"
            phase_color = "cyan"

        # Signal Tiers (A+, A, B, C, D)
        if srs >= 82 and confidence >= 75:
            signal_tier = "A+"
        elif srs >= 72 and confidence >= 65:
            signal_tier = "A"
        elif srs >= 58:
            signal_tier = "B"
        elif srs >= 45:
            signal_tier = "C"
        else:
            signal_tier = "D"

        # Alert Tag Engine
        alerts = []
        if trend_res["overextended"] or (mom_res["rsi"] > 74 and br_res["pct_advances"] < 45):
            alerts.append({"type": "ROTATION_EXHAUSTION", "label": "Rotation Exhaustion", "badge": "badge-bear"})
        elif acc_res["distribution"]:
            alerts.append({"type": "DISTRIBUTION", "label": "Capital Outflow / Dist.", "badge": "badge-bear"})
        elif phase == "IMPROVING" and mom_res["turning_up"] and rs_res["acceleration"] > 0 and not trend_res["overextended"]:
            alerts.append({"type": "EARLY_ROTATION", "label": "Early Rotation Alert", "badge": "badge-cyan"})
        elif phase == "LEADING" and str_res["bos"] and vol_res["expansion"]:
            alerts.append({"type": "CONFIRMED_ROTATION", "label": "Confirmed Leader", "badge": "badge-bull"})

        if not alerts:
            alerts.append({"type": "NORMAL", "label": phase.capitalize(), "badge": f"badge-{phase_color}"})

        # Explainable Scoring Rationale
        reasons = []
        if rs_res["acceleration"] > 1.0:
            reasons.append(f"Short-term relative strength accelerating rapidly (+{rs_res['acceleration']}% vs Nifty 50).")
        if mom_res["turning_up"]:
            reasons.append("Daily momentum indicators (RSI & MACD histogram) pivoting upward prior to breakout.")
        if br_res["leadership_bonus"]:
            reasons.append(f"Broad-based constituent participation ({br_res['pct_advances']}% stocks advancing).")
        if br_res["concentration_penalty"]:
            reasons.append("Heavyweight concentration risk: advance driven predominantly by top 2 stocks.")
        if acc_res["quiet_accumulation"]:
            reasons.append("Quiet institutional accumulation detected: money flow rising amidst price consolidation.")
        if trend_res["stage_num"] in (2, 4):
            reasons.append(f"Favorable stage inflection: {trend_res['stage']}.")
        if trend_res.get("overextended") and trend_res.get("dist_200dma") is not None:
            reasons.append(f"Caution: Extended {trend_res['dist_200dma']}% above 200 DMA.")

        if not reasons:
            reasons.append("Consolidated performance tracking within benchmark corridor.")

        # Constituent Stocks Leadership Ranking
        stock_drill = []
        for st in sec_stocks:
            stock_drill.append(compute_stock_leadership(st, rs_res["alphas"].get("5D", 0.0)))
        stock_drill.sort(key=lambda x: x["score"], reverse=True)

        sectors_results.append({
            "symbol": sym,
            "name": name,
            "short_name": item["short_name"],
            "icon": item["icon"],
            "current_price": round(candles[-1]["close"], 2),
            "rotation_score": srs,
            "confidence_score": int(confidence),
            "phase": phase,
            "phase_code": phase_code,
            "phase_color": phase_color,
            "signal_tier": signal_tier,
            "primary_alert": alerts[0],
            "all_alerts": alerts,
            "factors": {
                "relative_strength": rs_res["score"],
                "momentum": mom_res["score"],
                "breadth": br_res["score"],
                "volume": vol_res["score"],
                "structure": str_res["score"],
                "accumulation": acc_res["score"],
                "trend": trend_res["score"],
                "acceleration": accel_score
            },
            "metrics": {
                "rs_trend": rs_res["trend"],
                "rs_accel": rs_res["acceleration"],
                "alphas": rs_res["alphas"],
                "alphas_n500": rs_res["alphas_n500"],
                "rsi": mom_res["rsi"],
                "roc_5d": mom_res["roc_5d"],
                "adx": mom_res["adx"],
                "breadth_pct": br_res["pct_advances"],
                "rvol": vol_res["rvol"],
                "structure": str_res["structure"],
                "cmf": acc_res["cmf"],
                "stage": trend_res["stage"],
                "stage_num": trend_res["stage_num"],
                "dist_200dma": trend_res.get("dist_200dma", 0.0)
            },
            "explainable_reasons": reasons,
            "top_stocks": stock_drill[:8]
        })

    # 4. Sort Sectors by SRS Descending
    sectors_results.sort(key=lambda x: (x["rotation_score"], x["factors"]["acceleration"]), reverse=True)

    for idx, s in enumerate(sectors_results, start=1):
        s["rank"] = idx

    # 5. Extract Spotlights: Early Rotation, Confirmed Leader, Outflow
    early_candidates = [s for s in sectors_results if s["phase_code"] == "improving"]
    confirmed_leaders = [s for s in sectors_results if s["phase_code"] == "leading"]
    outflow_sectors = [s for s in sectors_results if s["phase_code"] in ("weakening", "lagging")]

    top_early = early_candidates[0] if early_candidates else sectors_results[1]
    top_leader = confirmed_leaders[0] if confirmed_leaders else sectors_results[0]
    top_outflow = outflow_sectors[-1] if outflow_sectors else sectors_results[-1]

    # 6. Build Final Structured Output
    payload = {
        "meta": {
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "market_date": trade_date.strftime("%d-%b-%Y"),
            "market_regime": market_regime,
            "market_regime_desc": regime_desc,
            "primary_benchmark": "Nifty 50 (^NSEI)",
            "primary_benchmark_price": round(b_curr, 2),
            "broad_benchmark": "Nifty 500 (^CRSLDX)",
            "total_sectors_evaluated": len(sectors_results),
            "status": "FINALIZED"
        },
        "spotlights": {
            "top_early_rotation": {
                "name": top_early["name"],
                "symbol": top_early["symbol"],
                "rotation_score": top_early["rotation_score"],
                "confidence": top_early["confidence_score"],
                "phase": top_early["phase"],
                "signal_tier": top_early["signal_tier"],
                "rationale": " ".join(top_early["explainable_reasons"][:2]),
                "headline": f"Early Rotation Surge: {top_early['name']}",
                "alpha_5d": top_early["metrics"]["alphas"].get("5D", 0.0),
                "rsi": top_early["metrics"]["rsi"]
            },
            "top_confirmed_leader": {
                "name": top_leader["name"],
                "symbol": top_leader["symbol"],
                "rotation_score": top_leader["rotation_score"],
                "confidence": top_leader["confidence_score"],
                "phase": top_leader["phase"],
                "signal_tier": top_leader["signal_tier"],
                "rationale": " ".join(top_leader["explainable_reasons"][:2]),
                "headline": f"Confirmed Sector Leader: {top_leader['name']}",
                "alpha_5d": top_leader["metrics"]["alphas"].get("5D", 0.0),
                "breadth_pct": top_leader["metrics"]["breadth_pct"]
            },
            "top_outflow_warning": {
                "name": top_outflow["name"],
                "symbol": top_outflow["symbol"],
                "rotation_score": top_outflow["rotation_score"],
                "confidence": top_outflow["confidence_score"],
                "phase": top_outflow["phase"],
                "signal_tier": top_outflow["signal_tier"],
                "rationale": " ".join(top_outflow["explainable_reasons"][:2]),
                "headline": f"Capital Outflow Alert: {top_outflow['name']}",
                "alpha_5d": top_outflow["metrics"]["alphas"].get("5D", 0.0)
            }
        },
        "quadrant_counts": {
            "leading": len([s for s in sectors_results if s["phase_code"] == "leading"]),
            "improving": len([s for s in sectors_results if s["phase_code"] == "improving"]),
            "weakening": len([s for s in sectors_results if s["phase_code"] == "weakening"]),
            "lagging": len([s for s in sectors_results if s["phase_code"] == "lagging"])
        },
        "sectors": sectors_results
    }

    out_file = os.path.join(output_dir, "sector_rotation_matrix.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    file_size_kb = os.path.getsize(out_file) / 1024.0
    print(f"\n[OK] SUCCESS: Sector Rotation Scanner generated at: {out_file} ({file_size_kb:.1f} KB)")
    print(f"    Sectors Evaluated: {len(sectors_results)}")
    print(f"    Top Early Rotation Candidate: {top_early['name']} (Score: {top_early['rotation_score']})")
    print(f"    Top Confirmed Leader: {top_leader['name']} (Score: {top_leader['rotation_score']})")
    print("=" * 75)

    return payload


if __name__ == "__main__":
    execute_sector_rotation_scanner()
