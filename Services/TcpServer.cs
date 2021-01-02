using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ChessGameOnline.Services
{
    public class TcpServer
    {
        TcpListener server;

        public TcpServer()
        {
            server = new TcpListener(IPAddress.Parse("127.0.0.1"), 13000);
            server.Start();
           // Verify();
        }

        public async Task Verify()
        {
            TcpClient client = await server.AcceptTcpClientAsync();
            NetworkStream stream = client.GetStream();
            byte[] bytes = new byte[1024];
            string data;
            int i = 0;

            while (client.Available < 3) { }

            stream.Read(bytes, 0, bytes.Length);
            data = Encoding.UTF8.GetString(bytes);

            if (Regex.IsMatch(data, "^GET"))
            {
                const string eol = "\r\n";
                Byte[] response = Encoding.UTF8.GetBytes("HTTP/1.1 101 Switching Protocols" + eol
                    + "Connection: Upgrade" + eol
                    + "Upgrade: websocket" + eol
                    + "Sec-WebSocket-Accept: " + Convert.ToBase64String(
                        System.Security.Cryptography.SHA1.Create().ComputeHash(
                            Encoding.UTF8.GetBytes(
                                new System.Text.RegularExpressions.Regex("Sec-WebSocket-Key: (.*)").Match(data).Groups[1].Value.Trim() + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
                            )
                        )
                    ) + eol
                    + eol);
                stream.Write(response, 0, response.Length);
            }
            else
            {
                client.Close();
                Console.WriteLine("closed connection");
            }

            while (true)
            {
                i = stream.Read(bytes, 0, bytes.Length);
                if (i != 0)
                {
                    data = Encoding.UTF8.GetString(bytes);
                    Console.WriteLine(data);
                    if (data == "close")
                        break;
                }

            }

            client.Close();
        }
    }
}
