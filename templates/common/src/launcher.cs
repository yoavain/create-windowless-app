using System;
using System.IO;
using System.Diagnostics;
using System.ComponentModel;

namespace MyProcessSample {
    class MyProcess {
        public static void Main(string[] args) {
            // App Name
            const string AppName = "<APPNAME>";

            try {
                using (Process myProcess = new Process()) {
                    myProcess.StartInfo.FileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, AppName + ".exe");

                    for (int i=0; i < args.Length; i++) {
                        args[i] = "\"" + args[i] + "\"";
                    }
                    myProcess.StartInfo.Arguments = String.Join(" ", args);

                    // WorkingDirectory same as BaseDirectory
					myProcess.StartInfo.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory;

                    // Stop the process from opening a new window
                    myProcess.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;

                    myProcess.Start();
                }
            }
            catch (Exception e) {
                Console.WriteLine(e.Message);
            }
        }
    }
}
