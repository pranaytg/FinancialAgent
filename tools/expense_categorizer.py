import pandas as pd
import pdfplumber
from langchain.tools import tool

CATEGORIES = ["Rent", "Groceries", "Food", "Shopping", "Travel", "Other"]

def extract_transactions_from_pdf(pdf_file):
    transactions = []
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                for row in table[1:]:  # Skip header
                    transactions.append(row)
    return transactions

def classify_expense(description, gpt_classifier=None):
    # Placeholder: Use GPT or simple rules for demo
    desc = description.lower()
    if "rent" in desc:
        return "Rent"
    if any(word in desc for word in ["grocery", "supermarket"]):
        return "Groceries"
    if any(word in desc for word in ["restaurant", "food", "cafe", "pizza", "coffee"]):
        return "Food"
    if any(word in desc for word in ["amazon", "flipkart", "shopping", "mall"]):
        return "Shopping"
    if any(word in desc for word in ["uber", "flight", "air", "train", "hotel", "travel"]):
        return "Travel"
    return "Other"

def process_statement(file, filetype="csv"):
    if filetype == "csv":
        df = pd.read_csv(file)
    else:
        # PDF: extract transactions, assume columns: Date, Description, Amount
        transactions = extract_transactions_from_pdf(file)
        df = pd.DataFrame(transactions, columns=["Date", "Description", "Amount"])
    # Clean and classify
    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
    df = df.dropna(subset=["Amount"])
    df["Category"] = df["Description"].apply(classify_expense)
    return df

def expense_summary(df):
    summary = df.groupby("Category")["Amount"].sum().reindex(CATEGORIES, fill_value=0)
    unusual = df[df["Amount"].abs() > df["Amount"].abs().mean() + 2*df["Amount"].abs().std()]
    return summary, unusual

@tool
def run_expense_categorizer(file_path: str, filetype: str = "csv") -> str:
    """Categorize expenses from a bank statement file (csv or pdf) and return a summary."""
    df = process_statement(file_path, filetype)
    summary, unusual = expense_summary(df)
    result = "### 🧾 Expense Breakdown\n"
    for cat, amt in summary.items():
        result += f"- **{cat}:** ₹{amt:,.2f}\n"
    if not unusual.empty:
        result += "\n**⚠️ Unusual Expenses Detected:**\n"
        for _, row in unusual.iterrows():
            result += f"- {row['Date']}: {row['Description']} (₹{row['Amount']:,.2f})\n"
    return result