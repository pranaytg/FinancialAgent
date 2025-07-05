import os
from dotenv import load_dotenv
from langchain.agents import initialize_agent
from langchain.agents.agent_types import AgentType
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory


# Load environment variables
load_dotenv()

# Import your GPT-safe tool functions (already decorated with @tool)
from tools.sip import run_sip_tool
from tools.budget import run_budget_tool
from tools.loan import run_loan_tool
from tools.stock import run_stock_tool
from tools.pdf_generator import generate_pdf_summary
from tools.goal_planner import run_goal_tool  # Make sure this is @tool-decorated
from tools.email_report import run_email_report_tool  # Make sure this is @tool-decorated
from tools.expense_categorizer import run_expense_categorizer

# Tool list – use only @tool-decorated functions here
tools = [
    run_budget_tool,
    run_sip_tool,
    run_loan_tool,
    run_stock_tool,
    generate_pdf_summary,
    run_goal_tool,
    run_email_report_tool,
    run_expense_categorizer
]

# Initialize model (use "gpt-3.5-turbo" for cheaper option, "gpt-4o" for better performance)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Memory object is created per session in app.py, not here
def get_agent(memory):
    return initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        memory=memory,
        verbose=True,
    )

def run_gpt_agent(user_query: str, chat_history=None) -> str:
    """Run the agent with memory, passing chat history if provided."""
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    if chat_history:
        # Restore previous chat history
        for human, ai in chat_history:
            memory.chat_memory.add_user_message(human)
            memory.chat_memory.add_ai_message(ai)
    agent = get_agent(memory)
    return agent.run(user_query)