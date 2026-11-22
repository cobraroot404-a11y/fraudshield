# Optional local components

## Random Forest

Set `FRAUDSHIELD_FOREST_DATASET` to a reviewed local CSV and restart the API. For a smoke test, use `../ML/example_forest_training.csv` from the backend directory. The scorer trains in memory from `amount`, `currency`, `product_name`, UTC `created_at`, and the binary `flagged` label. The supplied example is fictional. Its results have no predictive validity claim.

`POST /ml/random-forest/score` accepts `amount`, `currency`, `product_name`, and a timezone-aware `created_at`. It requires an analyst or administrator bearer token and returns `flagged` and `probability`. It does not persist transactions or change graph-based scoring. Restart the API after replacing the training file. Use only local, operator-reviewed CSV files.

## Receipt OCR

Create a separate Python 3.11 or newer environment and install `backend/ocr/requirements.txt` there. The OCR stack can use NumPy 2 while the main graph stack keeps its NumPy 1 constraint. Obtain the English recognizer and CRAFT detector files from a trusted upstream distribution independently. Set `FRAUDSHIELD_OCR_PYTHON` to the OCR environment's interpreter path and `FRAUDSHIELD_OCR_MODELS` to the directory containing those files. The worker disables automatic downloads. Never use untrusted model files.

`POST /ocr/scan` accepts an analyst or administrator bearer token and a multipart PNG or JPEG field named `file`. It returns optional `merchant` and `amount`. The worker processes at most 2 MiB of image bytes and 4 million pixels. It returns derived fields only, and the feature is intended for local test receipts. Confirm the suggested amount before submitting a transaction. Set `VITE_ENABLE_RECEIPT_SCAN=true` in the frontend environment to enable the upload control.

## Regression checks

Run `python -m unittest discover -s tests` from `backend/` and `npm test` from `frontend/`. A live OCR check additionally needs the separately installed packages and trusted weights.
