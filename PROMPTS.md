# AI Assistant Interaction Logs (PROMPTS.md)

This document outlines the evolutionary steps and the corresponding prompts used with the AI assistant to build the **Ad Performance Aggregator**. Each step represents a phase in the project's development, from initial setup to high-performance optimization.

---

## 🚀 1. Initial Project Setup

**Prompt:**

> "Create a basic Node.js CLI application that reads a CSV file and writes its content to a results folder. The program should be executable from the command line, accepting input and output file paths as arguments, for example: `node aggregator.js --input test.csv --output results/`."

**Objective:**

- Set up the basic project structure.
- Implement command-line argument parsing.
- Handle basic File I/O.

---

## 📊 2. Core Aggregation Logic

**Prompt:**

> "Update the Node.js script to aggregate campaign data. For each `campaign_id`, compute the following metrics:
>
> - `total_impressions`
> - `total_clicks`
> - `total_spend`
> - `total_conversions`
> - `CTR` (Click-Through Rate): `total_clicks / total_impressions`
> - `CPA` (Cost Per Acquisition): `total_spend / total_conversions` (Return `null` if conversions are zero)."

**Objective:**

- Define the data model for campaign aggregation.
- Implement the mathematical logic for CTR and CPA.
- Ensure proper handling of edge cases (e.g., division by zero).

---

## 📜 3. Functional Requirements & SOLID Refactoring

**Prompt:**

> "Refactor the existing code to adhere to SOLID principles and improve code quality. Additionally, implement the logic to generate two specific CSV reports:
>
> 1. `top10_ctr.csv`: The top 10 campaigns with the highest Click-Through Rate (CTR).
> 2. `top10_cpa.csv`: The top 10 campaigns with the lowest Cost Per Acquisition (CPA), excluding any campaigns with zero conversions."

**Objective:**

- Separate concerns (Data Loading, Aggregation, Reporting).
- Implement sorting and filtering logic for the top 10 lists.
- Improve maintainability and readability.

---

## ⏱️ 4. Benchmarking & Performance Profiling

**Prompt:**

> "Add benchmark logs to the project. I need to see how much time is spent on reading the file, processing the data, and writing the results to CSV files. Use high-resolution timers for accuracy."

**Objective:**

- Identify performance bottlenecks.
- Gain visibility into memory and CPU usage during large file processing.

---

## ⚡ 5. High-Performance Parallel Optimization

**Prompt:**

> "I am processing a 1GB CSV file (~10 million rows). The current single-threaded implementation takes approximately 36 seconds. Optimize the system for maximum speed, using Worker Threads for parallel data processing.
>
> Explore the following:
>
> - Using **Worker Threads** for parallel data processing.
> - Optimizing the CSV parser for speed instead of flexibility.

**Objective:**

- Drastically reduce processing time using multi-core architecture.
- Optimize memory footprint by using typed arrays and shared buffers.
- Implement a robust worker pool system.

---

## 🧹 6. Code Review & Final Polish

**Prompt:**

> "Perform a final code review. Remove any redundant logs or unnecessary code blocks. Ensure the benchmarking system is streamlined and doesn't interfere with performance metrics. Clean up the project structure for a professional submission."

**Objective:**

- Technical debt reduction.
- Final validation of the requirements.
- Polishing the user experience (CLI output).

---

## 🛠️ Summary of Problem-Solving Approach

The project followed a **"Make it Work -> Make it Right -> Make it Fast"** philosophy:

1. **Make it Work:** Built the basic CLI and CSV handling.
2. **Make it Right:** Refactored into a service-oriented architecture with SOLID principles.
3. **Make it Fast:** Leveraged Node.js Worker Threads and Atomic operations to achieve significant performance gains, reducing processing time from ~36 seconds to ~2-3 seconds on an 16-core machine.
