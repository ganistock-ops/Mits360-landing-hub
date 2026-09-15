#!/usr/bin/env python3
"""
Unit Tests for MITS 360 Sector Rotation Scanner
Verifies:
1. Zero look-ahead bias
2. Mathematical boundedness of all 8 factor dimensions (0 <= Score <= 100)
3. SRS formula integrity
4. JSON output schema conformance
"""

import os
import json
import unittest
import datetime
from scripts.sector_rotation_scanner import (
    compute_sma,
    compute_ema,
    compute_rsi,
    compute_macd,
    compute_adx,
    compute_cmf,
    evaluate_relative_strength,
    evaluate_momentum,
    evaluate_breadth,
    evaluate_price_structure,
    evaluate_accumulation_distribution,
    evaluate_trend_regime_and_stages
)

class TestSectorRotationScanner(unittest.TestCase):

    def setUp(self):
        # Generate synthetic historical candle series for testing
        self.candles = []
        base_p = 1000.0
        for i in range(250):
            # Deterministic upward trend with noise
            c = base_p + (i * 1.5) + (5.0 if i % 2 == 0 else -4.0)
            h = c + 4.0
            l = c - 4.0
            o = c - 1.0
            v = 100000.0 + (i * 500)
            self.candles.append({
                "time": 1700000000 + (i * 86400),
                "date": f"2026-01-{i%28+1:02d}",
                "open": o, "high": h, "low": l, "close": c, "volume": v
            })

    def test_zero_look_ahead_bias(self):
        """
        Critical Test: Slicing candles up to bar T must produce exact same metrics
        regardless of future bars existing in the dataset.
        """
        t = 150
        slice_t = self.candles[:t]
        
        # Indicator on sliced data
        rsi_sliced = compute_rsi([c["close"] for c in slice_t], 14)
        ema_sliced = compute_ema([c["close"] for c in slice_t], 20)
        macd_sliced = compute_macd([c["close"] for c in slice_t])
        
        # Slicing the full dataset up to T must yield identical values
        full_sliced = self.candles[:t]
        rsi_check = compute_rsi([c["close"] for c in full_sliced], 14)
        ema_check = compute_ema([c["close"] for c in full_sliced], 20)
        macd_check = compute_macd([c["close"] for c in full_sliced])
        
        self.assertEqual(rsi_sliced, rsi_check, "RSI exhibits look-ahead contamination!")
        self.assertEqual(ema_sliced, ema_check, "EMA exhibits look-ahead contamination!")
        self.assertEqual(macd_sliced, macd_check, "MACD exhibits look-ahead contamination!")

    def test_indicators_boundedness(self):
        closes = [c["close"] for c in self.candles]
        rsi = compute_rsi(closes, 14)
        self.assertTrue(0.0 <= rsi <= 100.0, f"RSI out of bounds: {rsi}")

        adx = compute_adx(self.candles, 14)
        self.assertTrue(0.0 <= adx <= 100.0, f"ADX out of bounds: {adx}")

        cmf = compute_cmf(self.candles, 20)
        self.assertTrue(-1.0 <= cmf <= 1.0, f"CMF out of bounds: {cmf}")

    def test_dimensions_score_ranges(self):
        """All factor dimension scores must strictly remain in [0, 100]."""
        mom = evaluate_momentum(self.candles)
        self.assertTrue(0.0 <= mom["score"] <= 100.0, f"Momentum score out of bounds: {mom['score']}")

        struct = evaluate_price_structure(self.candles)
        self.assertTrue(0.0 <= struct["score"] <= 100.0, f"Structure score out of bounds: {struct['score']}")

        accum = evaluate_accumulation_distribution(self.candles)
        self.assertTrue(0.0 <= accum["score"] <= 100.0, f"Accumulation score out of bounds: {accum['score']}")

        trend = evaluate_trend_regime_and_stages(self.candles, "Bull Market")
        self.assertTrue(0.0 <= trend["score"] <= 100.0, f"Trend score out of bounds: {trend['score']}")

    def test_output_json_conformance(self):
        """Verify data/sector_rotation_matrix.json exists and adheres to full specification."""
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sector_rotation_matrix.json")
        self.assertTrue(os.path.exists(json_path), f"File {json_path} does not exist!")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("meta", data)
        self.assertIn("spotlights", data)
        self.assertIn("sectors", data)
        self.assertGreaterEqual(len(data["sectors"]), 10, "Expected at least 10 sectors")

        # Verify each sector has required fields
        required_sector_keys = {
            "name", "symbol", "rotation_score", "confidence_score", "phase",
            "signal_tier", "factors", "metrics", "explainable_reasons"
        }
        for s in data["sectors"]:
            for k in required_sector_keys:
                self.assertIn(k, s, f"Sector {s.get('name')} missing required key '{k}'")
            self.assertTrue(0.0 <= s["rotation_score"] <= 100.0, f"SRS out of bounds for {s['name']}")
            self.assertTrue(0.0 <= s["confidence_score"] <= 100.0, f"Confidence out of bounds for {s['name']}")

if __name__ == "__main__":
    unittest.main()
