from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import signal
import sys

PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8", errors="replace")

        print(f'\n{self.client_address[0]} - "POST {self.path} {self.request_version}"')
        print(body)
        sys.stdout.flush()

        self.send_response(204)
        self.end_headers()

def stop_server(signal_number, frame):
    print("\nStopping server...")
    sys.exit(0)

signal.signal(signal.SIGINT, stop_server)

server = ThreadingHTTPServer(("", PORT), Handler)
print(f"Serving current folder at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")
server.serve_forever()