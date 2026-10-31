import argparse
import json
import math
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Lock


def encode_cue(data):
    if not isinstance(data, dict) or set(data) != {"speed", "power", "phase", "light"}:
        raise ValueError("expected speed, power, phase, light")
    values = []
    for name in ("speed", "power", "phase", "light"):
        value = data[name]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(name)
        if not math.isfinite(value) or not 0 <= value <= 1:
            raise ValueError(name)
        values.append(round(value * 100))
    return ("M," + ",".join(map(str, values)) + "\n").encode("ascii")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", help="serial device, such as /dev/cu.usbmodem...")
    parser.add_argument("--baud", type=int, default=115200)
    parser.add_argument("--listen", type=int, default=8765)
    args = parser.parse_args()

    device = None
    if args.port:
        import serial
        device = serial.Serial(args.port, args.baud, timeout=0.2, write_timeout=0.2)
    lock = Lock()

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/cue":
                self.send_error(404)
                return
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if size < 2 or size > 512:
                    raise ValueError("payload size")
                packet = encode_cue(json.loads(self.rfile.read(size)))
            except (ValueError, TypeError, json.JSONDecodeError):
                self.send_error(400)
                return
            try:
                with lock:
                    if device is not None:
                        device.write(packet)
            except Exception:
                self.send_error(503)
                return
            self.send_response(204)
            self.end_headers()

        def log_message(self, format, *values):
            pass

    try:
        ThreadingHTTPServer(("127.0.0.1", args.listen), Handler).serve_forever()
    finally:
        if device is not None:
            device.close()


if __name__ == "__main__":
    main()
