# Test Data Generation Strategy (AI/LLM Assisted)

**Project:** TechTrio E-Commerce Platform  
**Author:** Nazim-E-Alam

## 1. Overview
A critical challenge in testing the TechTrio platform (specifically the Pinecone vector-search and PostgreSQL pagination) was the lack of realistic, high-volume product data. Manual creation of test data is time-consuming and lacks the semantic variance required to properly test AI-based vector search. 

To solve this, I leveraged Large Language Models (LLMs) to programmatically generate synthetic test data.

## 2. Methodology: LLM-Assisted Data Creation

### The Problem
Pinecone's vector search relies on rich product descriptions to create accurate embeddings. Simple mock data (e.g., "Product A", "Test Description") fails to validate the semantic search capabilities (e.g., searching "cold weather gear" to find "winter jacket").

### The Solution
I developed a Python script utilizing the OpenAI/Gemini API to generate 5,000 highly realistic product entries across 10 categories. 

**Prompt Example used in the script:**
> *"Generate a JSON array of 50 e-commerce products in the 'Electronics' category. For each product, provide a realistic title, a rich 3-sentence description highlighting features and use-cases, price, stock count, and an array of 5 tags. Ensure diverse vocabulary."*

### Execution Flow
1. **Generation:** The python script called the LLM API to generate JSON batches of products.
2. **Sanitization:** The script validated the JSON schemas against our PostgreSQL model requirements.
3. **Seeding:** The sanitized data was inserted directly into the PostgreSQL development database using batch `INSERT` statements to optimize speed.
4. **Embedding Generation:** A backend job was triggered to process these 5,000 products, generate vector embeddings, and sync them to the Pinecone index.

## 3. Benefits & ROI
- **Saved 40+ hours** of manual data entry for the QA and Dev teams.
- Enabled rigorous testing of the **semantic search algorithms** because the LLM generated highly varied, natural language descriptions.
- Allowed for accurate **performance profiling** of the pagination and Redis caching layers under a realistic database load (5,000+ records).

---
*Note: This document serves as proof of technical capability regarding automated test data management and AI utilization in the SDLC.*
