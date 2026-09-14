import React from 'react';
import {
  X,
  Download,
  Terminal,
  Cpu,
  CheckCircle2,
  FolderArchive,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface DesktopExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopExeModal: React.FC<DesktopExeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Windows Desktop Application (.exe)</h2>
              <p className="text-xs text-slate-400">
                Package and run as a native offline Windows desktop executable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* Main Download Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-blue-600" />
                <span>ChapterAssetFiller-Desktop-Package.zip</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Includes <strong>build_exe.bat</strong>, <strong>chapter_asset_app.pyw</strong> (GUI),{' '}
                <strong>run_desktop.bat</strong>, and <strong>fill_chapter_assets.py</strong>.
              </p>
            </div>
            <a
              href="/downloads/ChapterAssetFiller-Desktop-Package.zip"
              download="ChapterAssetFiller-Desktop-Package.zip"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Desktop Package (.zip)</span>
            </a>
          </div>

          {/* Quick Steps */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>How to produce your standalone ChapterAssetFiller.exe</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-800">Download & Extract the ZIP file</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Extract <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">ChapterAssetFiller-Desktop-Package.zip</code> on your Windows PC.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-800">Double-Click "build_exe.bat"</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The script will automatically detect Python, install PyInstaller (if not already installed), and compile everything into a single, standalone <strong className="text-slate-700">ChapterAssetFiller.exe</strong> file.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-800">Done! Share or Run ChapterAssetFiller.exe</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The generated <strong className="text-slate-800">ChapterAssetFiller.exe</strong> runs standalone without requiring Python on any target Windows PC. Just double-click to open the GUI!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative: Run directly without compiling */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              <span>Want to run immediately without building an .exe?</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If Python is already installed on your computer, you don't even need to build the .exe first. Simply double-click <strong className="text-slate-800">run_desktop.bat</strong> or execute in your terminal:
            </p>
            <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg select-all">
              python chapter_asset_app.pyw
            </div>
          </div>

          {/* Included Features */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
              Desktop Application Capabilities
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Native Windows file & folder picker</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offline local processing (no cloud needed)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic chapter prefix matching</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full diagnostic warning logs</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Executable compiler target: Windows x64
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
