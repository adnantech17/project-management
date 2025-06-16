import logging
from fastapi import Request
from typing import Dict, Any

logger = logging.getLogger("app")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

SENSITIVE_FIELDS = {"password", "hashed_password"}

def filter_sensitive(data: Dict[str, Any]) -> Dict[str, Any]:
    return {k: ("***" if k in SENSITIVE_FIELDS else v) for k, v in data.items()}

def log_request(request: Request, body: Dict[str, Any]):
    filtered = filter_sensitive(body)
    logger.info(f"{request.method} {request.url.path} | params: {filtered}") 