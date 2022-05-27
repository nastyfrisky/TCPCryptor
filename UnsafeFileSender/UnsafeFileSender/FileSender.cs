using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace UnsafeFileSender
{
    class FileSender
    {
        private WeakReference<Form1> formDelegate = new WeakReference<Form1>(null);
        private byte[] handshakeBytes = new byte[] { 0x5, 0x8, 0xFF, 0xC8 };
        private byte[] fileData;
        private string fileName;
        private string address;

        public FileSender(
            Form1 formDelegate, 
            string filePath,
            string hostAddress)
        {
            this.formDelegate.SetTarget(formDelegate);
            address = hostAddress;
            sendFile(filePath);
        }

        private void sendFile(String path)
        {
            try
            {
                byte[] fileData = File.ReadAllBytes(path);
                this.fileData = fileData;
                fileName = Path.GetFileName(path);
                new Thread(sendFile).Start();
            } catch(Exception)
            {
                Form1 form;
                formDelegate.TryGetTarget(out form);
                if (form == null) { return; }
                form.cannotOpenFile();
                onComplete();
                return;
            }
        }

        private void sendFile()
        {
            string host;
            int port;

            if(!parseHost(out host, out port)) {
                Form1 form;
                formDelegate.TryGetTarget(out form);
                if (form != null) {
                    form.incorrectAddress();
                    onComplete();
                    return;
                }
            }

            string[] parseResult = address.Split(new char[] { ':' });

            Socket socket;
            try
            {
                socket = new Socket(SocketType.Stream, ProtocolType.Tcp);
                socket.Connect(host, port);
            } catch(Exception)
            {
                Form1 form;
                formDelegate.TryGetTarget(out form);
                if (form == null) { return; }
                form.cannotConnectToServer();
                onComplete();
                return;
            }

            try
            {
                sendData(socket, fileData, fileName);
            } catch(Exception)
            {
                Form1 form;
                formDelegate.TryGetTarget(out form);
                if (form == null) { return; }
                form.errorFileSending();
                return;
            }

            onComplete();
        }

        private void sendData(Socket socket, byte[] data, string fileName)
        {
            byte[] fileNameBytes = Encoding.UTF8.GetBytes(fileName);
            byte[] fileNameLengthBytes = new byte[]
            { 
                (byte)((fileNameBytes.Length >> 8) & 255), 
                (byte)((fileNameBytes.Length >> 0) & 255) 
            };

            byte[] dataLengthBytes = new byte[]
            {
                (byte)((data.Length >> 24) & 255),
                (byte)((data.Length >> 16) & 255),
                (byte)((data.Length >> 8) & 255),
                (byte)((data.Length >> 0) & 255)
            };

            socket.Send(handshakeBytes);
            socket.Send(fileNameLengthBytes);
            socket.Send(fileNameBytes);
            socket.Send(dataLengthBytes);

            int bytesPosition = 0;
            while(bytesPosition < data.Length)
            {
                int packetSize = Math.Min(65535, data.Length - bytesPosition);
                socket.Send(data, bytesPosition, packetSize, SocketFlags.None);
                bytesPosition += packetSize;
                onProgress(bytesPosition / (double)data.Length);
            }

            byte[] successFlag = new byte[1];
            socket.Receive(successFlag);

            if (successFlag[0] != 0x00)
            {
                Form1 form;
                formDelegate.TryGetTarget(out form);
                if (form == null) { return; }
                form.errorFileSending();
            }

            onSuccess();
        }

        private void onProgress(double progress)
        {
            Form1 form;
            formDelegate.TryGetTarget(out form);
            if (form == null) { return; }
            form.onProgress(progress);
        }

        private void onComplete()
        {
            Form1 form;
            formDelegate.TryGetTarget(out form);
            if (form == null) { return; }
            form.sendingComplete();
        }

        private void onSuccess()
        {
            Form1 form;
            formDelegate.TryGetTarget(out form);
            if (form == null) { return; }
            form.sentSuccess();
        }

        private bool parseHost(out string host, out int port)
        {
            host = "";
            port = 0;

            try
            {
                string[] parseResult = address.Split(new char[] { ':' });
                host = parseResult[0];
                int.TryParse(parseResult[1], out port);
            } catch (Exception)
            {
                return false;
            }

            return true;
        }
    }
}
