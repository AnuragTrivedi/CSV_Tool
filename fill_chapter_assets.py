"""Populate missing chapter animation and activity rows in a book CSV.

Usage:
    python fill_chapter_assets.py
    python fill_chapter_assets.py before.csv asset_folder completed.csv

The program preserves the supplied CSV rows and inserts only assets that are
present in ``asset_folder`` and absent from the matching chapter. New-row
metadata is supplied in the desktop UI (or uses the documented defaults).
"""

from __future__ import annotations

import csv
import re
import sys
from collections import defaultdict
from pathlib import Path


CHAPTER_PATTERN = re.compile(r"_CH(?P<chapter>\d{1,4})_(?P<remainder>.+)$", re.IGNORECASE)
ASSET_TYPES = (
    ("Course Book", "Course Book"),
    ("Animation", "Animation"),
    ("Read Aloud", "Read aloud"),
    ("Audio", "Audio"),
    ("Interactivities", "Activity"),
    ("Fun with words", "video"),
    ("Teacher Manual", "Teacher's Manual"),
    ("Worksheet", "Worksheets"),
    ("Detailed Solution", "Solutions"),
    ("Answer Key", "Answer Key"),
    ("Listening Text", "Listening Text"),
)

DEFAULT_PREFIXES = {
    "Course Book": "CB",
    "Animation": "VID",
    "Read Aloud": "VID_RA",
    "Audio": "AUD",
    "Interactivities": "AC",
    "Fun with words": "FWW",
    "Teacher Manual": "TM",
    "Worksheet": "WS",
    "Detailed Solution": "SOL",
    "Answer Key": "AK",
    "Listening Text": "LT",
}

DEFAULT_ASSET_SEQUENCES: dict[str, int] = {
    "Course Book": 1,
    "Animation": 2,
    "Read Aloud": 3,
    "Audio": 4,
    "Interactivities": 5,
    "Fun with words": 6,
    "Teacher Manual": 7,
    "Worksheet": 8,
    "Detailed Solution": 9,
    "Answer Key": 10,
    "Listening Text": 11,
}

DEFAULT_ROW_VALUES = {
    "actionEnabled": "VIEW",
    "allowTo": "BOTH",
    "isAllowToDemo": "FALSE",
    "Book Type": "Coursebook",
    "isMainPdf": "FALSE",
    "openInMainContent": "FALSE",
    "isVisibleInPageButton": "FALSE",
    "pageNo": "",
    "recordType": "NEW",
    "isConvertToTopic": "FALSE",
    "isRemove": "FALSE",
}

TYPE_SPECIFIC_DEFAULT_COLUMN_VALUES: dict[str, dict[str, str]] = {
    "Teacher Manual": {
        "actionEnabled": "BOTH",
        "allowTo": "TEACHER",
        "openInMainContent": "TRUE",
    },
    "Worksheet": {
        "actionEnabled": "BOTH",
        "allowTo": "TEACHER",
        "openInMainContent": "TRUE",
    },
    "Course Book": {
        "isMainPdf": "TRUE",
        "openInMainContent": "TRUE",
    },
    "Coursebook": {
        "isMainPdf": "TRUE",
        "openInMainContent": "TRUE",
    },
}

REQUIRED_COLUMNS = {
    "isbn", "rowType", "sequence", "name", "groupName", "url", "actionEnabled",
    "allowTo", "isAllowToDemo", "Book Type", "isMainPdf", "openInMainContent",
    "isVisibleInPageButton", "pageNo", "recordType", "isConvertToTopic", "isRemove",
}


def fail(message: str) -> None:
    raise ValueError(message)


class AssetScanResult:
    """Result of scanning the asset folder, including what was skipped and why."""

    def __init__(self) -> None:
        self.assets: dict[int, list[tuple[str, str, int | str]]] = defaultdict(list)
        self.unmatched_pattern: list[str] = []
        self.unrecognized_prefix: list[tuple[str, int, str]] = []
        self.total_files = 0

    def chapters_found(self) -> set[int]:
        return set(self.assets.keys())


