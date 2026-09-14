#!/usr/bin/env python3
"""
Chapter Asset CSV Entry Filler - Desktop Application
Can be run directly with python: python chapter_asset_app.pyw
Or compiled to standalone Windows .exe using build_exe.bat
"""

import os
import sys
import csv
import traceback
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

import fill_chapter_assets as core


class ChapterAssetApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Book Asset CSV Entry Filler")
        self.geometry("760x640")
        self.minsize(680, 520)

        # Apply system-native theme
        style = ttk.Style(self)
        if "clam" in style.theme_names():
            style.theme_use("clam")

        self.csv_path_var = tk.StringVar()
        self.folder_path_var = tk.StringVar()
        self.out_path_var = tk.StringVar()

        self._build_ui()

    def _build_ui(self):
        # Header banner
        header_frame = tk.Frame(self, bg="#1e293b", padx=20, pady=16)
        header_frame.pack(fill=tk.X)

        title_lbl = tk.Label(
            header_frame,
            text="Book Asset CSV Entry Filler",
            font=("Segoe UI", 16, "bold"),
            fg="#f8fafc",
            bg="#1e293b",
        )
        title_lbl.pack(anchor="w")

        sub_lbl = tk.Label(
            header_frame,
            text="Scan asset directory and automatically insert missing chapter asset rows into your metadata CSV",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#1e293b",
        )
        sub_lbl.pack(anchor="w", pady=(2, 0))

        # Main content container
        content = ttk.Frame(self, padding=20)
        content.pack(fill=tk.BOTH, expand=True)

        # File Inputs Frame
        inputs_group = ttk.LabelFrame(content, text=" File & Folder Selection ", padding=14)
        inputs_group.pack(fill=tk.X, pady=(0, 12))

        # 1. Source CSV
        ttk.Label(inputs_group, text="1. Source CSV File:").grid(row=0, column=0, sticky="w", pady=4)
        csv_entry = ttk.Entry(inputs_group, textvariable=self.csv_path_var)
        csv_entry.grid(row=0, column=1, sticky="ew", padx=8, pady=4)
        ttk.Button(inputs_group, text="Browse CSV...", command=self.browse_csv).grid(row=0, column=2, pady=4)

        # 2. Asset Folder
        ttk.Label(inputs_group, text="2. Asset Folder:").grid(row=1, column=0, sticky="w", pady=4)
        folder_entry = ttk.Entry(inputs_group, textvariable=self.folder_path_var)
        folder_entry.grid(row=1, column=1, sticky="ew", padx=8, pady=4)
        ttk.Button(inputs_group, text="Browse Folder...", command=self.browse_folder).grid(row=1, column=2, pady=4)

        # 3. Output CSV
        ttk.Label(inputs_group, text="3. Output CSV File:").grid(row=2, column=0, sticky="w", pady=4)
        out_entry = ttk.Entry(inputs_group, textvariable=self.out_path_var)
        out_entry.grid(row=2, column=1, sticky="ew", padx=8, pady=4)
        ttk.Button(inputs_group, text="Browse Output...", command=self.browse_output).grid(row=2, column=2, pady=4)

        inputs_group.columnconfigure(1, weight=1)

        # Action bar
        btn_bar = ttk.Frame(content)
        btn_bar.pack(fill=tk.X, pady=(0, 12))

        self.run_btn = tk.Button(
            btn_bar,
            text=" Populate & Generate CSV",
            font=("Segoe UI", 11, "bold"),
            bg="#2563eb",
            fg="white",
            activebackground="#1d4ed8",
            activeforeground="white",
            relief=tk.FLAT,
            padx=16,
            pady=8,
            cursor="hand2",
            command=self.process_files,
        )
        self.run_btn.pack(side=tk.LEFT)

        clear_btn = ttk.Button(btn_bar, text="Clear Logs", command=self.clear_logs)
        clear_btn.pack(side=tk.RIGHT)

        # Log & Diagnostics Output
        log_group = ttk.LabelFrame(content, text=" Process Results & Diagnostics ", padding=10)
        log_group.pack(fill=tk.BOTH, expand=True)

        self.log_text = scrolledtext.ScrolledText(
            log_group,
            wrap=tk.WORD,
            font=("Consolas", 9),
            bg="#0f172a",
            fg="#e2e8f0",
            insertbackground="white",
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.tag_config("success", foreground="#4ade80")
        self.log_text.tag_config("warning", foreground="#fbbf24")
        self.log_text.tag_config("error", foreground="#f87171")
        self.log_text.tag_config("info", foreground="#60a5fa")
        self.log_text.tag_config("bold", font=("Consolas", 9, "bold"))

        self.log("Ready. Select your source CSV and asset folder above, then click 'Populate & Generate CSV'.\n", "info")

    def log(self, message: str, tag: str = ""):
        self.log_text.insert(tk.END, message + "\n", tag)
        self.log_text.see(tk.END)

    def clear_logs(self):
        self.log_text.delete("1.0", tk.END)

    def browse_csv(self):
        path = filedialog.askopenfilename(
            title="Select Source Metadata CSV",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")],
        )
        if path:
            self.csv_path_var.set(path)
            if not self.out_path_var.get():
                p = Path(path)
                default_out = p.with_name(f"{p.stem}_completed.csv")
                self.out_path_var.set(str(default_out))

    def browse_folder(self):
        folder = filedialog.askdirectory(title="Select Asset Folder with Chapter Files")
        if folder:
            self.folder_path_var.set(folder)

    def browse_output(self):
        path = filedialog.asksaveasfilename(
            title="Choose Output CSV File",
            defaultextension=".csv",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")],
        )
        if path:
            self.out_path_var.set(path)

    def process_files(self):
        csv_file = self.csv_path_var.get().strip().strip('"')
        asset_folder = self.folder_path_var.get().strip().strip('"')
        output_file = self.out_path_var.get().strip().strip('"')

        if not csv_file:
            messagebox.showwarning("Missing Input", "Please select a source CSV file.")
            return
        if not asset_folder:
            messagebox.showwarning("Missing Input", "Please select the folder containing your chapter asset files.")
            return
        if not output_file:
            messagebox.showwarning("Missing Input", "Please specify an output CSV file path.")
            return

        csv_path = Path(csv_file)
        folder_path = Path(asset_folder)
        out_path = Path(output_file)

        if not csv_path.is_file():
            messagebox.showerror("File Error", f"Source CSV not found:\n{csv_path}")
            return
        if not folder_path.is_dir():
            messagebox.showerror("Folder Error", f"Asset folder not found:\n{folder_path}")
            return

        self.clear_logs()
        self.log(f"Reading CSV: {csv_path.name}...", "info")

        try:
            with csv_path.open("r", encoding="utf-8-sig", newline="") as source:
                reader = csv.DictReader(source)
                fieldnames = reader.fieldnames or []
                missing = core.REQUIRED_COLUMNS.difference(fieldnames)
                if missing:
                    self.log(f"Error: Missing required columns in CSV: {', '.join(sorted(missing))}", "error")
                    messagebox.showerror("Invalid CSV", f"CSV is missing required columns:\n{', '.join(sorted(missing))}")
                    return
                rows = list(reader)

            self.log(f"Loaded {len(rows)} existing CSV rows.", "info")
            self.log(f"Scanning asset folder: {folder_path}...", "info")

            scan = core.load_assets(folder_path)
            self.log(f"Found {scan.total_files} total files. Detected assets for chapters: {sorted(scan.chapters_found()) or 'None'}")

            csv_chapters = {chapter for row in rows if (chapter := core.current_chapter(row)) is not None}
            self.log(f"CSV contains {len(csv_chapters)} chapters: {sorted(csv_chapters)}")

            warnings = core.diagnose(scan, csv_chapters)
            if warnings:
                self.log("\n--- DIAGNOSTICS & WARNINGS ---", "bold")
                for w in warnings:
                    self.log(f"• {w}", "warning")
                self.log("-------------------------------\n")

            self.log("Populating missing assets...", "info")
            completed_rows, inserted = core.populate(rows, scan.assets)

            out_path.parent.mkdir(parents=True, exist_ok=True)
            with out_path.open("w", encoding="utf-8", newline="") as destination:
                writer = csv.DictWriter(destination, fieldnames=fieldnames, lineterminator="\n")
                writer.writeheader()
                writer.writerows(completed_rows)

            self.log(f"\nSUCCESS! Completed successfully!", "success")
            self.log(f"• Total Rows in Output: {len(completed_rows)}")
            self.log(f"• Newly Inserted Asset Rows: {inserted}")
            self.log(f"• Saved To: {out_path}", "bold")

            messagebox.showinfo(
                "Completed Successfully",
                f"Done!\n\nInserted {inserted} new chapter asset rows.\nOutput saved to:\n{out_path}",
            )

        except Exception as e:
            self.log(f"\nUnexpected Error: {str(e)}", "error")
            self.log(traceback.format_exc(), "error")
            messagebox.showerror("Execution Failed", f"An error occurred:\n{str(e)}")


if __name__ == "__main__":
    app = ChapterAssetApp()
    app.mainloop()
