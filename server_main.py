import argparse
import logging
from pathlib import Path
from server.app import app

def main():
    import uvicorn

    parser = argparse.ArgumentParser(description="DMGTTM - Dungeon Master Tool Server")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Server host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Server port (default: 8000)")
    parser.add_argument("--log-level", choices=["debug", "info", "warning", "error", "critical"], default="info", help="Log level")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")

    args = parser.parse_args()

    logging.basicConfig(level=getattr(logging, args.log_level.upper()))
    logger = logging.getLogger(__name__)
    logger.info(f"Starting DMGTTM Server on {args.host}:{args.port}")

    uvicorn.run("server.app:app", host=args.host, port=args.port, reload=args.reload, log_level=args.log_level)

if __name__ == "__main__":
    main()