def load_assets(
    asset_directory: Path, prefixes: dict[str, str] | None = None
) -> AssetScanResult:
    """Scan asset_directory and return an AssetScanResult with matches and diagnostics."""
    prefixes = DEFAULT_PREFIXES if prefixes is None else prefixes
    result = AssetScanResult()
    for path in asset_directory.iterdir():
        if not path.is_file():
            continue
        result.total_files += 1
        match = CHAPTER_PATTERN.search(path.name)
        if not match:
            result.unmatched_pattern.append(path.name)
            continue
        chapter = int(match["chapter"])
        remainder = match["remainder"]
        matched_type = False

        # 1. Explicit check for Read Aloud with _VID_RA or VID_RA
        ra_match = re.match(r"^(_?VID_RA|_?RA)(.*)$", remainder, re.IGNORECASE)
        ra_config_prefix = prefixes.get("Read Aloud", "VID_RA").strip().lstrip("_")
        if ra_match or (ra_config_prefix and remainder.casefold().startswith(ra_config_prefix.casefold())):
            used_prefix = ra_match.group(1) if ra_match else ra_config_prefix
            suffix = remainder[len(used_prefix):]
            number = re.search(r"\d+", suffix)
            sort_key: int | str = int(number.group()) if number else suffix.lstrip("_-").upper()
            result.assets[chapter].append(("Read Aloud", path.name, sort_key))
            matched_type = True

        # 2. Check other asset types with longest prefix priority
        if not matched_type:
            sorted_types = sorted(ASSET_TYPES, key=lambda it: len(prefixes.get(it[0], "").strip()), reverse=True)
            for asset_type, _ in sorted_types:
                if asset_type == "Read Aloud":
                    continue
                prefix = prefixes.get(asset_type, "").strip().lstrip("_")
                if not prefix:
                    continue
                p_match = re.match(rf"^(_?{re.escape(prefix)})(.*)$", remainder, re.IGNORECASE)
                if p_match:
                    used_prefix = p_match.group(1)
                    suffix = remainder[len(used_prefix):]
                    number = re.search(r"\d+", suffix)
                    sort_key = int(number.group()) if number else suffix.lstrip("_-").upper()
                    result.assets[chapter].append((asset_type, path.name, sort_key))
                    matched_type = True
                    break
        if not matched_type:
            result.unrecognized_prefix.append((path.name, chapter, remainder))

    for chapter, chapter_assets in result.assets.items():
        def display_order(item: tuple[str, str, int | str]) -> tuple[int, int, int | str]:
            asset_type, _, ordinal = item
            ordinal_kind = 0 if isinstance(ordinal, int) else 1
            type_order = next(index for index, item_type in enumerate(ASSET_TYPES) if item_type[0] == asset_type)
            return (type_order, ordinal_kind, ordinal)

        chapter_assets.sort(key=display_order)
    return result


