"""
common/logging.py

Centralized structured logger and latency timing metrics.
"""

import logging
import time
import sys
from typing import Dict, Any, Optional
from config import LOG_LEVEL


def setup_logger(name: str = "shifa") -> logging.Logger:
    """Configures standard formatted logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


logger = setup_logger()


class Timer:
    """Context manager to measure latency of individual pipeline stages."""

    def __init__(self, stage_name: str):
        self.stage_name = stage_name
        self.elapsed_ms: float = 0.0
        self.start_time: Optional[float] = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time is not None:
            self.elapsed_ms = round((time.perf_counter() - self.start_time) * 1000, 2)
            logger.debug(f"[LATENCY] {self.stage_name}: {self.elapsed_ms}ms")
