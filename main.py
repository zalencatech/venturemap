"""
main.py - the entry point. Run it with:   python main.py

It runs the whole ETL pipeline. The website is not needed for this.
For the exploratory analysis, run afterwards:   python -m src.analysis
"""

import logging
import sys

from src.extract import ExtractError
from src.pipeline import PipelineError, run_pipeline


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    try:
        summary = run_pipeline()
    except (ExtractError, PipelineError) as error:
        print(f"\nPipeline stopped: {error}")
        return 1

    print("\n=== VentureMap pipeline summary ===")
    print(f"Fetched (raw observations): {summary['records_fetched']}")
    print(f"Cleaned (country-years)   : {summary['records_cleaned']}")
    print(f"Rejected                  : {summary['records_rejected']}")
    print(f"Loaded into SQLite        : {summary['records_loaded']}")
    print("\nOutput files are in the data/ folder.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