def diagnose(
    scan: AssetScanResult, csv_chapters: set[int], prefixes: dict[str, str] | None = None
) -> list[str]:
    prefixes = DEFAULT_PREFIXES if prefixes is None else prefixes
    warnings: list[str] = []

    if scan.total_files == 0:
        warnings.append("The asset folder is empty - no files were found to process.")
        return warnings

    if scan.unmatched_pattern:
        sample = ", ".join(scan.unmatched_pattern[:5])
        more = f" (+{len(scan.unmatched_pattern) - 5} more)" if len(scan.unmatched_pattern) > 5 else ""
        warnings.append(
            f"{len(scan.unmatched_pattern)} file(s) don't contain a '_CHnn_' chapter marker "
            f"and were ignored entirely: {sample}{more}"
        )

    if scan.unrecognized_prefix:
        known = ", ".join(f"{k}={v!r}" for k, v in prefixes.items())
        examples = ", ".join(f"{name!r} (chapter {ch}, remainder {rem!r})" for name, ch, rem in scan.unrecognized_prefix[:5])
        more = f" (+{len(scan.unrecognized_prefix) - 5} more)" if len(scan.unrecognized_prefix) > 5 else ""
        warnings.append(
            f"{len(scan.unrecognized_prefix)} file(s) matched a chapter number but their filename "
            f"prefix isn't recognized, so they were skipped: {examples}{more}. "
            f"Known prefixes are: {known}."
        )

    folder_chapters = scan.chapters_found()
    only_in_folder = sorted(folder_chapters - csv_chapters)
    only_in_csv = sorted(csv_chapters - folder_chapters)

    if folder_chapters and not (folder_chapters & csv_chapters):
        warnings.append(
            f"CHAPTER NUMBER MISMATCH: the asset folder contains chapter number(s) "
            f"{sorted(folder_chapters)} but the CSV's chapter rows are numbered {sorted(csv_chapters)}. "
            f"None of these overlap, so nothing will be inserted."
        )
    elif only_in_folder:
        warnings.append(
            f"The asset folder has files for chapter(s) {only_in_folder}, but the CSV has no "
            f"matching 'chapter' row for {'that number' if len(only_in_folder) == 1 else 'those numbers'}."
        )

    if only_in_csv:
        warnings.append(
            f"The CSV has chapter row(s) {only_in_csv} with no corresponding files in the asset folder."
        )

    return warnings


def current_chapter(row: dict[str, str]) -> int | None:
    if row.get("rowType", "").strip() != "chapter":
        return None
    try:
        return int(float(row["sequence"]))
    except (TypeError, ValueError):
        fail(
            f"Invalid chapter sequence: {row.get('sequence', '')!r} "
            f"(chapter row name {row.get('name', '')!r}). "
            "The 'sequence' column for a 'chapter' row must be a whole number."
        )


def make_row(
    row_base: dict[str, str], filename: str, asset_type: str, item_number: int, asset_count: int, sequence: int,
    column_values: dict[str, str],
) -> dict[str, str]:
    row = row_base.copy()
    row.update(column_values)
    row["rowType"] = "chapter_assets"
    row["sequence"] = str(sequence)
    row["url"] = filename
    group_name = dict(ASSET_TYPES)[asset_type]
    display_name = "Interactivity" if asset_type == "Interactivities" else asset_type
    row["name"] = display_name if asset_count == 1 else f"{display_name} - {item_number}"
    row["groupName"] = group_name
    return row


