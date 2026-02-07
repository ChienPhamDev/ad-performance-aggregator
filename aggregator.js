const { Command } = require("commander");
const DataAggregator = require("./src/services/DataAggregator");
const ReportService = require("./src/services/ReportService");
const CsvFileWriter = require("./src/utils/CsvFileWriter");
const benchmark = require("./src/utils/Benchmark");

/**
 * Main application logic.
 * Orchestrates the data processing and report generation.
 */
async function run() {
    const program = new Command();
    program
        .requiredOption("-i, --input <path>", "input CSV file path")
        .requiredOption("-o, --output <path>", "output directory path")
        .parse(process.argv);

    const { input, output } = program.opts();

    try {
        benchmark.start("Total Execution");

        const aggregator = new DataAggregator(input);
        const reportService = new ReportService();
        const csvWriter = new CsvFileWriter(output);

        // 1. Process data using streaming aggregation
        benchmark.start("Data Processing");
        const campaigns = await aggregator.process();
        benchmark.stop("Data Processing");

        // 2. Generate and save reports
        csvWriter.save("summary.csv", campaigns);
        csvWriter.save("top10_ctr.csv", reportService.getTop10ByCtr(campaigns));
        csvWriter.save(
            "top10_cpa.csv",
            reportService.getTop10ByLowestCpa(campaigns),
        );

        benchmark.stop("Total Execution");
    } catch (err) {
        console.error("❌ Error processing data:", err.message);
        process.exit(1);
    }
}

run();
