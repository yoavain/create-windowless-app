using System;
using System.Diagnostics;
using System.ComponentModel;

namespace MyProcessSample
{
    class MyProcess
    {
        public static void Main(string[] args)
        {
            // App Name
            const string AppName = "<APPNAME>";

            try
            {
                using (Process myProcess = new Process())
                {

                    myProcess.StartInfo.FileName = AppName;
                    myProcess.StartInfo.Arguments = String.Join(" ", args);

                    // Stop the process from opening a new window
                    myProcess.StartInfo.RedirectStandardOutput = true;
//                  myProcess.StartInfo.UseShellExecute = false;
//                  myProcess.StartInfo.CreateNoWindow = true;
                    myProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;

                    myProcess.Start();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
    }
}