def populate(
    rows: list[dict[str, str]],
    assets: dict[int, list[tuple[str, str, int | str]]],
    asset_sequences: dict[str, int] | None = None,
    column_values_by_type: dict[str, dict[str, str]] | None = None,
) -> tuple[list[dict[str, str]], int]:
    if not rows:
        fail("The CSV must contain at least one data row.")
    asset_sequences = {**DEFAULT_ASSET_SEQUENCES, **(asset_sequences or {})}
    column_values_by_type = column_values_by_type or {}
    row_base = {column: "" for column in rows[0]}
    result: list[dict[str, str]] = []
    active_chapter: int | None = None
    existing_urls: set[str] = set()
    existing_sequences: list[int] = []
    inserted = 0

    def append_missing_assets(chapter: int | None) -> None:
        nonlocal inserted
        if chapter is None:
            return
        next_sequence = max(existing_sequences, default=0) + 1
        type_index = {asset_type: index for index, (asset_type, _) in enumerate(ASSET_TYPES)}

        def entry_order(item: tuple[str, str, int | str]) -> tuple[int, int, int, int | str]:
            asset_type, _, ordinal = item
            return (
                asset_sequences.get(asset_type, 10_000),
                type_index.get(asset_type, 99),
                0 if isinstance(ordinal, int) else 1,
                ordinal,
            )

        chapter_assets = sorted(assets.get(chapter, []), key=entry_order)
        asset_counts = defaultdict(int)
        for asset_type, _, _ in chapter_assets:
            asset_counts[asset_type] += 1
        item_numbers = defaultdict(int)
        for asset_type, filename, ordinal in chapter_assets:
            item_numbers[asset_type] += 1
            if filename.casefold() in existing_urls:
                continue
            sequence = asset_sequences.get(asset_type, next_sequence)
            column_values = {
                **DEFAULT_ROW_VALUES,
                **TYPE_SPECIFIC_DEFAULT_COLUMN_VALUES.get(asset_type, {}),
                **column_values_by_type.get(asset_type, {}),
            }
            result.append(
                make_row(row_base, filename, asset_type, item_numbers[asset_type], asset_counts[asset_type], sequence, column_values)
            )
            if asset_type not in asset_sequences:
                next_sequence += 1
            inserted += 1

    for row in rows:
        chapter = current_chapter(row)
        if chapter is not None:
            append_missing_assets(active_chapter)
            active_chapter = chapter
            existing_urls = set()
            existing_sequences = []
        if active_chapter is not None and row.get("rowType", "").strip() == "chapter_assets":
            raw_url = row.get("url", "").strip().casefold()
            existing_urls.add(raw_url)
            just_name = raw_url.split("/")[-1]
            if just_name:
                existing_urls.add(just_name)
            existing_sequence = row.get("sequence", "").strip()
            if existing_sequence:
                try:
                    existing_sequences.append(int(float(existing_sequence)))
                except ValueError:
                    fail(
                        f"Invalid chapter asset sequence: {row.get('sequence', '')!r} "
                        f"(chapter {active_chapter}, asset name {row.get('name', '')!r}, "
                        f"url {row.get('url', '')!r}). "
                        "The 'sequence' column for this row must be blank or a whole number."
                    )
        result.append(row)
    append_missing_assets(active_chapter)
    return result, inserted


def main(argv: list[str]) -> int:
    if len(argv) == 1:
        if sys.stdin is None:
            print(
                "fill_chapter_assets.py was launched without console arguments.\n"
                "Run chapter_asset_app.pyw for the GUI window, or pass:\n"
                "    python fill_chapter_assets.py before.csv asset_folder completed.csv",
                file=sys.stderr,
            )
            return 2
        print("Chapter Asset CSV Completion")
        print("Enter the full paths below. Press Enter to accept the suggested output name.\n")
        input_csv = Path(input("Source CSV path: ").strip().strip('"'))
        asset_folder = Path(input("Asset folder path: ").strip().strip('"'))
        default_output = input_csv.with_name(f"{input_csv.stem}_completed.csv")
        output_text = input(f"Output CSV path [{default_output}]: ").strip().strip('"')
        output_csv = Path(output_text) if output_text else default_output
    elif len(argv) == 4:
        input_csv, asset_folder, output_csv = map(Path, argv[1:])
    else:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    if not input_csv.is_file():
        fail(f"Input CSV not found: {input_csv}")
    if not asset_folder.is_dir():
        fail(f"Asset folder not found: {asset_folder}")
    with input_csv.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        fieldnames = reader.fieldnames or []
        missing = REQUIRED_COLUMNS.difference(fieldnames)
        if missing:
            fail(f"CSV is missing required columns: {', '.join(sorted(missing))}")
        rows = list(reader)

    scan = load_assets(asset_folder)
    csv_chapters = {chapter for row in rows if (chapter := current_chapter(row)) is not None}
    warnings = diagnose(scan, csv_chapters)
    if warnings:
        print("WARNINGS:", file=sys.stderr)
        for warning in warnings:
            print(f"  - {warning}", file=sys.stderr)

    completed_rows, inserted = populate(rows, scan.assets)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with output_csv.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(completed_rows)

    print(f"Done! Created {output_csv} with {inserted} new chapter-asset rows.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except ValueError as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
