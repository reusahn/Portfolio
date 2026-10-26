"""Independent TCP framing sender. Python 3 standard library. No CV model or archive code."""
import argparse
import socket
import struct
from pathlib import Path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("png", type=Path)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8031, type=int)
    parser.add_argument("--chunk-size", default=65536, type=int)
    parser.add_argument("--disconnect-after", type=int, help="QA: close after N payload bytes")
    args = parser.parse_args()
    payload = args.png.read_bytes()
    if not 24 <= len(payload) <= 4 * 1024 * 1024:
        parser.error("PNG must be between 24 bytes and 4 MiB.")
    if payload[:8] != b"\x89PNG\r\n\x1a\n":
        parser.error("Input must be PNG.")
    width, height = struct.unpack("!II", payload[16:24])
    if not (0 < width <= 2048 and 0 < height <= 2048) or args.chunk_size < 1:
        parser.error("Use a PNG up to 2048x2048 and a positive chunk size.")
    if args.disconnect_after is not None and not 0 <= args.disconnect_after < len(payload):
        parser.error("--disconnect-after must be shorter than the payload.")
    outbound = payload if args.disconnect_after is None else payload[:args.disconnect_after]
    with socket.create_connection((args.host, args.port), timeout=5) as sock:
        sock.sendall(struct.pack("!I", len(payload)))
        for start in range(0, len(outbound), args.chunk_size):
            sock.sendall(outbound[start:start + args.chunk_size])
    print(f"Sent {len(outbound)} of {len(payload)} payload bytes. Display receipt is not acknowledged.")
    if args.disconnect_after is not None:
        print("Intentional partial frame. Receiver should retain its previous image.")

if __name__ == "__main__":
    main()
