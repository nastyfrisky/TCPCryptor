using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Threading;

namespace UnsafeFileSender
{
    public partial class Form1 : Form
    {
        private FileSender fileSender;
        private Dispatcher currentDispatcher;

        public Form1()
        {
            InitializeComponent();
            currentDispatcher = Dispatcher.CurrentDispatcher;
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            button1.Enabled = false;
            button2.Enabled = false;
            fileSender = new FileSender(this, textBox1.Text, textBox2.Text);
        }

        public void cannotOpenFile()
        {
            showErrorMessage("Не получилось открыть файл");
        }

        public void incorrectAddress()
        {
            showErrorMessage("Вы ввели некорректный адрес сервера");
        }

        public void cannotConnectToServer()
        {
            showErrorMessage("Не получилось подключиться к серверу");
        }

        public void onProgress(double progress)
        {
            runInUI(() =>
            {
                progressBar1.Minimum = 0;
                progressBar1.Maximum = 1000;
                progressBar1.Value = (int)(progress * 1000);
                label3.Text = "Идёт процесс передачи файла... (" + Math.Round(progress * 100, 2) + "%)";
            });
        }

        public void errorFileSending()
        {
            showErrorMessage("Во время передачи файла произошла ошибОчка");
        }

        private void showErrorMessage(string message)
        {
            runInUI(() =>
            {
                MessageBox.Show(message, "Ошибка");
            });
        }

        private void showSuccessMessage(string message)
        {
            runInUI(() =>
            {
                MessageBox.Show(message, "Информация");
            });
        }

        private void runInUI(Action callback)
        {
            currentDispatcher.Invoke(callback);
        }

        private void OpenDialog(TextBox textBox)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Filter = "All Files (*)|*";

            if (dialog.ShowDialog() == DialogResult.OK)
            {
                textBox.Text = dialog.FileName;
            }
        }

        private void label3_Click(object sender, EventArgs e)
        {

        }

        private void textBox2_TextChanged(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            OpenDialog(textBox1);
        }

        public void sendingComplete()
        {
            runInUI(() =>
            {
                label3.Text = "Передача файла ещё не начата";
                button1.Enabled = true;
                button2.Enabled = true;
                progressBar1.Value = 0;
            });
        }

        public void sentSuccess()
        {
            showSuccessMessage("Файл успешно передан!");
        }
    }
}
