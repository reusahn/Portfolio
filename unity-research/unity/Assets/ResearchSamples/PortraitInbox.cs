using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace Jonghoon.ResearchSamples
{
    // One active sender at a time. This is a framing/thread-boundary example, not the four-user installation.
    public sealed class PortraitInbox : MonoBehaviour
    {
        [SerializeField] int port = 8031;
        [SerializeField] bool allowLan;
        [SerializeField] Renderer displaySurface;
        [SerializeField] string status = "stopped";
        const int MaxBytes = 4 * 1024 * 1024;
        sealed class Inbox
        {
            public readonly CancellationTokenSource cancel = new CancellationTokenSource();
            public readonly BlockingCollection<byte[]> queue = new BlockingCollection<byte[]>(2);
            public TcpListener listener;
            public TcpClient client;
            public Task worker;
            public volatile string status = "starting";
        }
        Inbox inbox;
        Texture2D displayed;
        MaterialPropertyBlock block;
        string lastTransportStatus = "";

        void OnEnable()
        {
            block = new MaterialPropertyBlock();
            var current = new Inbox();
            try
            {
                current.listener = new TcpListener(allowLan ? IPAddress.Any : IPAddress.Loopback, port);
                current.listener.Start();
                inbox = current;
                current.worker = Task.Run(() => Receive(current));
            }
            catch (Exception e) { inbox = null; status = "bind_failed: " + e.Message; current.listener?.Stop(); current.cancel.Dispose(); current.queue.Dispose(); }
        }

        static void Receive(Inbox s)
        {
            var token = s.cancel.Token;
            try
            {
                while (!token.IsCancellationRequested)
                {
                    s.status = "listening";
                    using (var client = s.listener.AcceptTcpClient())
                    {
                        s.client = client;
                        client.ReceiveTimeout = 3000;
                        using (var stream = client.GetStream())
                        {
                            try
                            {
                                while (!token.IsCancellationRequested)
                                {
                                    var header = new byte[4];
                                    ReadFully(stream, header, token);
                                    int n = BigEndian(header, 0);
                                    if (n < 24 || n > MaxBytes) throw new InvalidDataException("Invalid frame length.");
                                    var bytes = new byte[n];
                                    ReadFully(stream, bytes, token);
                                    // Backpressure bounds pending frames. Unity never runs on this worker.
                                    s.queue.Add(bytes, token);
                                    s.status = "frame_queued";
                                }
                            }
                            catch (Exception e) when (e is IOException || e is SocketException || e is InvalidDataException)
                            { s.status = "connection_closed: " + e.GetType().Name; }
                        }
                    }
                    s.client = null;
                }
            }
            catch (OperationCanceledException) { }
            catch (Exception e) { if (!token.IsCancellationRequested) s.status = "listener_failed: " + e.GetType().Name; }
        }

        static int BigEndian(byte[] b, int i) =>
            (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3];

        static void ReadFully(Stream stream, byte[] destination, CancellationToken token)
        {
            int offset = 0;
            while (offset < destination.Length)
            {
                token.ThrowIfCancellationRequested();
                int n = stream.Read(destination, offset, destination.Length - offset);
                if (n == 0) throw new EndOfStreamException("Peer closed a partial frame.");
                offset += n;
            }
        }

        static bool SafePng(byte[] b)
        {
            byte[] signature = { 137, 80, 78, 71, 13, 10, 26, 10 };
            if (b.Length < 24) return false;
            for (int i = 0; i < signature.Length; i++) if (b[i] != signature[i]) return false;
            if (b[12] != 73 || b[13] != 72 || b[14] != 68 || b[15] != 82) return false;
            int w = BigEndian(b, 16), h = BigEndian(b, 20);
            return w > 0 && h > 0 && w <= 2048 && h <= 2048;
        }

        void Update()
        {
            var current = inbox;
            if (current == null) return;
            if (lastTransportStatus != current.status)
            { lastTransportStatus = current.status; status = lastTransportStatus; }
            if (!current.queue.TryTake(out var bytes)) return;
            if (!SafePng(bytes)) { status = "rejected_png_header"; return; }
            Texture2D next = null;
            try
            {
                next = new Texture2D(2, 2, TextureFormat.RGBA32, false);
                if (!next.LoadImage(bytes, true)) throw new InvalidDataException("PNG decode failed.");
                if (displaySurface != null)
                {
                    displaySurface.GetPropertyBlock(block);
                    block.SetTexture("_BaseMap", next); block.SetTexture("_MainTex", next);
                    displaySurface.SetPropertyBlock(block);
                }
                var old = displayed; displayed = next; next = null;
                if (old != null) Destroy(old);
                status = "display_updated";
            }
            catch (Exception e) { status = "decode_failed: " + e.GetType().Name; }
            finally { if (next != null) Destroy(next); }
        }

        void OnDisable()
        {
            var current = inbox; inbox = null;
            if (current != null)
            {
                current.cancel.Cancel();
                current.listener.Stop();
                current.client?.Close();
                if (current.worker != null)
                    current.worker.ContinueWith(_ => { current.queue.Dispose(); current.cancel.Dispose(); });
                else { current.queue.Dispose(); current.cancel.Dispose(); }
            }
            if (displayed != null) { Destroy(displayed); displayed = null; }
            status = "stopped";
        }
    }
}
