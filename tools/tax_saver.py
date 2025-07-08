import pandas as pd
import os
from agent import run_gpt_agent  # Import your agent function

def calc_tax_old_regime(
    salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
    nps_employer=0, deductions_80e=0, deductions_80g=0
):
    # HRA Exemption calculation (simplified)
    hra_exempt = min(
        hra_received,
        0.5 * salary,  # Assuming metro
        rent - 0.1 * salary if rent > 0.1 * salary else 0
    ) if hra_received and rent else 0

    gross_income = salary
    # 50k standard deduction, plus all deductions
    taxable_income = (
        gross_income
        - hra_exempt
        - deductions_80c
        - deductions_80d
        - deductions_80e
        - deductions_80g
        - nps_employer
        - 50000
    )

    # Old regime slabs (FY 2023-24)
    slabs = [
        (250000, 0.0),
        (250000, 0.05),
        (500000, 0.2),
        (float('inf'), 0.3)
    ]
    tax = 0
    income_left = taxable_income
    for slab_amt, rate in slabs:
        if income_left > 0:
            amt = min(slab_amt, income_left)
            tax += amt * rate
            income_left -= amt
        else:
            break
    # Rebate under 87A if taxable income <= 5L
    if taxable_income <= 500000:
        tax = 0
    tax += 0.04 * tax  # 4% cess
    return max(0, round(tax)), max(0, round(taxable_income))

def calc_tax_new_regime(salary, nps_employer=0):
    # Standard deduction of 50,000 allowed in new regime (from FY 23-24)
    taxable_income = salary - 50000 - nps_employer
    slabs = [
        (300000, 0.0),
        (300000, 0.05),
        (300000, 0.1),
        (300000, 0.15),
        (300000, 0.2),
        (1500000, 0.3)
    ]
    tax = 0
    income_left = taxable_income
    for slab_amt, rate in slabs:
        if income_left > 0:
            amt = min(slab_amt, income_left)
            tax += amt * rate
            income_left -= amt
        else:
            break
    # Rebate under 87A if taxable income <= 7L
    if taxable_income <= 700000:
        tax = 0
    tax += 0.04 * tax  # 4% cess
    return max(0, round(tax)), max(0, round(taxable_income))

def suggest_tax_saving(
    salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
    nps_employer=0, deductions_80e=0, deductions_80g=0
):
    suggestions = []
    if deductions_80c < 150000:
        suggestions.append(f"Invest ₹{150000 - deductions_80c:,} more in 80C (e.g., ELSS, PPF, EPF, life insurance) to maximize deduction.")
    if deductions_80d < 25000:
        suggestions.append(f"Buy health insurance to claim up to ₹{25000 - deductions_80d:,} more under 80D.")
    if deductions_80e < 50000:
        suggestions.append(f"Pay more towards education loan interest to claim up to ₹{50000 - deductions_80e:,} under 80E.")
    if deductions_80g < 100000:
        suggestions.append(f"Donate to eligible charities to claim more under 80G.")
    if nps_employer < 50000:
        suggestions.append(f"Ask employer to contribute more to NPS (80CCD(2)) for extra tax benefit.")
    if rent and hra_received and rent > 0.1 * salary:
        suggestions.append("Ensure rent receipts are submitted to maximize HRA exemption.")
    if not suggestions:
        suggestions.append("You are already utilizing most major tax benefits!")
    return suggestions

def gpt_tax_suggestions(
    salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
    nps_employer=0, deductions_80e=0, deductions_80g=0
):
    prompt = f"""
You are a tax advisor for India (FY 2023-24). The user has:
- Salary: ₹{salary}
- Basic Salary: ₹{basic_salary}
- Rent Paid: ₹{rent}
- HRA Received: ₹{hra_received}
- 80C: ₹{deductions_80c}
- 80D: ₹{deductions_80d}
- 80E: ₹{deductions_80e}
- 80G: ₹{deductions_80g}
- Employer NPS: ₹{nps_employer}

Suggest in a friendly, conversational tone:
- The best ways to save more tax (with numbers)
- Missed opportunities
- Any smart tips for this profile
- Keep it concise and actionable.
"""
    # Use your agent for GPT suggestions (no chat history needed here)
    return run_gpt_agent(prompt, [])

def tax_summary_gpt(
    salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
    nps_employer=0, deductions_80e=0, deductions_80g=0
):
    old_tax, old_taxable = calc_tax_old_regime(
        salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
        nps_employer, deductions_80e, deductions_80g
    )
    new_tax, new_taxable = calc_tax_new_regime(salary, nps_employer)
    suggestions = suggest_tax_saving(
        salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
        nps_employer, deductions_80e, deductions_80g
    )
    best = "New Regime" if new_tax < old_tax else "Old Regime"
    result = {
        "old_regime": {
            "taxable_income": old_taxable,
            "tax_payable": old_tax
        },
        "new_regime": {
            "taxable_income": new_taxable,
            "tax_payable": new_tax
        },
        "best": best,
        "suggestions": suggestions,
        "gpt_suggestions": None,
    }
    summary = f"""
### Tax Optimization Summary

- **Old Regime:**  
    - Taxable Income: ₹{old_taxable:,.0f}  
    - Tax Payable: ₹{old_tax:,.0f}

- **New Regime:**  
    - Taxable Income: ₹{new_taxable:,.0f}  
    - Tax Payable: ₹{new_tax:,.0f}

**Best for you:** {best}

#### Suggestions:
"""
    for s in suggestions:
        summary += f"- {s}\n"
    # Add GPT suggestions
    try:
        gpt_sugg = gpt_tax_suggestions(
            salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
            nps_employer, deductions_80e, deductions_80g
        )
        # Try to parse GPT suggestions into a list of tips (split by lines or dashes)
        gpt_sugg_list = []
        if isinstance(gpt_sugg, str):
            # Split by lines that start with a dash or bullet, or by newlines
            for line in gpt_sugg.splitlines():
                line = line.strip()
                if line.startswith('-') or line.startswith('•'):
                    tip = line.lstrip('-•').strip()
                    if tip:
                        gpt_sugg_list.append(tip)
                elif line:
                    gpt_sugg_list.append(line)
        result["gpt_suggestions_raw"] = gpt_sugg
        result["gpt_suggestions_list"] = gpt_sugg_list
        result["gpt_suggestions"] = gpt_sugg  # for backward compatibility
        summary += f"\n---\n**GPT Suggestions:**\n{gpt_sugg}"
    except Exception as e:
        summary += f"\n\n*GPT suggestions unavailable: {e}*"
    result["summary"] = summary
    return result